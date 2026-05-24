"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { createCategory } from "@/lib/firebase/admin-firestore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const nameEn = form.get("nameEn") as string;
    const slug = nameEn.toLowerCase().replace(/\s+/g, "-");

    try {
      await createCategory({
        name: { en: nameEn, ar: form.get("nameAr") as string },
        slug,
        order: Number(form.get("order") || 0),
      });
      (e.target as HTMLFormElement).reset();
      onSuccess();
    } catch {
      setError(t("saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-safra-dark">{t("addCategory")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="nameEn" label={t("nameEn")} required />
        <Input name="nameAr" label={t("nameAr")} required dir="rtl" />
        <Input name="order" label={t("sortOrder")} type="number" min="0" defaultValue="0" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={loading}>
        {t("saveCategory")}
      </Button>
    </form>
  );
}
