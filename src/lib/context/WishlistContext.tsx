"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { useLocale } from "next-intl";

interface WishlistContextType {
  items: Product[];
  totalWishlistItems: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [items, setItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("safra_wishlist");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse wishlist from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("safra_wishlist", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === product.id)) return prev;
      return [...prev, product];
    });
    toast.success(isAr ? "تمت الإضافة للمفضلة" : "Added to wishlist");
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    toast.success(isAr ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const totalWishlistItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalWishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
