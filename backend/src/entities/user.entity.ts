import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Dossier } from './dossier.entity';

export enum UserRole {
  USER = 'user',
  PRO = 'pro',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'verification_token', nullable: true })
  verificationToken?: string | null;

  @Column({ name: 'reset_token', nullable: true })
  resetToken?: string | null;

  @Column({ name: 'reset_token_expires_at', type: 'datetime', nullable: true })
  resetTokenExpiresAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Dossier, (dossier) => dossier.user)
  dossiers!: Dossier[];
}