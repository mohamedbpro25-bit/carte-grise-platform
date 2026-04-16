import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm'; import { Dossier } from './dossier.entity';
export enum DocumentType {
  CARTE_IDENTITE = 'carte_identite',
  JUSTIFICATIF_DOMICILE = 'justificatif_domicile',
  CERTIFICAT_CESSION = 'certificat_cession',
  CARTE_GRISE_ANCIENNE = 'carte_grise_ancienne',
  DECLARATION_PERTE_VOL = 'declaration_perte_vol',
  CARTE_GRISE_ORIGINALE = 'carte_grise_originale',
  CERTIFICAT_CONFORMITE = 'certificat_conformite',
  QUITUS_FISCAL = 'quitus_fiscal',
  ACTE_DECES = 'acte_deces',
  ACTE_SUCCESSION = 'acte_succession',
  CERTIFICAT_COLLECTION = 'certificat_collection',
  JUSTIFICATIF_ACHAT = 'justificatif_achat',
  ACTE_MARIAGE = 'acte_mariage',
  DECLARATION_SUR_HONNEUR = 'declaration_sur_honneur',
  ACTE_MARIAGE_DIVORCE = 'acte_mariage_divorce',
  CERTIFICAT_CONFORMITE_MODIFIE = 'certificat_conformite_modifie',
  CERTIFICAT_TRANSFORMATION = 'certificat_transformation',
  PLAINTE_POLICE = 'plainte_police'
}
@Entity('documents')
export class Document { @PrimaryGeneratedColumn('uuid') id: string; @ManyToOne(() => Dossier, dossier => dossier.documents) @JoinColumn({ name: 'dossier_id' }) dossier: Dossier; @Column({ type: 'enum', enum: DocumentType }) type: DocumentType; @Column() url: string; @Column() filename: string; @Column('int') size: number; @Column({ default: false }) verified: boolean; @CreateDateColumn({ name: 'uploaded_at' }) uploadedAt: Date; }