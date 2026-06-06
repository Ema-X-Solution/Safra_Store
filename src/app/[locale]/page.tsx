import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchCategories } from "@/lib/categories";
import { getFeaturedProducts, getDiscountedProducts } from "@/lib/firebase/services/products-service";
import { getFAQs } from "@/lib/firebase/services/faq-service";
import { getSettings } from "@/lib/firebase/services/settings-service";
import { getCategoryName, getBilingualText } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import ProductCard from "@/components/products/ProductCard";
import Button from "@/components/ui/Button";
import { Leaf, Truck, ShieldCheck, Tag } from "lucide-react";
import Image from "next/image";
import MarketingBanner from "@/components/home/MarketingBanner";
import AnimatedFAQ from "@/components/home/AnimatedFAQ";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  setRequestLocale(currentLocale);

  const t = await getTranslations("hero");
  const home = await getTranslations("home");

  // Parallel fetching for performance
  const [categories, featured, discounted, allFaqs, settings] = await Promise.all([
    fetchCategories(),
    getFeaturedProducts(),
    getDiscountedProducts(),
    getFAQs(),
    getSettings()
  ]);

  const topFaqs = allFaqs.slice(0, 6);
  const heroSettings = settings?.hero;

  return (
    <>
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-safra-dark px-4 py-20 text-safra-cream sm:px-6 lg:px-8 min-h-[90vh] flex items-center">
        {heroSettings?.bannerImage ? (
          <Image
            src={heroSettings.bannerImage}
            alt="Hero Background"
            fill
            className="object-cover opacity-50 transition-transform duration-[20s] ease-out hover:scale-110"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-safra-dark via-safra-olive to-safra-deep-gold opacity-90">
            <div className="absolute -end-20 -top-20 h-96 w-96 rounded-full bg-safra-bright blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-20 -start-20 h-96 w-96 rounded-full bg-safra-light blur-3xl opacity-20" />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl drop-shadow-lg tracking-tight">
              {getBilingualText(heroSettings?.title, currentLocale, t("title"))}
            </h1>
            <p className="mt-6 text-xl text-safra-cream/95 drop-shadow-md max-w-2xl font-medium">
              {getBilingualText(heroSettings?.subtitle, currentLocale, t("subtitle"))}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="shadow-lg">
                  {getBilingualText(heroSettings?.ctaText, currentLocale, t("cta"))}
                </Button>
              </Link>
              <Link href="#categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-safra-cream text-safra-cream hover:bg-safra-cream hover:text-safra-dark backdrop-blur-sm"
                >
                  {t("secondary")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories Section ──────────────────────────────────────── */}
      {categories.length > 0 && (
        <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-safra-dark">{home("categoriesTitle")}</h2>
            <p className="mt-2 text-safra-muted">{home("categoriesSubtitle") || "Browse our fresh selections"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.id}`} className="group relative overflow-hidden rounded-3xl bg-white border border-safra-taupe/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-safra-gold/30">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-safra-light/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="aspect-square p-6 flex flex-col items-center justify-center text-center relative z-10">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-safra-light/30 shadow-sm transition-all duration-300 group-hover:bg-safra-gold/10 group-hover:scale-110 group-hover:rotate-3">
                    {category.image ? (
                      <Image src={category.image} alt={getCategoryName(category, currentLocale)} width={48} height={48} className="object-contain drop-shadow-sm" />
                    ) : (
                      <Leaf className="h-10 w-10 text-safra-olive" />
                    )}
                  </div>
                  <h3 className="font-bold text-safra-dark text-lg group-hover:text-safra-olive transition-colors">{getCategoryName(category, currentLocale)}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/categories">
              <Button variant="outline" className="border-safra-olive text-safra-olive hover:bg-safra-olive hover:text-white rounded-full px-8">
                {currentLocale === "ar" ? "عرض جميع التصنيفات" : "View All Categories"}
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ─── Flash Sales / Offers Section ────────────────────────────── */}
      {discounted.length > 0 && (
        <section className="bg-red-50/50 px-4 py-16 sm:px-6 lg:px-8 border-y border-red-100">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2">
                  <Tag className="h-8 w-8" />
                  {currentLocale === "ar" ? "عروض خاصة" : "Special Offers"}
                </h2>
                <p className="mt-2 text-safra-muted">{currentLocale === "ar" ? "أفضل الأسعار لفترة محدودة" : "Best prices for a limited time"}</p>
              </div>
              <Link href="/offers" className="hidden sm:block text-red-600 font-medium hover:underline">
                {currentLocale === "ar" ? "شاهد كل العروض" : "View all offers"}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {discounted.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categories.find((c) => c.id === product.categoryId)}
                />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/offers">
                <Button variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-none rounded-full w-full">{currentLocale === "ar" ? "شاهد كل العروض" : "View all offers"}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <MarketingBanner />

      {/* ─── Featured Products Section ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-safra-dark">{home("featuredTitle")}</h2>
          <p className="mt-2 text-safra-muted">{home("featuredSubtitle")}</p>
        </div>
        {featured.length === 0 ? (
          <p className="py-12 text-center text-safra-muted">{home("noProducts")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.filter((p) => !p.discountPrice || p.discountPrice <= 0).slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categories.find((c) => c.id === product.categoryId)}
              />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link href="/products">
            <Button variant="secondary">{home("viewAll")}</Button>
          </Link>
        </div>
      </section>

      {/* ─── Why Us Section ──────────────────────────────────────────── */}
      <section className="bg-safra-light/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-safra-dark">{home("whyUs.title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Leaf, key: "fresh" as const },
              { icon: ShieldCheck, key: "organic" as const },
              { icon: Truck, key: "delivery" as const },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-safra-gold/20">
                  <Icon className="h-7 w-7 text-safra-gold" />
                </div>
                <h3 className="text-lg font-semibold text-safra-dark">{home(`whyUs.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-safra-muted">{home(`whyUs.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quick FAQ Section ───────────────────────────────────────── */}
      <AnimatedFAQ 
        faqs={topFaqs} 
        locale={currentLocale} 
        title={currentLocale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"} 
        readMoreText={currentLocale === "ar" ? "قراءة المزيد من الأسئلة ←" : "Read all FAQs →"} 
      />
    </>
  );
}
