import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function PaiementSuccesPage() {
  const router = useRouter()
  const numero = typeof router.query.numero === 'string' ? router.query.numero : null

  return (
    <>
      <Head>
        <title>Paiement validé - Carte grise</title>
      </Head>

      <div className="container-custom py-12 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-200">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-emerald-700 mb-3">Achat validé avec succès</h1>
            <p className="text-slate-700 mb-2">Votre paiement a bien été effectué.</p>
            <p className="text-slate-700 mb-6">Vous pouvez retrouver votre dossier dans Mon compte.</p>

            {numero && (
              <p className="mb-6 text-sm text-slate-600">Numéro de suivi dossier: <span className="font-semibold text-slate-900">{numero}</span></p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="rounded-lg bg-blue-700 text-white px-5 py-3 font-medium hover:bg-blue-800 transition-colors">
                Aller à Mon compte
              </Link>
              <Link href="/suivi" className="rounded-lg border border-slate-300 text-slate-700 px-5 py-3 font-medium hover:bg-slate-50 transition-colors">
                Suivre mon dossier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
