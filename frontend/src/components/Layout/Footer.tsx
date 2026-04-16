import React, { memo } from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-slate-200 bg-gradient-to-b from-white via-blue-50/20 to-slate-50/50">
      <div className="container-custom py-14">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">CarteGrise France</h3>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">Plateforme de confiance pour vos démarches carte grise. Rapide, claire et conforme aux procédures officielles.</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-blue-600">République Française</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-lg">Menu rapide</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/simulateur" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">Simulateur</Link></li>
              <li><Link href="/modalites" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">Modalités</Link></li>
              <li><Link href="/documents-papiers" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">Documents & papiers</Link></li>
              <li><Link href="/suivi" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">Suivi de dossier</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-lg">Infos légales</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">Mentions légales</a></li>
              <li><a href="#" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">CGV</a></li>
              <li><a href="#" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">RGPD</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-lg">Contact & Support</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="tel:+33123456789" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">01 23 45 67 89</a></li>
              <li><a href="mailto:contact@cartegrise-france.fr" className="text-slate-700 hover:text-blue-700 hover:font-semibold transition-colors">contact@cartegrise-france.fr</a></li>
              <li className="text-slate-700 font-medium">Lun–Sam : 8h30 – 19h00</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-blue-50/50 to-cyan-50 p-6 shadow-md hover:shadow-lg transition-all">
          <p className="font-bold text-slate-900 text-lg">Besoin d'imprimer des formulaires ?</p>
          <p className="mt-2 text-slate-700 leading-relaxed">Rendez-vous dans la section Documents & papiers pour télécharger vos PDF imprimables et prêts à remplir.</p>
          <Link href="/documents-papiers" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2 font-bold text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-cyan-600 transition-all">Voir les documents</Link>
        </div>

        {/* Barre de confiance officielle */}
        <div className="mt-8 border-t-2 border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 items-center">
            <img src="/badge-agree-etat.svg" alt="Agréé par l'État" className="h-14 drop-shadow-sm hover:drop-shadow-md transition-all" />
            <img src="/badge-ants.svg" alt="Habilité ANTS" className="h-14 drop-shadow-sm hover:drop-shadow-md transition-all" />
            <img src="/badge-securite.svg" alt="Paiement sécurisé" className="h-14 drop-shadow-sm hover:drop-shadow-md transition-all" />
          </div>
          <p className="text-xs font-medium text-slate-600">© 2026 <span className="font-bold text-slate-900">CarteGrise France</span> — Tous droits réservés. Plateforme sécurisée</p>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)