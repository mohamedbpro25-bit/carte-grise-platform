import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'; import { User } from './user.entity'; import { Vehicle } from './vehicle.entity'; import { Document } from './document.entity'; import { Payment } from './payment.entity';
export enum DossierStatus { DRAFT = 'brouillon', PENDING_PAYMENT = 'en_attente_paiement', PENDING_DOCUMENTS = 'documents_attendus', PENDING_VALIDATION = 'validation_administrative', IN_PROGRESS = 'en_cours', COMPLETED = 'termine', REJECTED = 'rejete' }
export enum DemarcheType {
  ACHAT = 'achat',
  DUPLICATA = 'duplicata',
  CHANGEMENT_ADRESSE = 'changement_adresse',
  CHANGEMENT_TITULAIRE = 'changement_titulaire',
  DECLARATION_VENTE = 'declaration_vente',
  DECLARATION_CESSION = 'declaration_cession',
  CERTIFICAT_NON_GAGE = 'certificat_non_gage',
  IMMATRICULATION_IMPORT = 'immatriculation_import',
  IMMATRICULATION_PROVISOIRE = 'immatriculation_provisoire',
  CARTE_GRISE_DEUX_NOMS = 'carte_grise_deux_noms',
  CARTE_GRISE_REMORQUE = 'carte_grise_remorque',
  CARTE_GRISE_MOTO = 'carte_grise_moto',
  CARTE_GRISE_SCOOTER = 'carte_grise_scooter',
  CARTE_GRISE_VEHICULE_ELECTRIQUE = 'carte_grise_vehicule_electrique',
  HERITAGE = 'heritage',
  SANS_ANCIENNE = 'sans_ancienne',
  FICHE_IDENTIFICATION = 'fiche_identification',
  CHANGEMENT_MATRIMONIAL = 'changement_matrimonial',
  FIN_LOA_LOCATION = 'fin_loa_location',
  CODE_CESSION = 'code_cession',
  MODIFICATION_TECHNIQUE = 'modification_technique',
  CONVERSION_ETHANOL = 'conversion_ethanol',
  CARTE_GRISE_COLLECTION = 'carte_grise_collection',
  USURPATION_PLAQUES = 'usurpation_plaques',
  CORRECTION = 'correction',
  IMMATRICULATION_ETRANGER = 'immatriculation_etranger',
  CESSION_ENREGISTREMENT = 'cession_enregistrement'
}
@Entity('dossiers')
export class Dossier { @PrimaryGeneratedColumn('uuid') id: string; @Column({ unique: true }) numero: string; @ManyToOne(() => User, user => user.dossiers) @JoinColumn({ name: 'user_id' }) user: User; @Column({ name: 'type_demande', type: 'enum', enum: DemarcheType }) typeDemande: DemarcheType; @Column({ type: 'enum', enum: DossierStatus, default: DossierStatus.DRAFT }) statut: DossierStatus; @Column({ name: 'prix_total', type: 'decimal', precision: 10, scale: 2 }) prixTotal: number; @Column({ name: 'current_step', default: 1 }) currentStep: number; @Column({ name: 'form_data', type: 'json', nullable: true }) formData: any; @CreateDateColumn({ name: 'created_at' }) createdAt: Date; @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date; @OneToMany(() => Vehicle, vehicle => vehicle.dossier) vehicles: Vehicle[]; @OneToMany(() => Document, document => document.dossier) documents: Document[]; @OneToMany(() => Payment, payment => payment.dossier) payments: Payment[]; }