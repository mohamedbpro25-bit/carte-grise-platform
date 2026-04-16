import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const mainSteps = [
  {
    title: 'Simulation immédiate',
    text: 'Renseignez votre immatriculation et votre région pour obtenir un prix clair en quelques secondes.',
  },
  {
    title: 'Validation sécurisée',
    text: 'Confirmez votre demande et réglez en ligne via un parcours de paiement protégé.',
  },
  {
    title: 'Envoi des pièces',
    text: 'Ajoutez vos justificatifs dans votre espace personnel et suivez leur vérification.',
  },
  {
    title: 'Réception finale',
    text: "Suivez l'avancement du dossier et recevez vos documents administratifs selon les délais officiels.",
  },
]

const majorModalities = [
  'Changement de propriétaire',
  "Changement d'adresse",
  'Duplicata (perte, vol, détérioration)',
  'Déclaration de cession',
  'Immatriculation véhicule étranger',
  'Carte grise moto / scooter / remorque',
]

const faq = [
  {
    q: 'Combien de temps pour mettre à jour une carte grise ?',
    a: "En règle générale, vous devez faire la démarche dans le délai légal d'un mois après changement de situation.",
  },
  {
    q: 'Puis-je suivre mon dossier en direct ?',
    a: "Oui. Votre espace Mon compte affiche le statut, les pièces envoyées, les paiements et le détail du dossier.",
  },
  {
    q: 'Quels documents faut-il préparer ?',
    a: 'La liste dépend de votre modalité. Vous retrouvez les formulaires à imprimer dans Documents & papiers.',
  },
]

const testimonials = [
  {
    name: 'Sonia M.',
    role: 'Changement de titulaire',
    text: "Démarche rapide, claire et très pratique. J'ai pu suivre mon dossier sans relancer plusieurs fois.",
  },
  {
    name: 'Karim B.',
    role: 'Duplicata carte grise',
    text: 'Le parcours est simple et les documents à fournir sont bien expliqués. Très utile pour gagner du temps.',
  },
  {
    name: 'Julie R.',
    role: 'Véhicule importé',
    text: 'Bon accompagnement sur un dossier un peu plus complexe. Les étapes sont rassurantes et bien structurées.',
  },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>CertiCarte | Démarches en ligne</title>
        <meta name="description" content="Plateforme de démarches carte grise en ligne : simulation, documents, suivi et paiement sécurisé. Agréé par l'État." />
      </Head>

      <section className="fr-hero py-20">
        <div className="container-custom grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="fr-pill bg-blue-100 text-blue-800">Démarches carte grise en ligne</p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 md:text-6xl">Une interface simple pour gérer votre carte grise de A à Z.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-700">Simulation du coût, transmission des justificatifs, suivi du dossier, historique complet dans votre compte.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/simulateur" className="rounded-full bg-blue-700 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-800">Calculer mon prix</Link>
              <Link href="/tunnel/step1-type" className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">Commencer ma demande</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-white px-3 py-2">Traitement en ligne</span>
              <span className="rounded-full bg-white px-3 py-2">Suivi dossier</span>
              <span className="rounded-full bg-white px-3 py-2">Documents imprimables</span>
              <span className="rounded-full bg-white px-3 py-2">Paiement sécurisé</span>
            </div>
            {/* Trust badges officiels */}
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <img src="/badge-agree-etat.svg" alt="Agréé par l'État" className="h-16 drop-shadow-md hover:drop-shadow-lg transition-all" />
              <img src="/badge-ants.svg" alt="Habilité ANTS" className="h-16 drop-shadow-md hover:drop-shadow-lg transition-all" />
              <img src="/badge-securite.svg" alt="Paiement sécurisé" className="h-16 drop-shadow-md hover:drop-shadow-lg transition-all" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-white p-7 shadow-xl hover:shadow-2xl transition-all">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Modalités principales</h2>
            <div className="mt-5 grid gap-3">
              {majorModalities.map((item) => (
                <div key={item} className="rounded-xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:shadow-md transition-all">{item}</div>
              ))}
            </div>
            <Link href="/modalites" className="mt-6 inline-flex text-sm font-semibold text-blue-700 hover:underline">Voir le catalogue complet des modalités</Link>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-custom">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="fr-pill bg-red-100 text-red-700">Parcours utilisateur</p>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Votre dossier en 4 étapes</h2>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-blue-700 hover:underline">Accéder à mon compte</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {mainSteps.map((step, i) => (
              <article key={step.title} className="glass-card p-6 group">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">{i + 1}</div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-custom grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-red-50/20 to-white p-7 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-red-600 bg-clip-text text-transparent">Documents et papiers</h2>
            <p className="mt-3 text-slate-700">Retrouvez vos formulaires PDF prêts à imprimer puis ajoutez vos fichiers directement dans votre dossier.</p>
            <Link href="/documents-papiers" className="mt-5 inline-flex rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700">Ouvrir Documents & papiers</Link>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/20 to-white p-7 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Suivi et transparence</h2>
            <p className="mt-3 text-slate-700">Depuis Mon compte, consultez les informations détaillées : prix, données de formulaire, pièces uploadées et paiements.</p>
            <Link href="/dashboard" className="mt-5 inline-flex rounded-full bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800">Voir mon compte</Link>
          </article>
        </div>
      </section>

      <section id="avis" className="py-16 scroll-mt-28">
        <div className="container-custom">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="fr-pill bg-blue-100 text-blue-800">Avis clients</p>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Ils ont finalisé leur démarche avec nous</h2>
            </div>
            <Link href="/tunnel/step1-type" className="text-sm font-semibold text-blue-700 hover:underline">Commencer une demande</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all group">
                <div className="text-yellow-400 mb-3 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-sm leading-7 text-slate-700 italic">"{ item.text}"</p>
                <div className="mt-5 border-t-2 border-slate-100 pt-4">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm text-blue-600 font-semibold">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-white p-8 shadow-lg">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent">Questions fréquentes</h2>
          <div className="mt-6 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                <summary className="cursor-pointer font-bold text-slate-900 group-hover:text-blue-700 transition">{item.q}</summary>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed pl-5 border-l-2 border-blue-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
