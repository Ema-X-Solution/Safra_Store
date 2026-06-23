"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import SingleImageUploader from "@/components/admin/shared/SingleImageUploader";
import type { SubCategory, SubCategoryInput } from "@/lib/types";
import { useTranslations } from "next-intl";

interface SubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCategory: SubCategory | null;
  categoryId: string;
  onSave: (data: SubCategoryInput) => Promise<void>;
}

export default function SubCategoryModal({ isOpen, onClose, subCategory, categoryId, onSave }: SubCategoryModalProps) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (subCategory) {
        setNameEn(subCategory.name.en || "");
        setNameAr(subCategory.name.ar || "");
        setSlug(subCategory.slug || "");
        setDescEn(subCategory.description?.en || "");
        setDescAr(subCategory.description?.ar || "");
        setImage(subCategory.image || "");
        setOrder(subCategory.order || 0);
      } else {
        setNameEn("");
        setNameAr("");
        setSlug("");
        setDescEn("");
        setDescAr("");
        setImage("");
        setOrder(0);
      }
    }
  }, [isOpen, subCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: SubCategoryInput = {
        categoryId,
        name: { en: nameEn, ar: nameAr },
        slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
        description: { en: descEn, ar: descAr },
        image,
        order: Number(order)
      };
      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-safra-dark/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border border-safra-taupe/40 bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-safra-taupe/20 px-6 py-4 bg-safra-cream/30">
            <Dialog.Title className="text-lg font-semibold text-safra-dark">
              {subCategory ? "Edit Subcategory" : "Add Subcategory"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark transition">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="scNameEn" label={t("nameEn")} value={nameEn} onChange={e => setNameEn(e.target.value)} required langValidate="en" />
                <Input name="scNameAr" label={t("nameAr")} value={nameAr} onChange={e => setNameAr(e.target.value)} required dir="rtl" langValidate="ar" />
              </div>

              <Input name="scSlug" label="Slug (optional)" value={slug} onChange={e => setSlug(e.target.value)} langValidate="en" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Textarea label={t("descriptionEn")} rows={3} value={descEn} onChange={e => setDescEn(e.target.value)} langValidate="en" />
                <Textarea label={t("descriptionAr")} rows={3} value={descAr} onChange={e => setDescAr(e.target.value)} dir="rtl" langValidate="ar" />
              </div>

              <Input name="scOrder" label="Order" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />

              <div>
                <label className="mb-2 block text-sm font-medium text-safra-dark">Image</label>
                <SingleImageUploader value={image} onChange={setImage} aspectRatio="square" />
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-safra-taupe/20">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>{t("cancel")}</Button>
              <Button type="submit" loading={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {t("saveChanges")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
