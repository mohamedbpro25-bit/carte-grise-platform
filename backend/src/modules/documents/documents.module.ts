import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Document } from '../../entities/document.entity';
import { Dossier } from '../../entities/dossier.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ensureUploadsDir } from '../../common/uploads-path';

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Dossier]),
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, ensureUploadsDir());
        },
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5,
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        const isAllowed = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension);

        callback(null, isAllowed);
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}