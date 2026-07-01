"use client";

import { useTranslations, useLocale } from "next-intl";
import { Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Product, Category, SubCategory } from "@/lib/types";
import { getProductName, formatFirebaseDate } from "@/lib/types";
import Price from "@/components/ui/Price";

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  subCategories: SubCategory[];
  onDelete: (id: string) => void;
}

export default function ProductsTable({ products, categories, subCategories, onDelete }: ProductsTableProps) {
  const t = useTranslations("admin");
  const locale = useLocale() as "en" | "ar";

  if (!products || products.length === 0) {
    return (
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
        <p className="text-safra-muted">{t("noProductsFound")}</p>
      </div>
    );
  }

  const getCatName = (id: string) => {
    const c = categories.find(c => c.id === id);
    return c ? c.name[locale] : t("unknown");
  };

  const getSubCatName = (id?: string) => {
    if (!id) return null;
    const s = subCategories.find(s => s.id === id);
    return s ? s.name[locale] : null;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/20 text-start text-safra-olive">
            <tr>
              <th className="px-6 py-3 font-medium">{t("product")}</th>
              <th className="px-6 py-3 font-medium">{t("category")}</th>
              <th className="px-6 py-3 font-medium">{t("price")}</th>
              <th className="px-6 py-3 font-medium">{t("stock")}</th>
              <th className="px-6 py-3 font-medium">{t("statusLabel")}</th>
              <th className="px-6 py-3 font-medium text-end">{t("actionsCol")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-safra-taupe/20">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-safra-light/10">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-safra-cream">
                      <Image 
                        src={product.image || product.images?.[0] || "/placeholder.jpg"} 
                        alt="Product" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-safra-dark">{getProductName(product, locale)}</p>
                      <div className="flex gap-2 text-xs">
                        {product.featured && <span className="text-safra-gold">{t("featured_badge")}</span>}
                        {product.bestSeller && <span className="text-orange-500">{t("bestSeller_badge")}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-safra-dark">
                  <div className="flex flex-col">
                    <span>{getCatName(product.categoryId)}</span>
                    {getSubCatName(product.subcategoryId) && (
                      <span className="text-xs text-safra-olive">{getSubCatName(product.subcategoryId)}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 font-medium text-safra-dark">
                  {product.hasMultipleWeights && product.weights && product.weights.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {product.weights.map((w, idx) => (
                        <div key={idx} className="text-xs flex flex-col">
                          <span className="flex items-center gap-1">
                            <span className="text-safra-muted">{w.value} {w.unit}:</span>
                            {w.discountPrice ? (
                              <>
                                <Price amount={w.discountPrice} />
                                <span className="text-safra-muted line-through">
                                  <Price amount={w.price} />
                                </span>
                              </>
                            ) : (
                              <Price amount={w.price} />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {product.discountPrice ? (
                        <>
                          <Price amount={product.discountPrice} />
                          <span className="text-xs text-safra-muted line-through">
                            <Price amount={product.price} />
                          </span>
                        </>
                      ) : (
                        <Price amount={product.price} />
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-3 text-safra-olive">
                  {product.hasMultipleWeights && product.weights && product.weights.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {product.weights.map((w, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-1">
                          <span className="text-safra-muted">{w.value} {w.unit}:</span>
                          <span className="font-medium">{w.stock ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>{product.stock}</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === "active" ? "bg-green-100 text-green-700" :
                      product.status === "inactive" ? "bg-gray-100 text-gray-700" :
                      "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.status === "inactive" ? t("inactive") : t("statusActive")}
                  </span>
                </td>
                <td className="px-6 py-3 text-end">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/view`}
                      className="rounded-lg p-2 text-safra-muted hover:bg-safra-cream hover:text-safra-dark transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg p-2 text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark transition-colors"
                      title="Edit product"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
