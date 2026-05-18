/**
 * LQIP (Low-Quality Image Placeholder) Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER-ONLY – uses Sharp. Never import this in client components.
 *
 * Generates a tiny base64 blur thumbnail stored directly in the DB so
 * Next.js <Image placeholder="blur"> works with zero extra HTTP requests.
 *
 * Output: data:image/jpeg;base64,... (~300–700 bytes)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import sharp from 'sharp';

/**
 * Generate a base64 LQIP string from any image buffer.
 *
 * @param buffer - The ORIGINAL (pre-compression) image buffer for best accuracy
 * @returns      - data-URI string safe to store in the DB and pass to blurDataURL
 */
export async function generateLQIP(buffer: Buffer): Promise<string> {
  const lqipBuffer = await sharp(buffer)
    .resize(20, undefined, { withoutEnlargement: true }) // 20px wide tiny thumb
    .blur(3)
    .jpeg({ quality: 20, progressive: false })
    .toBuffer();

  return `data:image/jpeg;base64,${lqipBuffer.toString('base64')}`;
}
