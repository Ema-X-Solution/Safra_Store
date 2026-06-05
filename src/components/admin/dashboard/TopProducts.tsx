"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Price from "@/components/ui/Price";
import type { Product } from "@/lib/types";
import { getProductName } from "@/lib/types";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";

export default function TopProducts({ products }: { products: Product[] }) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;

  if (!products || products.length === 0) return null;

  return (
    <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm h-full flex flex-col">
      <div className="border-b border-safra-taupe/30 px-6 py-4 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-safra-dark">Top Products</h3>
        <Link href="/admin/products" className="text-sm font-medium text-safra-gold hover:underline">
          {t("viewAll")}
        </Link>
      </div>
      <div className="divide-y divide-safra-taupe/20 flex-1 overflow-y-auto">
        {products.slice(0, 10).map((product) => (
          <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-safra-light/10 transition">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-safra-cream">
              <Image src={product.image || product.images?.[0] || "/placeholder.jpg"} alt="Product" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-safra-dark">
                {getProductName(product, locale)}
              </p>
              <p className="text-sm text-safra-muted">{product.stock} in stock</p>
            </div>
            <div className="text-end font-medium text-safra-deep-gold">
              <Price amount={product.discountPrice || product.price} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
