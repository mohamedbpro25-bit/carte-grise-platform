import { Controller, Post, Param, Body, BadRequestException, Headers, Req, UseGuards } from '@nestjs/common'; import { PaiementService } from './paiement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('paiement')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  @Post('create-session/:id')
  @UseGuards(JwtAuthGuard)
  async createSession(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { successUrl?: string; cancelUrl?: string },
  ) {
    const { successUrl, cancelUrl } = body;
    if (!successUrl || !cancelUrl) {
      throw new BadRequestException('successUrl et cancelUrl sont obligatoires');
    }
    const session = await this.paiementService.createCheckoutSession(id, req.user.userId, successUrl, cancelUrl);
    return { url: session.url };
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
    if (!signature) {
      throw new BadRequestException('Stripe signature manquante');
    }
    return this.paiementService.handleStripeWebhook(req.body, signature);
  }
}
