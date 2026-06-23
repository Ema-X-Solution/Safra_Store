"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryCard from "@/components/admin/categories/CategoryCard";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import { getCategories, createCategory } from "@/lib/firebase/services/categories-service";
import { getProducts } from "@/lib/firebase/services/products-service";
import type { Category, CategoryInput } from "@/lib/types";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedCategories, fetchedProducts] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      setCategories(fetchedCategories);
      
      const counts: Record<string, number> = {};
      fetchedProducts.forEach(p => {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      });
      setProductCounts(counts);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setModalOpen(true);
  };

  const handleSave = async (data: CategoryInput) => {
    try {
      await createCategory(data);
      toast.success("Category created successfully");
      load();
    } catch (err) {
      toast.error("Failed to save category");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{t("categories")}</h1>
          <p className="mt-1 text-sm text-safra-muted">{t("categoriesDesc")}</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-5 w-5" />
          {t("addCategory")}
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
          <p className="text-safra-muted">{t("noCategories")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => {}} // Removed from card, handled in details page
              onDelete={() => {}} // Removed from card, handled in details page
              productsCount={productCounts[category.id] || 0}
            />
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={null}
        onSave={handleSave}
      />
    </div>
  );
}
