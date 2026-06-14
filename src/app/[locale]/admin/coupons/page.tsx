"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CouponsTable from "@/components/admin/coupons/CouponsTable";
import CouponModal from "@/components/admin/coupons/CouponModal";
import { subscribeToCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/firebase/services/coupons-service";
import type { Coupon, CouponInput } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const t = useTranslations("admin");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCoupons((data) => {
      setCoupons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget);
      toast.success("Coupon deleted");
    } catch (err) {
      toast.error("Failed to delete coupon");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSave = async (data: CouponInput) => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, data);
        toast.success("Coupon updated");
      } else {
        await createCoupon(data);
        toast.success("Coupon created");
      }
    } catch (err) {
      toast.error("Failed to save coupon");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{t("coupons")}</h1>
          <p className="mt-1 text-sm text-safra-muted">{t("couponsDesc")}</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-5 w-5" />
          {t("addCoupon")}
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>
      ) : (
        <CouponsTable coupons={coupons} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <CouponModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        coupon={editingCoupon}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t("deleteCoupon")}
        description={t("deleteCouponConfirm")}
        loading={deleting}
      />
    </div>
  );
}
