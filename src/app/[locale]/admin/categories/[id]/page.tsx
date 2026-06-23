"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import SubCategoryModal from "@/components/admin/categories/SubCategoryModal";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/firebase/services/categories-service";
import { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } from "@/lib/firebase/services/subcategories-service";
import type { Category, CategoryInput, SubCategory, SubCategoryInput } from "@/lib/types";
import { getCategoryName } from "@/lib/types";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

export default function CategoryDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("admin");

  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modals
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [delCatTarget, setDelCatTarget] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  // SubCategory Modals
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [delSubTarget, setDelSubTarget] = useState<string | null>(null);
  const [deletingSub, setDeletingSub] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const cat = await getCategoryById(id);
      if (!cat) {
        toast.error("Category not found");
        router.push("/admin/categories");
        return;
      }
      setCategory(cat);
      const subs = await getSubCategories(id);
      setSubCategories(subs);
    } catch (err) {
      toast.error("Failed to load category details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // --- Category Handlers ---
  const handleSaveCategory = async (data: CategoryInput) => {
    try {
      await updateCategory(id, data);
      toast.success("Category updated");
      load();
    } catch (err) {
      toast.error("Failed to update category");
      throw err;
    }
  };

  const confirmDeleteCategory = async () => {
    if (!delCatTarget) return;
    setDeletingCat(true);
    try {
      await deleteCategory(delCatTarget);
      toast.success("Category deleted");
      router.push("/admin/categories");
    } catch (err) {
      toast.error("Failed to delete category");
      setDeletingCat(false);
      setDelCatTarget(null);
    }
  };

  // --- SubCategory Handlers ---
  const handleAddSub = () => {
    setEditingSub(null);
    setSubModalOpen(true);
  };

  const handleEditSub = (sub: SubCategory) => {
    setEditingSub(sub);
    setSubModalOpen(true);
  };

  const handleSaveSub = async (data: SubCategoryInput) => {
    try {
      if (editingSub) {
        await updateSubCategory(editingSub.id, data);
        toast.success("Subcategory updated");
      } else {
        await createSubCategory(data);
        toast.success("Subcategory created");
      }
      load();
    } catch (err) {
      toast.error("Failed to save subcategory");
      throw err;
    }
  };

  const confirmDeleteSub = async () => {
    if (!delSubTarget) return;
    setDeletingSub(true);
    try {
      await deleteSubCategory(delSubTarget);
      toast.success("Subcategory deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete subcategory");
    } finally {
      setDeletingSub(false);
      setDelSubTarget(null);
    }
  };

  if (loading || !category) {
    return <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="rounded-lg p-2 hover:bg-white text-safra-muted hover:text-safra-dark transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-safra-dark">{getCategoryName(category, locale)}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setCatModalOpen(true)} className="gap-2 border border-safra-taupe/50">
            <Edit className="h-4 w-4" />
            Edit Category
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDelCatTarget(category.id)}
            className="gap-2 border border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Category Info Card */}
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-6">
        <div className="relative h-32 w-32 shrink-0 rounded-xl overflow-hidden bg-safra-cream border border-safra-taupe/20">
          {category.image ? (
            <Image src={category.image} alt={category.name.en} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-safra-muted text-xs">No Image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-safra-muted uppercase tracking-wider font-semibold mb-1">Name (EN)</p>
              <p className="font-medium text-safra-dark">{category.name.en}</p>
            </div>
            <div>
              <p className="text-xs text-safra-muted uppercase tracking-wider font-semibold mb-1">Name (AR)</p>
              <p className="font-medium text-safra-dark" dir="rtl">{category.name.ar}</p>
            </div>
            {category.description && (
              <>
                <div>
                  <p className="text-xs text-safra-muted uppercase tracking-wider font-semibold mb-1">Desc (EN)</p>
                  <p className="text-sm text-safra-olive line-clamp-3">{category.description.en}</p>
                </div>
                <div>
                  <p className="text-xs text-safra-muted uppercase tracking-wider font-semibold mb-1">Desc (AR)</p>
                  <p className="text-sm text-safra-olive line-clamp-3" dir="rtl">{category.description.ar}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-safra-dark">Subcategories</h2>
          <Button onClick={handleAddSub} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subcategory
          </Button>
        </div>

        {subCategories.length === 0 ? (
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
            <p className="text-safra-muted">No subcategories found. Add one to organize your products further.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subCategories.map((sub) => (
              <div key={sub.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-safra-taupe/40 bg-white transition-all hover:shadow-md">
                <div className="relative h-32 w-full bg-safra-cream">
                  {sub.image ? (
                    <Image src={sub.image} alt={sub.name.en} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-safra-muted text-sm">No Image</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-safra-dark">{sub.name[locale]}</h3>
                  {sub.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-safra-muted">{sub.description[locale]}</p>
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => handleEditSub(sub)} className="rounded-lg p-1.5 text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDelSubTarget(sub.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <CategoryModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        category={category}
        onSave={handleSaveCategory}
      />

      <SubCategoryModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        subCategory={editingSub}
        categoryId={category.id}
        onSave={handleSaveSub}
      />

      <ConfirmDialog
        isOpen={!!delCatTarget}
        onClose={() => setDelCatTarget(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? This will also delete ALL its subcategories and products."
        loading={deletingCat}
      />

      <ConfirmDialog
        isOpen={!!delSubTarget}
        onClose={() => setDelSubTarget(null)}
        onConfirm={confirmDeleteSub}
        title="Delete Subcategory"
        description="Are you sure you want to delete this subcategory? This will also delete ALL products linked to it."
        loading={deletingSub}
      />
    </div>
  );
}
