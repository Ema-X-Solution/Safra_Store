import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/products/ProductCard";
import { fetchCategories } from "@/lib/categories";
import Button from "@/components/ui/Button";
import { Leaf, Truck, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("hero");
  const home = await getTranslations("home");
  const [featured, categories] = await Promise.all([fetchFeaturedProducts(), fetchCategories()]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-safra-dark via-safra-olive to-safra-deep-gold px-4 py-20 text-safra-cream sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -end-20 -top-20 h-96 w-96 rounded-full bg-safra-bright blur-3xl" />
          <div className="absolute -bottom-20 -start-20 h-96 w-96 rounded-full bg-safra-light blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{t("title")}</h1>
            <p className="mt-6 text-lg text-safra-cream/80">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg">{t("cta")}</Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-safra-cream text-safra-cream hover:bg-safra-cream hover:text-safra-dark"
                >
                  {t("secondary")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-safra-dark">{home("featuredTitle")}</h2>
          <p className="mt-2 text-safra-muted">{home("featuredSubtitle")}</p>
        </div>
        {featured.length === 0 ? (
          <p className="py-12 text-center text-safra-muted">{home("noProducts")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
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
    </>
  );
}
