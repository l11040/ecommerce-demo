'use client';

import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from '../cart-store';

export function useCart() {
  return useCartStore(
    useShallow((s) => ({
      itemCount: s.itemCount,
      setItemCount: s.setItemCount,
    })),
  );
}
