import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'; import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm'; import { Dossier, DossierStatus } from '../../entities/dossier.entity'; import { User } from '../../entities/user.entity'; import { CreateDossierDto, UpdateDossierStepDto } from './dto/dossier.dto'; import * as fs from 'fs'; import * as path from 'path'; import { Vehicle } from '../../entities/vehicle.entity'; import { Document } from '../../entities/document.entity'; import { Payment, PaymentStatus } from '../../entities/payment.entity'; import { getUploadPathCandidates } from '../../common/uploads-path';
function generateDossierNumber() { const date = new Date(); return `CG-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*10000)}`; }

function getPricingConfig(): any {
  try {
    const configPath = path.join(__dirname, '../../config/pricing.config.json');
    const rawData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Erreur lecture pricing.config.json:', error);
    return null;
  }
}

function calculatePrice(vehicle: any, region: string) {
  const config = getPricingConfig();
  
  if (!config) {
    console.warn('Config pricing non trouvée, utilisation tarifs par défaut');
    return { gestionFee: 11.00, regionalTax: 220.00, postageFee: 2.50, total: 233.50 };
  }

  const safeRegion = typeof region === 'string' && region.trim() ? region.trim() : 'ile-de-france';
  const regionalKey = safeRegion.toLowerCase().replace(/\s+/g, '-');
  const regionalData = config.regional_rates[regionalKey];
  const rawPuissance = Number(vehicle?.puissanceFiscale);
  const puissanceFiscale = Number.isFinite(rawPuissance) && rawPuissance > 0 ? rawPuissance : 5;
  
  if (!regionalData) {
    console.warn(`Région ${safeRegion} non trouvée, utilisation tarif par défaut (44€/CV)`);
    const fallbackRegionalTax = Math.round((puissanceFiscale * 44.00) * 100) / 100;
    const fallbackTotal = Math.round((11.00 + fallbackRegionalTax + 2.50) * 100) / 100;
    return { gestionFee: 11.00, regionalTax: fallbackRegionalTax, postageFee: 2.50, total: fallbackTotal, region: safeRegion, puissanceFiscale };
  }

  // Taxe régionale
  const regionalTax = Math.round((puissanceFiscale * regionalData.rate_per_cv) * 100) / 100;

  // Frais ANTS
  const gestionFee = config.fixed_fees.ants_fee;

  // Frais de poste
  const postageFee = config.fixed_fees.postage_fee;

  const total = gestionFee + regionalTax + postageFee;

  return {
    gestionFee,
    regionalTax,
    postageFee,
    total: Math.round(total * 100) / 100,
    region: regionalData.name,
    puissanceFiscale
  };
}
@Injectable()
export class DossiersService {
  constructor(
    @InjectRepository(Dossier) private dossierRepo: Repository<Dossier>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Document) private documentRepo: Repository<Document>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  private mergeFormData(existing: any, incoming: any) {
    return { ...(existing || {}), ...(incoming || {}) };
  }

  private normalizeText(value: unknown) {
    return String(value || '').trim().toLowerCase();
  }

  private isSameDraftCandidate(dossier: Dossier, dto: CreateDossierDto) {
    const existingVehicle = (dossier.formData?.vehicle as Record<string, any> | undefined) || {};
    const incomingVehicle = (dto.formData?.vehicle as Record<string, any> | undefined) || {};
    const existingTitulaire = (dossier.formData?.titulaire as Record<string, any> | undefined) || {};
    const incomingTitulaire = (dto.formData?.titulaire as Record<string, any> | undefined) || {};

    return this.normalizeText(dossier.typeDemande) === this.normalizeText(dto.typeDemande)
      && this.normalizeText(existingVehicle.immatriculation) === this.normalizeText(incomingVehicle.immatriculation)
      && this.normalizeText(existingVehicle.marque) === this.normalizeText(incomingVehicle.marque)
      && this.normalizeText(existingVehicle.modele) === this.normalizeText(incomingVehicle.modele)
      && this.normalizeText(existingTitulaire.nom) === this.normalizeText(incomingTitulaire.nom)
      && this.normalizeText(existingTitulaire.prenom) === this.normalizeText(incomingTitulaire.prenom)
      && this.normalizeText(existingTitulaire.email) === this.normalizeText(incomingTitulaire.email);
  }

