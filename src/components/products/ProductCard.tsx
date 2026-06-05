"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, Category, getProductName, getCategoryName } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";
import { Heart, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  category?: Category;
}

export default function ProductCard({ product, category }: ProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const inStock = product.stock > 0;
  const inWish = isInWishlist(product.id);
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice > 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWish) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
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
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-safra-dark/60 text-sm font-medium text-safra-cream z-10">
            {t("outOfStock")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-safra-dark transition-colors group-hover:text-safra-gold">
            {getProductName(product, locale)}
          </h3>
          {category && (
            <p className="mt-0.5 text-xs text-safra-muted">{getCategoryName(category, locale)}</p>
          )}
        </Link>
        <div className="mt-1 flex items-end gap-2">
          <p className="text-lg font-bold text-safra-deep-gold">
            <Price amount={hasDiscount ? product.discountPrice! : product.price} />
          </p>
          {hasDiscount && (
            <p className="text-sm font-medium text-safra-muted line-through mb-0.5">
              <Price amount={product.price} />
            </p>
          )}
        </div>
        <Button
          className="mt-4 w-full pt-2 pb-2"
          size="sm"
          disabled={!inStock}
          onClick={() => addItem(product)}
        >
          {inStock ? t("addToCart") : t("outOfStock")}
        </Button>
      </div>
    </article>
  );
}
