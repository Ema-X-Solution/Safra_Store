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
import { Leaf, Truck, ShieldCheck, HelpCircle, ChevronDown, Tag } from "lucide-react";
import Image from "next/image";

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

  const topFaqs = allFaqs.slice(0, 4);
  const heroSettings = settings?.hero;

  return (
    <>
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-safra-dark px-4 py-20 text-safra-cream sm:px-6 lg:px-8 min-h-[70vh] flex items-center">
        {heroSettings?.bannerImage ? (
          <Image
            src={heroSettings.bannerImage}
            alt="Hero Background"
            fill
            className="object-cover opacity-40"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-safra-dark via-safra-olive to-safra-deep-gold opacity-90">
            <div className="absolute -end-20 -top-20 h-96 w-96 rounded-full bg-safra-bright blur-3xl opacity-20" />
            <div className="absolute -bottom-20 -start-20 h-96 w-96 rounded-full bg-safra-light blur-3xl opacity-20" />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl drop-shadow-md">
              {getBilingualText(heroSettings?.title, currentLocale, t("title"))}
            </h1>
            <p className="mt-6 text-lg text-safra-cream/90 drop-shadow">
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
              <Link key={category.id} href={`/products?category=${category.id}`} className="group relative overflow-hidden rounded-2xl bg-safra-light/30 border border-safra-taupe/20 transition-all hover:shadow-md hover:border-safra-gold">
                <div className="aspect-square p-6 flex flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                    {category.image ? (
                      <Image src={category.image} alt={getCategoryName(category, currentLocale)} width={40} height={40} className="object-contain" />
                    ) : (
                      <Leaf className="h-8 w-8 text-safra-olive" />
                    )}
                  </div>
                  <h3 className="font-semibold text-safra-dark">{getCategoryName(category, currentLocale)}</h3>
                </div>
              </Link>
            ))}
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
              <Link href="/products?sale=true" className="hidden sm:block text-red-600 font-medium hover:underline">
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
              <Link href="/products?sale=true">
                <Button variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">{currentLocale === "ar" ? "شاهد كل العروض" : "View all offers"}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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
            {featured.slice(0, 8).map((product) => (
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
      {topFaqs.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-safra-gold mb-4" />
            <h2 className="text-3xl font-bold text-safra-dark">{currentLocale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h2>
          </div>
          <div className="space-y-4">
            {topFaqs.map((faq) => (
              <details key={faq.id} className="group rounded-xl border border-safra-taupe/30 bg-white p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-semibold text-safra-dark">
                  <span className="text-lg">{getBilingualText(faq.question, currentLocale)}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180 text-safra-gold" />
                </summary>
                <p className="mt-4 leading-relaxed text-safra-muted">
                  {getBilingualText(faq.answer, currentLocale)}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/faq" className="text-safra-olive font-medium hover:text-safra-dark transition">
              {currentLocale === "ar" ? "قراءة المزيد من الأسئلة ←" : "Read all FAQs →"}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
