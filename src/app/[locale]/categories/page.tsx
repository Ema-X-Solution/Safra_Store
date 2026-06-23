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
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category) => {
              const categoryName = getCategoryName(category, currentLocale);
              return (
                <Link 
                  key={category.id} 
                  href={`/categories/${category.id}`} 
                  className="group relative flex flex-col items-center overflow-hidden rounded-2xl bg-white border border-safra-taupe/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-safra-gold/30 h-full w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-safra-light/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                  <div className="w-full flex flex-col items-center justify-center text-center p-4 sm:p-5 gap-3 relative z-10">
                    <div className="rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md flex-shrink-0"
                         style={{ width: 150, height: 150 }}>
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={categoryName}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-safra-light/30">
                          <Leaf className="h-10 w-10 text-safra-olive" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <h2 className="font-bold text-safra-dark text-base sm:text-lg leading-tight group-hover:text-safra-olive transition-colors line-clamp-2">
                        {categoryName}
                      </h2>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
