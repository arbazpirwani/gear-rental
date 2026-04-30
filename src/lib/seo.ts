import { useEffect } from 'react';

// Production canonical URL. If you point a custom domain at this site, change
// this once and the canonicals/sitemap update everywhere.
export const SITE_URL = 'https://arbazpirwani.github.io/gear-rental';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/sony-zv-e10.jpg`;

export interface DocumentMeta {
  title: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

// Sets <title>, meta description, OG, Twitter card, canonical and (optionally)
// a Product/etc JSON-LD script. Cleans up on unmount so the next page starts
// fresh. Side-effect-only — render nothing.
export function useDocumentMeta({ title, description, image, noindex, jsonLd }: DocumentMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    setMeta('description', description, 'name');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image ?? DEFAULT_OG_IMAGE, 'property');
    setMeta('og:url', window.location.href, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', image ?? DEFAULT_OG_IMAGE, 'name');
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow', 'name');
    setLink('canonical', window.location.href);

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.dataset.seoDynamic = 'true';
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = previousTitle;
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [title, description, image, noindex, JSON.stringify(jsonLd)]);
}

function setMeta(key: string, value: string | undefined, attr: 'name' | 'property') {
  const v = value ?? '';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', v);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
