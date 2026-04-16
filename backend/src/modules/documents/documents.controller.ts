import { Controller, Post, Body, UploadedFiles, UseInterceptors, BadRequestException, Get, Param, Req, Res, UseGuards, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { createReadStream } from 'fs';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadDocuments(
    @Req() req: any,
    @UploadedFiles() files: any[] = [],
    @Body() body: any,
  ) {
    try {
      const { type, dossierId } = body || {};

      if (!dossierId) {
        throw new BadRequestException('Dossier ID is required');
      }

      if (!type) {
        throw new BadRequestException('Document type is required');
      }

      if (!files || files.length === 0) {
        throw new BadRequestException('Aucun fichier recu');
      }

      const uploadedDocuments = [];

      for (const file of files) {
        const document = await this.documentsService.uploadDocument(dossierId, req.user.userId, type, file);
        uploadedDocuments.push(document);
      }
      return { message: 'Documents uploaded successfully', documents: uploadedDocuments };
    } catch (error) {
      console.error('Upload error:', (error as Error).message);
      throw error;
    }
  }

  @Get(':id/preview')
  @UseGuards(JwtAuthGuard)
  async previewDocument(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const data = await this.documentsService.getPreviewForUser(id, req.user.userId);
    res.setHeader('Content-Type', data.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(data.fileName)}"`);
    return createReadStream(data.filePath).pipe(res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteDocument(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.deleteForUser(id, req.user.userId);
  }
}