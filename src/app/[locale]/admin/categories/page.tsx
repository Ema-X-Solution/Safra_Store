"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getAllCategories } from "@/lib/firebase/admin-firestore";
import type { Category } from "@/lib/types";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoriesList from "@/components/admin/CategoriesList";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await getAllCategories());
    } catch {
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
        <h1 className="text-2xl font-bold text-safra-dark">{t("categories")}</h1>
        <p className="mt-1 text-safra-muted">{t("categoriesDesc")}</p>
      </div>

      <CategoryForm onSuccess={load} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-safra-dark">{t("categoryList")}</h2>
        {loading ? (
          <p className="text-safra-muted">{t("loading")}</p>
        ) : (
          <CategoriesList categories={categories} onRefresh={load} />
        )}
      </div>
    </div>
  );
}
