import { useState, useRef } from 'react';
import { uploadPhoto, compressImage } from '../lib/upload';

interface PhotoUploadProps {
  bucket: 'dog-photos' | 'sighting-photos';
  onUploaded: (url: string) => void;
  currentUrl?: string | null;
  label?: string;
}

export default function PhotoUpload({ bucket, onUploaded, currentUrl, label }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image'); return; }
    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadPhoto(compressed, bucket);
      onUploaded(url);
      setPreview(url);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
      <div onClick={() => inputRef.current?.click()}
        className="bg-wood3/30 border-[1.5px] border-dashed border-amber/30 rounded-2xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer active:border-amber overflow-hidden relative">
        {preview ? (
          <>
            <img src={preview} className="absolute inset-0 w-full h-full object-cover"/>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="font-mono text-[10px] text-white tracking-wide">UPLOADING...</span>
              </div>
            )}
          </>
        ) : (
          <>
            <span className="text-3xl">📷</span>
            <p className="font-mono text-[9px] text-muted tracking-[.06em]">{label ?? 'ADD PHOTO'}</p>
          </>
        )}
      </div>
      {error && <p className="text-warn text-[11px] font-mono">{error}</p>}
    </div>
  );
}
