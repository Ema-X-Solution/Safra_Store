"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Product, Category, getCategoryName } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  showFilter?: boolean;
}

export default function ProductGrid({ products, categories, showFilter = false }: ProductGridProps) {
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.categoryId === activeCategory);

  return (
    <div>
      {showFilter && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("All")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === "All"
                ? "bg-safra-gold text-safra-dark shadow-sm"
                : "bg-white text-safra-olive hover:bg-safra-light"
            )}
          >
            {t("filterAll")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-safra-gold text-safra-dark shadow-sm"
                  : "bg-white text-safra-olive hover:bg-safra-light"
              )}
            >
              {getCategoryName(cat, locale)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-safra-muted">{t("notFound")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={categories.find((c) => c.id === product.categoryId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
