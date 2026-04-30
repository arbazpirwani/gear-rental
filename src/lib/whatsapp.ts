import type { CustomerInfo, PriceQuote } from '../types';
import { formatAed } from './pricing';

// Owner WhatsApp number (international format, no +).
export const OWNER_WHATSAPP = '971559870068';
export const OWNER_DISPLAY_PHONE = '+971 55 987 0068';
export const OWNER_NAME = 'Arbaz Pirwani';
export const OWNER_LOCATION = 'Reem Island, Abu Dhabi';

export function buildBookingMessage(
  customer: CustomerInfo,
  q: PriceQuote,
  bookingId?: string,
): string {
  const lines: string[] = [];
  lines.push('*New Booking Request — Gear Rental*', '');
  if (bookingId) lines.push(`Booking ID: ${bookingId}`, '');
  lines.push('*Customer*');
  lines.push(`Name: ${customer.fullName}`);
  lines.push(`Phone / WhatsApp: ${customer.phone}`);
  lines.push(`Email: ${customer.email}`);
  if (customer.pickupNotes.trim()) lines.push(`Notes: ${customer.pickupNotes.trim()}`);
  lines.push('');
  lines.push('*Items*');
  for (const l of q.lines) {
    lines.push(`• ${l.title} — ${l.days} day(s) × ${formatAed(l.rate)} = ${formatAed(l.subtotal)} (deposit ${formatAed(l.deposit)})`);
  }
  lines.push('');
  lines.push('*Pricing*');
  lines.push(`Rental subtotal: ${formatAed(q.rentalSubtotal)}`);
  if (q.itemDiscountPercent > 0) {
    lines.push(`Bundle discount (${q.itemDiscountPercent}%): -${formatAed(q.itemDiscountAmount)}`);
  }
  lines.push(`Rental total: ${formatAed(q.rentalTotal)}`);
  lines.push(`Refundable deposit: ${formatAed(q.depositTotal)}`);
  lines.push(`Advance to confirm (30%): ${formatAed(q.advance)}`);
  lines.push(`Balance at pickup: ${formatAed(q.balanceAtPickup)}`);
  lines.push('');
  lines.push('Customer has read and agreed to the rental terms.');
  return lines.join('\n');
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
