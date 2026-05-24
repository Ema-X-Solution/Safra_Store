"use client";

import { useLocale, useTranslations } from "next-intl";
import { deleteCategory } from "@/lib/firebase/admin-firestore";
import { getCategoryName, type Category } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { Trash2 } from "lucide-react";

interface CategoriesListProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoriesList({ categories, onRefresh }: CategoriesListProps) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDeleteCategory"))) return;
    await deleteCategory(id);
    onRefresh();
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-xl border border-safra-taupe/40 bg-white p-6 text-center text-safra-muted">
        {t("noCategories")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between rounded-lg border border-safra-taupe/30 bg-white px-4 py-3"
        >
          <span className="font-medium text-safra-dark">{getCategoryName(cat, locale)}</span>
          <button
            onClick={() => handleDelete(cat.id)}
            className="text-red-600 hover:text-red-700"
            aria-label={t("delete")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
