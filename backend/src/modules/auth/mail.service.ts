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

      this.transporter
        .verify()
        .then(() => this.logger.log('SMTP configure et pret a envoyer des emails'))
        .catch((error) => this.logger.error('SMTP configure mais verification echouee', error as any));
    }
  }

  private getFromAddress() {
    return this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER') || 'no-reply@certicarte.local';
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

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: 'Verification de votre email',
        html: `<p>Bonjour,</p><p>Confirmez votre email: <a href="${verifyLink}">${verifyLink}</a></p><p>Fallback API: <a href="${verifyApiLink}">${verifyApiLink}</a></p>`,
      });
    } catch (error) {
      this.logger.error(`Echec envoi email verification vers ${email}`, error as any);
    }
  }

  async sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
    const { frontendUrl } = this.getBaseUrls();
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    if (!this.transporter) {
      this.logger.warn(`SMTP non configure. Lien reset password: ${resetLink}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: 'Reinitialisation de mot de passe',
        html: `<p>Bonjour,</p><p>Reinitialisez votre mot de passe: <a href="${resetLink}">${resetLink}</a></p>`,
      });
    } catch (error) {
      this.logger.error(`Echec envoi email reset vers ${email}`, error as any);
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const { frontendUrl } = this.getBaseUrls();
    const dashboardLink = `${frontendUrl}/dashboard`;

    if (!this.transporter) {
      this.logger.warn(`SMTP non configure. Email bienvenue non envoye pour ${email}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: 'Bienvenue sur CertiCarte',
        html: `
          <p>Bonjour ${firstName || ''},</p>
          <p>Votre compte CertiCarte est cree et actif.</p>
          <p>Accedez a votre espace client : <a href="${dashboardLink}">${dashboardLink}</a></p>
          <p>Merci pour votre confiance.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Echec envoi email bienvenue vers ${email}`, error as any);
    }
  }

  async sendOrderConfirmationEmail(params: {
    email: string;
    firstName?: string;
    dossierNumero: string;
    modalite: string;
    montant: number;
    dossierId: string;
    paymentMode: 'mock' | 'stripe';
  }): Promise<void> {
    const { frontendUrl } = this.getBaseUrls();
    const dashboardLink = `${frontendUrl}/dashboard`;
    const suiviLink = `${frontendUrl}/suivi`;
    const safeMontant = Number(params.montant || 0).toFixed(2);

    if (!this.transporter) {
      this.logger.warn(`SMTP non configure. Email commande non envoye pour ${params.email} (dossier ${params.dossierNumero})`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: params.email,
        subject: `Confirmation de commande ${params.dossierNumero}`,
        html: `
          <p>Bonjour ${params.firstName || ''},</p>
          <p>Votre commande CertiCarte a bien ete enregistree.</p>
          <ul>
            <li><strong>Numero de dossier :</strong> ${params.dossierNumero}</li>
            <li><strong>Modalite :</strong> ${params.modalite}</li>
            <li><strong>Montant paye :</strong> ${safeMontant} EUR</li>
            <li><strong>Mode de paiement :</strong> ${params.paymentMode}</li>
          </ul>
          <p>Vous pouvez suivre votre dossier ici :</p>
          <p><a href="${dashboardLink}">${dashboardLink}</a></p>
          <p>Ou consulter le suivi public :</p>
          <p><a href="${suiviLink}">${suiviLink}</a></p>
          <p>Merci pour votre confiance.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Echec envoi email commande vers ${params.email} (${params.dossierNumero})`, error as any);
    }
  }
}
