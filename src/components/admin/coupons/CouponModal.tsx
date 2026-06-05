"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Coupon, CouponInput } from "@/lib/types";
import { toDate } from "@/lib/types";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSave: (data: CouponInput) => Promise<void>;
}

export default function CouponModal({ isOpen, onClose, coupon, onSave }: CouponModalProps) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const activeStr = form.get("active") as string;

    const minOrderRaw = Number(form.get("minOrderValue"));
    const maxDiscountRaw = Number(form.get("maxDiscount"));
    const usageLimitRaw = Number(form.get("usageLimit"));

    // Build object without optional undefined fields — Firebase rejects undefined
    const payload: import("@/lib/types").CouponInput = {
      code: (form.get("code") as string).trim().toUpperCase(),
      description: {
        en: form.get("descEn") as string,
        ar: form.get("descAr") as string,
      },
      discountType: form.get("discountType") as any,
      discountValue: Number(form.get("discountValue")),
      expiryDate: new Date(form.get("expiryDate") as string),
      active: activeStr === "true",
    };

    // Only add optional fields if they have a real value
    if (minOrderRaw > 0) payload.minOrderValue = minOrderRaw;
    if (maxDiscountRaw > 0) payload.maxDiscount = maxDiscountRaw;
    if (usageLimitRaw > 0) payload.usageLimit = usageLimitRaw;

    try {
      await onSave(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  // Format date for datetime-local input
  const defaultDate = coupon ? toDate(coupon.expiryDate).toISOString().slice(0, 16) : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="code" label="Coupon Code" defaultValue={coupon?.code} required />
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-safra-dark">Status</label>
              <select name="active" defaultValue={coupon ? String(coupon.active) : "true"} className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-safra-dark focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <Input name="descEn" label="Description (English)" defaultValue={coupon?.description?.en} required />
            <Input name="descAr" label="Description (Arabic)" defaultValue={coupon?.description?.ar} dir="rtl" required />
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-safra-dark">Discount Type</label>
              <select name="discountType" defaultValue={coupon?.discountType || "percentage"} className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-safra-dark focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            
            <Input name="discountValue" label="Discount Value" type="number" step="0.01" defaultValue={coupon?.discountValue} required />
            <Input name="minOrderValue" label="Min Order Value (Optional)" type="number" step="0.01" defaultValue={coupon?.minOrderValue} />
            <Input name="maxDiscount" label="Max Discount (Optional)" type="number" step="0.01" defaultValue={coupon?.maxDiscount} />
            <Input name="usageLimit" label="Usage Limit (Optional)" type="number" defaultValue={coupon?.usageLimit} />
            <Input name="expiryDate" label="Expiry Date" type="datetime-local" defaultValue={defaultDate} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Coupon</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
