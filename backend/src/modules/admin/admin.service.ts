import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier } from '../../entities/dossier.entity';
import { AuditService } from '../audit/audit.service';
import { AuditLog } from '../../entities/audit-log.entity';
import { DossierStatus } from '../../entities/dossier.entity';
import { User } from '../../entities/user.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { Document } from '../../entities/document.entity';
import * as fs from 'fs';
import * as path from 'path';
const archiver = require('archiver');
import { getUploadPathCandidates } from '../../common/uploads-path';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Dossier)
    private dossierRepo: Repository<Dossier>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    private auditService: AuditService,
  ) {}

  private extractHolder(dossier: Dossier) {
    const titulaire = (dossier.formData?.titulaire || {}) as Record<string, any>;
    return {
      civilite: titulaire.civilite || dossier.formData?.civilite || null,
      nom: titulaire.nom || dossier.formData?.nom || dossier.user?.lastName || null,
      prenom: titulaire.prenom || dossier.formData?.prenom || dossier.user?.firstName || null,
      email: titulaire.email || dossier.formData?.email || dossier.user?.email || null,
      telephone: titulaire.telephone || dossier.formData?.telephone || dossier.user?.phone || null,
      dateNaissance: titulaire.dateNaissance || dossier.formData?.dateNaissance || null,
      lieuNaissance: titulaire.lieuNaissance || dossier.formData?.lieuNaissance || null,
      adresse: titulaire.adresse || dossier.formData?.adresse || dossier.user?.address || null,
      codePostal: titulaire.codePostal || dossier.formData?.codePostal || null,
      ville: titulaire.ville || dossier.formData?.ville || null,
    };
  }

  private extractPrimaryVehicle(dossier: Dossier) {
    const relationVehicle = dossier.vehicles?.[0];
    const formVehicle = (dossier.formData?.vehicle || {}) as Record<string, any>;
    return {
      immatriculation: relationVehicle?.immatriculation || formVehicle.immatriculation || null,
      marque: relationVehicle?.marque || formVehicle.marque || null,
      modele: relationVehicle?.modele || formVehicle.modele || null,
      puissanceFiscale: relationVehicle?.puissanceFiscale ?? formVehicle.puissanceFiscale ?? null,
      energie: relationVehicle?.energie || formVehicle.energie || null,
      annee: relationVehicle?.annee ?? formVehicle.annee ?? null,
    };
  }

  async getAllDossiers() {
    const dossiers = await this.dossierRepo.find({
      relations: ['user', 'documents', 'payments', 'vehicles'],
      order: { createdAt: 'DESC' },
    });

    return dossiers.map((dossier) => {
      const holder = this.extractHolder(dossier);
      const primaryVehicle = this.extractPrimaryVehicle(dossier);
      const documents = (dossier.documents || []).map((document) => ({
        id: document.id,
        type: document.type,
        filename: document.filename,
        size: document.size,
        verified: document.verified,
        uploadedAt: document.uploadedAt,
      }));
      const payments = (dossier.payments || []).map((payment) => ({
        id: payment.id,
        montant: Number(payment.montant),
        statut: payment.statut,
        createdAt: payment.createdAt,
      }));

      return {
        id: dossier.id,
        numero: dossier.numero,
        typeDemande: dossier.typeDemande,
        statut: dossier.statut,
        prixTotal: Number(dossier.prixTotal),
        currentStep: dossier.currentStep,
        createdAt: dossier.createdAt,
        updatedAt: dossier.updatedAt,
        formData: dossier.formData || {},
        holder,
        primaryVehicle,
        paymentSummary: {
          total: payments.length,
          paid: payments.filter((payment) => payment.statut === PaymentStatus.SUCCEEDED).length,
          pending: payments.filter((payment) => payment.statut === PaymentStatus.PENDING).length,
          failed: payments.filter((payment) => payment.statut === PaymentStatus.FAILED).length,
        },
        documentSummary: {
          total: documents.length,
          verified: documents.filter((document) => document.verified).length,
        },
        user: dossier.user
          ? {
              id: dossier.user.id,
              firstName: dossier.user.firstName,
              lastName: dossier.user.lastName,
              email: dossier.user.email,
              phone: dossier.user.phone || null,
              address: dossier.user.address || null,
            }
          : null,
        vehicles: (dossier.vehicles || []).map((vehicle) => ({
          id: vehicle.id,
          immatriculation: vehicle.immatriculation,
          marque: vehicle.marque,
          modele: vehicle.modele,
          puissanceFiscale: vehicle.puissanceFiscale,
          energie: vehicle.energie,
          annee: vehicle.annee,
        })),
        documents,
        payments,
      };
    });
  }

  async updateDossierStatus(id: string, statut: DossierStatus, externalRef?: string, adminNote?: string) {
    const dossier = await this.dossierRepo.findOne({ where: { id } });

    if (!dossier) {
      throw new NotFoundException('Dossier introuvable');
    }

    const formData = { ...(dossier.formData || {}) } as Record<string, any>;
    const adminTracking = { ...(formData.adminTracking || {}) } as Record<string, any>;

    if (typeof externalRef === 'string') {
      adminTracking.externalRef = externalRef.trim();
    }
    if (typeof adminNote === 'string') {
      adminTracking.adminNote = adminNote.trim();
    }

    formData.adminTracking = adminTracking;

    await this.dossierRepo.update(id, { statut, formData });
    await this.auditService.log({
      action: 'ADMIN_DOSSIER_STATUS_UPDATED',
      resourceType: 'dossier',
      resourceId: id,
      details: { statut, externalRef: adminTracking.externalRef || null, adminNote: adminTracking.adminNote || null },
    });
    return { message: 'Statut mis à jour' };
  }

  async getAuditLogs() {
    return this.auditLogRepo.find({
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async getUsers() {
    return this.userRepo.find({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getOverview() {
    const [totalUsers, totalDossiers, totalPayments] = await Promise.all([
      this.userRepo.count(),
      this.dossierRepo.count(),
      this.paymentRepo.count(),
    ]);

    const [paidSalesCount, pendingSalesCount, failedSalesCount] = await Promise.all([
      this.paymentRepo.count({ where: { statut: PaymentStatus.SUCCEEDED } }),
      this.paymentRepo.count({ where: { statut: PaymentStatus.PENDING } }),
      this.paymentRepo.count({ where: { statut: PaymentStatus.FAILED } }),
    ]);

    const revenueRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.montant), 0)', 'totalRevenue')
      .where('payment.statut = :status', { status: PaymentStatus.SUCCEEDED })
      .getRawOne<{ totalRevenue: string }>();

    const revenueMonthRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.montant), 0)', 'revenueThisMonth')
      .where('payment.statut = :status', { status: PaymentStatus.SUCCEEDED })
      .andWhere('YEAR(payment.created_at) = YEAR(CURRENT_DATE())')
      .andWhere('MONTH(payment.created_at) = MONTH(CURRENT_DATE())')
      .getRawOne<{ revenueThisMonth: string }>();

    const dossiersByStatus = await this.dossierRepo
      .createQueryBuilder('dossier')
      .select('dossier.statut', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dossier.statut')
      .orderBy('count', 'DESC')
      .getRawMany<{ status: string; count: string }>();

    const recentSales = await this.paymentRepo.find({
      where: { statut: PaymentStatus.SUCCEEDED },
      relations: ['dossier', 'dossier.user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const totalRevenue = Number(revenueRaw?.totalRevenue || 0);
    const revenueThisMonth = Number(revenueMonthRaw?.revenueThisMonth || 0);

    return {
      kpis: {
        totalUsers,
        totalDossiers,
        totalPayments,
        totalSales: paidSalesCount,
        pendingSales: pendingSalesCount,
        failedSales: failedSalesCount,
        totalRevenue,
        revenueThisMonth,
        averageBasket: paidSalesCount > 0 ? totalRevenue / paidSalesCount : 0,
      },
      dossiersByStatus: dossiersByStatus.map((row) => ({
        status: row.status,
        count: Number(row.count),
      })),
      recentSales: recentSales.map((payment) => ({
        id: payment.id,
        montant: Number(payment.montant),
        statut: payment.statut,
        createdAt: payment.createdAt,
        dossierNumero: payment.dossier?.numero,
        client: payment.dossier?.user
          ? {
              fullName: `${payment.dossier.user.firstName} ${payment.dossier.user.lastName}`,
              email: payment.dossier.user.email,
            }
          : null,
      })),
    };
  }

  async deleteUser(userId: string, actorUserId?: string) {
    if (actorUserId && actorUserId === userId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte admin.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role === 'admin') {
      const adminCount = await this.userRepo.count({ where: { role: 'admin' as any } });
      if (adminCount <= 1) {
        throw new BadRequestException('Impossible de supprimer le dernier compte admin.');
      }
    }

    await this.userRepo.delete(userId);

    await this.auditService.log({
      actorUserId,
      action: 'ADMIN_USER_DELETED',
      resourceType: 'user',
      resourceId: userId,
      details: { email: user.email, role: user.role },
    });

    return { message: 'Compte supprimé avec succès' };
  }

  async getUserDocuments(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const documents = await this.documentRepo.find({
      where: { dossier: { user: { id: userId } } },
      relations: ['dossier', 'dossier.user'],
      order: { uploadedAt: 'DESC' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      filename: doc.filename,
      size: doc.size,
      verified: doc.verified,
      uploadedAt: doc.uploadedAt,
      dossierId: doc.dossier?.id,
      dossierNumero: doc.dossier?.numero,
      previewUrl: `/api/admin/documents/${doc.id}/preview`,
      downloadUrl: `/api/admin/documents/${doc.id}/download`,
    }));
  }

  private inferContentType(fileName: string) {
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.pdf') return 'application/pdf';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    return 'application/octet-stream';
  }

  private resolveFilePath(document: Document) {
    const candidates = getUploadPathCandidates(document.url || '');

    for (const candidate of candidates) {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  async getDocumentDownload(documentId: string) {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
      relations: ['dossier', 'dossier.user'],
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }

    const filePath = this.resolveFilePath(document);
    if (!filePath) {
      throw new NotFoundException('Fichier introuvable sur le serveur');
    }

    return {
      filePath,
      fileName: document.filename || path.basename(filePath),
      contentType: this.inferContentType(document.filename || filePath),
    };
  }

  private sanitizeFileName(value: string) {
    return (value || 'document').replace(/[^a-zA-Z0-9._-]+/g, '_');
  }

  private formatArchiveDate(value: Date | string | undefined) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return 'date_inconnue';
    }

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  async getDossierDocumentsArchive(dossierId: string) {
    const dossier = await this.dossierRepo.findOne({
      where: { id: dossierId },
      relations: ['documents', 'user'],
    });

    if (!dossier) {
      throw new NotFoundException('Dossier introuvable');
    }

    const docs = dossier.documents || [];
    if (docs.length === 0) {
      throw new NotFoundException('Aucun document dans ce dossier');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    let addedFiles = 0;

    docs.forEach((doc: Document, index: number) => {
      const filePath = this.resolveFilePath(doc);
      if (!filePath) {
        return;
      }

      addedFiles += 1;
      const ext = path.extname(doc.filename || filePath);
      const safeType = this.sanitizeFileName(String(doc.type || 'document'));
      const safeBase = this.sanitizeFileName(path.basename(doc.filename || filePath, ext));
      const archiveName = `${String(index + 1).padStart(2, '0')}_${safeType}_${safeBase}${ext}`;
      archive.file(filePath, { name: archiveName });
    });

    if (addedFiles === 0) {
      throw new NotFoundException('Aucun fichier disponible sur le serveur pour ce dossier');
    }

    const safeNumero = this.sanitizeFileName(dossier.numero || dossier.id);
    const safeClient = this.sanitizeFileName(`${dossier.user?.lastName || ''}_${dossier.user?.firstName || ''}`.replace(/^_+|_+$/g, '') || 'client');
    const safeStatus = this.sanitizeFileName(String(dossier.statut || 'statut'));
    const safeDate = this.formatArchiveDate(dossier.createdAt);
    return {
      archive,
      fileName: `dossier_${safeNumero}_${safeClient}_${safeStatus}_${safeDate}.zip`,
    };
  }
}