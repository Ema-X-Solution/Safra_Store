"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { fetchProductById } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";
import { getSubCategoryById } from "@/lib/firebase/services/subcategories-service";
import { getProductName, getProductDescription, getCategoryName, getBilingualText, type Product, type Category, type SubCategory, type ProductWeight } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import { ArrowLeft, Minus, Plus, ShoppingCart, Tag, Heart, Info, Box, Scale } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { use, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedWeight, setSelectedWeight] = useState<ProductWeight | null>(null);

  useEffect(() => {
    Promise.all([fetchProductById(id), fetchCategories()]).then(([p, cats]) => {
      setProduct(p ?? null);
      if (p) {
        setCategory(cats.find((c) => c.id === p.categoryId) ?? null);
        setActiveImage(p.images?.[0] || p.image);
        // Auto-select first weight if product has multiple weights
        if (p.hasMultipleWeights && p.weights && p.weights.length > 0) {
          setSelectedWeight(p.weights[0]);
        }
        if (p.subcategoryId) {
          getSubCategoryById(p.subcategoryId).then((sub) => {
            setSubCategory(sub);
          });
        }
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-safra-taupe border-t-safra-gold"></div>
      </div>
    );
  }

  if (!product) notFound();

  const inStock = product.stock > 0;
  const images = product.images?.length > 0 ? product.images : [product.image];
  // Price logic: use selected weight's price if applicable
  const displayPrice = product.hasMultipleWeights && selectedWeight ? selectedWeight.price : product.price;
  const displayDiscountPrice = product.hasMultipleWeights && selectedWeight ? selectedWeight.discountPrice : product.discountPrice;
  const hasDiscount = displayDiscountPrice !== undefined && displayDiscountPrice > 0 && displayDiscountPrice < displayPrice;
  const inWish = isInWishlist(product.id);

  const handleWishlist = () => {
    if (inWish) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-safra-olive transition-colors hover:text-safra-gold"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToProducts")}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-safra-taupe/10 bg-white shadow-sm">
            {hasDiscount && (
              <div className="absolute top-4 start-4 z-20 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                <Tag className="h-4 w-4" />
                <span>{isAr ? "تخفيض" : "Sale"}</span>
              </div>
            )}
            <button
              onClick={handleWishlist}
              className={cn(
                "absolute top-4 end-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:scale-110",
                inWish ? "text-red-500" : "text-safra-taupe hover:text-red-500"
              )}
            >
              <Heart className="h-5 w-5" fill={inWish ? "currentColor" : "none"} />
            </button>
            <Image
              src={activeImage}
              alt={getProductName(product, locale)}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          
          {/* Thumbnails List (Scrollable instead of wrapping grid) */}
          {images.length > 1 && (
            <div className="flex w-full gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all snap-start",
                    activeImage === img
                      ? "border-safra-gold shadow-md"
                      : "border-safra-taupe/20 opacity-70 hover:opacity-100 hover:border-safra-gold/50"
                  )}
                >
                  <Image src={img} alt={`${getProductName(product, locale)} thumbnail ${idx + 1}`} fill className="object-cover" sizes="100px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col text-start min-w-0">
          {/* Header Info */}
          <div className="border-b border-safra-taupe/20 pb-8">
            {category && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Link
                  href={`/products?category=${category.id}`}
                  className="inline-flex items-center rounded-full border border-safra-gold/20 bg-safra-light/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-safra-olive transition-colors hover:bg-safra-gold hover:text-white"
                >
                  {getCategoryName(category, locale)}
                </Link>
                {subCategory && (
                  <>
                    <span className="text-safra-muted text-sm">&gt;</span>
                    <Link
                      href={`/products?category=${category.id}&subcategory=${subCategory.id}`}
                      className="inline-flex items-center rounded-full border border-safra-taupe/20 bg-safra-cream/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-safra-dark transition-colors hover:bg-safra-taupe/30"
                    >
                      {subCategory.name[locale]}
                    </Link>
                  </>
                )}
              </div>
            )}
            
            <h1 className="text-3xl font-extrabold tracking-tight text-safra-dark sm:text-5xl lg:leading-tight">
              {getProductName(product, locale)}
            </h1>
            
            <div className="mt-6 flex flex-wrap items-baseline gap-4">
              <span className="text-4xl font-black text-safra-deep-gold">
                <Price amount={hasDiscount ? displayDiscountPrice! : displayPrice} />
              </span>
              {hasDiscount && (
                <span className="text-xl font-medium text-safra-muted">
                  <Price amount={displayPrice} strikethrough={true} />
                </span>
              )}
            </div>
          </div>
          
          {/* Weights Selector */}
          {product.hasMultipleWeights && product.weights && product.weights.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-safra-olive" />
                <p className="text-sm font-semibold text-safra-dark">
                  {isAr ? "اختر الوزن" : "Select Weight"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.weights.map((w) => {
                  const isSelected = selectedWeight?.id === w.id;
                  const hasWDiscount = w.discountPrice && w.discountPrice < w.price;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWeight(w)}
                      className={cn(
                        "flex flex-col items-center rounded-xl border-2 px-4 py-2.5 text-sm transition-all",
                        isSelected
                          ? "border-safra-gold bg-safra-gold/10 text-safra-dark shadow-md"
                          : "border-safra-taupe/30 bg-white text-safra-muted hover:border-safra-gold/60 hover:text-safra-dark"
                      )}
                    >
                      <span className="font-bold text-base">{w.value} {w.unit}</span>
                      <span className={cn("text-xs mt-0.5", isSelected ? "text-safra-olive" : "text-safra-muted")}>
                        {hasWDiscount ? (
                          <>
                            <span className="font-semibold"><Price amount={w.discountPrice!} /></span>
                            {" "}
                            <span className="line-through opacity-70"><Price amount={w.price} /></span>
                          </>
                        ) : (
                          <Price amount={w.price} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-6 flex items-center">
            <div className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
              inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-green-500" : "bg-red-500")} />
              {inStock ? t("itemsLeft", { count: product.stock }) : t("outOfStock")}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 prose prose-sm sm:prose-base prose-safra max-w-none text-safra-muted">
            <p className="whitespace-pre-line leading-relaxed text-lg">
              {getProductDescription(product, locale)}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mt-10 rounded-2xl border border-safra-taupe/20 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b border-safra-taupe/10 bg-safra-light/30 px-5 py-4">
                <Info className="h-5 w-5 text-safra-gold" />
                <h3 className="font-bold text-safra-dark text-lg">{isAr ? "المواصفات التقنية" : "Specifications"}</h3>
              </div>
              <div className="p-5">
                <dl className="grid grid-cols-1 gap-y-4">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between border-b border-safra-taupe/10 pb-4 last:border-0 last:pb-0">
                      <dt className="text-sm font-medium text-safra-muted sm:w-1/3">
                        {getBilingualText(spec.key, locale)}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-safra-dark sm:mt-0 sm:w-2/3 sm:text-end">
                        {getBilingualText(spec.value, locale)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Add to Cart Action Area */}
          <div className="mt-10 lg:mt-auto pt-8">
            <div className="rounded-2xl border border-safra-taupe/20 bg-white p-6 shadow-lg shadow-safra-taupe/5">
              {inStock ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-14 items-center justify-between rounded-xl border border-safra-taupe/50 bg-safra-light/20 px-4 sm:w-40">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-safra-olive transition-colors hover:bg-white hover:text-safra-dark hover:shadow-sm"
                      aria-label="Decrease"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-safra-dark">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-safra-olive transition-colors hover:bg-white hover:text-safra-dark hover:shadow-sm"
                      aria-label="Increase"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button 
                    onClick={() => {
                      if (product.hasMultipleWeights && !selectedWeight) return;
                      addItem(product, qty, selectedWeight ?? undefined);
                    }} 
                    className="h-14 flex-1 gap-3 text-lg font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    disabled={product.hasMultipleWeights && !selectedWeight}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {t("addToCart")}
                  </Button>
                </div>
              ) : (
                <div className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-safra-taupe/20 text-lg font-bold text-safra-dark">
                  <Box className="h-5 w-5" />
                  {t("outOfStock")}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
