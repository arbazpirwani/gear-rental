export type Category = 'camera' | 'lens' | 'action' | 'gimbal' | 'support' | 'filter' | 'audio';

// Display order. Categories not listed here go last.
export const CATEGORY_ORDER: Category[] = [
  'camera',
  'lens',
  'action',
  'gimbal',
  'support',
  'filter',
  'audio',
];

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: Category;
  shortDescription: string;
  description: string;
  highlights: string[];
  pricePerDay: number;
  deposit: number;
  image: string;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  startDate: string;
  endDate: string;
}

export interface PriceLine {
  productId: string;
  title: string;
  days: number;
  rate: number;
  subtotal: number;
  deposit: number;
}

export interface PriceQuote {
  lines: PriceLine[];
  rentalSubtotal: number;
  itemDiscountPercent: number;
  itemDiscountAmount: number;
  rentalTotal: number;
  depositTotal: number;
  advance: number;
  balanceAtPickup: number;
  grandTotalPayable: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  pickupNotes: string;
  agreed: boolean;
}
