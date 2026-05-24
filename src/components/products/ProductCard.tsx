"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, Category, getProductName, getCategoryName } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";

interface ProductCardProps {
  product: Product;
  category?: Category;
}

export default function ProductCard({ product, category }: ProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const { addItem } = useCart();
  const inStock = product.stock > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-safra-taupe/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-safra-cream">
        <Image
          src={product.image}
          alt={getProductName(product, locale)}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-safra-dark/60 text-sm font-medium text-safra-cream">
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
        <p className="mt-1 text-lg font-bold text-safra-deep-gold">
          <Price amount={product.price} />
        </p>
        <Button
          className="mt-auto w-full pt-2 pb-2"
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
