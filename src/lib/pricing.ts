import type { CartItem, PriceLine, PriceQuote, Product } from '../types';

// Multi-day pricing model
//   day 1   = 100% of pricePerDay
//   day 2   = 75%
//   day 3+  = 60%
// → 7 days ≈ 5.25× day rate (a "weekly" rate)
//
// Bundle discount on rental subtotal:
//   3-4 distinct items = 10% off
//   5+  distinct items = 15% off
// Deposit is never discounted.
//
// Advance to confirm booking: 30% of rental total OR AED 100 minimum.

export const ADVANCE_PERCENT = 0.3;
export const ADVANCE_MIN = 100;

export function daysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function rentalForDays(pricePerDay: number, days: number): number {
  if (days <= 0) return 0;
  if (days === 1) return pricePerDay;
  if (days === 2) return pricePerDay + Math.round(pricePerDay * 0.75);
  // day 1 + day 2 + (days-2) * 60%
  const tail = (days - 2) * Math.round(pricePerDay * 0.6);
  return pricePerDay + Math.round(pricePerDay * 0.75) + tail;
}

export function bundleDiscountPercent(itemCount: number): number {
  if (itemCount >= 5) return 15;
  if (itemCount >= 3) return 10;
  return 0;
}

export function quote(
  items: CartItem[],
  lookup: (id: string) => Product | undefined,
): PriceQuote {
  const lines: PriceLine[] = [];
  let rentalSubtotal = 0;
  let depositTotal = 0;

  for (const item of items) {
    const product = lookup(item.productId);
    if (!product) continue;
    const days = daysBetween(item.startDate, item.endDate);
    const subtotal = rentalForDays(product.pricePerDay, days);
    lines.push({
      productId: product.id,
      title: product.title,
      days,
      rate: product.pricePerDay,
      subtotal,
      deposit: product.deposit,
    });
    rentalSubtotal += subtotal;
    depositTotal += product.deposit;
  }

  const itemDiscountPercent = bundleDiscountPercent(items.length);
  const itemDiscountAmount = Math.round(rentalSubtotal * (itemDiscountPercent / 100));
  const rentalTotal = rentalSubtotal - itemDiscountAmount;
  const advance = Math.max(ADVANCE_MIN, Math.round(rentalTotal * ADVANCE_PERCENT));
  const balanceAtPickup = rentalTotal - advance + depositTotal;

  return {
    lines,
    rentalSubtotal,
    itemDiscountPercent,
    itemDiscountAmount,
    rentalTotal,
    depositTotal,
    advance,
    balanceAtPickup,
    grandTotalPayable: rentalTotal + depositTotal,
  };
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString('en-AE')}`;
}
