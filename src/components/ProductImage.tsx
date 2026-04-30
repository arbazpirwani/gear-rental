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

// Try the configured path. If the load fails (file missing, decode error),
// try swapping .jpg ↔ .svg once. If both fail, show a category placeholder.
// Keyed on `product.image` so a different product resets the chain.
function ImageWithFallback({ product, src, large }: { product: Product; src: string; large: boolean }) {
  const [errored, setErrored] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const fallback = swapExtension(src);
  const finalSrc = errored && !usedFallback && fallback ? fallback : src;

  if (errored && (usedFallback || !fallback)) {
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
      src={finalSrc}
      alt={product.title}
      className={large ? 'product-image-lg' : 'product-image'}
      onError={() => {
        if (!errored) {
          setErrored(true);
        } else {
          setUsedFallback(true);
        }
      }}
    />
  );
}

export default function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const src = resolveSrc(product.image);
  if (!src) {
    return (
      <div className={`placeholder ${large ? 'placeholder-lg' : ''}`}>
        <div className="placeholder-glyph">{CATEGORY_GLYPH[product.category]}</div>
        <div className="placeholder-cat">{CATEGORY_LABEL[product.category]}</div>
        <div className="placeholder-title">{product.brand}</div>
      </div>
    );
  }
  return <ImageWithFallback key={src} product={product} src={src} large={large} />;
}

function resolveSrc(rawPath: string): string {
  if (!rawPath) return '';
  if (rawPath.startsWith('http')) return rawPath;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${rawPath}`;
}

function swapExtension(src: string): string | null {
  if (src.endsWith('.jpg')) return src.replace(/\.jpg$/, '.svg');
  if (src.endsWith('.svg')) return src.replace(/\.svg$/, '.jpg');
  return null;
}
