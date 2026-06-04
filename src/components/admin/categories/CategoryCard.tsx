import { LucideIcon, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { getCategoryName } from "@/lib/types";
import type { Category } from "@/lib/types";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  productsCount?: number;
}

export default function CategoryCard({ category, onEdit, onDelete, productsCount = 0 }: CategoryCardProps) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-safra-taupe/40 bg-white transition-all hover:shadow-md">
      <div className="relative h-40 w-full bg-safra-cream">
        {category.image ? (
          <Image src={category.image} alt={getCategoryName(category, locale)} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-safra-muted">No Image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-safra-dark">{getCategoryName(category, locale)}</h3>
        {category.description && (
          <p className="mt-1 line-clamp-2 text-sm text-safra-muted">{category.description[locale]}</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="inline-flex rounded-full bg-safra-light/30 px-2.5 py-0.5 text-xs font-medium text-safra-olive">
            {productsCount} Products
          </span>
          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit(category)}
              className="rounded-lg p-2 text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
