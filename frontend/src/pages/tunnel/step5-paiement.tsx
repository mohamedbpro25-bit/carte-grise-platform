import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Stepper from '@/components/UI/Stepper'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import api from '@/services/api'
import { authService } from '@/services/auth'
import { dossierService } from '@/services/dossier'
import { getDossierTypeLabel } from '@/services/display'
import toast from 'react-hot-toast'
type DossierItem = {
  id: string
  prixTotal: number
  numero?: string
}

type PaymentSummary = {
  typeDemande: string
  immatriculation: string
  marque: string
  modele: string
  titulaire: string
  email: string
}

const steps = ['Type', 'Vehicule', 'Titulaire', 'Documents', 'Paiement']
export default function Step5Paiement() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dossierInitLoading, setDossierInitLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [dossier, setDossier] = useState<DossierItem | null>(null)
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [authReady, setAuthReady] = useState(false)
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
    return { user, complete }
  }

  const initDossier = async () => {
    setDossierInitLoading(true)
    const { user, complete } = syncProfileState()
    if (!user || !complete) {
      setDossierInitLoading(false)
      return
    }

    const simulation = localStorage.getItem('simulationData')
    const type = localStorage.getItem('dossierType')
    const vehicle = localStorage.getItem('vehicleData')
    const titulaire = localStorage.getItem('titulaireData')
    const simulationData = simulation ? JSON.parse(simulation) : null
    const vehicleData = vehicle ? JSON.parse(vehicle) : null
    const titulaireData = titulaire ? JSON.parse(titulaire) : null
    const mergedFormData = { vehicle: vehicleData || {}, titulaire: titulaireData || {} }

    const storedDossierId = typeof window !== 'undefined' ? localStorage.getItem('dossierId') : null
    if (storedDossierId) {
      try {
        await dossierService.updateStep(storedDossierId, 5, mergedFormData)
        const response = await dossierService.getOne(storedDossierId)
        setDossier(response)
        setDossierInitLoading(false)
        return
      } catch (error) {
        console.error('Impossible de recuperer le dossier existant:', error)
      }
    }

    if (!type || !vehicle || !titulaire) {
      toast.error('Donnees manquantes pour le dossier. Reprenez la demarche depuis le debut.')
      setDossierInitLoading(false)
      return
    }

    let prixTotal = 49
    try {
      const calc = await dossierService.calculatePrice(vehicleData, simulationData?.region || 'ile-de-france')
      prixTotal = calc?.total ?? 49
    } catch {
      prixTotal = 49
    }

    try {
      const response = await dossierService.create({
        typeDemande: type,
        prixTotal: prixTotal ?? 49,
        currentStep: 5,
        statut: 'en_attente_paiement',
        formData: mergedFormData,
      })
      setDossier(response)
      localStorage.setItem('dossierId', response.id)
    } catch (error) {
      console.error('Erreur creation dossier:', error)
      toast.error('Erreur creation dossier')
    } finally {
      setDossierInitLoading(false)
    }
  }

  useEffect(() => {
    try {
      const type = localStorage.getItem('dossierType') || '-'
      const vehicleRaw = localStorage.getItem('vehicleData')
      const titulaireRaw = localStorage.getItem('titulaireData')
      const vehicle = vehicleRaw ? JSON.parse(vehicleRaw) : {}
      const titulaire = titulaireRaw ? JSON.parse(titulaireRaw) : {}

      setSummary({
        typeDemande: getDossierTypeLabel(type),
        immatriculation: vehicle?.immatriculation || '-',
        marque: vehicle?.marque || '-',
        modele: vehicle?.modele || '-',
        titulaire: `${titulaire?.prenom || ''} ${titulaire?.nom || ''}`.trim() || '-',
        email: titulaire?.email || '-',
      })
    } catch {
      setSummary(null)
    }

    syncProfileState()
    setAuthReady(true)
    initDossier()
  }, [])

  const handleAuthBeforePayment = async (e: React.FormEvent) => {
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
        await initDossier()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur authentification')
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
      toast.success(response?.message || 'Profil mis a jour')
      await initDossier()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Impossible de mettre a jour le profil')
    } finally {
      setAuthLoading(false)
    }
  }
  const handlePayment = async () => {
    if (!dossier) return
    setLoading(true)
    try {
      const numero = dossier.numero || ''
      const successUrl = `${window.location.origin}/paiement/succes?numero=${encodeURIComponent(numero)}`
      const cancelUrl = window.location.origin + '/tunnel/step5-paiement'
      const response = await api.post(`/paiement/create-session/${dossier.id}`, { successUrl, cancelUrl })
      window.location.href = response.data.url
    } catch (error) { toast.error('Erreur paiement') }
    finally { setLoading(false) }
  }
  return (
    <>
      <Head><title>Paiement - Carte grise</title></Head>
      <div className="container-custom py-8 max-w-2xl"><div className="bg-white rounded-xl shadow-lg overflow-hidden"><div className="p-6 border-b"><h1 className="text-2xl font-bold">Paiement</h1><Stepper steps={steps} currentStep={5} /></div>
      <div className="p-8 text-center">
        {summary && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-slate-900">Recapitulatif de la demande</p>
            <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              <p><span className="font-medium">Demarche:</span> {summary.typeDemande}</p>
              <p><span className="font-medium">Immatriculation:</span> {summary.immatriculation}</p>
              <p><span className="font-medium">Vehicule:</span> {summary.marque} {summary.modele}</p>
              <p><span className="font-medium">Titulaire:</span> {summary.titulaire}</p>
              <p className="md:col-span-2"><span className="font-medium">Email:</span> {summary.email}</p>
            </div>
          </div>
        )}

        {authReady && !isAuthenticated && (
          <form onSubmit={handleAuthBeforePayment} className="mb-8 rounded-xl border border-slate-200 p-5 text-left">
            <p className="mb-4 text-sm text-slate-700">Avant le paiement, connectez-vous ou creez votre compte.</p>
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

        {authReady && isAuthenticated && !profileComplete && (
          <form onSubmit={handleCompleteProfile} className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
            <p className="mb-4 text-sm text-amber-900">Votre compte doit être complété avant de passer au paiement.</p>
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

        <div className="mb-8"><div className="text-6xl mb-4">💳</div><h2 className="text-xl font-semibold mb-2">Paiement securise</h2><p className="text-gray-600">Montant total: {dossier?.prixTotal ?? 0} €</p></div>
        {isAuthenticated && !dossier && (
          <p className="mb-3 text-sm text-amber-700">{profileComplete ? 'Preparation du dossier en cours...' : 'Completez votre profil compte pour activer le paiement.'}</p>
        )}
        <Button onClick={handlePayment} loading={loading} size="lg" disabled={!isAuthenticated || !profileComplete || !dossier || dossierInitLoading}>{dossierInitLoading ? 'Preparation du dossier...' : 'Payer avec Stripe'}</Button><p className="text-xs text-gray-500 mt-4">Paiement 100% securise par Stripe</p>
      </div></div></div>
    </>
  )
}