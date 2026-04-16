import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { dossierService } from '@/services/dossier'
import { getDossierStatusClasses, getDossierStatusLabel, getDossierTypeLabel } from '@/services/display'
import Button from '@/components/UI/Button'

type Dossier = {
  id: string
  numero: string
  typeDemande: string
  statut: string
  prixTotal: number
  createdAt: string
  documents?: Array<{ id: string; filename: string; type: string }>
}

export default function Dashboard() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      setIsLoggedIn(false)
      return
    }

    const user = authService.getCurrentUser()
    if (String(user?.role || '').toLowerCase() === 'admin') {
      router.push('/admin.html')
      setIsLoggedIn(false)
      return
    }

    setIsLoggedIn(true)
  }, [router])

  const { data: dossiers, isLoading, error } = useQuery({
    queryKey: ['dossiers'],
    queryFn: dossierService.getMyDossiers,
    enabled: isLoggedIn === true,
    retry: 0,
  })

  const getStatusBadge = (status: string) => {
    return <span className={`rounded-full px-3 py-1 text-sm ${getDossierStatusClasses(status)}`}>{getDossierStatusLabel(status)}</span>
  }

  if (isLoggedIn === null) return <div className="container-custom py-12">Chargement...</div>
  if (!isLoggedIn) return null

  return (
    <>
      <Head>
        <title>Mon compte - CertiCarte</title>
      </Head>
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Mon compte</h1>
            <Button onClick={() => router.push('/tunnel/step1-type')}>Nouvelle demande</Button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Mes demandes</h2>

            {isLoading && <p>Chargement...</p>}
            {error && <p className="text-red-600">Erreur lors du chargement des dossiers</p>}

            {!isLoading && !error && dossiers && dossiers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Vous n'avez pas encore de demandes.</p>
                <Button onClick={() => router.push('/tunnel/step1-type')}>Créer ma première demande</Button>
              </div>
            )}

            {!isLoading && !error && dossiers && dossiers.length > 0 && (
              <div className="space-y-4">
                {dossiers.map((dossier: Dossier) => (
                  <div key={dossier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-lg">{dossier.numero}</p>
                        <p className="text-gray-600">{getDossierTypeLabel(dossier.typeDemande)}</p>
                      </div>
                      {getStatusBadge(dossier.statut)}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Créé le {new Date(dossier.createdAt).toLocaleDateString()}</span>
                      <span>Prix: {dossier.prixTotal}€</span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fichiers uploades</p>
                      {(!dossier.documents || dossier.documents.length === 0) && (
                        <p className="mt-1 text-sm text-gray-500">Aucun fichier pour cette demande.</p>
                      )}
                      {dossier.documents && dossier.documents.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {dossier.documents.slice(0, 6).map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                              <span className="truncate pr-3 text-gray-700">{doc.filename}</span>
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">{doc.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/dossiers/${dossier.id}`)}>Voir dossier complet</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}