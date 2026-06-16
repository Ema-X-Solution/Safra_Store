"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Price from "@/components/ui/Price";
import type { Order } from "@/lib/types";
import { formatFirebaseDate } from "@/lib/types";

interface LatestOrdersTableProps {
  orders: Order[];
}

export default function LatestOrdersTable({ orders }: LatestOrdersTableProps) {
  const t = useTranslations("admin");

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 text-center shadow-sm">
        <p className="text-safra-muted">{t("noOrders")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="border-b border-safra-taupe/30 px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-safra-dark">{t("latestOrders")}</h3>
        <Link href="/admin/orders" className="text-sm font-medium text-safra-gold hover:underline">
          {t("viewAll")}
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/20 text-start text-safra-olive">
            <tr>
              <th className="px-6 py-3 font-medium">{t("orderId")}</th>
              <th className="px-6 py-3 font-medium">{t("customer")}</th>
              <th className="px-6 py-3 font-medium">{t("statusCol")}</th>
              <th className="px-6 py-3 font-medium">{t("date")}</th>
              <th className="px-6 py-3 font-medium">{t("total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-safra-taupe/20">
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-safra-light/10">
                <td className="px-6 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-safra-gold hover:underline">
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-6 py-3 text-safra-dark">{order.shippingAddress?.fullName || order.userId}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === "delivered" ? "bg-green-100 text-green-700" :
                    order.status === "cancelled" ? "bg-red-100 text-red-700" :
                    order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {t(`status.${order.status}`)}
                  </span>
                </td>
                <td className="px-6 py-3 text-safra-olive">{formatFirebaseDate(order.createdAt)}</td>
                <td className="px-6 py-3 font-medium text-safra-dark">
                  <Price amount={order.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
