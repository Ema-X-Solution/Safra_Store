"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import BilingualInput from "@/components/admin/shared/BilingualInput";
import BilingualTextarea from "@/components/admin/shared/BilingualTextarea";
import ImageUploader from "@/components/admin/products/ImageUploader";
import SpecificationsEditor from "@/components/admin/products/SpecificationsEditor";
import { getProductById, createProduct, updateProduct } from "@/lib/firebase/services/products-service";
import { getCategories } from "@/lib/firebase/services/categories-service";
import { getSubCategories } from "@/lib/firebase/services/subcategories-service";
import type { ProductInput, ProductSpecification, ProductSEO, Category, SubCategory, ProductWeight } from "@/lib/types";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";

export default function AdminProductEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const t = useTranslations("admin");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [slugAr, setSlugAr] = useState("");
  const [shortDescEn, setShortDescEn] = useState("");
  const [shortDescAr, setShortDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [price, setPrice] = useState(0);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [hasMultipleWeights, setHasMultipleWeights] = useState(false);
  const [weights, setWeights] = useState<ProductWeight[]>([]);
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  
  // SEO state
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoTitleAr, setSeoTitleAr] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");
  const [seoDescAr, setSeoDescAr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);

        if (!isNew) {
          const product = await getProductById(id);
          if (product) {
            setNameEn(product.name?.en || "");
            setNameAr(product.name?.ar || "");
            setSlugEn(product.slug?.en || "");
            setSlugAr(product.slug?.ar || "");
            setShortDescEn(product.shortDescription?.en || "");
            setShortDescAr(product.shortDescription?.ar || "");
            setDescEn(product.description?.en || "");
            setDescAr(product.description?.ar || "");
            setPrice(product.price || 0);
            setHasDiscount(product.discountPrice !== undefined && product.discountPrice > 0);
            setDiscountPrice(product.discountPrice || "");
            setHasMultipleWeights(product.hasMultipleWeights || false);
            setWeights(product.weights || []);
            setStock(product.stock || 0);
            setStatus(product.status || "active");
            setCategoryId(product.categoryId || "");
            setSubcategoryId(product.subcategoryId || "");
            setFeatured(product.featured || false);
            setBestSeller(product.bestSeller || false);
            setImages(product.images || (product.image ? [product.image] : []));
            setSpecs(product.specifications || []);
            setSeoTitleEn(product.seo?.metaTitle?.en || "");
            setSeoTitleAr(product.seo?.metaTitle?.ar || "");
            setSeoDescEn(product.seo?.metaDescription?.en || "");
            setSeoDescAr(product.seo?.metaDescription?.ar || "");
          } else {
            toast.error("Product not found");
            router.push("/admin/products");
          }
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew, router]);

  useEffect(() => {
    async function loadSubs() {
      if (!categoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const subs = await getSubCategories(categoryId);
        setSubCategories(subs);
        // If the current subcategoryId is not in the new list, clear it
        if (!subs.find((s) => s.id === subcategoryId)) {
          setSubcategoryId("");
        }
      } catch (err) {
        console.error("Failed to load subcategories", err);
      }
    }
    loadSubs();
  }, [categoryId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (subCategories.length > 0 && !subcategoryId) {
      toast.error(isAr ? "الرجاء اختيار قسم فرعي" : "Please select a subcategory");
      return;
    }
    
    if (hasMultipleWeights) {
      if (weights.length === 0) {
        toast.error(isAr ? "الرجاء إضافة وزن واحد على الأقل" : "Please add at least one weight");
        return;
      }
      for (const w of weights) {
        if (!w.value || w.value <= 0) {
          toast.error(isAr ? "الرجاء إدخال قيمة صحيحة للوزن" : "Please enter a valid weight value");
          return;
        }
        if (!w.price || w.price <= 0) {
          toast.error(isAr ? "الرجاء إدخال سعر صحيح للوزن" : "Please enter a valid price for the weight");
          return;
        }
        if (w.discountPrice && w.discountPrice >= w.price) {
          toast.error(isAr ? "سعر التخفيض يجب أن يكون أقل من السعر الأساسي للوزن" : "Discount price must be less than the main price for the weight");
          return;
        }
      }
    } else {
      if (hasDiscount) {
        if (!discountPrice || Number(discountPrice) <= 0) {
          toast.error(isAr ? "الرجاء إدخال سعر التخفيض" : "Please enter a valid discount price");
          return;
        }
        if (Number(discountPrice) >= Number(price)) {
          toast.error(isAr ? "سعر التخفيض يجب أن يكون أقل من السعر الأساسي" : "Discount price must be less than the main price");
          return;
        }
      }
    }

    setSaving(true);
    try {
      const data: ProductInput = {
        name: { en: nameEn, ar: nameAr },
        slug: { en: slugEn || nameEn.toLowerCase().replace(/\s+/g, '-'), ar: slugAr || nameAr.replace(/\s+/g, '-') },
        shortDescription: { en: shortDescEn, ar: shortDescAr },
        description: { en: descEn, ar: descAr },
        price: hasMultipleWeights ? (weights.length > 0 ? weights[0].price : 0) : Number(price),
        discountPrice: hasMultipleWeights 
          ? (weights.length > 0 && weights[0].discountPrice ? weights[0].discountPrice : undefined)
          : (hasDiscount && discountPrice ? Number(discountPrice) : undefined),
        hasMultipleWeights,
        weights: hasMultipleWeights ? weights : [],
        image: images[0],
        images,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        stock: Number(stock),
        status,
        featured,
        bestSeller,
        specifications: specs,
        seo: {
          metaTitle: { en: seoTitleEn, ar: seoTitleAr },
          metaDescription: { en: seoDescEn, ar: seoDescAr },
        }
      };

      if (isNew) {
        await createProduct(data);
        toast.success("Product created successfully");
        router.push("/admin/products");
      } else {
        await updateProduct(id, data);
        toast.success("Product updated successfully");
      }
    } catch (err: unknown) {
      console.error("❌ Save product error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "Failed to save product";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="rounded-lg p-2 hover:bg-white text-safra-muted hover:text-safra-dark transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{isNew ? t("addProductTitle") : t("editProductTitle")}</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
          
          {/* Basic Info */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">{t("basicInfo")}</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="nameEn" label={t("nameEn")} value={nameEn} onChange={e => setNameEn(e.target.value)} required langValidate="en" />
                <Input name="nameAr" label={t("nameAr")} value={nameAr} onChange={e => setNameAr(e.target.value)} required dir="rtl" langValidate="ar" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="slugEn" label={t("slugEn")} value={slugEn} onChange={e => setSlugEn(e.target.value)} langValidate="en" />
                <Input name="slugAr" label={t("slugAr")} value={slugAr} onChange={e => setSlugAr(e.target.value)} dir="rtl" langValidate="ar" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="shortDescEn" label={t("shortDescEn")} value={shortDescEn} onChange={e => setShortDescEn(e.target.value)} langValidate="en" />
                <Input name="shortDescAr" label={t("shortDescAr")} value={shortDescAr} onChange={e => setShortDescAr(e.target.value)} dir="rtl" langValidate="ar" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Textarea label={t("descriptionEn")} rows={5} value={descEn} onChange={e => setDescEn(e.target.value)} langValidate="en" />
                <Textarea label={t("descriptionAr")} rows={5} value={descAr} onChange={e => setDescAr(e.target.value)} dir="rtl" langValidate="ar" />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">{t("media")}</h3>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Specifications */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">{t("specifications")}</h3>
            <SpecificationsEditor specs={specs} onChange={setSpecs} />
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">{t("seo")}</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="seoTitleEn" label={t("metaTitleEn")} value={seoTitleEn} onChange={e => setSeoTitleEn(e.target.value)} langValidate="en" />
                <Input name="seoTitleAr" label={t("metaTitleAr")} value={seoTitleAr} onChange={e => setSeoTitleAr(e.target.value)} dir="rtl" langValidate="ar" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="seoDescEn" label={t("metaDescEn")} value={seoDescEn} onChange={e => setSeoDescEn(e.target.value)} langValidate="en" />
                <Input name="seoDescAr" label={t("metaDescAr")} value={seoDescAr} onChange={e => setSeoDescAr(e.target.value)} dir="rtl" langValidate="ar" />
              </div>
            </div>
          </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
          
          {/* Pricing & Inventory */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">{t("pricingInventory")}</h3>
            <div className="space-y-4">

              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-safra-taupe/20">
                <input 
                  type="checkbox" 
                  id="hasMultipleWeights" 
                  checked={hasMultipleWeights} 
                  onChange={e => {
                    setHasMultipleWeights(e.target.checked);
                    if (e.target.checked && weights.length === 0) {
                      setWeights([{ id: `w-${Date.now()}`, value: 0, unit: "g", price: 0, stock: 0 }]);
                    }
                  }} 
                  className="h-4 w-4 rounded border-safra-taupe text-safra-gold focus:ring-safra-gold" 
                />
                <label htmlFor="hasMultipleWeights" className="text-sm font-medium text-safra-dark cursor-pointer select-none">
                  {isAr ? "المنتج له أوزان/أحجام متعددة؟" : "Product has multiple sizes/weights?"}
                </label>
              </div>

              {!hasMultipleWeights ? (
                <>
                  <Input name="price" label={t("price")} type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="hasDiscount" 
                      checked={hasDiscount} 
                      onChange={e => {
                        setHasDiscount(e.target.checked);
                        if (!e.target.checked) setDiscountPrice("");
                      }} 
                      className="h-4 w-4 rounded border-safra-taupe text-safra-gold focus:ring-safra-gold" 
                    />
                    <label htmlFor="hasDiscount" className="text-sm font-medium text-safra-dark cursor-pointer select-none">
                      {isAr ? "يوجد تخفيض على هذا المنتج؟" : "Product has discount?"}
                    </label>
                  </div>

                  {hasDiscount && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <Input 
                        name="discountPrice" 
                        label={t("discountPrice")} 
                        type="number" 
                        step="0.01" 
                        value={discountPrice} 
                        onChange={e => setDiscountPrice(e.target.value ? Number(e.target.value) : "")} 
                        required 
                      />
                      {Number(discountPrice) >= price && discountPrice !== "" && (
                        <p className="mt-1 text-xs text-red-500">
                          {isAr ? "سعر التخفيض يجب أن يكون أقل من السعر الأساسي" : "Discount price must be less than the main price"}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-safra-dark">
                      {isAr ? "الأوزان والأسعار" : "Weights & Prices"}
                    </label>
                  </div>
                  
                  {weights.map((w, index) => (
                    <div key={w.id} className="relative rounded-lg border border-safra-taupe/40 bg-safra-light/10 p-4 space-y-4">
                      <button
                        type="button"
                        onClick={() => setWeights(weights.filter((_, i) => i !== index))}
                        className="absolute top-2 end-2 text-safra-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-safra-dark">{isAr ? "الوزن" : "Weight"}</label>
                          <input 
                            type="number" 
                            value={w.value || ""} 
                            onChange={(e) => {
                              const newWeights = [...weights];
                              newWeights[index].value = Number(e.target.value);
                              setWeights(newWeights);
                            }}
                            className="w-full rounded-md border border-safra-taupe/40 px-3 py-1.5 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-safra-dark">{isAr ? "الوحدة" : "Unit"}</label>
                          <select
                            value={w.unit}
                            onChange={(e) => {
                              const newWeights = [...weights];
                              newWeights[index].unit = e.target.value as "g" | "kg";
                              setWeights(newWeights);
                            }}
                            className="w-full rounded-md border border-safra-taupe/40 px-3 py-1.5 text-sm"
                          >
                            <option value="g">{isAr ? "جرام" : "g"}</option>
                            <option value="kg">{isAr ? "كيلوجرام" : "kg"}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-safra-dark">{isAr ? "السعر" : "Price"}</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={w.price || ""} 
                            onChange={(e) => {
                              const newWeights = [...weights];
                              newWeights[index].price = Number(e.target.value);
                              setWeights(newWeights);
                            }}
                            className="w-full rounded-md border border-safra-taupe/40 px-3 py-1.5 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-safra-dark">{isAr ? "سعر التخفيض" : "Discount Price"}</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={w.discountPrice || ""} 
                            onChange={(e) => {
                              const newWeights = [...weights];
                              newWeights[index].discountPrice = e.target.value ? Number(e.target.value) : undefined;
                              setWeights(newWeights);
                            }}
                            className="w-full rounded-md border border-safra-taupe/40 px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-safra-dark">{isAr ? "المخزون" : "Stock"}</label>
                        <input 
                          type="number" 
                          value={w.stock ?? ""} 
                          onChange={(e) => {
                            const newWeights = [...weights];
                            newWeights[index].stock = e.target.value ? Number(e.target.value) : undefined;
                            setWeights(newWeights);
                          }}
                          className="w-full rounded-md border border-safra-taupe/40 px-3 py-1.5 text-sm"
                          placeholder={isAr ? "أدخل المخزون" : "Enter stock"}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setWeights([...weights, { id: `w-${Date.now()}`, value: 0, unit: "g", price: 0, stock: 0 }])}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 me-2" />
                    {isAr ? "إضافة وزن آخر" : "Add another weight"}
                  </Button>
                </div>
              )}

              {!hasMultipleWeights && (
                <Input name="stock" label={t("stockQty")} type="number" value={stock} onChange={e => setStock(Number(e.target.value))} required />
              )}
            </div>
          </div>

          {/* Classification */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">{t("classification")}</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("statusLabel")}</label>
                <select value={status} onChange={e => setStatus(e.target.value as "active" | "draft" | "archived")} className="w-full rounded-lg border border-safra-taupe/40 p-2">
                  <option value="active">{t("statusActive")}</option>
                  <option value="draft">{t("statusDraft")}</option>
                  <option value="archived">{t("statusArchived")}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("category")}</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-lg border border-safra-taupe/40 p-2">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name[locale]}</option>
                  ))}
                </select>
              </div>
              {subCategories.length > 0 && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium">{t("subcategory") || "Subcategory"}</label>
                  <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} className="w-full rounded-lg border border-safra-taupe/40 p-2">
                    <option value="">{isAr ? "اختر القسم الفرعي" : "Select Subcategory"}</option>
                    {subCategories.map(s => (
                      <option key={s.id} value={s.id}>{s.name[locale]}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-safra-taupe text-safra-gold" />
                <label htmlFor="featured" className="text-sm">{t("featuredProduct")}</label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="bestSeller" checked={bestSeller} onChange={e => setBestSeller(e.target.checked)} className="h-4 w-4 rounded border-safra-taupe text-safra-gold" />
                <label htmlFor="bestSeller" className="text-sm">{t("bestSeller")}</label>
              </div>
            </div>
          </div>

          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-safra-taupe/30 bg-white/90 p-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-4">
            <Link href="/admin/products">
              <Button type="button" variant="ghost">{t("cancel")}</Button>
            </Link>
            <Button type="submit" loading={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {isNew ? t("createProduct") : t("saveChanges")}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
