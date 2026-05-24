"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getAllProductsAdmin, getAllCategories } from "@/lib/firebase/admin-firestore";
import type { Product, Category } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import ProductsList from "@/components/admin/ProductsList";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getAllProductsAdmin(), getAllCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-safra-dark">{t("products")}</h1>
        <p className="mt-1 text-safra-muted">{t("productsDesc")}</p>
      </div>

      <ProductForm categories={categories} onSuccess={load} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-safra-dark">{t("productList")}</h2>
        {loading ? (
          <p className="text-safra-muted">{t("loading")}</p>
        ) : (
          <ProductsList products={products} categories={categories} onRefresh={load} />
        )}
      </div>
    </div>
  );
}
