import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { MediaReference } from '../content/types';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB (Admin.md open question #13; adjust when confirmed)

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

type SniffedType = 'jpeg' | 'png' | 'webp';

/** Inspect actual bytes rather than trusting the filename/extension or the browser-reported MIME type. */
function sniffImageType(bytes: Buffer): SniffedType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return 'png';
  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  )
    return 'webp';
  return null;
}

export class UploadRejectedError extends Error {}

export async function saveUploadedImage(file: File, alt: string): Promise<MediaReference> {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new UploadRejectedError(`Image must be smaller than ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    throw new UploadRejectedError('Only JPEG, PNG or WebP images are allowed.');
  }

  // Re-encoding through sharp strips EXIF/metadata and neutralises polyglot
  // payloads (Admin.md 16.3) since only decoded pixel data survives.
  let pipeline = sharp(bytes, { failOn: 'error' }).rotate();
  if (sniffed === 'png') pipeline = pipeline.png();
  else pipeline = pipeline.webp({ quality: 82 });

  const output = await pipeline.toBuffer({ resolveWithObject: true });
  const extension = sniffed === 'png' ? 'png' : 'webp';

  await mkdir(UPLOAD_DIR, { recursive: true });
  const id = randomUUID();
  const filename = `${id}.${extension}`;
  await writeFile(path.join(UPLOAD_DIR, filename), output.data);

  return {
    id,
    url: `/uploads/${filename}`,
    alt,
    width: output.info.width,
    height: output.info.height,
  };
}
