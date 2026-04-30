import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface BookedRange {
  productId: string;
  startDate: string;
  endDate: string;
  bookingId: string;
  status: 'pending' | 'confirmed';
}

export function useBookedDates(productId: string | undefined): {
  ranges: BookedRange[];
  loading: boolean;
} {
  const [ranges, setRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(productId));

  useEffect(() => {
    if (!db || !productId) {
      setRanges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'bookedDates'), where('productId', '==', productId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: BookedRange[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            productId: data.productId,
            startDate: data.startDate,
            endDate: data.endDate,
            bookingId: data.bookingId,
            status: data.status === 'confirmed' ? 'confirmed' : 'pending',
          };
        });
        setRanges(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore bookedDates read failed:', err);
        setRanges([]);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [productId]);

  return { ranges, loading };
}

export function isDateBlocked(date: string, ranges: BookedRange[]): boolean {
  for (const r of ranges) {
    if (date >= r.startDate && date <= r.endDate) return true;
  }
  return false;
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA <= endB && startB <= endA;
}
