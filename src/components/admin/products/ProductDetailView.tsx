"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Package,
  Tag,
  ChevronLeft,
  ChevronRight,
  Globe,
  BarChart2,
  Layers,
  Info,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Price from "@/components/ui/Price";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Product, Category } from "@/lib/types";
import { formatFirebaseDate, toDate } from "@/lib/types";
import { deleteProduct } from "@/lib/firebase/services/products-service";
import { toast } from "sonner";

interface ProductDetailViewProps {
  product: Product;
  category: Category | undefined;
}

export default function ProductDetailView({ product, category }: ProductDetailViewProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const stockColor =
    product.stock === 0
      ? "text-red-600 bg-red-50"
      : product.stock < 10
      ? "text-yellow-600 bg-yellow-50"
      : "text-green-700 bg-green-50";

  const statusColor =
    product.status === "active"
      ? "bg-green-100 text-green-700"
      : product.status === "archived"
      ? "bg-gray-100 text-gray-600"
      : "bg-yellow-100 text-yellow-700";

  const handleDeleteClick = () => setDeleteTarget(product.id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to delete product");
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg p-2 hover:bg-white text-safra-muted hover:text-safra-dark transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-safra-dark">{product.name.en}</h1>
            <p className="text-sm text-safra-muted mt-0.5">{product.name.ar}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/products/${product.id}`}>
            <Button variant="ghost" className="gap-2 border border-safra-taupe/50">
              <Edit className="h-4 w-4" />
              Edit Product
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleDeleteClick}
            loading={deleting}
            className="gap-2 border border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {product.status || "active"}
        </span>
        {product.featured && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
            <Star className="h-3 w-3" /> Featured
          </span>
        )}
        {product.bestSeller && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            <TrendingUp className="h-3 w-3" /> Best Seller
          </span>
        )}
        {category && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-safra-cream px-3 py-1 text-xs font-semibold text-safra-olive">
            <Tag className="h-3 w-3" /> {category.name.en}
          </span>
        )}
        {product.createdAt && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-safra-muted border border-safra-taupe/30">
            Created {formatFirebaseDate(product.createdAt)}
          </span>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* ── Left: Image Gallery ── */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-safra-taupe/40 bg-white shadow-sm aspect-[4/3]">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[activeImage]}
                  alt={product.name.en}
                  fill
                  className="object-contain p-4 transition-opacity duration-200"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white transition"
                    >
                      <ChevronLeft className="h-5 w-5 text-safra-dark" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white transition"
                    >
                      <ChevronRight className="h-5 w-5 text-safra-dark" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === activeImage ? "w-6 bg-safra-gold" : "w-2 bg-safra-taupe/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-safra-muted">
                <Package className="h-16 w-16 opacity-30" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    i === activeImage
                      ? "border-safra-gold shadow-md shadow-safra-gold/20"
                      : "border-safra-taupe/30 hover:border-safra-taupe"
                  }`}
                >
                  <Image src={src} alt={`Thumb ${i}`} fill className="object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-safra-gold/80 text-center text-[8px] font-bold uppercase text-white py-0.5">
                      Primary
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Info ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Pricing card */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-5 shadow-sm space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-safra-dark">
              <BarChart2 className="h-4 w-4 text-safra-olive" /> Pricing & Inventory
            </h3>
            <div className="flex items-end gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-safra-dark">
                    <Price amount={product.discountPrice!} />
                  </span>
                  <span className="text-lg text-safra-muted line-through">
                    <Price amount={product.price} />
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    -{discountPct}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-safra-dark">
                  <Price amount={product.price} />
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-safra-muted">
                You save <Price amount={product.price - product.discountPrice!} />
              </p>
            )}
            <div className="pt-2 border-t border-safra-taupe/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-safra-muted">Stock</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${stockColor}`}>
                  {product.stock === 0 ? "Out of Stock" : `${product.stock} units`}
                </span>
              </div>
            </div>
          </div>

          {/* Slugs */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-5 shadow-sm space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-safra-dark">
              <Globe className="h-4 w-4 text-safra-olive" /> Slugs
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-safra-muted mb-1">English</p>
                <code className="block rounded-lg bg-safra-cream/60 px-3 py-2 text-xs font-mono text-safra-dark">
                  /{product.slug?.en || "—"}
                </code>
              </div>
              <div>
                <p className="text-xs text-safra-muted mb-1">Arabic</p>
                <code className="block rounded-lg bg-safra-cream/60 px-3 py-2 text-xs font-mono text-safra-dark" dir="rtl">
                  /{product.slug?.ar || "—"}
                </code>
              </div>
            </div>
          </div>

          {/* Category */}
          {category && (
            <div className="rounded-xl border border-safra-taupe/40 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-safra-dark mb-3">
                <Layers className="h-4 w-4 text-safra-olive" /> Category
              </h3>
              <div className="flex items-center gap-3">
                {category.image && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image src={category.image} alt={category.name.en} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-safra-dark">{category.name.en}</p>
                  <p className="text-xs text-safra-muted">{category.name.ar}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description Tabs */}
      <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-safra-taupe/30">
          <button
            onClick={() => setActiveTab("en")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "en"
                ? "bg-safra-gold/10 text-safra-dark border-b-2 border-safra-gold"
                : "text-safra-muted hover:text-safra-dark"
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setActiveTab("ar")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "ar"
                ? "bg-safra-gold/10 text-safra-dark border-b-2 border-safra-gold"
                : "text-safra-muted hover:text-safra-dark"
            }`}
          >
            🇸🇦 Arabic
          </button>
        </div>
        <div className="p-6 space-y-4">
          {activeTab === "en" ? (
            <>
              {product.shortDescription?.en && (
                <p className="text-sm font-medium text-safra-olive">{product.shortDescription.en}</p>
              )}
              <p className="text-sm text-safra-dark leading-relaxed whitespace-pre-line">
                {product.description?.en || <span className="text-safra-muted italic">No description</span>}
              </p>
            </>
          ) : (
            <div dir="rtl">
              {product.shortDescription?.ar && (
                <p className="text-sm font-medium text-safra-olive mb-2">{product.shortDescription.ar}</p>
              )}
              <p className="text-sm text-safra-dark leading-relaxed whitespace-pre-line">
                {product.description?.ar || <span className="text-safra-muted italic">لا يوجد وصف</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="rounded-xl border border-safra-taupe/40 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-safra-taupe/20">
            <h3 className="flex items-center gap-2 font-semibold text-safra-dark">
              <Info className="h-4 w-4 text-safra-olive" /> Specifications
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-safra-cream/40">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-safra-olive w-1/4">Key (EN)</th>
                  <th className="px-6 py-3 text-left font-medium text-safra-olive w-1/4">Value (EN)</th>
                  <th className="px-6 py-3 text-right font-medium text-safra-olive w-1/4">المفتاح</th>
                  <th className="px-6 py-3 text-right font-medium text-safra-olive w-1/4">القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-safra-taupe/20">
                {product.specifications.map((spec, i) => (
                  <tr key={i} className="hover:bg-safra-cream/20 transition-colors">
                    <td className="px-6 py-3 font-medium text-safra-dark">{spec.key.en}</td>
                    <td className="px-6 py-3 text-safra-dark">{spec.value.en}</td>
                    <td className="px-6 py-3 font-medium text-safra-dark text-right" dir="rtl">{spec.key.ar}</td>
                    <td className="px-6 py-3 text-safra-dark text-right" dir="rtl">{spec.value.ar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEO */}
      {product.seo && (
        <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-4">
          <h3 className="flex items-center gap-2 font-semibold text-safra-dark">
            <Globe className="h-4 w-4 text-safra-olive" /> SEO
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-safra-muted font-medium uppercase tracking-wide">Meta Title (EN)</p>
              <p className="text-sm text-safra-dark rounded-lg bg-safra-cream/40 px-3 py-2">
                {product.seo.metaTitle?.en || <span className="italic text-safra-muted">—</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-safra-muted font-medium uppercase tracking-wide">Meta Title (AR)</p>
              <p className="text-sm text-safra-dark rounded-lg bg-safra-cream/40 px-3 py-2" dir="rtl">
                {product.seo.metaTitle?.ar || <span className="italic text-safra-muted">—</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-safra-muted font-medium uppercase tracking-wide">Meta Description (EN)</p>
              <p className="text-sm text-safra-dark rounded-lg bg-safra-cream/40 px-3 py-2">
                {product.seo.metaDescription?.en || <span className="italic text-safra-muted">—</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-safra-muted font-medium uppercase tracking-wide">Meta Description (AR)</p>
              <p className="text-sm text-safra-dark rounded-lg bg-safra-cream/40 px-3 py-2" dir="rtl">
                {product.seo.metaDescription?.ar || <span className="italic text-safra-muted">—</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name.en}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
