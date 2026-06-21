import { api } from './api';

/**
 * Uploads a File/Blob to Supabase Storage via a signed URL obtained from the server.
 * Returns the public URL once upload completes.
 */
export async function uploadPhoto(file: File, bucket: 'dog-photos' | 'sighting-photos'): Promise<string> {
  const { signedUrl, token, publicUrl, path } = await api.signUpload(bucket, file.name);

  // Supabase signed upload URL expects a PUT with the token in the URL already
  const res = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!res.ok) throw new Error('Photo upload failed');
  return publicUrl;
}

/** Compress an image client-side before upload (max 1600px, JPEG 0.82 quality) */
export function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result as string; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
      else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Compression failed'));
        resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
