import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getCategoryById } from "@/lib/firebase/services/categories-service";
import { getSubCategories } from "@/lib/firebase/services/subcategories-service";
import { getCategoryName, getBilingualText } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { Leaf, ArrowLeft, ArrowRight, Grid3X3 } from "lucide-react";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const category = await getCategoryById(id);
  
  if (!category) return { title: "Category Not Found" };
  
  return {
    title: `${getCategoryName(category, locale as Locale)} - Safra Store`,
    description: getBilingualText(category.description, locale as Locale) || "Browse products in this category",
  };
}

export default async function CategoryDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const currentLocale = locale as Locale;
  setRequestLocale(currentLocale);
  const isAr = currentLocale === "ar";

  const [category, subCategories] = await Promise.all([
    getCategoryById(id),
    getSubCategories(id)
  ]);

  if (!category) {
    notFound();
  }

  const categoryName = getCategoryName(category, currentLocale);
  const categoryDesc = getBilingualText(category.description, currentLocale);

  return (
    <div className="min-h-screen bg-safra-light/10 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-safra-dark text-safra-cream py-16 sm:py-24 lg:py-32">
        {category.image ? (
          <>
            <Image
              src={category.image}
              alt={categoryName}
              fill
              className="object-cover opacity-30 mix-blend-overlay"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-safra-dark via-safra-dark/80 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-safra-dark via-safra-olive to-safra-deep-gold opacity-90" />
        )}
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <Link
            href="/categories"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-safra-cream/70 transition-colors hover:text-white backdrop-blur-sm bg-white/5 rounded-full px-4 py-2 border border-white/10"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isAr ? "العودة للتصنيفات" : "Back to Categories"}
          </Link>
          
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
            {category.image ? (
              <Image src={category.image} alt={categoryName} width={48} height={48} className="object-contain drop-shadow-md" />
            ) : (
              <Leaf className="h-10 w-10 text-safra-gold" />
            )}
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-md">
            {categoryName}
          </h1>
          
          {categoryDesc && (
            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-safra-cream/90 drop-shadow-sm leading-relaxed">
              {categoryDesc}
            </p>
          )}

          <div className="mt-8 flex gap-4">
            <Link href={`/products?category=${category.id}`}>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                {isAr ? "تصفح كل المنتجات" : "View All Products"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between border-b border-safra-taupe/20 pb-6">
          <h2 className="text-2xl font-bold text-safra-dark flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-safra-olive" />
            {isAr ? "الأقسام الفرعية" : "Subcategories"}
          </h2>
          <span className="text-safra-muted font-medium bg-safra-taupe/10 px-3 py-1 rounded-full text-sm">
            {subCategories.length} {isAr ? "قسم" : "categories"}
          </span>
        </div>

        {subCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-safra-taupe/10">
            <Leaf className="mx-auto h-12 w-12 text-safra-taupe/50 mb-4" />
            <p className="text-lg text-safra-muted">
              {isAr ? "لا توجد أقسام فرعية لهذا القسم." : "No subcategories found for this category."}
            </p>
            <Link href={`/products?category=${category.id}`} className="mt-6 inline-block">
              <Button variant="outline">{isAr ? "تصفح المنتجات" : "Browse Products"}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/products?category=${category.id}&subcategory=${sub.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-safra-taupe/20 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-safra-gold/40"
              >
                <div className="aspect-[4/3] w-full bg-safra-light/30 relative overflow-hidden">
                  {sub.image ? (
                    <Image
                      src={sub.image}
                      alt={sub.name[currentLocale]}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-safra-taupe/30">
                      <Leaf className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-safra-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-safra-dark text-lg group-hover:text-safra-gold transition-colors text-center line-clamp-2">
                    {sub.name[currentLocale]}
                  </h3>
                  {sub.description && (
                    <p className="text-xs text-safra-muted mt-2 text-center line-clamp-2">
                      {sub.description[currentLocale]}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
