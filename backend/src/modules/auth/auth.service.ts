import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../../entities/user.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
import { MailService } from './mail.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
    private auditService: AuditService,
  ) {}

  private isEmailVerificationRequired() {
    const forceVerify = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    return forceVerify || smtpConfigured;
  }

  private isProfileComplete(user: Pick<User, 'firstName' | 'lastName' | 'phone' | 'address'>) {
    return [user.firstName, user.lastName, user.phone, user.address].every((value) => typeof value === 'string' && value.trim().length > 0);
  }

  private buildAuthUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      emailVerified: user.emailVerified,
      profileComplete: this.isProfileComplete(user),
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existing) throw new ConflictException('Email deja utilise');

    const hashed = await bcrypt.hash(registerDto.password, 10);
    const requireVerification = this.isEmailVerificationRequired();
    const verificationToken = requireVerification ? randomUUID() : null;
    const user = this.userRepository.create({
      ...registerDto,
      password: hashed,
      verificationToken,
      emailVerified: !requireVerification,
    });

    await this.userRepository.save(user);
    if (requireVerification && verificationToken) {
      await this.mailService.sendVerificationEmail(user.email, verificationToken);
    }
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: this.buildAuthUser(user),
      message: requireVerification
        ? 'Inscription reussie. Verifiez votre email pour activer votre compte.'
        : 'Inscription reussie. Votre compte est actif.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const requireVerification = this.isEmailVerificationRequired();
    if (!user.emailVerified && requireVerification) {
      throw new UnauthorizedException('Email non verifie. Consultez votre boite mail.');
    }

    if (!user.emailVerified && !requireVerification) {
      user.emailVerified = true;
      user.verificationToken = null;
      await this.userRepository.save(user);
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_LOGGED_IN',
      resourceType: 'user',
      resourceId: user.id,
    });
    return {
      token,
      user: this.buildAuthUser(user),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.phone = dto.phone;
    user.address = dto.address;

    await this.userRepository.save(user);
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_PROFILE_UPDATED',
      resourceType: 'user',
      resourceId: user.id,
    });

    return {
      user: this.buildAuthUser(user),
      message: 'Profil mis a jour avec succes.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('Lien de verification invalide');

    user.emailVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_EMAIL_VERIFIED',
      resourceType: 'user',
      resourceId: user.id,
    });

    return { message: 'Email verifie avec succes' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      return { message: 'Si cet email existe, un lien de reinitialisation a ete envoye' };
    }

    user.resetToken = randomUUID();
    user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await this.userRepository.save(user);
    await this.mailService.sendResetPasswordEmail(user.email, user.resetToken);
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_RESET_REQUESTED',
      resourceType: 'user',
      resourceId: user.id,
    });

    return { message: 'Si cet email existe, un lien de reinitialisation a ete envoye' };
  }

  async resendVerification(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return { message: 'Si cet email existe, un nouveau lien a ete envoye' };
    }
    if (user.emailVerified) {
      return { message: 'Email deja verifie' };
    }

    user.verificationToken = randomUUID();
    await this.userRepository.save(user);
    await this.mailService.sendVerificationEmail(user.email, user.verificationToken);
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_VERIFICATION_RESENT',
      resourceType: 'user',
      resourceId: user.id,
    });

    return { message: 'Si cet email existe, un nouveau lien a ete envoye' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({ where: { resetToken: dto.token } });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Lien de reinitialisation invalide ou expire');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await this.userRepository.save(user);
    await this.auditService.log({
      actorUserId: user.id,
      action: 'USER_PASSWORD_RESET',
      resourceType: 'user',
      resourceId: user.id,
    });

    return { message: 'Mot de passe mis a jour avec succes' };
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}