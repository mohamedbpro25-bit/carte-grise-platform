export const DOSSIER_TYPE_LABELS: Record<string, string> = {
  achat: 'Achat / cession vehicule occasion',
  changement_titulaire: 'Changement de proprietaire',
  changement_adresse: 'Changement d adresse',
  duplicata: 'Duplicata carte grise',
  immatriculation_etranger: 'Immatriculation vehicule etranger',
  immatriculation_import: 'Importation vehicule',
  immatriculation_provisoire: 'Immatriculation provisoire WW',
  carte_grise_deux_noms: 'Carte grise a deux noms',
  changement_matrimonial: 'Mariage / divorce (etat civil)',
  heritage: 'Heritage vehicule',
  sans_ancienne: 'Carte grise sans ancienne carte',
  correction: 'Correction de carte grise',
  declaration_cession: 'Enregistrement de cession',
  code_cession: 'Code de cession',
  certificat_non_gage: 'Certificat de non-gage',
  fiche_identification: 'Fiche d identification',
  fin_loa_location: 'Fin de LOA / location',
  carte_grise_remorque: 'Carte grise remorque',
  carte_grise_moto: 'Carte grise moto',
  carte_grise_scooter: 'Carte grise scooter',
  carte_grise_vehicule_electrique: 'Carte grise vehicule electrique',
  modification_technique: 'Modification caracteristiques techniques',
  conversion_ethanol: 'Conversion ethanol',
  carte_grise_collection: 'Carte grise collection',
  usurpation_plaques: 'Usurpation de plaques',
}

export const DOSSIER_STATUS_LABELS: Record<string, string> = {
  brouillon: 'En attente paiement',
  en_attente_paiement: 'En attente paiement',
  documents_attendus: 'En attente de validation',
  validation_administrative: 'Validation administrative',
  en_cours: 'En cours',
  termine: 'Termine',
  rejete: 'Rejete',
}

export const DOSSIER_STATUS_STYLES: Record<string, string> = {
  brouillon: 'bg-amber-100 text-amber-800',
  en_attente_paiement: 'bg-amber-100 text-amber-800',
  documents_attendus: 'bg-blue-100 text-blue-800',
  validation_administrative: 'bg-orange-100 text-orange-800',
  en_cours: 'bg-sky-100 text-sky-800',
  termine: 'bg-emerald-100 text-emerald-800',
  rejete: 'bg-red-100 text-red-800',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  paye: 'Paye',
  echoue: 'Echoue',
}

export const getDossierTypeLabel = (type: string) => DOSSIER_TYPE_LABELS[type] || type || '-'

export const getDossierStatusLabel = (status: string) => DOSSIER_STATUS_LABELS[status] || status || '-'

export const getPaymentStatusLabel = (status: string) => PAYMENT_STATUS_LABELS[status] || status || '-'

export const getDossierStatusClasses = (status: string) => DOSSIER_STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'