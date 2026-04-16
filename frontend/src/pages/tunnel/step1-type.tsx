import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Stepper from '@/components/UI/Stepper'
import Button from '@/components/UI/Button'

const steps = ['Type', 'Véhicule', 'Titulaire', 'Documents', 'Paiement']

type DemarcheOption = {
  value: string
  label: string
  icon: string
}

type DemarcheSection = {
  title: string
  options: DemarcheOption[]
}

export default function Step1Type() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSelectedType(localStorage.getItem('dossierType') || '')
  }, [])

  const sections: DemarcheSection[] = [
    {
      title: 'Démarches principales',
      options: [
        { value: 'achat', label: 'Achat / cession vehicule occasion', icon: '🚘' },
        { value: 'changement_titulaire', label: 'Changement de proprietaire', icon: '🚗' },
        { value: 'changement_adresse', label: 'Changement d adresse', icon: '🏠' },
        { value: 'duplicata', label: 'Duplicata carte grise', icon: '📄' }
      ]
    },
    {
      title: 'Immatriculation et import',
      options: [
        { value: 'immatriculation_etranger', label: 'Immatriculation vehicule etranger', icon: '🌍' },
        { value: 'immatriculation_import', label: 'Importation vehicule', icon: '🌐' },
        { value: 'immatriculation_provisoire', label: 'Immatriculation provisoire WW', icon: '⏳' }
      ]
    },
    {
      title: 'Situation personnelle et administrative',
      options: [
        { value: 'carte_grise_deux_noms', label: 'Carte grise a deux noms', icon: '👥' },
        { value: 'changement_matrimonial', label: 'Mariage / divorce (etat civil)', icon: '💍' },
        { value: 'heritage', label: 'Heritage vehicule', icon: '🏛️' },
        { value: 'sans_ancienne', label: 'Carte grise sans ancienne carte', icon: '❓' },
        { value: 'correction', label: 'Correction de carte grise', icon: '✍️' }
      ]
    },
    {
      title: 'Documents et attestations',
      options: [
        { value: 'declaration_cession', label: 'Enregistrement de cession', icon: '📝' },
        { value: 'code_cession', label: 'Code de cession', icon: '🔐' },
        { value: 'certificat_non_gage', label: 'Certificat de non-gage', icon: '🛡️' },
        { value: 'fiche_identification', label: "Fiche d'identification", icon: '📋' }
      ]
    },
    {
      title: 'Cas spécifiques',
      options: [
        { value: 'fin_loa_location', label: 'Fin de LOA / location', icon: '📁' },
        { value: 'carte_grise_remorque', label: 'Carte grise remorque', icon: '🚻' },
        { value: 'carte_grise_moto', label: 'Carte grise moto', icon: '🏐️' },
        { value: 'carte_grise_scooter', label: 'Carte grise scooter', icon: '🛵' },
        { value: 'carte_grise_vehicule_electrique', label: 'Carte grise véhicule électrique', icon: '🔋' },
        { value: 'modification_technique', label: 'Modification caractéristiques techniques', icon: '🔧' },
        { value: 'conversion_ethanol', label: 'Conversion éthanol', icon: '⛽' },
        { value: 'carte_grise_collection', label: 'Carte grise collection', icon: '🏆' },
        { value: 'usurpation_plaques', label: 'Usurpation de plaques', icon: '🚫' }
      ]
    }
  ]

  const handleContinue = () => { if (selectedType) { localStorage.setItem('dossierType', selectedType); router.push('/tunnel/step2-vehicule') } }
  return (
    <>
      <Head><title>Type de démarche - Carte grise</title></Head>
      <div className="container-custom py-8 max-w-3xl"><div className="bg-white rounded-xl shadow-lg overflow-hidden"><div className="p-6 border-b"><h1 className="text-2xl font-bold">Nouvelle demande</h1><Stepper steps={steps} currentStep={1} /></div>
      <div className="p-8"><h2 className="text-xl font-semibold mb-6">Choisissez votre type de démarche</h2><div className="space-y-6">{sections.map((section, sectionIndex) => (<div key={section.title}>
      {sectionIndex > 0 && <div className="border-t border-dashed border-gray-300 mb-6" />}
      <h3 className="text-sm font-bold tracking-wide uppercase text-gray-600 mb-3">{section.title}</h3>
      <div className="space-y-3">{section.options.map((type) => (<label key={type.value} className={`block p-4 border-2 rounded-lg cursor-pointer transition ${selectedType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
      <div className="flex items-center gap-4"><input type="radio" name="type" value={type.value} checked={selectedType === type.value} onChange={(e) => setSelectedType(e.target.value)} className="mt-1" />
      <span className="font-semibold text-slate-900">{type.label}</span></div></label>))}</div></div>))}</div>
      <div className="flex justify-between mt-8"><Button variant="outline" onClick={() => router.push('/simulateur')}>Retour</Button><Button onClick={handleContinue} disabled={!selectedType}>Continuer</Button></div></div></div></div>
    </>
  )
}