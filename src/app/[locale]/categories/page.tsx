import { setRequestLocale } from "next-intl/server";
import { fetchCategories } from "@/lib/categories";
import { getCategoryName } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Leaf } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "كل التصنيفات - متجر سفرة" : "All Categories - Safra Store",
    description: locale === "ar" ? "تصفح جميع أقسام المنتجات العضوية لدينا" : "Browse all our organic product categories",
  };
}

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  setRequestLocale(currentLocale);

  const categories = await fetchCategories();

  return (
    <div className="min-h-screen bg-safra-light/10 pb-20 pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-safra-dark mb-4">
            {currentLocale === "ar" ? "جميع التصنيفات" : "All Categories"}
          </h1>
          <p className="text-lg text-safra-muted">
            {currentLocale === "ar" 
              ? "استكشف مجموعتنا المتنوعة من المنتجات الطبيعية والعضوية" 
              : "Explore our diverse range of natural and organic products"}
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-safra-taupe/20">
            <Leaf className="mx-auto h-16 w-16 text-safra-taupe mb-4 opacity-50" />
            <p className="text-xl text-safra-muted">
              {currentLocale === "ar" ? "لا توجد تصنيفات حالياً" : "No categories found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category=${category.id}`} 
                className="group relative overflow-hidden rounded-3xl bg-white border border-safra-taupe/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-safra-gold/30 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-safra-light/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-safra-light/30 shadow-sm transition-all duration-300 group-hover:bg-safra-gold/10 group-hover:scale-110 group-hover:rotate-3 relative z-10">
                  {category.image ? (
                    <Image src={category.image} alt={getCategoryName(category, currentLocale)} width={64} height={64} className="object-contain drop-shadow-sm" />
                  ) : (
                    <Leaf className="h-12 w-12 text-safra-olive" />
                  )}
                </div>
                <h3 className="font-bold text-safra-dark text-xl group-hover:text-safra-olive transition-colors relative z-10">
                  {getCategoryName(category, currentLocale)}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
