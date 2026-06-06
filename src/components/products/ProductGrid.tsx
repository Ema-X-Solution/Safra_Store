"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Product, Category, getCategoryName } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  showFilter?: boolean;
}

type SortOption = "default" | "price_asc" | "price_desc" | "newest";

export default function ProductGrid({ products, categories, showFilter = false }: ProductGridProps) {
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState("All");
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Sync state from URL on mount or URL change
  useEffect(() => {
    const catId = searchParams.get("category");
    if (catId) {
      setActiveCategory(catId);
    }
    const sale = searchParams.get("sale");
    if (sale === "true") {
      setShowSaleOnly(true);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    
    // Update URL without refresh
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "All") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter((p) => p.categoryId === activeCategory);
    }

    // Filter by Sale
    if (showSaleOnly) {
      result = result.filter((p) => p.discountPrice !== undefined && p.discountPrice > 0);
    }

    // Sort
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === "newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt as { seconds?: number }).seconds || 0 : 0;
        const dateB = b.createdAt ? (b.createdAt as { seconds?: number }).seconds || 0 : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [products, activeCategory, showSaleOnly, sortBy]);

  return (
    <div>
      {showFilter && (
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-safra-taupe/20 pb-6">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("All")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                  activeCategory === "All"
                    ? "bg-safra-gold text-safra-dark border-safra-gold shadow-sm"
                    : "bg-white text-safra-olive border-safra-taupe/30 hover:bg-safra-light/20"
                )}
              >
                {t("filterAll")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                    activeCategory === cat.id
                      ? "bg-safra-gold text-safra-dark border-safra-gold shadow-sm"
                      : "bg-white text-safra-olive border-safra-taupe/30 hover:bg-safra-light/20"
                  )}
                >
                  {getCategoryName(cat, locale)}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 text-sm text-safra-dark">
              <SlidersHorizontal className="h-4 w-4 text-safra-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-medium focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="default">{isAr ? "الترتيب الافتراضي" : "Default Sorting"}</option>
                <option value="newest">{isAr ? "الأحدث" : "Newest Arrivals"}</option>
                <option value="price_asc">{isAr ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
                <option value="price_desc">{isAr ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {processedProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-xl text-safra-muted mb-4">{t("notFound")}</p>
          <button 
            onClick={() => { handleCategoryChange("All"); setShowSaleOnly(false); }}
            className="text-safra-gold font-medium hover:underline"
          >
            {isAr ? "مسح الفلاتر" : "Clear Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {processedProducts.map((product) => (
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
