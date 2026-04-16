import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../../entities/document.entity';
import { Dossier } from '../../entities/dossier.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ensureUploadsDir, getStoredUploadPath, getUploadPathCandidates, sanitizeUploadSegment } from '../../common/uploads-path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(Dossier)
    private dossierRepo: Repository<Dossier>,
  ) {}

  private extractStoredIndex(dossier: Dossier, fileName: string) {
    const safeNumero = sanitizeUploadSegment(dossier.numero || dossier.id);
    const baseName = path.basename(String(fileName || ''), path.extname(String(fileName || '')));
    const match = baseName.match(new RegExp(`^${safeNumero}_(\\d+)$`));
    return match ? Number(match[1]) : null;
  }

  private getNextStoredIndex(dossier: Dossier, documents: Document[], currentDocumentId?: string) {
    const usedIndexes = new Set(
      (documents || [])
        .filter((document) => document.id !== currentDocumentId)
        .map((document) => this.extractStoredIndex(dossier, document.filename || document.url || ''))
        .filter((value): value is number => Number.isInteger(value) && value > 0),
    );

    let nextIndex = 1;
    while (usedIndexes.has(nextIndex)) {
      nextIndex += 1;
    }

    return nextIndex;
  }

  private buildStoredFileName(dossier: Dossier, index: number, originalName: string) {
    const extension = path.extname(originalName || '').toLowerCase() || '.pdf';
    const safeNumero = sanitizeUploadSegment(dossier.numero || dossier.id);
    return `${safeNumero}_${index}${extension}`;
  }

  private moveUploadedFile(file: any, dossier: Dossier, index: number) {
    const storedFileName = this.buildStoredFileName(dossier, index, file?.originalname || file?.filename || 'document.pdf');
    const uploadsDir = ensureUploadsDir();
    const targetPath = path.join(uploadsDir, storedFileName);

    if (file?.path && path.resolve(file.path) !== path.resolve(targetPath)) {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      fs.renameSync(file.path, targetPath);
    }

    return {
      storedFileName,
      storedUrl: getStoredUploadPath(storedFileName),
      storedPath: targetPath,
    };
  }

  async uploadDocument(dossierId: string, userId: string, type: string, file: any) {
    try {
      if (!file || !file.originalname) {
        throw new NotFoundException('Fichier invalide');
      }

      if (!Object.values(DocumentType).includes(type as DocumentType)) {
        throw new BadRequestException('Type de document invalide');
      }

      const dossier = await this.dossierRepo.findOne({ where: { id: dossierId, user: { id: userId } }, relations: ['user', 'documents'] });

      if (!dossier) {
        throw new ForbiddenException('Acces interdit a ce dossier');
      }

      const existing = await this.documentRepo.findOne({
        where: { dossier: { id: dossier.id }, type: type as DocumentType },
        relations: ['dossier'],
      });
      const storedIndex = existing
        ? this.extractStoredIndex(dossier, existing.filename || existing.url || '') || this.getNextStoredIndex(dossier, dossier.documents || [], existing.id)
        : this.getNextStoredIndex(dossier, dossier.documents || []);
      const { storedFileName, storedUrl, storedPath } = this.moveUploadedFile(file, dossier, storedIndex);

      if (existing) {
        const oldFilePath = this.resolveFilePath(existing);
        existing.filename = storedFileName;
        existing.url = storedUrl;
        existing.size = file.size || 0;
        existing.verified = false;
        existing.uploadedAt = new Date();
        const updated = await this.documentRepo.save(existing);

        if (oldFilePath && fs.existsSync(oldFilePath) && path.resolve(oldFilePath) !== path.resolve(storedPath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (error) {
            console.warn('Impossible de supprimer l ancien fichier remplace:', (error as Error).message);
          }
        }
        return updated;
      }

      const document = this.documentRepo.create({
        dossier,
        type: type as DocumentType,
        filename: storedFileName,
        url: storedUrl,
        size: file.size || 0,
      });

      const savedDocument = await this.documentRepo.save(document);
      return savedDocument;
    } catch (error) {
      console.error('Document upload error:', (error as Error).message);
      throw error;
    }
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

  async getPreviewForUser(documentId: string, userId: string) {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
      relations: ['dossier', 'dossier.user'],
    });

    if (!document) {
      throw new NotFoundException('Document non trouve');
    }

    if (!document.dossier || document.dossier.user?.id !== userId) {
      throw new ForbiddenException('Acces interdit a ce document');
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

  async deleteForUser(documentId: string, userId: string) {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
      relations: ['dossier', 'dossier.user'],
    });

    if (!document) {
      throw new NotFoundException('Document non trouve');
    }

    if (!document.dossier || document.dossier.user?.id !== userId) {
      throw new ForbiddenException('Acces interdit a ce document');
    }

    const filePath = this.resolveFilePath(document);
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.warn('Impossible de supprimer le fichier physique:', (error as Error).message);
      }
    }

    await this.documentRepo.remove(document);
    return { message: 'Document supprime avec succes' };
  }
}