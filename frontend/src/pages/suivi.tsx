import React, { useState } from 'react'
import Head from 'next/head'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import api from '@/services/api'
import { getDossierStatusClasses, getDossierStatusLabel, getDossierTypeLabel } from '@/services/display'
import toast from 'react-hot-toast'
type DossierData = {
  numero: string
  typeDemande: string
  statut: string
  createdAt: string
}

export default function Suivi() {
  const [numero, setNumero] = useState('')
  const [dossier, setDossier] = useState<DossierData | null>(null)
  const [loading, setLoading] = useState(false)
  const handleSearch = async () => {
    if (!numero.trim()) {
      toast.error('Veuillez saisir un numero de dossier')
      return
    }
    setLoading(true)
    try {
      const response = await api.get(`/dossiers/public/suivi/${numero.trim()}`)
      setDossier(response.data)
    } catch (error) { toast.error('Dossier non trouve'); setDossier(null) }
    finally { setLoading(false) }
  }
  const getStatusBadge = (status: string) => {
    return <span className={`rounded-full px-2 py-1 text-xs ${getDossierStatusClasses(status)}`}>{getDossierStatusLabel(status)}</span>
  }
  return (
    <>
      <Head><title>Suivi de dossier - Carte Grise Express</title></Head>
      <div className="container-custom py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Suivi de dossier</h1>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-4">
            <Input placeholder="Ex: CG-20241215-1234" value={numero} onChange={(e) => setNumero(e.target.value)} className="flex-1" />
            <Button onClick={handleSearch} loading={loading}>Rechercher</Button>
          </div>
          {dossier && (<div className="mt-6 space-y-4"><div className="p-4 bg-gray-50 rounded-lg"><p className="font-semibold">Numero: {dossier.numero}</p><p>Type: {getDossierTypeLabel(dossier.typeDemande)}</p><p>Statut: {getStatusBadge(dossier.statut)}</p><p>Cree le: {new Date(dossier.createdAt).toLocaleDateString()}</p></div></div>)}
        </div>
      </div>
    </>
  )
}