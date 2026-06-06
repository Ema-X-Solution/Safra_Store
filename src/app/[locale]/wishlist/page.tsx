"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWishlist } from "@/lib/context/WishlistContext";
import ProductCard from "@/components/products/ProductCard";
import Button from "@/components/ui/Button";
import { Heart } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default function WishlistPage() {
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  const { items, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Heart className="mx-auto h-16 w-16 text-safra-taupe" />
        <h1 className="mt-6 text-2xl font-bold text-safra-dark">
          {isAr ? "قائمة الأمنيات فارغة" : "Your Wishlist is empty"}
        </h1>
        <p className="mt-2 text-safra-muted">
          {isAr
            ? "يبدو أنك لم تقم بإضافة أي منتجات إلى مفضلتك بعد."
            : "Looks like you haven't added any products to your wishlist yet."}
        </p>
        <Link href="/products" className="mt-8 inline-block">
          <Button>{isAr ? "تصفح المنتجات" : "Browse Products"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-safra-taupe/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-safra-dark flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" fill="currentColor" />
            {isAr ? "قائمة الأمنيات" : "My Wishlist"}
          </h1>
          <p className="mt-2 text-safra-muted">
            {isAr ? `${items.length} منتجات في مفضلتك` : `${items.length} items in your wishlist`}
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-sm font-medium text-red-500 hover:text-red-700 transition"
        >
          {isAr ? "مسح القائمة بالكامل" : "Clear Wishlist"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
