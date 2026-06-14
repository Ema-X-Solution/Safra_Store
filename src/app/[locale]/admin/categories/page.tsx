"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryCard from "@/components/admin/categories/CategoryCard";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/firebase/services/categories-service";
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget);
      toast.success("Category deleted successfully");
      load();
    } catch (err) {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSave = async (data: CategoryInput) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success("Category updated successfully");
      } else {
        await createCategory(data);
        toast.success("Category created successfully");
      }
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              productsCount={productCounts[category.id] || 0}
            />
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? WARNING: This will also permanently delete ALL products associated with this category!"
        loading={deleting}
      />
    </div>
  );
}
