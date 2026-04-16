import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Stepper from '@/components/UI/Stepper'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import api from '@/services/api'
import toast from 'react-hot-toast'
const steps = ['Type', 'Véhicule', 'Titulaire', 'Documents', 'Paiement']
export default function Step2Vehicule() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ immatriculation: '', marque: '', modele: '', puissanceFiscale: '', energie: 'essence', annee: new Date().getFullYear() })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedVehicleData = localStorage.getItem('vehicleData')
    if (!storedVehicleData) return

    try {
      setFormData(JSON.parse(storedVehicleData))
    } catch {
      localStorage.removeItem('vehicleData')
    }
  }, [])

  const handleAutoFill = async () => {
    if (!formData.immatriculation) return
    setLoading(true)
    try {
      const response = await api.get(`/vehicules/infos?immat=${formData.immatriculation}`)
      setFormData({ ...formData, ...response.data })
      toast.success('Infos véhicule récupérées')
    } catch (error) { toast.error('Véhicule non trouvé') }
    finally { setLoading(false) }
  }
  const handleContinue = () => {
    const puissance = Number(formData.puissanceFiscale)
    const currentYear = new Date().getFullYear()
    if (!formData.immatriculation || !formData.marque || !formData.modele) {
      toast.error('Veuillez renseigner immatriculation, marque et modèle')
      return
    }
    if (!Number.isFinite(puissance) || puissance <= 0) {
      toast.error('Puissance fiscale invalide')
      return
    }
    if (!Number.isFinite(formData.annee) || formData.annee < 1950 || formData.annee > currentYear) {
      toast.error('Année du véhicule invalide')
      return
    }

    localStorage.setItem('vehicleData', JSON.stringify(formData)); router.push('/tunnel/step3-titulaire')
  }
  return (
    <>
      <Head><title>Informations véhicule - Carte grise</title></Head>
      <div className="container-custom py-8 max-w-2xl"><div className="bg-white rounded-xl shadow-lg overflow-hidden"><div className="p-6 border-b"><h1 className="text-2xl font-bold">Informations du vehicule</h1><Stepper steps={steps} currentStep={2} /></div>
      <div className="p-8"><div className="space-y-4"><div className="flex gap-4"><Input label="Immatriculation" value={formData.immatriculation} onChange={(e) => setFormData({...formData, immatriculation: e.target.value.toUpperCase()})} className="flex-1" /><Button onClick={handleAutoFill} loading={loading} variant="outline" className="mt-7">Auto-fill</Button></div>
      <div className="grid md:grid-cols-2 gap-4"><Input label="Marque" value={formData.marque} onChange={(e) => setFormData({...formData, marque: e.target.value})} /><Input label="Modèle" value={formData.modele} onChange={(e) => setFormData({...formData, modele: e.target.value})} /></div>
      <div className="grid md:grid-cols-2 gap-4"><Input label="Puissance fiscale (CV)" type="number" value={formData.puissanceFiscale} onChange={(e) => setFormData({...formData, puissanceFiscale: e.target.value})} />
      <div><label className="block text-sm font-medium mb-1">Énergie</label><select value={formData.energie} onChange={(e) => setFormData({...formData, energie: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="essence">Essence</option><option value="diesel">Diesel</option><option value="electrique">Électrique</option></select></div></div>
      <Input label="Année" type="number" value={formData.annee} onChange={(e) => setFormData({...formData, annee: Number(e.target.value)})} /></div>
      <div className="flex justify-between mt-8"><Button variant="outline" onClick={() => router.push('/tunnel/step1-type')}>Retour</Button><Button onClick={handleContinue}>Continuer</Button></div></div></div></div>
    </>
  )
}