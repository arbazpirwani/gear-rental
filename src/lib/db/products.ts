import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { PRODUCTS as SEED_PRODUCTS } from '../../data/products';
import type { Product } from '../../types';

export type ProductSource = 'seed' | 'firestore' | 'loading';

export interface UseProductsResult {
  products: Product[];
  source: ProductSource;
  error?: string;
}

function fromDoc(id: string, data: DocumentData): Product {
  return {
    id,
    title: data.title ?? '',
    brand: data.brand ?? '',
    category: data.category ?? 'camera',
    shortDescription: data.shortDescription ?? '',
    description: data.description ?? '',
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    pricePerDay: Number(data.pricePerDay ?? 0),
    deposit: Number(data.deposit ?? 0),
    image: data.image ?? '',
    inStock: data.inStock !== false,
  };
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [source, setSource] = useState<ProductSource>(
    isFirebaseConfigured ? 'loading' : 'seed',
  );
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!db) {
      setSource('seed');
      setProducts(SEED_PRODUCTS);
      return;
    }
    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setProducts(SEED_PRODUCTS);
          setSource('seed');
          return;
        }
        const items = snap.docs.map((d) => fromDoc(d.id, d.data()));
        setProducts(items);
        setSource('firestore');
      },
      (err) => {
        console.warn('Firestore products read failed:', err);
        setProducts(SEED_PRODUCTS);
        setSource('seed');
        setError(err.message);
      },
    );
    return () => unsub();
  }, []);

  return { products, source, error };
}

export function useProduct(id: string | undefined): {
  product: Product | undefined;
  source: ProductSource;
} {
  const { products, source } = useProducts();
  const product = id ? products.find((p) => p.id === id) : undefined;
  return { product, source };
}

// Add only products that don't already exist in Firestore. Safe to run after
// you've edited prices in /admin — your edits are preserved.
export async function addMissingProducts(): Promise<{ added: number; skipped: number }> {
  if (!db) throw new Error('Firebase not configured.');
  const existing = await getDocs(query(collection(db, 'products')));
  const existingIds = new Set(existing.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let added = 0;
  let skipped = 0;
  for (const p of SEED_PRODUCTS) {
    if (existingIds.has(p.id)) {
      skipped++;
      continue;
    }
    batch.set(doc(db, 'products', p.id), productToFirestore(p));
    added++;
  }
  if (added > 0) await batch.commit();
  return { added, skipped };
}

// Destructive: overwrites every seed-id doc with the seed-file contents.
// Use only when you actually want a factory reset — admin edits to prices,
// titles, etc. on those products will be lost.
export async function resetProductsToSeed(): Promise<number> {
  if (!db) throw new Error('Firebase not configured.');
  const batch = writeBatch(db);
  for (const p of SEED_PRODUCTS) {
    const ref = doc(db, 'products', p.id);
    batch.set(ref, productToFirestore(p));
  }
  await batch.commit();
  return SEED_PRODUCTS.length;
}

export async function upsertProduct(p: Product): Promise<void> {
  if (!db) throw new Error('Firebase not configured.');
  await setDoc(doc(db, 'products', p.id), productToFirestore(p));
}

export async function updateProductFields(
  id: string,
  fields: Partial<Pick<Product, 'pricePerDay' | 'deposit' | 'title' | 'shortDescription' | 'description' | 'inStock'>>,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured.');
  await updateDoc(doc(db, 'products', id), fields);
}

function productToFirestore(p: Product) {
  return {
    title: p.title,
    brand: p.brand,
    category: p.category,
    shortDescription: p.shortDescription,
    description: p.description,
    highlights: p.highlights,
    pricePerDay: p.pricePerDay,
    deposit: p.deposit,
    image: p.image,
    inStock: p.inStock,
  };
}
