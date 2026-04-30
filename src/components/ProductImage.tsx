import { useState } from 'react';
import type { Product } from '../types';

const CATEGORY_LABEL: Record<Product['category'], string> = {
  camera: 'CAMERA',
  lens: 'LENS',
  audio: 'AUDIO',
  filter: 'FILTER',
  support: 'SUPPORT',
  gimbal: 'GIMBAL',
};

const CATEGORY_GLYPH: Record<Product['category'], string> = {
  camera: '◉',
  lens: '◎',
  audio: '🎙',
  filter: '◐',
  support: '⌶',
  gimbal: '⟳',
};

export default function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const [errored, setErrored] = useState(false);
  // Vite serves /public at base URL. Build the absolute URL the browser resolves.
  const src = product.image.startsWith('http')
    ? product.image
    : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${product.image}`;

  if (errored) {
    return (
      <div className={`placeholder ${large ? 'placeholder-lg' : ''}`}>
        <div className="placeholder-glyph">{CATEGORY_GLYPH[product.category]}</div>
        <div className="placeholder-cat">{CATEGORY_LABEL[product.category]}</div>
        <div className="placeholder-title">{product.brand}</div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={product.title}
      loading="lazy"
      className={large ? 'product-image-lg' : 'product-image'}
      onError={() => setErrored(true)}
    />
  );
}
