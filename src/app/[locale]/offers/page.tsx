import { setRequestLocale } from "next-intl/server";
import { fetchCategories } from "@/lib/categories";
import { getDiscountedProducts } from "@/lib/firebase/services/products-service";
import { getFirebaseDb } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductGrid from "@/components/products/ProductGrid";
import type { Locale } from "@/i18n/routing";
import type { SubCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "العروض الخاصة - متجر سفرة" : "Special Offers - Safra Store",
    description: locale === "ar" ? "تصفح أحدث عروضنا وتخفيضاتنا الحصرية" : "Browse our latest exclusive offers and discounts",
  };
}

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  setRequestLocale(currentLocale);

  const [products, categories] = await Promise.all([
    getDiscountedProducts(),
    fetchCategories()
  ]);

  let subCategories: SubCategory[] = [];
  try {
    const subCategoriesSnap = await getDocs(collection(getFirebaseDb(), "subcategories"));
    subCategories = subCategoriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as SubCategory));
  } catch (error) {
    console.error("Failed to load subcategories:", error);
  }

  return (
    <div className="bg-safra-light/10 min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-950 py-20 sm:py-28">
        {/* Animated background glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -end-32 h-96 w-96 rounded-full bg-red-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Sale badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-white tracking-wide">
              {currentLocale === "ar" ? "عروض لفترة محدودة" : "Limited Time Offers"}
            </span>
          </div>

          <h1 className="text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl tracking-tight drop-shadow-lg">
            {currentLocale === "ar" ? "العروض والتخفيضات" : "Special Offers"}
          </h1>
          <p className="mt-6 text-xl text-red-100/90 max-w-2xl mx-auto font-medium">
            {currentLocale === "ar" 
              ? "استمتع بأفضل الأسعار على منتجاتنا الطبيعية والعضوية المختارة بعناية" 
              : "Enjoy the best prices on our carefully selected natural and organic products"}
          </p>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">{products.length}</p>
              <p className="text-sm text-red-200/80 mt-1">{currentLocale === "ar" ? "منتج بعرض خاص" : "Products on Sale"}</p>
            </div>
            <div className="h-10 w-px bg-white/20 hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-yellow-400">{currentLocale === "ar" ? "حتى 50%" : "Up to 50%"}</p>
              <p className="text-sm text-red-200/80 mt-1">{currentLocale === "ar" ? "تخفيضات" : "Discounts"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductGrid products={products} categories={categories} subCategories={subCategories} showFilter />
      </div>
    </div>
  );
}
