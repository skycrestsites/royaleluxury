import { useRef, useState } from 'react';
import { publicImageUrl } from '../lib/firebase';
import { errorMessage } from '../lib/format';
import { ACCEPT_ATTRIBUTE, uploadImage } from '../lib/uploads';
import type { StoredImage } from '../lib/types';
import { Icon } from './Icon';

interface Props {
  folder: string;
  images: StoredImage[];
  onChange: (images: StoredImage[]) => void;
  max?: number;
}

type Upload = { id: string; name: string; progress: number; error?: string };

/** Upload, caption, reorder and remove images. The first image is the primary image. */
export function ImageManager({ folder, images, onChange, max = 12 }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const latest = useRef(images);
  latest.current = images;

  const remaining = max - images.length;

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files).slice(0, Math.max(0, remaining));
    await Promise.all(
      selected.map(async (file) => {
        const id = crypto.randomUUID();
        const update = (patch: Partial<Upload>) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
        setUploads((list) => [...list, { id, name: file.name, progress: 0 }]);
        try {
          const image = await uploadImage(folder, file, (progress) => update({ progress }));
          onChange([...latest.current, { ...image, alt: '' }]);
          setUploads((list) => list.filter((u) => u.id !== id));
        } catch (error) {
          update({ error: errorMessage(error) });
        }
      }),
    );
  }

  const move = (from: number, to: number) => {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="a-images">
      {images.length > 0 && (
        <ul className="a-image-grid">
          {images.map((image, i) => (
            <li key={image.path} className="a-image-item">
              <div className="a-image-thumb">
                <img src={publicImageUrl(image.path)} alt="" loading="lazy" />
                {i === 0 && <span className="a-image-primary">Primary</span>}
              </div>
              <input
                className="a-input a-input--sm"
                placeholder="Describe the image (alt text)"
                aria-label={`Alt text for image ${i + 1}`}
                value={image.alt}
                onChange={(e) => onChange(images.map((img, j) => (j === i ? { ...img, alt: e.target.value } : img)))}
              />
              <div className="a-image-actions">
                <button type="button" className="a-icon-btn" aria-label="Move left" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <Icon name="chevronLeft" size={16} />
                </button>
                <button type="button" className="a-icon-btn" aria-label="Move right" disabled={i === images.length - 1} onClick={() => move(i, i + 1)}>
                  <Icon name="chevronRight" size={16} />
                </button>
                <button type="button" className="a-icon-btn a-icon-btn--danger" aria-label="Remove image" onClick={() => onChange(images.filter((_, j) => j !== i))}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {uploads.map((upload) => (
        <div key={upload.id} className={`a-upload ${upload.error ? 'has-error' : ''}`}>
          <span>{upload.name}</span>
          {upload.error ? (
            <span className="a-field-error">{upload.error}</span>
          ) : (
            <progress max={1} value={upload.progress} aria-label={`Uploading ${upload.name}`} />
          )}
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={`a-dropzone ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <Icon name="upload" size={22} />
          <p>
            Drag images here or{' '}
            <button type="button" className="a-link" onClick={() => input.current?.click()}>
              browse
            </button>
          </p>
          <span className="a-field-hint">JPG, PNG, WebP or AVIF up to 10 MB. Portrait 4:5 looks best.</span>
          <input
            ref={input}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            multiple={max > 1}
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}
