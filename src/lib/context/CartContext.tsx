"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Product, CartItem, ProductWeight } from "@/lib/types";

export interface AppliedCoupon {
  code: string;
  discountValue: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedWeight?: ProductWeight) => void;
  removeItem: (productId: string, weightId?: string) => void;
  updateQuantity: (productId: string, quantity: number, weightId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  appliedCoupon: AppliedCoupon | null;
  setCoupon: (coupon: AppliedCoupon | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "safra-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
        setAppliedCoupon(parsed.appliedCoupon || null);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_KEY, JSON.stringify({ items, appliedCoupon }));
    }
  }, [items, appliedCoupon, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1, selectedWeight?: ProductWeight) => {
    setItems((prev) => {
      // Match by product id AND weight id (if any) so different weights are separate cart rows
      const cartKey = selectedWeight ? `${product.id}__${selectedWeight.id}` : product.id;
      const existing = prev.find((i) => {
        const key = i.selectedWeight ? `${i.product.id}__${i.selectedWeight.id}` : i.product.id;
        return key === cartKey;
      });
      if (existing) {
        return prev.map((i) => {
          const key = i.selectedWeight ? `${i.product.id}__${i.selectedWeight.id}` : i.product.id;
          return key === cartKey
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i;
        });
      }
      return [...prev, { product, quantity, selectedWeight }];
    });
  }, []);

  const removeItem = useCallback((productId: string, weightId?: string) => {
    setItems((prev) => prev.filter((i) => {
      const key = i.selectedWeight ? `${i.product.id}__${i.selectedWeight.id}` : i.product.id;
      const targetKey = weightId ? `${productId}__${weightId}` : productId;
      return key !== targetKey;
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, weightId?: string) => {
    setItems((prev) =>
      prev
        .map((i) => {
          const key = i.selectedWeight ? `${i.product.id}__${i.selectedWeight.id}` : i.product.id;
          const targetKey = weightId ? `${productId}__${weightId}` : productId;
          return key === targetKey
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.product.stock)) }
            : i;
        })
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  // Use selectedWeight price if available, otherwise product price
  const totalPrice = items.reduce((sum, i) => {
    const priceToUse = i.selectedWeight
      ? (i.selectedWeight.discountPrice && i.selectedWeight.discountPrice < i.selectedWeight.price
          ? i.selectedWeight.discountPrice
          : i.selectedWeight.price)
      : (i.product.discountPrice || i.product.price);
    return sum + priceToUse * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, appliedCoupon, setCoupon: setAppliedCoupon }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
