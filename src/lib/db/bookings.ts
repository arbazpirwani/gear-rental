import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CartItem, CustomerInfo, PriceQuote } from '../../types';

export type BookingStatus = 'pending' | 'confirmed' | 'picked_up' | 'returned' | 'cancelled';

export interface BookingDoc {
  id: string;
  customer: CustomerInfo;
  items: CartItem[];
  quote: PriceQuote;
  status: BookingStatus;
  createdAtMillis: number;
}

export async function createBooking(
  customer: CustomerInfo,
  items: CartItem[],
  q: PriceQuote,
): Promise<string> {
  if (!db) throw new Error('Firebase not configured.');
  const bookingRef = doc(collection(db, 'bookings'));
  const bookingId = bookingRef.id;

  const batch = writeBatch(db);
  batch.set(bookingRef, {
    customer,
    items,
    quote: {
      lines: q.lines,
      rentalSubtotal: q.rentalSubtotal,
      itemDiscountPercent: q.itemDiscountPercent,
      itemDiscountAmount: q.itemDiscountAmount,
      rentalTotal: q.rentalTotal,
      depositTotal: q.depositTotal,
      advance: q.advance,
      balanceAtPickup: q.balanceAtPickup,
      grandTotalPayable: q.grandTotalPayable,
    },
    status: 'pending' as BookingStatus,
    createdAt: serverTimestamp(),
  });

  // Public companion docs (no PII) so the calendar can show booked dates.
  for (const item of items) {
    const blockRef = doc(collection(db, 'bookedDates'));
    batch.set(blockRef, {
      productId: item.productId,
      startDate: item.startDate,
      endDate: item.endDate,
      bookingId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
  return bookingId;
}

export function useBookings(): { bookings: BookingDoc[]; loading: boolean } {
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setBookings([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: BookingDoc[] = snap.docs.map((d) => {
          const data = d.data();
          const created = data.createdAt;
          const millis = created?.toMillis ? created.toMillis() : Date.now();
          return {
            id: d.id,
            customer: data.customer,
            items: data.items ?? [],
            quote: data.quote,
            status: (data.status ?? 'pending') as BookingStatus,
            createdAtMillis: millis,
          };
        });
        setBookings(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore bookings read failed:', err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return { bookings, loading };
}

// Updating a booking's status also has to keep the public `bookedDates`
// docs in sync, otherwise the calendar lies after admin actions:
//   pending → confirmed: flip the date-block label so customers see "confirmed"
//   anything → cancelled: delete the date-blocks so the dates are freed
//   confirmed → returned/picked_up: leave the block as-is (the dates were used)
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured.');
  const batch = writeBatch(db);
  batch.update(doc(db, 'bookings', id), { status });

  const blockSnap = await getDocs(
    query(collection(db, 'bookedDates'), where('bookingId', '==', id)),
  );
  for (const blockDoc of blockSnap.docs) {
    if (status === 'cancelled') {
      batch.delete(blockDoc.ref);
    } else if (status === 'confirmed') {
      batch.update(blockDoc.ref, { status: 'confirmed' });
    }
  }
  await batch.commit();
}
