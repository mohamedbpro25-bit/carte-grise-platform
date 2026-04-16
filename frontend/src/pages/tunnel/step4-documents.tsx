import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useDropzone } from 'react-dropzone'
import Stepper from '@/components/UI/Stepper'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import api from '@/services/api'
import { authService } from '@/services/auth'
import { dossierService } from '@/services/dossier'
import toast from 'react-hot-toast'
const steps = ['Type', 'Vehicule', 'Titulaire', 'Documents', 'Paiement']
export default function Step4Documents() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  })
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', address: '' })
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({})
  const [dossierId, setDossierId] = useState<string | null>(null)
  const [dossierLoading, setDossierLoading] = useState(false)
  const [dossierError, setDossierError] = useState<string | null>(null)
  const [dossierType, setDossierType] = useState<string>('')

  const handleUnauthorizedState = () => {
    setIsAuthenticated(false)
    setProfileComplete(false)
    setDossierId(null)
    setDossierError('Session expirée ou invalide. Connectez-vous de nouveau pour continuer.')
  }

  const syncProfileState = () => {
    const user = authService.getCurrentUser()
    const complete = authService.isProfileComplete(user)
    setIsAuthenticated(!!user)
    setProfileComplete(complete)
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    })
    if (user && !complete) {
      setDossierError('Votre compte doit être complété avec téléphone et adresse avant de continuer.')
    }
    return { user, complete }
  }

  const createDossierIfNeeded = async () => {
    if (typeof window === 'undefined') return
    const { complete } = syncProfileState()
    const type = localStorage.getItem('dossierType')
    const vehicle = localStorage.getItem('vehicleData')
    const titulaire = localStorage.getItem('titulaireData')
    const simulation = localStorage.getItem('simulationData')
    const vehicleData = vehicle ? JSON.parse(vehicle) : null
    const titulaireData = titulaire ? JSON.parse(titulaire) : null
    const storedId = localStorage.getItem('dossierId')
    if (storedId && authService.isAuthenticated() && complete) {
      try {
        await dossierService.updateStep(storedId, 4, { vehicle: vehicleData || {}, titulaire: titulaireData || {} })
        setDossierId(storedId)
        setDossierError(null)
        return
      } catch {
        // Stale dossier from another account/session; recreate a valid one.
        localStorage.removeItem('dossierId')
        setDossierId(null)
      }
    }

    if (!authService.isAuthenticated()) {
      setDossierError('Connectez-vous ou creez votre compte pour upload les documents.')
      return
    }

    if (!complete) {
      setDossierId(null)
      return
    }

    if (!type || !vehicle || !titulaire) {
      setDossierError('Données manquantes : veuillez reprendre la démarche depuis le debut.')
      return
    }

    const simulationData = simulation ? JSON.parse(simulation) : null
    const mergedFormData = { vehicle: vehicleData || {}, titulaire: titulaireData || {} }

    setDossierLoading(true)
    try {
      let price = 49
      try {
        const calc = await dossierService.calculatePrice(vehicleData, simulationData?.region || 'ile-de-france')
        price = calc?.total ?? 49
      } catch {
        price = 49
      }

      const response = await dossierService.create({
        typeDemande: type,
        prixTotal: price,
        currentStep: 4,
        statut: 'en_attente_paiement',
        formData: mergedFormData,
      })
      localStorage.setItem('dossierId', response.id)
      setDossierId(response.id)
      setDossierError(null)
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleUnauthorizedState()
        return
      }
      console.error('Erreur creation dossier:', error)
      setDossierError('Impossible de creer le dossier. Veuillez vous reconnecter et reessayer.')
    } finally {
      setDossierLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedType = localStorage.getItem('dossierType')
    setDossierType(storedType || '')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    syncProfileState()
    createDossierIfNeeded()
  }, [])

  const handleAuthBeforeUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      if (authMode === 'login') {
        await authService.login({ email: authForm.email, password: authForm.password })
      } else {
        await authService.register({
          email: authForm.email,
          password: authForm.password,
          firstName: authForm.firstName,
          lastName: authForm.lastName,
          phone: authForm.phone,
          address: authForm.address,
        })
      }
      const { complete } = syncProfileState()
      toast.success(authMode === 'login' ? 'Connexion reussie' : 'Compte cree avec succes')
      if (complete) {
        await createDossierIfNeeded()
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error('Compte introuvable ou mot de passe incorrect. Si vous avez changé de base, créez un nouveau compte.')
      } else {
        toast.error(error?.response?.data?.message || 'Erreur authentification')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      const response = await authService.updateProfile(profileForm)
      syncProfileState()
      setDossierError(null)
      toast.success(response?.message || 'Profil mis a jour')
      await createDossierIfNeeded()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Impossible de mettre a jour le profil')
    } finally {
      setAuthLoading(false)
    }
  }

  const getRequiredDocuments = (type: string) => {
    const baseDocs = [
      { type: 'carte_identite', label: 'Carte d\'identité' },
      { type: 'justificatif_domicile', label: 'Justificatif de domicile' }
    ]

    switch (type) {
      case 'achat':
      case 'changement_titulaire':
        return [...baseDocs, { type: 'certificat_cession', label: 'Certificat de cession' }, { type: 'carte_grise_ancienne', label: 'Carte grise ancienne' }]
      case 'duplicata':
        return [...baseDocs, { type: 'declaration_perte_vol', label: 'Déclaration de perte/vol' }]
      case 'changement_adresse':
        return [...baseDocs, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'immatriculation_import':
      case 'immatriculation_etranger':
        return [...baseDocs, { type: 'certificat_conformite', label: 'Certificat de conformité' }, { type: 'quitus_fiscal', label: 'Quitus fiscal' }]
      case 'heritage':
        return [...baseDocs, { type: 'acte_deces', label: 'Acte de décès' }, { type: 'acte_succession', label: 'Acte de succession' }]
      case 'carte_grise_collection':
        return [...baseDocs, { type: 'certificat_collection', label: 'Certificat de collection' }]
      case 'certificat_non_gage':
        return [...baseDocs, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'immatriculation_provisoire':
        return [...baseDocs, { type: 'justificatif_achat', label: 'Justificatif d\'achat' }]
      case 'carte_grise_deux_noms':
        return [...baseDocs, { type: 'acte_mariage', label: 'Acte de mariage' }, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'sans_ancienne':
        return [...baseDocs, { type: 'declaration_sur_honneur', label: 'Déclaration sur l\'honneur' }]
      case 'fiche_identification':
        return [...baseDocs, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'changement_matrimonial':
        return [...baseDocs, { type: 'acte_mariage_divorce', label: 'Acte de mariage/divorce' }, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'modification_technique':
        return [...baseDocs, { type: 'certificat_conformite_modifie', label: 'Certificat de conformité modifié' }, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'conversion_ethanol':
        return [...baseDocs, { type: 'certificat_transformation', label: 'Certificat de transformation' }, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'usurpation_plaques':
        return [...baseDocs, { type: 'plainte_police', label: 'Plainte déposée à la police' }, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'correction':
        return [...baseDocs, { type: 'carte_grise_originale', label: 'Carte grise originale' }]
      case 'cession_enregistrement':
        return [...baseDocs, { type: 'certificat_cession', label: 'Certificat de cession' }]
      case 'declaration_vente':
        return [...baseDocs, { type: 'certificat_cession', label: 'Certificat de cession' }]
      default:
        return baseDocs
    }
  }

  const documents = getRequiredDocuments(dossierType || 'achat')

  const onDrop = useCallback(async (acceptedFiles: File[], type: string) => {
    if (!dossierId) {
      toast.error('Dossier introuvable. Veuillez créer un dossier d\'abord.');
      return;
    }

    if (!acceptedFiles || acceptedFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('type', type);
      formData.append('dossierId', dossierId);

      const response = await api.post('/documents/upload', formData);

      await dossierService.updateStep(dossierId, 4, {
        vehicle: JSON.parse(localStorage.getItem('vehicleData') || '{}'),
        titulaire: JSON.parse(localStorage.getItem('titulaireData') || '{}'),
      })

      setUploadedFiles(prev => ({ ...prev, [type]: acceptedFiles }));
      toast.success('Fichiers uploadés avec succès!');
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleUnauthorizedState()
        toast.error('Connexion requise pour uploader les documents')
        return
      }
      console.error('Upload failed:', error?.response?.data || error?.message || error);
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  }, [dossierId]);

  const handleContinue = async () => {
    if (dossierId) {
      try {
        await dossierService.updateStep(dossierId, 4, {
          vehicle: JSON.parse(localStorage.getItem('vehicleData') || '{}'),
          titulaire: JSON.parse(localStorage.getItem('titulaireData') || '{}'),
        })
      } catch {
        toast.error('Impossible de synchroniser le dossier avant le paiement')
        return
      }
    }
    router.push('/tunnel/step5-paiement')
  }
  return (
    <>
      <Head><title>Documents - Carte grise</title></Head>
      <div className="container-custom py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Documents necessaires</h1>
            <Stepper steps={steps} currentStep={4} />
          </div>
          <div className="p-8">
            {dossierError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {dossierError}
              </div>
            )}
            {dossierLoading && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
                Création du dossier en cours...
              </div>
            )}
            {!isAuthenticated && (
              <form onSubmit={handleAuthBeforeUpload} className="mb-6 rounded-xl border border-slate-200 p-5 text-left">
                <p className="mb-4 text-sm text-slate-700">Connectez-vous ou creez votre compte pour uploader vos documents.</p>
                <div className="mb-4 flex gap-2">
                  <button type="button" className={`rounded-full px-4 py-2 text-sm ${authMode === 'login' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setAuthMode('login')}>Connexion</button>
                  <button type="button" className={`rounded-full px-4 py-2 text-sm ${authMode === 'register' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setAuthMode('register')}>Inscription</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {authMode === 'register' && (
                    <>
                      <Input label="Prenom" required value={authForm.firstName} onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })} />
                      <Input label="Nom" required value={authForm.lastName} onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })} />
                      <Input label="Telephone" required value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} />
                      <Input label="Adresse" required value={authForm.address} onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })} />
                    </>
                  )}
                  <Input label="Email" type="email" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                  <Input label="Mot de passe" type="password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                </div>
                <div className="mt-4">
                  <Button type="submit" loading={authLoading}>{authMode === 'login' ? 'Se connecter' : 'Creer mon compte'}</Button>
                </div>
              </form>
            )}
            {isAuthenticated && !profileComplete && (
              <form onSubmit={handleCompleteProfile} className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
                <p className="mb-4 text-sm text-amber-900">Votre compte n'est pas complet. Renseignez vos coordonnees pour continuer.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Prenom" required value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                  <Input label="Nom" required value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                  <Input label="Telephone" required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  <Input label="Adresse" required value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                </div>
                <div className="mt-4">
                  <Button type="submit" loading={authLoading}>Valider mon profil</Button>
                </div>
              </form>
            )}
            {!dossierId && !dossierLoading && isAuthenticated && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                {profileComplete
                  ? 'Creation du dossier en attente. Patientez quelques secondes puis reessayez.'
                  : 'Le dossier sera cree une fois votre profil compte complet.'}
              </div>
            )}
            <div className="space-y-6">
              {documents.map((doc) => (
                <div key={doc.type} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{doc.label}</h3>
                  <DocumentDropzone onDrop={(files) => onDrop(files, doc.type)} disabled={!dossierId || dossierLoading || authLoading || !isAuthenticated || !profileComplete} />
                  {uploadedFiles[doc.type] && uploadedFiles[doc.type].length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers uploadés :</h4>
                      <ul className="space-y-1">
                        {uploadedFiles[doc.type].map((file, index) => (
                          <li key={index} className="text-sm text-green-600 flex items-center">
                            <span className="mr-2">✓</span>
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => router.push('/tunnel/step3-titulaire')}>Retour</Button>
              <Button onClick={handleContinue} disabled={uploading || dossierLoading || !profileComplete}>Continuer</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
type DocumentDropzoneProps = {
  onDrop: (files: File[]) => void
  disabled?: boolean
}

function DocumentDropzone({ onDrop, disabled = false }: DocumentDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    onDropRejected: () => {
      toast.error('Formats acceptes: PDF, JPG, PNG, WEBP. Taille max 10 Mo.')
    },
  })
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
      <input {...getInputProps()} />
      <p>{disabled ? 'Connectez-vous pour uploader vos fichiers' : isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez ou cliquez'}</p>
      <p className="mt-2 text-xs text-gray-500">PDF, JPG, PNG ou WEBP, 10 Mo maximum</p>
    </div>
  )
}