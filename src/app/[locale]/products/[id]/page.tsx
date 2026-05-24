"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { fetchProductById } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";
import { getProductName, getProductDescription, getCategoryName, type Product, type Category } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { use, useEffect, useState } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    Promise.all([fetchProductById(id), fetchCategories()]).then(([p, cats]) => {
      setProduct(p ?? null);
      if (p) setCategory(cats.find((c) => c.id === p.categoryId) ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-safra-muted">
        Loading...
      </div>
    );
  }

  if (!product) notFound();

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm text-safra-olive transition-colors hover:text-safra-gold"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("backToProducts")}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
          <Image
            src={product.image}
            alt={getProductName(product, locale)}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
          {category && (
            <span className="rounded-full bg-safra-light px-3 py-1 text-xs font-medium text-safra-dark">
              {getCategoryName(category, locale)}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-bold text-safra-dark">
            {getProductName(product, locale)}
          </h1>
          <p className="mt-4 text-2xl font-bold text-safra-deep-gold">
            {formatPrice(product.price)}
          </p>
          <p className="mt-4 leading-relaxed text-safra-muted">
            {getProductDescription(product, locale)}
          </p>
          <p className="mt-2 text-sm text-safra-olive">
            {inStock ? t("itemsLeft", { count: product.stock }) : t("outOfStock")}
          </p>

          {inStock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-safra-taupe">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 text-safra-olive hover:text-safra-dark"
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="p-3 text-safra-olive hover:text-safra-dark"
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={() => addItem(product, qty)}>{t("addToCart")}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
