import React, { useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

type Demarche = { value: string; label: string }

const demarches: Demarche[] = [
  { value: 'achat', label: 'Achat / cession véhicule occasion' },
  { value: 'changement_titulaire', label: 'Changement de propriétaire' },
  { value: 'changement_adresse', label: "Changement d'adresse" },
  { value: 'duplicata', label: 'Duplicata carte grise' },
  { value: 'declaration_cession', label: 'Enregistrement de cession' },
  { value: 'immatriculation_etranger', label: 'Immatriculation véhicule étranger' },
  { value: 'immatriculation_import', label: 'Importation véhicule' },
  { value: 'immatriculation_provisoire', label: 'Immatriculation provisoire WW' },
  { value: 'carte_grise_deux_noms', label: 'Carte grise à deux noms' },
  { value: 'changement_matrimonial', label: 'Mariage / divorce (état civil)' },
  { value: 'fin_loa_location', label: 'Fin de LOA / location' },
  { value: 'certificat_non_gage', label: 'Certificat de non-gage' },
  { value: 'fiche_identification', label: "Fiche d'identification" },
  { value: 'modification_technique', label: 'Modification caractéristiques techniques' },
  { value: 'conversion_ethanol', label: 'Conversion éthanol' },
  { value: 'carte_grise_collection', label: 'Carte grise collection' },
  { value: 'heritage', label: 'Héritage véhicule' },
  { value: 'sans_ancienne', label: 'Carte grise sans ancienne carte' },
  { value: 'usurpation_plaques', label: 'Usurpation de plaques' },
  { value: 'correction', label: 'Correction de carte grise' },
  { value: 'code_cession', label: 'Code de cession' },
  { value: 'carte_grise_remorque', label: 'Carte grise remorque' },
  { value: 'carte_grise_moto', label: 'Carte grise moto' },
  { value: 'carte_grise_scooter', label: 'Carte grise scooter' },
  { value: 'carte_grise_vehicule_electrique', label: 'Carte grise véhicule électrique' },
]

export default function ModalitesPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const filteredDemarches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return demarches
    return demarches.filter((item) => item.label.toLowerCase().includes(normalized))
  }, [query])

  const totalResults = filteredDemarches.length

  const handleSelect = (value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dossierType', value)
    }
    router.push('/tunnel/step2-vehicule')
  }

  return (
    <>
      <Head>
        <title>Modalités — CertiCarte</title>
        <meta name="description" content="Choisissez votre démarche et accédez directement à l'étape 2 de la procédure carte grise." />
      </Head>

      <section className="fr-hero py-14">
        <div className="container-custom max-w-5xl">
          <p className="fr-pill bg-blue-100 text-blue-800">Démarches</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900">Choisissez votre modalité</h1>
          <p className="mt-3 text-lg text-slate-600">Liste des démarches, dans l'ordre, pour démarrer votre dossier.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-custom mb-6 max-w-lg">
          <label htmlFor="modalites-search" className="block text-sm font-semibold text-slate-800 mb-2">
            Rechercher une démarche
          </label>
          <input
            id="modalites-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : duplicata, import, moto…"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-2 text-xs text-slate-400">
            {totalResults} résultat{totalResults > 1 ? 's' : ''}
          </p>
        </div>

        <div className="container-custom">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-slate-700">Sélection rapide</div>
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Choisir une modalité
            </button>
            <p className="mt-3 text-sm text-slate-500">
              Ouvrez la fenêtre, choisissez votre démarche, puis passez directement à l'étape 2.
            </p>
          </div>
        </div>

        {isPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">Choisir une modalité</h2>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Fermer
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {filteredDemarches.map((item, index) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelect(item.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <span className="mr-2 text-xs font-bold text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredDemarches.length === 0 && (
          <div className="container-custom mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Aucune démarche trouvée pour votre recherche. Essayez avec d'autres mots-clés.
          </div>
        )}
      </section>
    </>
  )
}
