import React from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout/Layout'

export default function PolitiqueConfidentialite() {
  return (
    <Layout>
      <Head>
        <title>Politique de confidentialité — CertiCarte</title>
      </Head>
      <div className="container-custom py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Politique de confidentialité</h1>
        <p className="text-slate-600 mb-10">Conformément au RGPD (Règlement Général sur la Protection des Données)</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Responsable du traitement</h2>
          <p className="text-slate-700 leading-relaxed">
            Le responsable du traitement de vos données personnelles est :<br />
            <strong>CertiCarte</strong> — [Nom de la société]<br />
            Email : <a href="mailto:contact@certicarte.fr" className="text-blue-600 hover:underline">contact@certicarte.fr</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Données collectées</h2>
          <p className="text-slate-700 leading-relaxed">Dans le cadre de notre service, nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
            <li><strong>Données du véhicule :</strong> numéro d'immatriculation, VIN, caractéristiques techniques</li>
            <li><strong>Documents administratifs :</strong> justificatif d'identité, justificatif de domicile, certificat de cession</li>
            <li><strong>Données de paiement :</strong> traitées exclusivement par Stripe (nous ne stockons pas vos coordonnées bancaires)</li>
            <li><strong>Données de navigation :</strong> adresse IP, navigateur, pages visitées (logs techniques uniquement)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Finalités du traitement</h2>
          <p className="text-slate-700 leading-relaxed">Vos données sont utilisées pour :</p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li>Traiter votre demande de certificat d'immatriculation</li>
            <li>Gérer votre compte utilisateur</li>
            <li>Vous envoyer des notifications sur l'avancement de votre dossier</li>
            <li>Respecter nos obligations légales et réglementaires</li>
            <li>Prévenir la fraude</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Base légale</h2>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li><strong>Exécution d'un contrat :</strong> traitement de votre dossier</li>
            <li><strong>Obligation légale :</strong> transmission aux autorités compétentes (SIV/ANTS)</li>
            <li><strong>Intérêt légitime :</strong> sécurité du service et prévention de la fraude</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Durée de conservation</h2>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li><strong>Données de dossier :</strong> 5 ans après clôture (obligation légale)</li>
            <li><strong>Données de compte :</strong> jusqu'à suppression du compte + 3 ans</li>
            <li><strong>Données de paiement :</strong> 10 ans (obligation comptable)</li>
            <li><strong>Logs techniques :</strong> 12 mois</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Partage des données</h2>
          <p className="text-slate-700 leading-relaxed">
            Vos données peuvent être partagées avec :
          </p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li><strong>ANTS (Agence Nationale des Titres Sécurisés) :</strong> pour le traitement officiel de votre demande</li>
            <li><strong>Stripe :</strong> pour le traitement sécurisé des paiements</li>
            <li><strong>Hébergeur Render :</strong> stockage sécurisé des données (serveurs en Europe)</li>
          </ul>
          <p className="text-slate-700 mt-3">Nous ne vendons jamais vos données à des tiers.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">7. Vos droits (RGPD)</h2>
          <p className="text-slate-700 leading-relaxed">Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          </ul>
          <p className="text-slate-700 mt-3">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@certicarte.fr" className="text-blue-600 hover:underline">contact@certicarte.fr</a><br />
            En cas de réclamation non résolue, vous pouvez saisir la <strong>CNIL</strong> (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cnil.fr</a>).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">8. Sécurité des données</h2>
          <p className="text-slate-700 leading-relaxed">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des communications (HTTPS/TLS), hachage des mots de passe (bcrypt), accès restreint aux données personnelles, journalisation des accès.
          </p>
        </section>

        <p className="text-sm text-slate-500 mt-10">Dernière mise à jour : avril 2026</p>
      </div>
    </Layout>
  )
}
