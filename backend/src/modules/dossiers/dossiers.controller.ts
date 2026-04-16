import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common'; import { DossiersService } from './dossiers.service'; import { CreateDossierDto, UpdateDossierStepDto } from './dto/dossier.dto'; import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('dossiers')
export class DossiersController { constructor(private readonly service: DossiersService) {}

  @Post('public/calculate-price')
  calculatePricePublic(@Body() body: any) {
    return this.service.calculatePrice(body.vehicleData, body.region); 
  }

  @Get('public/suivi/:numero')
  async findByNumeroPublic(@Param('numero') numero: string) {
    const dossier = await this.service.findByNumero(numero);
    return {
      numero: dossier.numero,
      typeDemande: dossier.typeDemande,
      statut: dossier.statut,
      createdAt: dossier.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('calculate-price') calculatePrice(@Body() body: any) { return this.service.calculatePrice(body.vehicleData, body.region); }
  @UseGuards(JwtAuthGuard)
  @Post(':id/step') updateStep(@Param('id') id: string, @Request() req, @Body() dto: UpdateDossierStepDto) { return this.service.updateStep(id, req.user.userId, dto); }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel') cancel(@Param('id') id: string, @Request() req) { return this.service.cancel(id, req.user.userId); }
  @UseGuards(JwtAuthGuard)
  @Delete(':id') remove(@Param('id') id: string, @Request() req) { return this.service.remove(id, req.user.userId); }
  @UseGuards(JwtAuthGuard)
  @Post() create(@Request() req, @Body() dto: CreateDossierDto) { return this.service.create(req.user.userId, dto); }
  @UseGuards(JwtAuthGuard)
  @Get('suivi/:numero') findByNumero(@Param('numero') numero: string) { return this.service.findByNumero(numero); }
  @UseGuards(JwtAuthGuard)
  @Get(':id') findOne(@Param('id') id: string, @Request() req) { return this.service.findOne(id, req.user.userId); }
  @UseGuards(JwtAuthGuard)
  @Get() findAll(@Request() req) { return this.service.findAll(req.user.userId); }
}