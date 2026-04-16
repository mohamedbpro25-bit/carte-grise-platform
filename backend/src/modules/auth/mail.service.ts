import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  private getBaseUrls() {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const backendUrl = this.config.get<string>('BACKEND_URL') || 'http://localhost:4000';
    return { frontendUrl, backendUrl };
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const { frontendUrl, backendUrl } = this.getBaseUrls();
    const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const verifyApiLink = `${backendUrl}/api/auth/verify-email?token=${verificationToken}`;

    if (!this.transporter) {
      this.logger.warn(`SMTP non configure. Lien verification frontend: ${verifyLink}`);
      this.logger.warn(`SMTP non configure. Lien verification api: ${verifyApiLink}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM') || 'no-reply@cartegrise.local',
      to: email,
      subject: 'Verification de votre email',
      html: `<p>Bonjour,</p><p>Confirmez votre email: <a href="${verifyLink}">${verifyLink}</a></p><p>Fallback API: <a href="${verifyApiLink}">${verifyApiLink}</a></p>`,
    });
  }

  async sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
    const { frontendUrl } = this.getBaseUrls();
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    if (!this.transporter) {
      this.logger.warn(`SMTP non configure. Lien reset password: ${resetLink}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM') || 'no-reply@cartegrise.local',
      to: email,
      subject: 'Reinitialisation de mot de passe',
      html: `<p>Bonjour,</p><p>Reinitialisez votre mot de passe: <a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}
