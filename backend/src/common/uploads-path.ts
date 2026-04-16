import * as fs from 'fs';
import * as path from 'path';

function getCandidateUploadDirs() {
  const cwd = process.cwd();
  return Array.from(new Set([
    process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : null,
    path.resolve(cwd, 'uploads'),
    path.resolve(cwd, '..', 'uploads'),
  ].filter(Boolean) as string[]));
}

export function getUploadsDir() {
  const candidates = getCandidateUploadDirs();
  const existing = candidates.find((candidate) => fs.existsSync(candidate));
  return existing || candidates[candidates.length - 1];
}

export function ensureUploadsDir() {
  const uploadsDir = getUploadsDir();
  fs.mkdirSync(uploadsDir, { recursive: true });
  return uploadsDir;
}

export function getStoredUploadPath(fileName: string) {
  return path.join('uploads', fileName).replace(/\\/g, '/');
}

export function sanitizeUploadSegment(value: string) {
  return String(value || 'document')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'document';
}

export function getUploadPathCandidates(rawPath: string) {
  const normalizedRaw = String(rawPath || '').trim();
  const uploadsDir = getUploadsDir();

  return Array.from(new Set([
    normalizedRaw,
    path.resolve(process.cwd(), normalizedRaw),
    path.resolve(uploadsDir, path.basename(normalizedRaw)),
  ].filter(Boolean)));
}