import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DossierStatus } from '../../../entities/dossier.entity';

export class UpdateDossierStatusDto {
  @IsEnum(DossierStatus)
  statut!: DossierStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNote?: string;
}