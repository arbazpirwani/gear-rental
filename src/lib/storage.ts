import type { CartItem } from '../types';

const CART_KEY = 'gear-rental:cart';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.productId === 'string' &&
        typeof i?.startDate === 'string' &&
        typeof i?.endDate === 'string',
    );
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}
