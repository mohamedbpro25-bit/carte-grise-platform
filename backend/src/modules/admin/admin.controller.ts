import { Controller, Get, Patch, Param, Body, UseGuards, Delete, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateDossierStatusDto } from './dto/update-dossier-status.dto';
import { Res } from '@nestjs/common';
import { createReadStream } from 'fs';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dossiers')
  getAllDossiers() {
    return this.adminService.getAllDossiers();
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Req() req: any) {
    return this.adminService.deleteUser(id, req.user?.userId);
  }

  @Get('users/:id/documents')
  getUserDocuments(@Param('id') id: string) {
    return this.adminService.getUserDocuments(id);
  }

  @Get('documents/:id/download')
  async downloadDocument(@Param('id') id: string, @Res() res: any) {
    const data = await this.adminService.getDocumentDownload(id);
    res.setHeader('Content-Type', data.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(data.fileName)}"`);
    return createReadStream(data.filePath).pipe(res);
  }

  @Get('documents/:id/preview')
  async previewDocument(@Param('id') id: string, @Res() res: any) {
    const data = await this.adminService.getDocumentDownload(id);
    res.setHeader('Content-Type', data.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(data.fileName)}"`);
    return createReadStream(data.filePath).pipe(res);
  }

  @Get('dossiers/:id/documents.zip')
  async downloadDossierDocumentsZip(@Param('id') id: string, @Res() res: any) {
    const data = await this.adminService.getDossierDocumentsArchive(id);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(data.fileName)}"`);

    data.archive.on('error', () => {
      if (!res.headersSent) {
        res.status(500);
      }
      res.end();
    });

    data.archive.pipe(res);
    await data.archive.finalize();
  }

  @Patch('dossiers/:id/status')
  updateDossierStatus(@Param('id') id: string, @Body() body: UpdateDossierStatusDto) {
    return this.adminService.updateDossierStatus(id, body.statut, body.externalRef, body.adminNote);
  }
}