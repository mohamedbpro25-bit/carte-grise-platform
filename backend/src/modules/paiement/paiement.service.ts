import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'; import { ConfigService } from '@nestjs/config'; import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm'; import Stripe from 'stripe'; import { Payment, PaymentStatus } from '../../entities/payment.entity'; import { Dossier, DossierStatus } from '../../entities/dossier.entity'; import { AuditService } from '../audit/audit.service';
import { MailService } from '../auth/mail.service';

@Injectable()
export class PaiementService {
  private readonly logger = new Logger(PaiementService.name);
  private stripe: Stripe;
  private paymentsMode: 'stripe' | 'mock';

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Dossier)
    private dossierRepo: Repository<Dossier>,
    private config: ConfigService,
    private auditService: AuditService,
    private mailService: MailService,
  ) {
    this.paymentsMode = (this.config.get<string>('PAYMENTS_MODE') || 'stripe') as 'stripe' | 'mock';
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (this.paymentsMode === 'stripe') {
      if (!secret) {
        throw new Error('STRIPE_SECRET_KEY is not defined');
      }
      this.stripe = new Stripe(secret, { apiVersion: '2023-10-16' });
    }
  }

  private async trySendOrderConfirmation(dossier: Dossier, mode: 'mock' | 'stripe') {
    const email = dossier.user?.email;
    if (!email) return;

    try {
      await this.mailService.sendOrderConfirmationEmail({
        email,
        firstName: dossier.user?.firstName,
        dossierNumero: dossier.numero,
        modalite: dossier.typeDemande,
        montant: Number(dossier.prixTotal),
        dossierId: dossier.id,
        paymentMode: mode,
      });
    } catch (error) {
      this.logger.error(`Echec envoi email commande pour dossier ${dossier.numero}`, error as any);
    }
  }

  async createCheckoutSession(dossierId: string, userId: string, successUrl: string, cancelUrl: string) {
    const dossier = await this.dossierRepo.findOne({ where: { id: dossierId, user: { id: userId } }, relations: ['user'] });
    if (!dossier) {
      throw new NotFoundException('Dossier non trouve');
    }

    if (this.paymentsMode === 'mock') {
      const payment = this.paymentRepo.create({
        dossier,
        montant: Number(dossier.prixTotal),
        statut: PaymentStatus.SUCCEEDED,
        stripeSessionId: `mock_${Date.now()}`,
      });
      await this.paymentRepo.save(payment);

      dossier.statut = DossierStatus.PENDING_DOCUMENTS;
      await this.dossierRepo.save(dossier);

      await this.auditService.log({
        actorUserId: userId,
        action: 'PAYMENT_MOCK_SUCCEEDED',
        resourceType: 'payment',
        resourceId: payment.id,
        details: { dossierId: dossier.id, mode: 'mock' },
      });

      await this.trySendOrderConfirmation(dossier, 'mock');

      return { url: successUrl };
    }

    const amountInCents = Math.round(Number(dossier.prixTotal) * 100);
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Paiement dossier ${dossier.numero}`,
              description: `Paiement de la demande ${dossier.typeDemande}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { dossierId: dossier.id },
    });

    const payment = this.paymentRepo.create({
      dossier,
      montant: Number(dossier.prixTotal),
      statut: PaymentStatus.PENDING,
      stripeSessionId: session.id,
    });
    await this.paymentRepo.save(payment);

    dossier.statut = DossierStatus.PENDING_PAYMENT;
    await this.dossierRepo.save(dossier);

    return session;
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    if (this.paymentsMode === 'mock') {
      return { received: true, mode: 'mock' };
    }

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not defined');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Signature webhook invalide');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const stripeSessionId = session.id;
      const dossierId = session.metadata?.dossierId;

      if (stripeSessionId) {
        const payment = await this.paymentRepo.findOne({ where: { stripeSessionId }, relations: ['dossier', 'dossier.user'] });
        if (payment) {
          payment.statut = PaymentStatus.SUCCEEDED;
          await this.paymentRepo.save(payment);

          payment.dossier.statut = DossierStatus.PENDING_DOCUMENTS;
          await this.dossierRepo.save(payment.dossier);

          await this.auditService.log({
            action: 'PAYMENT_SUCCEEDED',
            resourceType: 'payment',
            resourceId: payment.id,
            details: { stripeSessionId, dossierId: payment.dossier.id },
          });

          await this.trySendOrderConfirmation(payment.dossier, 'stripe');
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await this.paymentRepo.findOne({ where: { stripeSessionId: session.id }, relations: ['dossier'] });
      if (payment) {
        payment.statut = PaymentStatus.FAILED;
        await this.paymentRepo.save(payment);
        await this.auditService.log({
          action: 'PAYMENT_FAILED',
          resourceType: 'payment',
          resourceId: payment.id,
          details: { stripeSessionId: session.id },
        });
      }
    }

    return { received: true };
  }
}
