"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash2 } from "lucide-react";
import type { Coupon } from "@/lib/types";
import { formatFirebaseDate } from "@/lib/types";
import Price from "@/components/ui/Price";

interface CouponsTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export default function CouponsTable({ coupons, onEdit, onDelete }: CouponsTableProps) {
  const t = useTranslations("admin");

  if (!coupons || coupons.length === 0) {
    return (
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
        <p className="text-safra-muted">No coupons found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/20 text-start text-safra-olive">
            <tr>
              <th className="px-6 py-3 font-medium">Code</th>
              <th className="px-6 py-3 font-medium">Discount</th>
              <th className="px-6 py-3 font-medium">Usage Limit</th>
              <th className="px-6 py-3 font-medium">Expiry</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-safra-taupe/20">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="transition-colors hover:bg-safra-light/10">
                <td className="px-6 py-3 font-medium text-safra-dark">{coupon.code}</td>
                <td className="px-6 py-3 text-safra-dark">
                  {coupon.discountType === "percentage" ? (
                    `${coupon.discountValue}%`
                  ) : (
                    <Price amount={coupon.discountValue} />
                  )}
                </td>
                <td className="px-6 py-3 text-safra-olive">
                  {coupon.usageCount} / {coupon.usageLimit || "∞"}
                </td>
                <td className="px-6 py-3 text-safra-olive">
                  {formatFirebaseDate(coupon.expiryDate)}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      coupon.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3 text-end">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="rounded-lg p-2 text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(coupon.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
