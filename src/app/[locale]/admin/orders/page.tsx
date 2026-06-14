"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { getAllOrders } from "@/lib/firebase/services/orders-service";
import type { Order } from "@/lib/types";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await getAllOrders());
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(term) || 
                          o.shippingAddress?.fullName?.toLowerCase().includes(term) ||
                          o.shippingAddress?.phone?.includes(term);
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{t("orders")}</h1>
          <p className="mt-1 text-sm text-safra-muted">{t("ordersDesc")}</p>
        </div>
        <Link href="/admin/orders/new">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            {t("addOrder")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-safra-taupe/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-safra-muted" />
          <input
            type="text"
            placeholder={t("searchOrders")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-safra-taupe/40 focus:outline-none focus:ring-1 focus:ring-safra-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-safra-taupe/40 bg-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-safra-gold"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="processing">{t("status.processing")}</option>
          <option value="shipped">{t("status.shipped")}</option>
          <option value="delivered">{t("status.delivered")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}
    </div>
  );
}
