import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import api from '@/services/api'
import { getDossierStatusLabel, getDossierTypeLabel } from '@/services/display'
import toast from 'react-hot-toast'

type Dossier = {
  id: string
  numero: string
  typeDemande: string
  statut: string
  prixTotal: number
  currentStep?: number
  createdAt: string
  updatedAt?: string
  formData?: {
    titulaire?: {
      civilite?: string
      nom?: string
      prenom?: string
      dateNaissance?: string
      lieuNaissance?: string
      adresse?: string
      codePostal?: string
      ville?: string
      email?: string
      telephone?: string
    }
    vehicle?: {
      immatriculation?: string
      marque?: string
      modele?: string
      puissanceFiscale?: number
      energie?: string
      annee?: number
    }
    civilite?: string
    nom?: string
    prenom?: string
    dateNaissance?: string
    lieuNaissance?: string
    adresse?: string
    codePostal?: string
    ville?: string
    email?: string
    telephone?: string
    adminTracking?: {
      externalRef?: string
      adminNote?: string
    }
  }
  holder?: {
    civilite?: string | null
    nom?: string | null
    prenom?: string | null
    email?: string | null
    telephone?: string | null
    dateNaissance?: string | null
    lieuNaissance?: string | null
    adresse?: string | null
    codePostal?: string | null
    ville?: string | null
  }
  primaryVehicle?: {
    immatriculation?: string | null
    marque?: string | null
    modele?: string | null
    puissanceFiscale?: number | null
    energie?: string | null
    annee?: number | null
  }
  paymentSummary?: { total: number; paid: number; pending: number; failed: number }
  documentSummary?: { total: number; verified: number }
  user: { firstName: string; lastName: string; email: string; phone?: string; address?: string } | null
  vehicles?: Array<{
    id: string
    immatriculation?: string
    marque?: string
    modele?: string
    puissanceFiscale?: number
    energie?: string
    annee?: number
  }>
  documents?: Array<{ id: string; type: string; filename: string; size: number; verified: boolean; uploadedAt: string }>
  payments?: Array<{ id: string; montant: number; statut: string; createdAt: string }>
}

type AdminUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  emailVerified: boolean
  createdAt: string
}

type UserDocument = {
  id: string
  type: string
  filename: string
  size: number
  verified: boolean
  uploadedAt: string
  dossierId?: string
  dossierNumero?: string
  previewUrl?: string
  downloadUrl: string
}

type AdminOverview = {
  kpis: {
    totalUsers: number
    totalDossiers: number
    totalPayments: number
    totalSales: number
    pendingSales: number
    failedSales: number
    totalRevenue: number
    revenueThisMonth: number
    averageBasket: number
  }
  dossiersByStatus: Array<{ status: string; count: number }>
  recentSales: Array<{
    id: string
    montant: number
    statut: string
    createdAt: string
    dossierNumero?: string
    client?: { fullName: string; email: string } | null
  }>
}

