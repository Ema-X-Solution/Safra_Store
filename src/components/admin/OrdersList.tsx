"use client";

import { useTranslations } from "next-intl";
import { updateOrderStatus } from "@/lib/firebase/admin-firestore";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

interface OrdersListProps {
  orders: Order[];
  onRefresh: () => void;
}

function formatDate(createdAt: Order["createdAt"]) {
  if (!createdAt) return "—";
  const date =
    createdAt instanceof Date
      ? createdAt
      : "seconds" in createdAt
        ? new Date(createdAt.seconds * 1000)
        : new Date();
  return date.toLocaleString();
}

export default function OrdersList({ orders, onRefresh }: OrdersListProps) {
  const t = useTranslations("admin");

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    await updateOrderStatus(orderId, status);
    onRefresh();
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-safra-taupe/40 bg-white p-8 text-center text-safra-muted">
        {t("noOrders")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-safra-taupe/40 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-safra-dark">
                {order.shippingAddress?.fullName || t("customer")}
              </p>
              <p className="text-sm text-safra-muted">{formatDate(order.createdAt)}</p>
              <p className="mt-1 text-sm text-safra-olive">
                {order.shippingAddress?.address}, {order.shippingAddress?.city}
              </p>
              <p className="text-sm text-safra-olive">{order.shippingAddress?.phone}</p>
            </div>
            <div className="text-end">
              <p className="text-lg font-bold text-safra-deep-gold">{formatPrice(order.total)}</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                className="mt-2 rounded-lg border border-safra-taupe px-3 py-1.5 text-sm text-safra-dark"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="mt-4 space-y-1 border-t border-safra-taupe/30 pt-4 text-sm text-safra-olive">
            {order.items?.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {typeof item.name === "object" ? item.name.en : item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
