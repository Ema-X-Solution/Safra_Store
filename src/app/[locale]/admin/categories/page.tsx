"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryCard from "@/components/admin/categories/CategoryCard";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/firebase/services/categories-service";
import type { Category, CategoryInput } from "@/lib/types";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await getCategories());
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted successfully");
        load();
      } catch (err) {
        toast.error("Failed to delete category");
      }
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
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
          <p className="text-safra-muted">No categories found. Create your first category to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
              productsCount={0} // We can fetch this separately if needed
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
    </div>
  );
}
