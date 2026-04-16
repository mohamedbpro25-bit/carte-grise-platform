import React from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout/Layout'

export default function CGV() {
  return (
    <Layout>
      <Head>
        <title>Conditions Générales de Vente — CertiCarte</title>
      </Head>
      <div className="container-custom py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-10">Conditions Générales de Vente</h1>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-700 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre CertiCarte et tout client souhaitant bénéficier des services de dématérialisation et d'assistance pour les démarches de certificat d'immatriculation (carte grise).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Description du service</h2>
          <p className="text-slate-700 leading-relaxed">
            CertiCarte propose un service d'assistance administrative permettant :
          </p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li>La constitution et le suivi de dossiers de demande de certificat d'immatriculation</li>
            <li>La vérification des documents fournis</li>
            <li>La transmission des demandes aux autorités compétentes (SIV/ANTS)</li>
            <li>Le suivi en temps réel de l'avancement du dossier</li>
          </ul>
          <p className="text-slate-700 mt-3 text-sm italic">
            CertiCarte N'EST PAS un service gouvernemental. Les frais perçus couvrent exclusivement les frais de gestion et d'assistance. Les taxes régionales (taxe régionale et taxe de gestion) sont collectées pour le compte de l'État.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Tarifs</h2>
          <p className="text-slate-700 leading-relaxed">
            Les tarifs applicables sont indiqués sur le site au moment de la commande et incluent :
          </p>
          <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1">
            <li><strong>Frais de gestion CertiCarte :</strong> variables selon le type de démarche</li>
            <li><strong>Taxe régionale :</strong> fixée par le Conseil Régional de votre lieu de résidence</li>
            <li><strong>Frais d'expédition :</strong> tarif postal en vigueur pour l'envoi du certificat</li>
          </ul>
          <p className="text-slate-700 mt-3">
            Tous les prix sont indiqués en euros TTC (TVA incluse).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Paiement</h2>
          <p className="text-slate-700 leading-relaxed">
            Le paiement s'effectue en ligne, de manière sécurisée, via la plateforme Stripe. Les moyens de paiement acceptés sont : carte bancaire Visa, Mastercard, American Express. Le paiement est dû en totalité lors de la validation du dossier.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Droit de rétractation</h2>
          <p className="text-slate-700 leading-relaxed">
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les services pleinement exécutés avant la fin du délai de rétractation avec l'accord exprès du consommateur. En acceptant la mise en traitement immédiate de votre dossier lors de la commande, vous renoncez expressément à ce droit une fois le service exécuté.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Délais de traitement</h2>
          <p className="text-slate-700 leading-relaxed">
            Les délais de traitement sont donnés à titre indicatif et dépendent des autorités compétentes. CertiCarte ne saurait être tenu responsable des délais liés à l'ANTS ou aux préfectures. En cas de retard exceptionnel, CertiCarte informera le client et proposera une solution adaptée.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">7. Responsabilité du client</h2>
          <p className="text-slate-700 leading-relaxed">
            Le client est seul responsable de l'exactitude et de la complétude des informations et documents fournis. CertiCarte ne peut être tenu responsable d'un refus de dossier dû à des informations erronées ou des documents invalides fournis par le client.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">8. Réclamations et litiges</h2>
          <p className="text-slate-700 leading-relaxed">
            Toute réclamation doit être adressée par email à <a href="mailto:contact@certicarte.fr" className="text-blue-600 hover:underline">contact@certicarte.fr</a>. En cas de litige non résolu, le client peut recourir au service de médiation de la consommation compétent. En dernier recours, les tribunaux français sont compétents.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">9. Droit applicable</h2>
          <p className="text-slate-700 leading-relaxed">
            Les présentes CGV sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents du ressort du siège social de CertiCarte.
          </p>
        </section>

        <p className="text-sm text-slate-500 mt-10">Dernière mise à jour : avril 2026</p>
      </div>
    </Layout>
  )
}
