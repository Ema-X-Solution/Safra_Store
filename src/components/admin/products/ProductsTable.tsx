"use client";

import { useTranslations, useLocale } from "next-intl";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Product, Category } from "@/lib/types";
import { getProductName, formatFirebaseDate } from "@/lib/types";
import Price from "@/components/ui/Price";

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onDelete: (id: string) => void;
}

export default function ProductsTable({ products, categories, onDelete }: ProductsTableProps) {
  const t = useTranslations("admin");
  const locale = useLocale() as "en" | "ar";

  if (!products || products.length === 0) {
    return (
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
        <p className="text-safra-muted">No products found.</p>
      </div>
    );
  }

  const getCatName = (id: string) => {
    const c = categories.find(c => c.id === id);
    return c ? c.name[locale] : "Unknown";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/20 text-start text-safra-olive">
            <tr>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-end">Actions</th>
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
                        {product.featured && <span className="text-safra-gold">Featured</span>}
                        {product.bestSeller && <span className="text-orange-500">Best Seller</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-safra-dark">{getCatName(product.categoryId)}</td>
                <td className="px-6 py-3 font-medium text-safra-dark">
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
                </td>
                <td className="px-6 py-3 text-safra-olive">{product.stock}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === "active" ? "bg-green-100 text-green-700" :
                      product.status === "archived" ? "bg-gray-100 text-gray-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {product.status || "active"}
                  </span>
                </td>
                <td className="px-6 py-3 text-end">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg p-2 text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
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
