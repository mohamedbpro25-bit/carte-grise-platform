import React from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout/Layout'

export default function MentionsLegales() {
  return (
    <Layout>
      <Head>
        <title>Mentions légales — CertiCarte</title>
      </Head>
      <div className="container-custom py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-10">Mentions légales</h1>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Éditeur du site</h2>
          <p className="text-slate-700 leading-relaxed">
            Le site <strong>CertiCarte</strong> est édité par :<br />
            [Nom de la société ou du porteur de projet]<br />
            Forme juridique : [SARL / Auto-entrepreneur / SAS…]<br />
            Adresse : [Adresse complète]<br />
            Email : <a href="mailto:contact@certicarte.fr" className="text-blue-600 hover:underline">contact@certicarte.fr</a><br />
            Téléphone : 01 23 45 67 89<br />
            SIRET : [Numéro SIRET]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Directeur de la publication</h2>
          <p className="text-slate-700 leading-relaxed">
            [Nom et prénom du directeur de publication]<br />
            Email : <a href="mailto:contact@certicarte.fr" className="text-blue-600 hover:underline">contact@certicarte.fr</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Hébergeur</h2>
          <p className="text-slate-700 leading-relaxed">
            Le site est hébergé par :<br />
            <strong>Render Services, Inc.</strong><br />
            651 N Broad Street, Suite 206, Middletown, DE 19709, États-Unis<br />
            Site : <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">render.com</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Propriété intellectuelle</h2>
          <p className="text-slate-700 leading-relaxed">
            L'ensemble du contenu de ce site (textes, images, graphiques, logo, icônes, etc.) est la propriété exclusive de CertiCarte, sauf mention contraire. Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord exprès par écrit de CertiCarte.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Limitation de responsabilité</h2>
          <p className="text-slate-700 leading-relaxed">
            CertiCarte est un service d'assistance administrative qui facilite les démarches de gestion des certificats d'immatriculation. CertiCarte n'est pas un service gouvernemental officiel. Les informations fournies sur ce site sont données à titre indicatif et ne sauraient engager la responsabilité de CertiCarte en cas d'erreur ou d'omission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Cookies</h2>
          <p className="text-slate-700 leading-relaxed">
            Ce site utilise uniquement des cookies techniques nécessaires au bon fonctionnement du service (session d'authentification). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
          </p>
        </section>

        <p className="text-sm text-slate-500 mt-10">Dernière mise à jour : avril 2026</p>
      </div>
    </Layout>
  )
}
