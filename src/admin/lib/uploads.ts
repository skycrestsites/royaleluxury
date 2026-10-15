import { deleteObject, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';
import type { StoredImage } from './types';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',');

export function validateImage(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPG, PNG, WebP or AVIF image.';
  if (file.size > MAX_UPLOAD_BYTES) return 'Images must be smaller than 10 MB.';
  return null;
}

async function dimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/** Uploads an image to `folder/` with a unique name and reports progress from 0 to 1. */
export async function uploadImage(folder: string, file: File, onProgress?: (progress: number) => void): Promise<StoredImage> {
  const problem = validateImage(file);
  if (problem) throw new Error(problem);

  const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const [{ width, height }] = await Promise.all([
    dimensions(file),
    new Promise<void>((resolve, reject) => {
      const task = uploadBytesResumable(ref(storage, path), file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      });
      task.on('state_changed', (s) => onProgress?.(s.bytesTransferred / s.totalBytes), reject, () => resolve());
    }),
  ]);

  return { path, width, height, alt: '' };
}

export const deleteImage = (path: string) => deleteObject(ref(storage, path)).catch(() => undefined);
