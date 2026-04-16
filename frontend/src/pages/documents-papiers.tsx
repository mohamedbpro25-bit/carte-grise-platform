import React, { useMemo, useState } from 'react'
import Head from 'next/head'
import type { GetStaticProps } from 'next'
import fs from 'fs'
import path from 'path'

type DocItem = {
  fileName: string
  href: string
}

type Props = {
  docs: DocItem[]
}

const DOC_TITLES: Record<string, string> = {
  'attestation_hebergement.pdf': "Attestation d'hebergement",
  'declaration-cession-cerfa-15776-01.pdf': 'Declaration de cession (Cerfa 15776-01)',
  'demande-certif-immat-neuf-cerfa-13749-03.pdf': "Demande de certificat d'immatriculation (Cerfa 13749-03)",
  'mandat_immatriculation_professionnel.pdf': "Mandat d'immatriculation professionnel",
  'notice_explicative_cerfa.pdf': 'Notice explicative Cerfa',
}

const toFriendlyTitle = (fileName: string): string => {
  const directTitle = DOC_TITLES[fileName.toLowerCase()]
  if (directTitle) return directTitle

  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

const listPdfFromPublicDocuments = (publicDocsDir: string): string[] => {
  if (!fs.existsSync(publicDocsDir)) return []

  return fs
    .readdirSync(publicDocsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => entry.name)
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const frontendRoot = process.cwd()
  const publicDocsDir = path.join(frontendRoot, 'public', 'documents')

  const docs: DocItem[] = listPdfFromPublicDocuments(publicDocsDir).map((fileName) => ({
    fileName,
    href: `/documents/${encodeURIComponent(fileName)}`,
  }))

  docs.sort((a, b) =>
    a.fileName.localeCompare(b.fileName, 'fr', { sensitivity: 'base' }),
  )

  return {
    props: { docs },
    revalidate: 30,
  }
}

export default function DocumentsPapiersPage({ docs }: Props) {
  const [query, setQuery] = useState('')

  const filteredDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return docs

    return docs.filter((doc) => {
      const title = toFriendlyTitle(doc.fileName).toLowerCase()
      return title.includes(normalized) || doc.fileName.toLowerCase().includes(normalized)
    })
  }, [docs, query])

  return (
    <>
      <Head>
        <title>Documents et papiers - CertiCarte</title>
        <meta name="description" content="Telechargez les documents carte grise a imprimer (PDF)." />
      </Head>

      <section className="fr-hero py-16">
        <div className="container-custom">
          <h1 className="text-4xl font-extrabold text-slate-900">Documents et papiers a imprimer</h1>
          <p className="mt-3 max-w-3xl text-slate-700">Retrouvez les formulaires utiles pour vos demarches. Vous pouvez imprimer, signer, puis reuploader les documents dans votre dossier.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label htmlFor="documents-search" className="block text-sm font-semibold text-slate-800">Rechercher un document</label>
          <input
            id="documents-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: cession, cerfa, mandat..."
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2"
          />
          <p className="mt-2 text-xs font-medium text-slate-500">{filteredDocs.length} document(s)</p>
        </div>

        <div className="container-custom grid gap-5 md:grid-cols-2">
          {docs.length === 0 && (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
              <h2 className="text-xl font-bold text-slate-900">Aucun document detecte</h2>
              <p className="mt-2 text-slate-600">Ajoutez vos fichiers PDF dans frontend/public/documents.</p>
            </article>
          )}

          {docs.length > 0 && filteredDocs.length === 0 && (
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm md:col-span-2">
              <h2 className="text-xl font-bold text-amber-900">Aucun resultat</h2>
              <p className="mt-2 text-amber-800">Aucun PDF ne correspond a votre recherche.</p>
            </article>
          )}

          {filteredDocs.map((doc) => (
            <article key={doc.fileName} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-900">{toFriendlyTitle(doc.fileName)}</h2>
              <p className="mt-1 break-all text-xs text-slate-500">{doc.fileName}</p>
              <p className="mt-2 text-slate-600">Document disponible.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a className="inline-flex rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800" href={doc.href} target="_blank" rel="noreferrer">
                  Ouvrir le PDF
                </a>
                <a className="inline-flex rounded-full bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300" href={`${doc.href}${doc.href.includes('?') ? '&' : '?'}dl=1`}>
                  Telecharger
                </a>
              </div>
            </article>
          ))}

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">Liens officiels utiles</h2>
            <p className="mt-2 text-slate-600">References administratives pour vos demarches.</p>
            <a className="mt-4 inline-flex rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700" href="https://www.service-public.fr/particuliers/vosdroits/N367" target="_blank" rel="noreferrer">
              Ouvrir Service-Public
            </a>
          </article>
        </div>
      </section>
    </>
  )
}
