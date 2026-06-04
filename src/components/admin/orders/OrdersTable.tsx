"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eye, Edit } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatFirebaseDate } from "@/lib/types";
import Price from "@/components/ui/Price";

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const t = useTranslations("admin");

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
        <p className="text-safra-muted">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/20 text-start text-safra-olive">
            <tr>
              <th className="px-6 py-3 font-medium">Order ID</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Payment</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-safra-taupe/20">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-safra-light/10">
                <td className="px-6 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-safra-gold hover:underline">
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-6 py-3">
                  <p className="font-medium text-safra-dark">{order.shippingAddress?.fullName}</p>
                  <p className="text-xs text-safra-muted">{order.shippingAddress?.phone}</p>
                </td>
                <td className="px-6 py-3 text-safra-olive">{formatFirebaseDate(order.createdAt)}</td>
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
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.paymentStatus || "pending"}
                  </span>
                </td>
                <td className="px-6 py-3 font-medium text-safra-dark">
                  <Price amount={order.total} />
                </td>
                <td className="px-6 py-3 text-end">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
