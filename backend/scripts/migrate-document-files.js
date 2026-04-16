const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');
const targetUploadsDir = path.join(projectRoot, 'uploads');

function sanitizeSegment(value) {
  return String(value || 'document')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'document';
}

function getExtension(row) {
  const fileName = row.filename || row.url || '';
  const ext = path.extname(String(fileName)).toLowerCase();
  return ext || '';
}

function getSourceCandidates(row) {
  const raw = String(row.url || '').trim();
  const baseName = path.basename(raw || row.filename || '');

  return Array.from(new Set([
    raw,
    path.resolve(backendRoot, raw),
    path.resolve(projectRoot, raw),
    path.join(backendRoot, 'uploads', baseName),
    path.join(projectRoot, 'uploads', baseName),
  ].filter(Boolean)));
}

async function run() {
  fs.mkdirSync(targetUploadsDir, { recursive: true });

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'sql7.freesqldatabase.com',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || 'sql7823235',
    password: process.env.DB_PASSWORD || 'spiQTQBNxd',
    database: process.env.DB_DATABASE || 'sql7823235',
  });

  const [rows] = await connection.query(`
    SELECT
      documents.id,
      documents.filename,
      documents.url,
      documents.uploaded_at AS uploadedAt,
      documents.dossier_id AS dossierId,
      dossiers.numero AS dossierNumero
    FROM documents
    INNER JOIN dossiers ON dossiers.id = documents.dossier_id
    ORDER BY dossiers.numero ASC, documents.uploaded_at ASC, documents.id ASC
  `);

  const documents = Array.isArray(rows) ? rows : [];
  const nextIndexByDossier = new Map();
  let movedCount = 0;
  let missingCount = 0;

  for (const row of documents) {
    const dossierKey = row.dossierId || row.dossierNumero || 'dossier';
    const nextIndex = (nextIndexByDossier.get(dossierKey) || 0) + 1;
    nextIndexByDossier.set(dossierKey, nextIndex);

    const safeNumero = sanitizeSegment(row.dossierNumero || row.dossierId || 'dossier');
    const targetFileName = `${safeNumero}_${nextIndex}${getExtension(row)}`;
    const targetPath = path.join(targetUploadsDir, targetFileName);
    const sourcePath = getSourceCandidates(row).find((candidate) => fs.existsSync(candidate));

    if (!sourcePath) {
      console.log(`MISSING ${row.id} -> ${row.url || row.filename}`);
      missingCount += 1;
      continue;
    }

    if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      fs.renameSync(sourcePath, targetPath);
    }

    await connection.query('UPDATE documents SET filename = ?, url = ? WHERE id = ?', [
      targetFileName,
      `uploads/${targetFileName}`,
      row.id,
    ]);

    movedCount += 1;
    console.log(`OK ${row.id} -> uploads/${targetFileName}`);
  }

  await connection.end();
  console.log(`DONE moved=${movedCount} missing=${missingCount}`);
}

run().catch((error) => {
  console.error('FATAL', error.message || error);
  process.exit(1);
});