  private async findReusableDraft(userId: string, dto: CreateDossierDto) {
    const candidates = await this.dossierRepo.find({
      where: {
        user: { id: userId },
        typeDemande: dto.typeDemande,
      },
      relations: ['payments'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

    return candidates.find((candidate) => {
      const hasSucceededPayment = (candidate.payments || []).some((payment) => payment.statut === PaymentStatus.SUCCEEDED);
      if (hasSucceededPayment) return false;
      if ([DossierStatus.COMPLETED, DossierStatus.REJECTED].includes(candidate.statut)) return false;
      if (new Date(candidate.createdAt).getTime() < sixHoursAgo) return false;
      return this.isSameDraftCandidate(candidate, dto);
    });
  }

  private async syncVehicleFromFormData(dossier: Dossier) {
    const vehicleData = dossier.formData?.vehicle;
    if (!vehicleData || !vehicleData.immatriculation) {
      return;
    }

    let vehicle = await this.vehicleRepo.findOne({ where: { dossier: { id: dossier.id } } });
    if (!vehicle) {
      vehicle = this.vehicleRepo.create({ dossier });
    }

    vehicle.immatriculation = String(vehicleData.immatriculation || '').toUpperCase();
    vehicle.marque = String(vehicleData.marque || '');
    vehicle.modele = String(vehicleData.modele || '');
    vehicle.energie = String(vehicleData.energie || '');
    vehicle.puissanceFiscale = Number(vehicleData.puissanceFiscale || 0);
    vehicle.annee = Number(vehicleData.annee || 0);
    await this.vehicleRepo.save(vehicle);
  }

  async create(userId: string, dto: CreateDossierDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouve');

    const reusableDraft = await this.findReusableDraft(userId, dto);
    if (reusableDraft) {
      reusableDraft.prixTotal = dto.prixTotal || reusableDraft.prixTotal || 0;
      reusableDraft.currentStep = Math.max(reusableDraft.currentStep || 1, dto.currentStep || 1);
      reusableDraft.statut = dto.statut || (reusableDraft.statut === DossierStatus.DRAFT ? DossierStatus.PENDING_PAYMENT : reusableDraft.statut);
      reusableDraft.formData = this.mergeFormData(reusableDraft.formData, dto.formData || {});
      await this.dossierRepo.save(reusableDraft);
      await this.syncVehicleFromFormData(reusableDraft);
      return this.findOne(reusableDraft.id, userId);
    }

    const dossier = this.dossierRepo.create({
      user,
      typeDemande: dto.typeDemande,
      prixTotal: dto.prixTotal || 0,
      numero: generateDossierNumber(),
      currentStep: dto.currentStep || 1,
      statut: dto.statut || DossierStatus.PENDING_PAYMENT,
      formData: dto.formData || {},
    });

    const saved = await this.dossierRepo.save(dossier);
    await this.syncVehicleFromFormData(saved);
    return this.findOne(saved.id, userId);
  }

  async findAll(userId: string) {
    return this.dossierRepo.find({ where: { user: { id: userId } }, relations: ['vehicles', 'documents', 'payments'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const dossier = await this.dossierRepo.findOne({ where: { id, user: { id: userId } }, relations: ['user', 'vehicles', 'documents', 'payments'] });
    if (!dossier) throw new NotFoundException('Dossier non trouve');
    return dossier;
  }

  async findByNumero(numero: string) { const dossier = await this.dossierRepo.findOne({ where: { numero }, relations: ['user'] }); if (!dossier) throw new NotFoundException('Dossier non trouve'); return dossier; }

  async updateStep(id: string, userId: string, dto: UpdateDossierStepDto) {
    const dossier = await this.findOne(id, userId);
    dossier.currentStep = Math.max(Number(dossier.currentStep || 1), Number(dto.currentStep || 1));
    if (dto.formData) dossier.formData = this.mergeFormData(dossier.formData, dto.formData);
    if (dto.statut) {
      dossier.statut = dto.statut;
    } else if (dossier.statut === DossierStatus.DRAFT) {
      dossier.statut = DossierStatus.PENDING_PAYMENT;
    }
    await this.dossierRepo.save(dossier);
    await this.syncVehicleFromFormData(dossier);
    return this.findOne(dossier.id, userId);
  }

  async cancel(id: string, userId: string) {
    const dossier = await this.findOne(id, userId);
    if (dossier.statut === DossierStatus.COMPLETED) {
      throw new BadRequestException('Impossible d annuler une demarche terminee');
    }

    dossier.statut = DossierStatus.REJECTED;
    dossier.formData = this.mergeFormData(dossier.formData, {
      userCancellation: {
        cancelledAt: new Date().toISOString(),
        reason: 'Annule par le client',
      },
    });
    await this.dossierRepo.save(dossier);
    return { message: 'Demarche annulee avec succes' };
  }

  async remove(id: string, userId: string) {
    const dossier = await this.findOne(id, userId);
    const successfulPayments = (dossier.payments || []).filter((payment) => payment.statut === PaymentStatus.SUCCEEDED);
    if (successfulPayments.length > 0) {
      throw new BadRequestException('Impossible de supprimer une demarche deja payee. Annulez-la a la place.');
    }

    for (const document of dossier.documents || []) {
      const candidates = getUploadPathCandidates(document.url || '');
      for (const candidate of candidates) {
        if (candidate && fs.existsSync(candidate)) {
          try {
            fs.unlinkSync(candidate);
          } catch {
            // best effort only
          }
          break;
        }
      }
    }

    await this.documentRepo.delete({ dossier: { id: dossier.id } as any });
    await this.paymentRepo.delete({ dossier: { id: dossier.id } as any });
    await this.vehicleRepo.delete({ dossier: { id: dossier.id } as any });
    await this.dossierRepo.delete(dossier.id);
    return { message: 'Demarche supprimee avec succes' };
  }

  async calculatePrice(vehicleData: any, region: string) { return calculatePrice(vehicleData, region); }
}