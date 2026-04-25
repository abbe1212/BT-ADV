/**
 * Cloudinary Server-Side Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is SERVER-ONLY. Never import it in client components.
 * It configures the Cloudinary v2 SDK once and exports a typed upload utility.
 *
 * Required env vars (add to .env.local):
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure once on module load (singleton pattern matching the rest of the lib)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true, // always use https URLs
});

/* ─── Types ──────────────────────────────────────────────────────────────────*/

export type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

export interface UploadToCloudinaryOptions {
  /** Cloudinary folder, e.g. 'bt-agency/works' */
  folder?: string;
  /** Override resource type detection */
  resourceType?: CloudinaryResourceType;
  /** Max width/height for images (optional transformation) */
  maxWidth?: number;
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

/* ─── Upload utility ─────────────────────────────────────────────────────────*/

/**
 * Uploads a Buffer or base64 DataURI to Cloudinary.
 * Uses signed upload (API secret stays on the server).
 *
 * @param source  - Raw Buffer or base64 data URI string
 * @param options - Upload options
 * @returns       CloudinaryUploadResult with secure_url and public_id
 */
export async function uploadToCloudinary(
  source: Buffer | string,
  options: UploadToCloudinaryOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = 'bt-agency',
    resourceType = 'auto',
  } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType as 'image' | 'video' | 'raw' | 'auto',
      overwrite: false,
    };

    const handleResult = (
      error: Error | undefined,
      result: Record<string, unknown> | undefined
    ) => {
      if (error) return reject(error);
      if (!result) return reject(new Error('No result from Cloudinary'));

      resolve({
        url:          result.url as string,
        secureUrl:    result.secure_url as string,
        publicId:     result.public_id as string,
        resourceType: result.resource_type as string,
        format:       result.format as string,
        width:        result.width as number | undefined,
        height:       result.height as number | undefined,
        bytes:        result.bytes as number,
      });
    };

    if (Buffer.isBuffer(source)) {
      // Stream upload from Buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        handleResult
      );
      uploadStream.end(source);
    } else {
      // DataURI or remote URL string
      cloudinary.uploader.upload(source, uploadOptions, handleResult);
    }
  });
}

export default cloudinary;
