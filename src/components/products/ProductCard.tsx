"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, Category, SubCategory, getProductName, getCategoryName, type ProductWeight } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { Locale } from "@/i18n/routing";
import { Heart, Tag, Minus, Plus, ShoppingCart, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  category?: Category;
  subCategory?: SubCategory;
}

export default function ProductCard({ product, category, subCategory }: ProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const inWish = isInWishlist(product.id);
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice > 0;
  const hasWeights = product.hasMultipleWeights && product.weights && product.weights.length > 0;
  
  // Determine overall stock status - if any weight has stock, product is in stock
  const hasAnyStock = hasWeights 
    ? product.weights!.some(w => (w.stock ?? 0) > 0)
    : product.stock > 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<ProductWeight | null>(
    hasWeights ? product.weights![0] : null
  );
  const [qty, setQty] = useState(1);
  
  // For selected weight in modal
  const currentWeightStock = selectedWeight ? (selectedWeight.stock ?? 0) : product.stock;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWish) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (hasWeights && product.weights && product.weights.length > 0) {
      setSelectedWeight(product.weights[0]);
      setQty(1);
      setIsModalOpen(true);
    } else {
      addItem(product);
    }
  };

  const handleConfirmAdd = () => {
    addItem(product, qty, selectedWeight ?? undefined);
    setIsModalOpen(false);
  };

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-safra-taupe/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative">
        {hasDiscount && (
          <div className="absolute top-3 start-3 z-20 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <Tag className="h-3 w-3" />
            <span>{isAr ? "خصم" : "Sale"}</span>
          </div>
        )}

        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 end-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:scale-110",
            inWish ? "text-red-500" : "text-safra-taupe hover:text-red-500"
          )}
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" fill={inWish ? "currentColor" : "none"} />
        </button>

        <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-safra-cream">
          <Image
              src={product.image}
              alt={getProductName(product, locale)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {!hasAnyStock && (
              <span className="absolute inset-0 flex items-center justify-center bg-safra-dark/60 text-sm font-medium text-safra-cream z-10">
                {t("outOfStock")}
              </span>
            )}
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <Link href={`/products/${product.id}`} className="block overflow-hidden">
            <h3 className="font-semibold text-safra-dark transition-colors group-hover:text-safra-gold truncate">
              {getProductName(product, locale)}
            </h3>
            {category && (
              <p className="mt-0.5 text-xs text-safra-muted truncate">
                {getCategoryName(category, locale)}
                {subCategory && ` > ${subCategory.name[locale]}`}
              </p>
            )}
          </Link>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-lg font-bold text-safra-deep-gold">
              <Price amount={hasDiscount ? product.discountPrice! : product.price} />
            </p>
            {hasDiscount && (
              <p className="text-sm font-medium text-safra-muted mb-0.5">
                <Price amount={product.price} strikethrough={true} />
              </p>
            )}
          </div>
          <Button
            className="mt-4 w-full pt-2 pb-2"
            size="sm"
            disabled={!hasAnyStock}
            onClick={handleAddToCart}
          >
            {hasAnyStock ? t("addToCart") : t("outOfStock")}
          </Button>
        </div>
      </article>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">{isAr ? "اختر الوزن" : "Select Weight"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Weights Selector */}
            {product.weights && product.weights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-4 w-4 text-safra-olive" />
                  <p className="text-sm font-semibold text-safra-dark">
                    {isAr ? "اختر الوزن" : "Select Weight"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.weights!.map((w) => {
                    const isSelected = selectedWeight?.id === w.id;
                    const hasWDiscount = w.discountPrice && w.discountPrice < w.price;
                    const weightInStock = (w.stock ?? 0) > 0;
                    
                    return (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWeight(w)}
                        disabled={!weightInStock}
                        className={cn(
                          "flex flex-col items-center rounded-xl border-2 px-4 py-2.5 text-sm transition-all flex-1",
                          !weightInStock && "opacity-50 cursor-not-allowed",
                          isSelected
                            ? "border-safra-gold bg-safra-gold/10 text-safra-dark shadow-md"
                            : "border-safra-taupe/30 bg-white text-safra-muted hover:border-safra-gold/60 hover:text-safra-dark"
                        )}
                      >
                        <span className="font-bold text-base">{w.value} {w.unit}</span>
                        <span className={cn("text-xs mt-0.5", isSelected ? "text-safra-olive" : "text-safra-muted")}>
                          {hasWDiscount ? (
                            <>
                              <span className="font-semibold"><Price amount={w.discountPrice!} /></span>
                              {" "}
                              <span className="line-through opacity-70"><Price amount={w.price} /></span>
                            </>
                          ) : (
                            <Price amount={w.price} />
                          )}
                        </span>
                        {!weightInStock && (
                          <span className="text-xs text-red-500 mt-1">{t("outOfStock")}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between rounded-xl border border-safra-taupe/50 bg-safra-light/20 px-4 py-3">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-safra-olive transition-colors hover:bg-white hover:text-safra-dark hover:shadow-sm"
                aria-label="Decrease"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-center text-lg font-bold text-safra-dark">{qty}</span>
              <button
                onClick={() => setQty(Math.min(currentWeightStock, qty + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-safra-olive transition-colors hover:bg-white hover:text-safra-dark hover:shadow-sm"
                aria-label="Increase"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleConfirmAdd} 
              className="w-full h-12 gap-2 text-lg font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {t("addToCart")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
