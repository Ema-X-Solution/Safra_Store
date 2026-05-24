"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAllProductsAdmin, getAllOrders } from "@/lib/firebase/admin-firestore";
import { Package, ShoppingBag, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      const [products, orders] = await Promise.all([getAllProductsAdmin(), getAllOrders()]);
      setStats({
        products: products.length,
        orders: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
      });
    }
    load();
  }, []);

  const cards = [
    { label: t("totalProducts"), value: stats.products, icon: Package, href: "/admin/products" },
    { label: t("totalOrders"), value: stats.orders, icon: ShoppingBag, href: "/admin/orders" },
    { label: t("pendingOrders"), value: stats.pending, icon: Clock, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-safra-dark">{t("dashboard")}</h1>
      <p className="mt-1 text-safra-muted">{t("dashboardDesc")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Icon className="h-8 w-8 text-safra-gold" />
            <p className="mt-4 text-3xl font-bold text-safra-dark">{value}</p>
            <p className="text-sm text-safra-muted">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
