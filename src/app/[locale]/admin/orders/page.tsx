"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getAllOrders } from "@/lib/firebase/admin-firestore";
import type { Order } from "@/lib/types";
import OrdersList from "@/components/admin/OrdersList";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-safra-dark">{t("orders")}</h1>
      <p className="mt-1 text-safra-muted">{t("ordersDesc")}</p>

      <div className="mt-8">
        {loading ? (
          <p className="text-safra-muted">{t("loading")}</p>
        ) : (
          <OrdersList orders={orders} onRefresh={loadOrders} />
        )}
      </div>
    </div>
  );
}
