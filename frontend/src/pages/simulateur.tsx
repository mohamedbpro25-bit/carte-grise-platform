import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import toast from 'react-hot-toast'
import api from '@/services/api'
type PriceResult = {
  gestionFee: number
  regionalTax: number
  postageFee: number
  total: number
}

export default function Simulateur() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null)
  const [formData, setFormData] = useState({ immatriculation: '', region: 'ile-de-france', puissanceFiscale: 5, energie: 'essence', annee: new Date().getFullYear() })
  const handleCalculate = async () => {
    setLoading(true)
    try {
      const response = await api.post('/dossiers/public/calculate-price', { vehicleData: formData, region: formData.region })
      setPriceResult(response.data)
      toast.success('Prix calculé avec succès')
    } catch (error) { toast.error('Erreur lors du calcul') }
    finally { setLoading(false) }
  }
  const handleContinue = () => {
    localStorage.setItem('simulationData', JSON.stringify({ ...formData, price: priceResult }))
    router.push('/tunnel/step1-type')
  }
  return (
    <>
      <Head><title>Simulateur de prix — CertiCarte</title></Head>
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent mb-4">Simulateur de prix</h1>
            <p className="text-xl text-slate-700">Estimez le coût de votre démarche carte grise en quelques secondes</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Vos informations</h2>
                <div className="space-y-5">
                  <Input label="Immatriculation" value={formData.immatriculation} onChange={(e) => setFormData({...formData, immatriculation: e.target.value.toUpperCase()})} placeholder="AA-123-AA" />
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Région</label>
                    <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-medium">
                      <option value="ile-de-france">Île-de-France</option>
                      <option value="provence-alpes-cote-d-azur">Provence-Alpes-Côte d'Azur</option>
                      <option value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</option>
                      <option value="bourgogne-franche-comte">Bourgogne-Franche-Comté</option>
                      <option value="bretagne">Bretagne</option>
                      <option value="centre-val-de-loire">Centre-Val de Loire</option>
                      <option value="corse">Corse</option>
                      <option value="grand-est">Grand Est</option>
                      <option value="hauts-de-france">Hauts-de-France</option>
                      <option value="normandie">Normandie</option>
                      <option value="nouvelle-aquitaine">Nouvelle-Aquitaine</option>
                      <option value="occitanie">Occitanie</option>
                      <option value="pays-de-la-loire">Pays de la Loire</option>
                    </select>
                  </div>
                  <Input label="Puissance fiscale (CV)" type="number" value={formData.puissanceFiscale} onChange={(e) => setFormData({...formData, puissanceFiscale: parseInt(e.target.value)})} min="1" max="50" />
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Énergie</label>
                    <select value={formData.energie} onChange={(e) => setFormData({...formData, energie: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-medium">
                      <option value="essence">Essence</option>
                      <option value="diesel">Diesel</option>
                      <option value="electrique">Électrique</option>
                    </select>
                  </div>
                  <Input label="Année du véhicule" type="number" value={formData.annee} onChange={(e) => setFormData({...formData, annee: parseInt(e.target.value)})} min="1950" max="2025" />
                  <Button onClick={handleCalculate} loading={loading} className="w-full" size="md" variant="primary">Calculer le prix</Button>
                </div>
              </div>
            </div>
            
            {/* Result */}
            <div>
              {priceResult ? (
                <div className="rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-50 shadow-lg p-8 sticky top-20">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Détail du prix</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b-2 border-green-200">
                      <span className="text-slate-700 font-medium">Frais ANTS</span>
                      <span className="font-bold text-slate-900">{priceResult.gestionFee} €</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b-2 border-green-200">
                      <span className="text-slate-700 font-medium">Taxe régionale</span>
                      <span className="font-bold text-slate-900">{priceResult.regionalTax} €</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b-2 border-green-200">
                      <span className="text-slate-700 font-medium">Frais de poste</span>
                      <span className="font-bold text-slate-900">{priceResult.postageFee} €</span>
                    </div>
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-white">{priceResult.total} €</span>
                    </div>
                  </div>
                  <Button onClick={handleContinue} className="w-full" size="md" variant="primary">Continuer ma demande</Button>
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-lg p-8">
                  <div className="text-center">
                    <p className="text-slate-600 font-semibold text-lg">Calculez pour voir le détail du prix</p>
                    <p className="mt-2 text-sm text-slate-400">Renseignez vos informations puis cliquez sur Calculer.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}