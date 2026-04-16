import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Stepper from '@/components/UI/Stepper'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import toast from 'react-hot-toast'
const steps = ['Type', 'Véhicule', 'Titulaire', 'Documents', 'Paiement']
export default function Step3Titulaire() {
  const router = useRouter()
  const [formData, setFormData] = useState({ civilite: 'M', nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', adresse: '', codePostal: '', ville: '', email: '', telephone: '' })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedTitulaireData = localStorage.getItem('titulaireData')
    if (!storedTitulaireData) return

    try {
      setFormData(JSON.parse(storedTitulaireData))
    } catch {
      localStorage.removeItem('titulaireData')
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredFields = ['nom', 'prenom', 'dateNaissance', 'lieuNaissance', 'adresse', 'codePostal', 'ville', 'email', 'telephone'] as const
    const hasMissing = requiredFields.some((field) => !String(formData[field]).trim())
    if (hasMissing) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Adresse email invalide')
      return
    }

    localStorage.setItem('titulaireData', JSON.stringify(formData)); router.push('/tunnel/step4-documents')
  }
  return (
    <>
      <Head><title>Informations titulaire - Carte grise</title></Head>
      <div className="container-custom py-8 max-w-2xl"><div className="bg-white rounded-xl shadow-lg overflow-hidden"><div className="p-6 border-b"><h1 className="text-2xl font-bold">Informations du titulaire</h1><Stepper steps={steps} currentStep={3} /></div>
      <form onSubmit={handleSubmit} className="p-8"><div className="space-y-4"><div className="flex gap-4"><label className="flex items-center"><input type="radio" value="M" checked={formData.civilite === 'M'} onChange={(e) => setFormData({...formData, civilite: e.target.value})} className="mr-2" />Monsieur</label><label className="flex items-center"><input type="radio" value="Mme" checked={formData.civilite === 'Mme'} onChange={(e) => setFormData({...formData, civilite: e.target.value})} className="mr-2" />Madame</label></div>
      <div className="grid md:grid-cols-2 gap-4"><Input label="Nom" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value.toUpperCase()})} /><Input label="Prénom" required value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} /></div>
      <div className="grid md:grid-cols-2 gap-4"><Input label="Date de naissance" type="date" required value={formData.dateNaissance} onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} /><Input label="Lieu de naissance" required value={formData.lieuNaissance} onChange={(e) => setFormData({...formData, lieuNaissance: e.target.value})} /></div>
      <Input label="Adresse" required value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} />
      <div className="grid md:grid-cols-2 gap-4"><Input label="Code postal" required value={formData.codePostal} onChange={(e) => setFormData({...formData, codePostal: e.target.value})} /><Input label="Ville" required value={formData.ville} onChange={(e) => setFormData({...formData, ville: e.target.value})} /></div>
      <div className="grid md:grid-cols-2 gap-4"><Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /><Input label="Téléphone" required value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} /></div></div>
      <div className="flex justify-between mt-8"><Button type="button" variant="outline" onClick={() => router.push('/tunnel/step2-vehicule')}>Retour</Button><Button type="submit">Continuer</Button></div></form></div></div>
    </>
  )
}