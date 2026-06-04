"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SingleImageUploader from "@/components/admin/shared/SingleImageUploader";
import type { Category, CategoryInput } from "@/lib/types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (data: CategoryInput) => Promise<void>;
}

export default function CategoryModal({ isOpen, onClose, category, onSave }: CategoryModalProps) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setImage(category?.image || "");
    }
  }, [isOpen, category]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const nameEn = form.get("nameEn") as string;
    
    try {
      await onSave({
        name: { en: nameEn, ar: form.get("nameAr") as string },
        description: { en: form.get("descEn") as string, ar: form.get("descAr") as string },
        slug: category?.slug || nameEn.toLowerCase().replace(/\s+/g, "-"),
        order: Number(form.get("order") || 0),
        image,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="nameEn" label="Name (English)" defaultValue={category?.name?.en} required />
            <Input name="nameAr" label="Name (Arabic)" defaultValue={category?.name?.ar} required dir="rtl" />
            <Input name="descEn" label="Description (English)" defaultValue={category?.description?.en} />
            <Input name="descAr" label="Description (Arabic)" defaultValue={category?.description?.ar} dir="rtl" />
            <Input name="order" label="Sort Order" type="number" defaultValue={category?.order || 0} />
          </div>
          <SingleImageUploader label="Category Image" value={image} onChange={setImage} aspectRatio="video" />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{t("saveCategory")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
