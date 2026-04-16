import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { dossierService } from '@/services/dossier'
import { getDossierStatusLabel, getDossierTypeLabel, getPaymentStatusLabel } from '@/services/display'
import api from '@/services/api'
import toast from 'react-hot-toast'

type DossierDetail = {
  id: string
  numero: string
  typeDemande: string
  statut: string
  prixTotal: number
  createdAt: string
  currentStep: number
  formData?: Record<string, any>
  user?: { firstName: string; lastName: string; email: string; phone?: string }
  vehicles?: Array<{ id: string; immatriculation?: string; marque?: string; modele?: string; puissanceFiscale?: number; energie?: string; annee?: number }>
  documents?: Array<{ id: string; type: string; filename: string; size: number; verified: boolean; uploadedAt: string }>
  payments?: Array<{ id: string; montant: number; statut: string; stripeSessionId?: string; createdAt: string }>
}

export default function DossierDetailPage() {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : ''
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null)
  const [pendingDocId, setPendingDocId] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<'cancel' | 'delete' | null>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setIsLoggedIn(false)
      router.push('/login')
      return
    }
    setIsLoggedIn(true)
  }, [router])

  const { data, isLoading, error, refetch } = useQuery<DossierDetail>({
    queryKey: ['dossier-detail', id],
    queryFn: () => dossierService.getOne(id),
    enabled: !!id && isLoggedIn === true,
  })

  const previewDocument = async (docId: string) => {
    try {
      const response = await api.get(`/documents/${docId}/preview`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      toast.error('Impossible d afficher la previsualisation')
    }
  }

  const deleteDocument = async (docId: string) => {
    const confirmDelete = window.confirm('Supprimer ce document ?')
    if (!confirmDelete) return
    setPendingDocId(docId)
    try {
      await api.delete(`/documents/${docId}`)
      toast.success('Document supprime')
      await refetch()
    } catch {
      toast.error('Suppression impossible')
    } finally {
      setPendingDocId(null)
    }
  }

  const replaceDocument = async (docId: string, dossierId: string, type: string, file: File) => {
    setPendingDocId(docId)
    try {
      await api.delete(`/documents/${docId}`)
      const formData = new FormData()
      formData.append('files', file)
      formData.append('type', type)
      formData.append('dossierId', dossierId)
      await api.post('/documents/upload', formData)
      toast.success('Document remplace avec succes')
      await refetch()
    } catch {
      toast.error('Remplacement impossible')
    } finally {
      setPendingDocId(null)
    }
  }

  const holder = data?.formData?.titulaire || {}
  const vehicleFromForm = data?.formData?.vehicle || {}
  const displayedHolderName = `${holder.prenom || data?.user?.firstName || ''} ${holder.nom || data?.user?.lastName || ''}`.trim()
  const displayedHolderEmail = holder.email || data?.user?.email || 'Non renseigne'
  const displayedHolderPhone = holder.telephone || data?.user?.phone || 'Non renseigne'
  const displayedVehicles = data?.vehicles && data.vehicles.length > 0
    ? data.vehicles
    : vehicleFromForm?.immatriculation
      ? [{ id: 'form-vehicle', immatriculation: vehicleFromForm.immatriculation, marque: vehicleFromForm.marque, modele: vehicleFromForm.modele, puissanceFiscale: vehicleFromForm.puissanceFiscale, energie: vehicleFromForm.energie, annee: vehicleFromForm.annee }]
      : []

  const cancelDossier = async () => {
    if (!data) return
    const confirmed = window.confirm('Annuler cette démarche ?')
    if (!confirmed) return
    setActionLoading('cancel')
    try {
      await dossierService.cancel(data.id)
      toast.success('Demarche annulee')
      await refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Annulation impossible')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteDossier = async () => {
    if (!data) return
    const confirmed = window.confirm('Supprimer cette démarche ? Cette action est irreversible.')
    if (!confirmed) return
    setActionLoading('delete')
    try {
      await dossierService.remove(data.id)
      toast.success('Demarche supprimee')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Suppression impossible')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoggedIn === null) return <div className="container-custom py-10">Chargement du dossier...</div>
  if (isLoggedIn === false) return null
  if (isLoading) return <div className="container-custom py-10">Chargement du dossier...</div>
  if (error || !data) return <div className="container-custom py-10 text-red-600">Impossible de charger le dossier.</div>

  return (
    <>
      <Head><title>Dossier {data.numero} - Mon compte</title></Head>
      <div className="container-custom py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Dossier {data.numero}</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={cancelDossier} disabled={actionLoading !== null || data.statut === 'termine' || data.statut === 'rejete'} className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60">{actionLoading === 'cancel' ? 'Annulation...' : 'Annuler la démarche'}</button>
            <button type="button" onClick={deleteDossier} disabled={actionLoading !== null} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{actionLoading === 'delete' ? 'Suppression...' : 'Supprimer la démarche'}</button>
            <Link href="/dashboard" className="text-blue-700 hover:underline">Retour à mon compte</Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Informations générales</h2>
            <div className="space-y-2 text-slate-700">
              <p><strong>Type:</strong> {getDossierTypeLabel(data.typeDemande)}</p>
              <p><strong>Statut:</strong> {getDossierStatusLabel(data.statut)}</p>
              <p><strong>Étape actuelle:</strong> {data.currentStep}</p>
              <p><strong>Prix total:</strong> {Number(data.prixTotal).toFixed(2)} EUR</p>
              <p><strong>Créé le:</strong> {new Date(data.createdAt).toLocaleString('fr-FR')}</p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Titulaire</h2>
            {(displayedHolderName || displayedHolderEmail || displayedHolderPhone) ? (
              <div className="space-y-2 text-slate-700">
                <p><strong>Nom:</strong> {displayedHolderName || 'Non renseigne'}</p>
                <p><strong>Email:</strong> {displayedHolderEmail}</p>
                <p><strong>Téléphone:</strong> {displayedHolderPhone}</p>
                <p><strong>Date de naissance:</strong> {holder.dateNaissance || 'Non renseigne'}</p>
                <p><strong>Lieu de naissance:</strong> {holder.lieuNaissance || 'Non renseigne'}</p>
                <p><strong>Adresse:</strong> {[holder.adresse, holder.codePostal, holder.ville].filter(Boolean).join(' ') || 'Non renseigne'}</p>
              </div>
            ) : <p className="text-slate-500">Aucune information titulaire.</p>}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Véhicule(s)</h2>
            {displayedVehicles.length === 0 ? <p className="text-slate-500">Aucun véhicule associé.</p> : (
              <div className="grid gap-4 md:grid-cols-2">
                {displayedVehicles.map((vehicle) => (
                  <article key={vehicle.id} className="rounded-xl border border-slate-200 p-4">
                    <p><strong>Immatriculation:</strong> {vehicle.immatriculation || 'N/A'}</p>
                    <p><strong>Marque / Modèle:</strong> {vehicle.marque || 'N/A'} {vehicle.modele || ''}</p>
                    <p><strong>Puissance fiscale:</strong> {vehicle.puissanceFiscale ?? 'N/A'}</p>
                    <p><strong>Energie:</strong> {vehicle.energie || 'N/A'}</p>
                    <p><strong>Année:</strong> {vehicle.annee ?? 'N/A'}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Documents</h2>
            {!data.documents || data.documents.length === 0 ? <p className="text-slate-500">Aucun document uploadé.</p> : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="py-2">Type</th>
                      <th className="py-2">Fichier</th>
                      <th className="py-2">Taille</th>
                      <th className="py-2">Vérifié</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.documents.map((doc) => (
                      <tr key={doc.id} className="border-t">
                        <td className="py-2">{doc.type}</td>
                        <td className="py-2">{doc.filename}</td>
                        <td className="py-2">{Math.round((doc.size || 0) / 1024)} Ko</td>
                        <td className="py-2">{doc.verified ? 'Oui' : 'Non'}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" onClick={() => previewDocument(doc.id)} disabled={pendingDocId === doc.id}>Voir</button>
                            <button type="button" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50" onClick={() => deleteDocument(doc.id)} disabled={pendingDocId === doc.id || doc.verified}>Supprimer</button>
                            <label className={`rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 ${pendingDocId === doc.id || doc.verified ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                              Remplacer
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                disabled={pendingDocId === doc.id || doc.verified}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  replaceDocument(doc.id, data.id, doc.type, file)
                                  e.currentTarget.value = ''
                                }}
                              />
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Paiement(s)</h2>
            {!data.payments || data.payments.length === 0 ? <p className="text-slate-500">Aucun paiement enregistré.</p> : (
              <div className="grid gap-3">
                {data.payments.map((payment) => (
                  <div key={payment.id} className="rounded-xl border border-slate-200 p-4 text-slate-700">
                    <p><strong>Montant:</strong> {Number(payment.montant).toFixed(2)} EUR</p>
                    <p><strong>Statut:</strong> {getPaymentStatusLabel(payment.statut)}</p>
                    <p><strong>Session Stripe:</strong> {payment.stripeSessionId || 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Données du formulaire</h2>
            {!data.formData ? (
              <p className="text-slate-500">Aucune donnée de formulaire disponible.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-xl border border-slate-200 p-4">
                  <h3 className="mb-3 text-base font-semibold text-slate-900">Véhicule</h3>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p><strong>Immatriculation:</strong> {data.formData?.vehicle?.immatriculation || 'Non renseigné'}</p>
                    <p><strong>Marque:</strong> {data.formData?.vehicle?.marque || 'Non renseigné'}</p>
                    <p><strong>Modèle:</strong> {data.formData?.vehicle?.modele || 'Non renseigné'}</p>
                    <p><strong>Énergie:</strong> {data.formData?.vehicle?.energie || 'Non renseigné'}</p>
                    <p><strong>Puissance fiscale:</strong> {data.formData?.vehicle?.puissanceFiscale ?? 'Non renseigné'}</p>
                    <p><strong>Année:</strong> {data.formData?.vehicle?.annee ?? 'Non renseigné'}</p>
                  </div>
                </article>

                <article className="rounded-xl border border-slate-200 p-4">
                  <h3 className="mb-3 text-base font-semibold text-slate-900">Titulaire</h3>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p><strong>Civilité:</strong> {data.formData?.titulaire?.civilite || 'Non renseigné'}</p>
                    <p><strong>Nom:</strong> {data.formData?.titulaire?.nom || 'Non renseigné'}</p>
                    <p><strong>Prénom:</strong> {data.formData?.titulaire?.prenom || 'Non renseigné'}</p>
                    <p><strong>Email:</strong> {data.formData?.titulaire?.email || 'Non renseigné'}</p>
                    <p><strong>Téléphone:</strong> {data.formData?.titulaire?.telephone || 'Non renseigné'}</p>
                    <p><strong>Date de naissance:</strong> {data.formData?.titulaire?.dateNaissance || 'Non renseigné'}</p>
                    <p><strong>Lieu de naissance:</strong> {data.formData?.titulaire?.lieuNaissance || 'Non renseigné'}</p>
                    <p><strong>Adresse:</strong> {data.formData?.titulaire?.adresse || 'Non renseigné'}</p>
                    <p><strong>Code postal:</strong> {data.formData?.titulaire?.codePostal || 'Non renseigné'}</p>
                    <p><strong>Ville:</strong> {data.formData?.titulaire?.ville || 'Non renseigné'}</p>
                  </div>
                </article>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
