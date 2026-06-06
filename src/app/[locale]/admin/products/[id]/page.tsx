"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BilingualInput from "@/components/admin/shared/BilingualInput";
import BilingualTextarea from "@/components/admin/shared/BilingualTextarea";
import ImageUploader from "@/components/admin/products/ImageUploader";
import SpecificationsEditor from "@/components/admin/products/SpecificationsEditor";
import { getProductById, createProduct, updateProduct } from "@/lib/firebase/services/products-service";
import { getCategories } from "@/lib/firebase/services/categories-service";
import type { ProductInput, ProductSpecification, ProductSEO, Category } from "@/lib/types";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function AdminProductEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const locale = useLocale() as "en" | "ar";

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
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");
  const [categoryId, setCategoryId] = useState("");
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
            setDiscountPrice(product.discountPrice || "");
            setStock(product.stock || 0);
            setStatus(product.status || "active");
            setCategoryId(product.categoryId || "");
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

    setSaving(true);
    try {
      const data: ProductInput = {
        name: { en: nameEn, ar: nameAr },
        slug: { en: slugEn || nameEn.toLowerCase().replace(/\s+/g, '-'), ar: slugAr || nameAr.replace(/\s+/g, '-') },
        shortDescription: { en: shortDescEn, ar: shortDescAr },
        description: { en: descEn, ar: descAr },
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        image: images[0],
        images,
        categoryId,
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
    } catch (err) {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="rounded-lg p-2 hover:bg-white text-safra-muted hover:text-safra-dark transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{isNew ? "Add Product" : "Edit Product"}</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Basic Info */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="nameEn" label="Name (English)" value={nameEn} onChange={e => setNameEn(e.target.value)} required />
                <Input name="nameAr" label="Name (Arabic)" value={nameAr} onChange={e => setNameAr(e.target.value)} required dir="rtl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="slugEn" label="Slug (English)" value={slugEn} onChange={e => setSlugEn(e.target.value)} />
                <Input name="slugAr" label="Slug (Arabic)" value={slugAr} onChange={e => setSlugAr(e.target.value)} dir="rtl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="shortDescEn" label="Short Desc (English)" value={shortDescEn} onChange={e => setShortDescEn(e.target.value)} />
                <Input name="shortDescAr" label="Short Desc (Arabic)" value={shortDescAr} onChange={e => setShortDescAr(e.target.value)} dir="rtl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description (English)</label>
                  <textarea rows={5} value={descEn} onChange={e => setDescEn(e.target.value)} className="w-full rounded-lg border border-safra-taupe/40 p-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description (Arabic)</label>
                  <textarea rows={5} value={descAr} onChange={e => setDescAr(e.target.value)} className="w-full rounded-lg border border-safra-taupe/40 p-2" dir="rtl" />
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">Media</h3>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Specifications */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">Specifications</h3>
            <SpecificationsEditor specs={specs} onChange={setSpecs} />
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">SEO</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="seoTitleEn" label="Meta Title (En)" value={seoTitleEn} onChange={e => setSeoTitleEn(e.target.value)} />
                <Input name="seoTitleAr" label="Meta Title (Ar)" value={seoTitleAr} onChange={e => setSeoTitleAr(e.target.value)} dir="rtl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="seoDescEn" label="Meta Description (En)" value={seoDescEn} onChange={e => setSeoDescEn(e.target.value)} />
                <Input name="seoDescAr" label="Meta Description (Ar)" value={seoDescAr} onChange={e => setSeoDescAr(e.target.value)} dir="rtl" />
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Pricing & Inventory */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">Pricing & Inventory</h3>
            <div className="space-y-4">
              <Input name="price" label="Price" type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} required />
              <Input name="discountPrice" label="Discount Price" type="number" step="0.01" value={discountPrice} onChange={e => setDiscountPrice(e.target.value ? Number(e.target.value) : "")} />
              <Input name="stock" label="Stock Quantity" type="number" value={stock} onChange={e => setStock(Number(e.target.value))} required />
            </div>
          </div>

          {/* Classification */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-safra-dark">Classification</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as "active" | "draft" | "archived")} className="w-full rounded-lg border border-safra-taupe/40 p-2">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-lg border border-safra-taupe/40 p-2">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name[locale]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-safra-taupe text-safra-gold" />
                <label htmlFor="featured" className="text-sm">Featured Product</label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="bestSeller" checked={bestSeller} onChange={e => setBestSeller(e.target.checked)} className="h-4 w-4 rounded border-safra-taupe text-safra-gold" />
                <label htmlFor="bestSeller" className="text-sm">Best Seller</label>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Actions */}
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-safra-taupe/30 bg-white/80 p-4 backdrop-blur-md lg:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-4">
            <Link href="/admin/products">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" loading={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {isNew ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
