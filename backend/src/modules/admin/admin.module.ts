import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Dossier } from '../../entities/dossier.entity';
import { AuditModule } from '../audit/audit.module';
import { AuditLog } from '../../entities/audit-log.entity';
import { User } from '../../entities/user.entity';
import { Payment } from '../../entities/payment.entity';
import { Document } from '../../entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dossier, AuditLog, User, Payment, Document]), AuditModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}