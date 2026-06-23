"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { getProductById } from "@/lib/firebase/services/products-service";
import { getCategories } from "@/lib/firebase/services/categories-service";
import { getSubCategoryById } from "@/lib/firebase/services/subcategories-service";
import type { Product, Category, SubCategory } from "@/lib/types";
import ProductDetailView from "@/components/admin/products/ProductDetailView";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminProductViewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prod, cats] = await Promise.all([getProductById(id), getCategories()]);
        if (!prod) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }
        setProduct(prod);
        setCategories(cats);
        if (prod.subcategoryId) {
          const sub = await getSubCategoryById(prod.subcategoryId);
          setSubCategory(sub);
        }
      } catch {
        toast.error("Failed to load product");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3 text-safra-muted">
        <Loader2 className="h-8 w-8 animate-spin text-safra-gold" />
        <p className="text-sm">Loading product...</p>
      </div>
    );
  }

  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);

  return <ProductDetailView product={product} category={category} subCategory={subCategory} />;
}
