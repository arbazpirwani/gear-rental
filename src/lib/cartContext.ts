import { createContext, useContext } from 'react';
import type { CartItem } from '../types';

interface CartContextValue {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const CartContext = createContext<CartContextValue>({
  cart: [],
  setCart: () => {},
});

export function useCart() {
  return useContext(CartContext);
}