export default function Admin() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<'overview' | 'users' | 'dossiers'>('overview')
  const [updatingDossierId, setUpdatingDossierId] = useState<string | null>(null)
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null)
  const [downloadingDossierZipId, setDownloadingDossierZipId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [dossierSearch, setDossierSearch] = useState('')
  const [dossierStatusFilter, setDossierStatusFilter] = useState('all')
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { externalRef: string; adminNote: string }>>({})
  const [expandedDossiers, setExpandedDossiers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      setIsAdmin(false)
      const redirectTo = encodeURIComponent(router.asPath || '/admin.html')
      router.push(`/login?redirect=${redirectTo}`)
      return
    }

    const role = String(user.role || '').toLowerCase()
    if (role !== 'admin') {
      setIsAdmin(false)
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
  }, [router])

  const dossiersQuery = useQuery<Dossier[]>({
    queryKey: ['admin-dossiers'],
    queryFn: async () => (await api.get('/admin/dossiers')).data,
    enabled: isAdmin === true && tab === 'dossiers',
    retry: 0,
  })

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
    enabled: isAdmin === true && tab === 'users',
    retry: 0,
  })

  const overviewQuery = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: async () => (await api.get('/admin/overview')).data,
    enabled: isAdmin === true && tab === 'overview',
    retry: 0,
  })

  const updateStatus = async (id: string, newStatus: string) => {
    const current = (dossiersQuery.data || []).find((dossier) => dossier.id === id)?.statut
    if (!newStatus || current === newStatus) return

    setUpdatingDossierId(id)
    try {
      await api.patch(`/admin/dossiers/${id}/status`, { statut: newStatus })
      toast.success('Statut mis à jour')
      dossiersQuery.refetch()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setUpdatingDossierId(null)
    }
  }

  const getTrackingDraft = (dossier: Dossier) => {
    return trackingDrafts[dossier.id] || {
      externalRef: dossier.formData?.adminTracking?.externalRef || '',
      adminNote: dossier.formData?.adminTracking?.adminNote || '',
    }
  }

  const updateTrackingDraft = (dossierId: string, patch: Partial<{ externalRef: string; adminNote: string }>) => {
    setTrackingDrafts((prev) => ({
      ...prev,
      [dossierId]: {
        externalRef: patch.externalRef ?? prev[dossierId]?.externalRef ?? '',
        adminNote: patch.adminNote ?? prev[dossierId]?.adminNote ?? '',
      },
    }))
  }

  const toggleDossierExpansion = (dossierId: string) => {
    setExpandedDossiers((prev) => ({
      ...prev,
      [dossierId]: !prev[dossierId],
    }))
  }

  const saveTracking = async (dossier: Dossier) => {
    const draft = getTrackingDraft(dossier)
    setSavingTrackingId(dossier.id)
    try {
      await api.patch(`/admin/dossiers/${dossier.id}/status`, {
        statut: dossier.statut,
        externalRef: draft.externalRef,
        adminNote: draft.adminNote,
      })
      toast.success('Suivi État enregistré')
      dossiersQuery.refetch()
    } catch {
      toast.error('Erreur lors de l enregistrement du suivi')
    } finally {
      setSavingTrackingId(null)
    }
  }

  const getVehicleSummary = (dossier: Dossier) => {
    const vehicle = dossier.primaryVehicle || dossier.vehicles?.[0] || dossier.formData?.vehicle
    if (!vehicle) return null

    return {
      immatriculation: vehicle.immatriculation || '',
      marque: vehicle.marque || '',
      modele: vehicle.modele || '',
      energie: vehicle.energie || '',
      puissanceFiscale: vehicle.puissanceFiscale,
      annee: vehicle.annee,
    }
  }

  const buildClientSheet = (dossier: Dossier) => {
    const holder = getHolderIdentity(dossier) || '-'
    const contact = getHolderContact(dossier)
    const address = getHolderAddress(dossier) || '-'
    const vehicle = getVehicleSummary(dossier)
    const lines = [
      `Dossier: ${dossier.numero}`,
      `Type: ${getDossierTypeLabel(dossier.typeDemande)}`,
      `Statut: ${getDossierStatusLabel(dossier.statut)}`,
      `Titulaire: ${holder}`,
      `Date de naissance: ${dossier.formData?.dateNaissance ? new Date(dossier.formData.dateNaissance).toLocaleDateString('fr-FR') : '-'}`,
      `Lieu de naissance: ${dossier.formData?.lieuNaissance || '-'}`,
      `Adresse: ${address}`,
      `Email: ${contact.email || '-'}`,
      `Telephone: ${contact.phone || '-'}`,
      `Reference Etat: ${getTrackingDraft(dossier).externalRef || '-'}`,
      `Note interne: ${getTrackingDraft(dossier).adminNote || '-'}`,
    ]

    if (vehicle) {
      lines.push(
        `Immatriculation: ${vehicle.immatriculation || '-'}`,
        `Marque: ${vehicle.marque || '-'}`,
        `Modele: ${vehicle.modele || '-'}`,
        `Energie: ${vehicle.energie || '-'}`,
        `Puissance fiscale: ${vehicle.puissanceFiscale ?? '-'}`,
        `Annee: ${vehicle.annee ?? '-'}`,
      )
    }

    return lines.join('\n')
  }

  const copyClientSheet = async (dossier: Dossier) => {
    const payload = buildClientSheet(dossier)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = payload
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      toast.success('Fiche client copiée')
    } catch {
      toast.error('Impossible de copier la fiche client')
    }
  }

  const getHolderIdentity = (dossier: Dossier) => {
    const holderFirstName = dossier.holder?.prenom?.trim() || dossier.formData?.titulaire?.prenom?.trim() || dossier.formData?.prenom?.trim() || dossier.user?.firstName || ''
    const holderLastName = dossier.holder?.nom?.trim() || dossier.formData?.titulaire?.nom?.trim() || dossier.formData?.nom?.trim() || dossier.user?.lastName || ''
    const civility = dossier.holder?.civilite?.trim() || dossier.formData?.titulaire?.civilite?.trim() || dossier.formData?.civilite?.trim() || ''
    return [civility, holderFirstName, holderLastName].filter(Boolean).join(' ').trim()
  }

  const getHolderContact = (dossier: Dossier) => {
    return {
      email: dossier.holder?.email?.trim() || dossier.formData?.titulaire?.email?.trim() || dossier.formData?.email?.trim() || dossier.user?.email || '',
      phone: dossier.holder?.telephone?.trim() || dossier.formData?.titulaire?.telephone?.trim() || dossier.formData?.telephone?.trim() || dossier.user?.phone || '',
    }
  }

  const getHolderAddress = (dossier: Dossier) => {
    const addressParts = [
      dossier.holder?.adresse?.trim() || dossier.formData?.titulaire?.adresse?.trim() || dossier.formData?.adresse?.trim() || dossier.user?.address || '',
      [dossier.holder?.codePostal?.trim() || dossier.formData?.titulaire?.codePostal?.trim() || dossier.formData?.codePostal?.trim() || '', dossier.holder?.ville?.trim() || dossier.formData?.titulaire?.ville?.trim() || dossier.formData?.ville?.trim() || ''].filter(Boolean).join(' '),
    ].filter(Boolean)

    return addressParts.join(', ')
  }

  const csvEscape = (value: unknown) => {
    const str = String(value ?? '')
    const escaped = str.replace(/"/g, '""')
    return `"${escaped}"`
  }

  const exportDossiersCsv = () => {
    const headers = [
      'Numero dossier',
      'Date creation',
      'Type demande',
      'Statut',
      'Client',
      'Email',
      'Telephone',
      'Prix total EUR',
      'Reference Etat',
      'Note interne',
    ]
    const lines = filteredDossiers.map((dossier) => {
      const draft = getTrackingDraft(dossier)
      const fullName = getHolderIdentity(dossier)
      const contact = getHolderContact(dossier)
      return [
        dossier.numero,
        new Date(dossier.createdAt).toLocaleString('fr-FR'),
        getDossierTypeLabel(dossier.typeDemande),
        getDossierStatusLabel(dossier.statut as any),
        fullName,
        contact.email,
        contact.phone,
        Number(dossier.prixTotal).toFixed(2),
        draft.externalRef || '',
        draft.adminNote || '',
      ].map(csvEscape).join(';')
    })

    const csv = `\uFEFF${headers.map(csvEscape).join(';')}\n${lines.join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    link.href = url
    link.download = `dossiers_admin_${stamp}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const downloadDossierZip = async (dossier: Dossier) => {
    setDownloadingDossierZipId(dossier.id)
    try {
      const response = await api.get(`/admin/dossiers/${dossier.id}/documents.zip`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      const contentDisposition = response.headers['content-disposition'] as string | undefined
      const fileNameMatch = contentDisposition?.match(/filename="?([^";]+)"?/) || null
      const decodedFileName = fileNameMatch?.[1] ? decodeURIComponent(fileNameMatch[1]) : null
      link.href = url
      link.download = decodedFileName || `dossier_${dossier.numero}_documents.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success('ZIP téléchargé')
    } catch {
      toast.error('Impossible de telecharger le ZIP du dossier')
    } finally {
      setDownloadingDossierZipId(null)
    }
  }

  const deleteUser = async (userId: string, email: string) => {
    const confirmed = window.confirm(`Confirmer la suppression du compte ${email} ? Cette action est irreversible.`)
    if (!confirmed) return

    setDeletingUserId(userId)
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('Compte supprimé')
      usersQuery.refetch()
      overviewQuery.refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression du compte')
    } finally {
      setDeletingUserId(null)
    }
  }

  const downloadDocument = async (doc: UserDocument) => {
    setDownloadingDocId(doc.id)
    try {
      const response = await api.get(`/admin/documents/${doc.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.filename || 'document'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Téléchargement impossible')
    } finally {
      setDownloadingDocId(null)
    }
  }

  const previewDocument = async (doc: UserDocument) => {
    try {
      const response = await api.get(`/admin/documents/${doc.id}/preview`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      toast.error('Prévisualisation impossible')
    }
  }

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return usersQuery.data || []
    return (usersQuery.data || []).filter((u) =>
      [u.firstName, u.lastName, u.email, u.role].join(' ').toLowerCase().includes(q),
    )
  }, [usersQuery.data, userSearch])

  const filteredDossiers = useMemo(() => {
    const q = dossierSearch.trim().toLowerCase()
    return (dossiersQuery.data || []).filter((d) => {
      const matchesStatus = dossierStatusFilter === 'all' || d.statut === dossierStatusFilter
      const matchesQuery = !q || [d.numero, d.user?.email, d.user?.firstName, d.user?.lastName, d.typeDemande].join(' ').toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [dossiersQuery.data, dossierSearch, dossierStatusFilter])

  const dossierBuckets = useMemo(() => {
    const all = dossiersQuery.data || []
    const waiting = all.filter((d) => ['en_attente_paiement', 'documents_attendus'].includes(d.statut)).length
    const inProgress = all.filter((d) => ['validation_administrative', 'en_cours'].includes(d.statut)).length
    const completed = all.filter((d) => d.statut === 'termine').length
    const rejected = all.filter((d) => d.statut === 'rejete').length
    return { waiting, inProgress, completed, rejected, total: all.length }
  }, [dossiersQuery.data])

  if (isAdmin === null) return <div className="container-custom py-10">Chargement...</div>
  if (!isAdmin) return null

  return (
    <>
      <Head><title>Admin - CertiCarte</title></Head>
      <div className="container-custom py-10">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Espace administrateur</h1>

        <div className="mb-6 flex gap-3">
          <button onClick={() => setTab('overview')} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === 'overview' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700'}`}>
            Aperçu business
          </button>
          <button onClick={() => setTab('users')} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === 'users' ? 'bg-indigo-700 text-white' : 'bg-white text-slate-700'}`}>
            Comptes créés
          </button>
          <button onClick={() => setTab('dossiers')} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === 'dossiers' ? 'bg-blue-700 text-white' : 'bg-white text-slate-700'}`}>
            Dossiers
            </button>
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            {overviewQuery.isLoading && <p>Chargement...</p>}
            {!overviewQuery.isLoading && overviewQuery.data && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">Comptes créés</p><p className="text-3xl font-bold text-slate-900">{overviewQuery.data.kpis.totalUsers}</p></div>
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">Demandes</p><p className="text-3xl font-bold text-slate-900">{overviewQuery.data.kpis.totalDossiers}</p></div>
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">Ventes payées</p><p className="text-3xl font-bold text-emerald-700">{overviewQuery.data.kpis.totalSales}</p></div>
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">Chiffre d'affaires total</p><p className="text-3xl font-bold text-emerald-700">{Number(overviewQuery.data.kpis.totalRevenue).toFixed(2)} EUR</p></div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">CA du mois</p><p className="text-2xl font-bold text-slate-900">{Number(overviewQuery.data.kpis.revenueThisMonth).toFixed(2)} EUR</p></div>
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">Panier moyen</p><p className="text-2xl font-bold text-slate-900">{Number(overviewQuery.data.kpis.averageBasket).toFixed(2)} EUR</p></div>
                  <div className="rounded-2xl bg-white p-5 shadow-md"><p className="text-sm text-slate-500">Paiements en attente / échoués</p><p className="text-2xl font-bold text-slate-900">{overviewQuery.data.kpis.pendingSales} / {overviewQuery.data.kpis.failedSales}</p></div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-xl font-semibold">Demandes par statut</h2>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {overviewQuery.data.dossiersByStatus.map((item) => (
                      <div key={item.status} className="rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-600">{getDossierStatusLabel(item.status as any)}</p>
                        <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-xl font-semibold">Dernières ventes</h2>
                  {overviewQuery.data.recentSales.length === 0 ? <p>Aucune vente payée.</p> : (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-slate-600">
                            <th className="py-2">Date</th>
                            <th className="py-2">Dossier</th>
                            <th className="py-2">Client</th>
                            <th className="py-2">Email</th>
                            <th className="py-2">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overviewQuery.data.recentSales.map((sale) => (
                            <tr key={sale.id} className="border-b">
                              <td className="py-2 pr-2">{new Date(sale.createdAt).toLocaleString('fr-FR')}</td>
                              <td className="py-2 pr-2">{sale.dossierNumero || '-'}</td>
                              <td className="py-2 pr-2">{sale.client?.fullName || '-'}</td>
                              <td className="py-2 pr-2">{sale.client?.email || '-'}</td>
                              <td className="py-2 pr-2 font-semibold">{Number(sale.montant).toFixed(2)} EUR</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Comptes créés</h2>
            <div className="mb-4">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher par nom, email, role..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none ring-blue-200 focus:border-blue-500 focus:ring-2"
              />
            </div>
            {usersQuery.isLoading && <p>Chargement...</p>}
            {!usersQuery.isLoading && (usersQuery.data || []).length === 0 && <p>Aucun compte.</p>}
            {!usersQuery.isLoading && (usersQuery.data || []).length > 0 && filteredUsers.length === 0 && <p>Aucun compte ne correspond au filtre.</p>}
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="py-2">Date</th>
                    <th className="py-2">Nom</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Téléphone</th>
                    <th className="py-2">Rôle</th>
                    <th className="py-2">Vérifié</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 pr-2">{new Date(u.createdAt).toLocaleString('fr-FR')}</td>
                      <td className="py-2 pr-2">{u.firstName} {u.lastName}</td>
                      <td className="py-2 pr-2">{u.email}</td>
                      <td className="py-2 pr-2">{u.phone || '-'}</td>
                      <td className="py-2 pr-2">{u.role}</td>
                      <td className="py-2 pr-2">{u.emailVerified ? 'Oui' : 'Non'}</td>
                      <td className="py-2 pr-2">
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          disabled={deletingUserId === u.id || authService.getCurrentUser()?.id === u.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {authService.getCurrentUser()?.id === u.id
                            ? 'Compte courant'
                            : deletingUserId === u.id
                              ? 'Suppression...'
                              : 'Supprimer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-500">Les documents clients sont consultables dossier par dossier dans l'onglet Dossiers.</p>
          </div>
        )}

        {tab === 'dossiers' && (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Gestion des dossiers</h2>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Exportez la liste pour traitement hors plateforme ou telechargez le ZIP de chaque dossier.</p>
              <button
                onClick={exportDossiersCsv}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Export CSV (dossiers filtres)
              </button>
            </div>
            <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <button onClick={() => setDossierStatusFilter('all')} className={`rounded-xl border px-4 py-3 text-left ${dossierStatusFilter === 'all' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">{dossierBuckets.total}</p>
              </button>
              <button onClick={() => setDossierStatusFilter('documents_attendus')} className={`rounded-xl border px-4 py-3 text-left ${dossierStatusFilter === 'documents_attendus' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs uppercase tracking-wide text-slate-500">En attente</p>
                <p className="text-2xl font-bold text-amber-700">{dossierBuckets.waiting}</p>
              </button>
              <button onClick={() => setDossierStatusFilter('en_cours')} className={`rounded-xl border px-4 py-3 text-left ${dossierStatusFilter === 'en_cours' ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs uppercase tracking-wide text-slate-500">En traitement</p>
                <p className="text-2xl font-bold text-indigo-700">{dossierBuckets.inProgress}</p>
              </button>
              <button onClick={() => setDossierStatusFilter('termine')} className={`rounded-xl border px-4 py-3 text-left ${dossierStatusFilter === 'termine' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs uppercase tracking-wide text-slate-500">Traités</p>
                <p className="text-2xl font-bold text-emerald-700">{dossierBuckets.completed}</p>
              </button>
              <button onClick={() => setDossierStatusFilter('rejete')} className={`rounded-xl border px-4 py-3 text-left ${dossierStatusFilter === 'rejete' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs uppercase tracking-wide text-slate-500">Rejetés</p>
                <p className="text-2xl font-bold text-red-700">{dossierBuckets.rejected}</p>
              </button>
            </div>
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <input
                type="text"
                value={dossierSearch}
                onChange={(e) => setDossierSearch(e.target.value)}
                placeholder="Rechercher numero, client, email..."
                className="md:col-span-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none ring-blue-200 focus:border-blue-500 focus:ring-2"
              />
              <select
                value={dossierStatusFilter}
                onChange={(e) => setDossierStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:border-blue-500 focus:ring-2"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente_paiement">En attente paiement</option>
                <option value="documents_attendus">En attente de validation</option>
                <option value="validation_administrative">Validation administrative</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Termine</option>
                <option value="rejete">Rejete</option>
              </select>
            </div>
            {dossiersQuery.isLoading && <p>Chargement...</p>}
            {!dossiersQuery.isLoading && (dossiersQuery.data || []).length === 0 && <p>Aucun dossier.</p>}
            {!dossiersQuery.isLoading && (dossiersQuery.data || []).length > 0 && filteredDossiers.length === 0 && <p>Aucun dossier ne correspond au filtre.</p>}
            <div className="space-y-4">
              {filteredDossiers.map((dossier) => (
                <article key={dossier.id} className="rounded-xl border border-slate-200 p-4">
                  {(() => {
                    const isExpanded = !!expandedDossiers[dossier.id]
                    return (
                      <>
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{dossier.numero}</p>
                      <p className="text-slate-600">{getDossierTypeLabel(dossier.typeDemande)}</p>
                      <p className="text-sm text-slate-500">{getHolderIdentity(dossier) || 'Titulaire non renseigné'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800">{getDossierStatusLabel(dossier.statut)}</span>
                      <button
                        type="button"
                        onClick={() => toggleDossierExpansion(dossier.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {isExpanded ? 'Réduire' : 'Ouvrir'}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3 text-sm text-slate-500">Créé le {new Date(dossier.createdAt).toLocaleDateString('fr-FR')} • Prix {Number(dossier.prixTotal).toFixed(2)} EUR</div>

                  {!isExpanded ? (
                    <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
                      <p><span className="font-semibold text-slate-900">Titulaire:</span> {getHolderIdentity(dossier) || '-'}</p>
                      <p><span className="font-semibold text-slate-900">Email:</span> {getHolderContact(dossier).email || '-'}</p>
                      <p><span className="font-semibold text-slate-900">Plaque:</span> {getVehicleSummary(dossier)?.immatriculation || '-'}</p>
                      <p><span className="font-semibold text-slate-900">Documents:</span> {dossier.documentSummary?.total ?? dossier.documents?.length ?? 0}</p>
                    </div>
                  ) : (
                    <>

                  <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Titulaire dossier</p>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Identité:</span> {getHolderIdentity(dossier) || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Date naissance:</span> {dossier.holder?.dateNaissance ? new Date(dossier.holder.dateNaissance).toLocaleDateString('fr-FR') : dossier.formData?.titulaire?.dateNaissance ? new Date(dossier.formData.titulaire.dateNaissance).toLocaleDateString('fr-FR') : dossier.formData?.dateNaissance ? new Date(dossier.formData.dateNaissance).toLocaleDateString('fr-FR') : '-'}</p>
                        <p><span className="font-semibold text-slate-900">Lieu naissance:</span> {dossier.holder?.lieuNaissance || dossier.formData?.titulaire?.lieuNaissance || dossier.formData?.lieuNaissance || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Adresse:</span> {getHolderAddress(dossier) || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Email:</span> {getHolderContact(dossier).email || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Téléphone:</span> {getHolderContact(dossier).phone || '-'}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Compte client</p>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Nom compte:</span> {`${dossier.user?.firstName || ''} ${dossier.user?.lastName || ''}`.trim() || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Email compte:</span> {dossier.user?.email || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Téléphone compte:</span> {dossier.user?.phone || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Adresse compte (profil):</span> {dossier.user?.address || 'Non renseignée sur le compte'}</p>
                        <p><span className="font-semibold text-slate-900">Étape:</span> {dossier.currentStep || '-'}/5</p>
                        <p><span className="font-semibold text-slate-900">Dernière maj:</span> {dossier.updatedAt ? new Date(dossier.updatedAt).toLocaleString('fr-FR') : '-'}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Synthèse dossier</p>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Type:</span> {getDossierTypeLabel(dossier.typeDemande)}</p>
                        <p><span className="font-semibold text-slate-900">Statut:</span> {getDossierStatusLabel(dossier.statut)}</p>
                        <p><span className="font-semibold text-slate-900">Prix:</span> {Number(dossier.prixTotal).toFixed(2)} EUR</p>
                        <p><span className="font-semibold text-slate-900">Documents:</span> {dossier.documentSummary?.total ?? dossier.documents?.length ?? 0}</p>
                        <p><span className="font-semibold text-slate-900">Docs vérifiés:</span> {dossier.documentSummary?.verified ?? 0}</p>
                        <p><span className="font-semibold text-slate-900">Paiements:</span> {dossier.paymentSummary?.total ?? dossier.payments?.length ?? 0}</p>
                        <p><span className="font-semibold text-slate-900">Paiements payés:</span> {dossier.paymentSummary?.paid ?? 0}</p>
                        <p><span className="font-semibold text-slate-900">Paiements en attente:</span> {dossier.paymentSummary?.pending ?? 0}</p>
                        <p><span className="font-semibold text-slate-900">Véhicule:</span> {getVehicleSummary(dossier) ? `${getVehicleSummary(dossier)?.marque || ''} ${getVehicleSummary(dossier)?.modele || ''}`.trim() || getVehicleSummary(dossier)?.immatriculation || '-' : '-'}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 md:col-span-2 xl:col-span-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Véhicule</p>
                        <button
                          onClick={() => copyClientSheet(dossier)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                        >
                          Copier fiche client
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm text-slate-700">
                        <p><span className="font-semibold text-slate-900">Plaque:</span> {getVehicleSummary(dossier)?.immatriculation || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Marque:</span> {getVehicleSummary(dossier)?.marque || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Modèle:</span> {getVehicleSummary(dossier)?.modele || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Énergie:</span> {getVehicleSummary(dossier)?.energie || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Puissance fiscale:</span> {getVehicleSummary(dossier)?.puissanceFiscale ?? '-'}</p>
                        <p><span className="font-semibold text-slate-900">Année:</span> {getVehicleSummary(dossier)?.annee ?? '-'}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 md:col-span-2 xl:col-span-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pièces et paiements</p>
                      <div className="grid gap-4 xl:grid-cols-2">
                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-900">Documents reçus</p>
                          {(!dossier.documents || dossier.documents.length === 0) ? (
                            <p className="text-sm text-slate-500">Aucun document uploadé.</p>
                          ) : (
                            <div className="space-y-2 text-sm text-slate-700">
                              {dossier.documents.map((document) => (
                                <div key={document.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <p>
                                    <span className="font-semibold text-slate-900">{document.type}:</span> {document.filename} {document.verified ? '(vérifié)' : '(à vérifier)'}
                                  </p>
                                  <p className="text-xs text-slate-500">{new Date(document.uploadedAt).toLocaleString('fr-FR')} • {(document.size / 1024).toFixed(1)} KB</p>
                                  <div className="mt-2 flex gap-2">
                                    <button
                                      onClick={() => previewDocument(document as UserDocument)}
                                      className="rounded bg-blue-700 px-2.5 py-1 text-xs text-white hover:bg-blue-800"
                                    >
                                      Visualiser
                                    </button>
                                    <button
                                      onClick={() => downloadDocument(document as UserDocument)}
                                      disabled={downloadingDocId === document.id}
                                      className="rounded bg-slate-900 px-2.5 py-1 text-xs text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {downloadingDocId === document.id ? 'Téléchargement...' : 'Télécharger'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-900">Paiements</p>
                          {(!dossier.payments || dossier.payments.length === 0) ? (
                            <p className="text-sm text-slate-500">Aucun paiement enregistré.</p>
                          ) : (
                            <div className="space-y-1 text-sm text-slate-700">
                              {dossier.payments.map((payment) => (
                                <p key={payment.id}>
                                  <span className="font-semibold text-slate-900">{Number(payment.montant).toFixed(2)} EUR:</span> {payment.statut} le {new Date(payment.createdAt).toLocaleString('fr-FR')}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <select value={dossier.statut} disabled={updatingDossierId === dossier.id} onChange={(e) => updateStatus(dossier.id, e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="en_attente_paiement">En attente paiement</option>
                    <option value="documents_attendus">En attente de validation</option>
                    <option value="validation_administrative">Validation administrative</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="rejete">Rejeté</option>
                  </select>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Réf plateforme État</label>
                      <input
                        type="text"
                        value={getTrackingDraft(dossier).externalRef}
                        onChange={(e) => updateTrackingDraft(dossier.id, { externalRef: e.target.value })}
                        placeholder="Ex: ANTS-2026-000123"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:border-blue-500 focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Note interne</label>
                      <input
                        type="text"
                        value={getTrackingDraft(dossier).adminNote}
                        onChange={(e) => updateTrackingDraft(dossier.id, { adminNote: e.target.value })}
                        placeholder="Ex: Dossier saisi sur ANTS le 14/04"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:border-blue-500 focus:ring-2"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => saveTracking(dossier)}
                        disabled={savingTrackingId === dossier.id}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingTrackingId === dossier.id ? 'Enregistrement...' : 'Enregistrer suivi État'}
                      </button>
                      <button
                        onClick={() => downloadDossierZip(dossier)}
                        disabled={downloadingDossierZipId === dossier.id}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloadingDossierZipId === dossier.id ? 'Preparation ZIP...' : 'Telecharger ZIP documents'}
                      </button>
                    </div>
                  </div>
                    </>
                  )}
                      </>
                    )
                  })()}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
