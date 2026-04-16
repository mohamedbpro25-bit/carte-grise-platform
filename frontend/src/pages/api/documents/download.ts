import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const isSafeFileName = (fileName: string) => {
  return /^[a-zA-Z0-9._-]+(\.pdf)?$/i.test(fileName)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileParam = Array.isArray(req.query.file) ? req.query.file[0] : req.query.file
  const scopeParam = Array.isArray(req.query.scope) ? req.query.scope[0] : req.query.scope
  const scope = scopeParam === 'repo' ? 'repo' : 'public'

  if (!fileParam || !isSafeFileName(fileParam)) {
    res.status(400).json({ message: 'Invalid file name' })
    return
  }

  const frontendRoot = process.cwd()
  const repoRoot = path.join(frontendRoot, '..')
  const publicFile = path.join(frontendRoot, 'public', 'documents', fileParam)
  const rootFile = path.join(repoRoot, fileParam)

  let filePath = ''
  if (scope === 'public' && fs.existsSync(publicFile)) {
    filePath = publicFile
  } else if (scope === 'repo' && fs.existsSync(rootFile)) {
    filePath = rootFile
  } else {
    res.status(404).json({ message: 'File not found' })
    return
  }

  const data = fs.readFileSync(filePath)
  const forceDownload = req.query.dl === '1'

  const outputFileName = fileParam.toLowerCase().endsWith('.pdf')
    ? fileParam
    : `${fileParam}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `${forceDownload ? 'attachment' : 'inline'}; filename="${outputFileName}"`,
  )
  res.status(200).send(data)
}
