"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { deleteProduct } from "@/lib/firebase/admin-firestore";
import { getProductName, getCategoryName, type Product, type Category } from "@/lib/types";
import Price from "@/components/ui/Price";
import type { Locale } from "@/i18n/routing";
import { Trash2 } from "lucide-react";

interface ProductsListProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}

export default function ProductsList({ products, categories, onRefresh }: ProductsListProps) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await deleteProduct(id);
    onRefresh();
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-safra-taupe/40 bg-white p-8 text-center text-safra-muted">
        {t("noProducts")}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/30 text-start text-safra-olive">
            <tr>
              <th className="px-4 py-3">{t("product")}</th>
              <th className="px-4 py-3">{t("price")}</th>
              <th className="px-4 py-3">{t("stock")}</th>
              <th className="px-4 py-3">{t("category")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-safra-taupe/30">
            {products.map((product) => {
              const cat = categories.find((c) => c.id === product.categoryId);
              return (
                <tr key={product.id} className="text-safra-dark">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-safra-cream">
                        <Image
                          src={product.image}
                          alt={getProductName(product, locale)}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <span className="font-medium">{getProductName(product, locale)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Price amount={product.price} />
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    {cat ? getCategoryName(cat, locale) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
