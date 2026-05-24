import { setRequestLocale, getTranslations } from "next-intl/server";
import { fetchProducts } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";
import ProductGrid from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");

  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-safra-dark">{t("title")}</h1>
        <p className="mt-2 text-safra-muted">{t("subtitle")}</p>
      </div>
      <ProductGrid products={products} categories={categories} showFilter />
    </div>
  );
}
