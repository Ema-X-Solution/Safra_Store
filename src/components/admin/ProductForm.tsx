"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { createProduct } from "@/lib/firebase/admin-firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Category } from "@/lib/types";
import { getCategoryName } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ProductFormProps {
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductForm({ categories, onSuccess }: ProductFormProps) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      if (categories.length === 0) {
        setError(t("needCategory"));
        setLoading(false);
        return;
      }

      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      } else {
        setError(t("imageRequired"));
        setLoading(false);
        return;
      }

      await createProduct({
        name: {
          en: form.get("nameEn") as string,
          ar: form.get("nameAr") as string,
        },
        description: {
          en: form.get("descEn") as string,
          ar: form.get("descAr") as string,
        },
        price: Number(form.get("price")),
        categoryId: form.get("categoryId") as string,
        stock: Number(form.get("stock")),
        featured: form.get("featured") === "on",
        image: imageUrl,
      });

      (e.target as HTMLFormElement).reset();
      setImageFile(null);
      onSuccess();
    } catch {
      setError(t("saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-safra-dark">{t("addProduct")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="nameEn" label={t("nameEn")} required />
        <Input name="nameAr" label={t("nameAr")} required dir="rtl" />
        <Input name="descEn" label={t("descEn")} required />
        <Input name="descAr" label={t("descAr")} required dir="rtl" />
        <Input name="price" label={t("price")} type="number" step="0.01" min="0" required />
        <Input name="stock" label={t("stock")} type="number" min="0" required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-safra-dark">{t("category")}</label>
        <select
          name="categoryId"
          required
          className="w-full rounded-lg border border-safra-taupe bg-white px-4 py-2.5 text-safra-dark focus:border-safra-gold focus:outline-none focus:ring-2 focus:ring-safra-gold/30"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getCategoryName(cat, locale)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-safra-dark">{t("uploadImage")}</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-safra-olive file:me-4 file:rounded-lg file:border-0 file:bg-safra-light file:px-4 file:py-2 file:text-safra-dark"
        />
        <p className="mt-1 text-xs text-safra-muted">{t("cloudinaryHint")}</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-safra-dark">
        <input type="checkbox" name="featured" className="rounded border-safra-taupe text-safra-gold" />
        {t("featured")}
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        {t("saveProduct")}
      </Button>
    </form>
  );
}
