"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Package, ShoppingBag, Clock, Users, DollarSign, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/firebase/services/analytics-service";
import { getAllOrders } from "@/lib/firebase/services/orders-service";
import { getFeaturedProducts } from "@/lib/firebase/services/products-service";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import LatestOrdersTable from "@/components/admin/dashboard/LatestOrdersTable";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import type { DashboardStats } from "@/lib/firebase/services/analytics-service";
import type { Order, Product } from "@/lib/types";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashboardStats, latestOrders, topProducts] = await Promise.all([
          getDashboardStats(),
          getAllOrders(), // we'll slice first 5 in component
          getFeaturedProducts() // using featured as top products for now
        ]);
        setStats(dashboardStats);
        setOrders(latestOrders);
        setProducts(topProducts);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return <div className="flex h-[50vh] items-center justify-center text-safra-muted">{t("loading")}</div>;
  }

  const statCards = [
    { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, trend: 12, trendLabel: "vs last month" },
    { title: "Monthly Revenue", value: `$${stats.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, trend: 5, trendLabel: "vs last month" },
    { title: t("totalOrders"), value: stats.ordersCount, icon: ShoppingBag, trend: 8, trendLabel: "vs last month" },
    { title: t("pendingOrders"), value: stats.pendingOrdersCount, icon: Clock },
    { title: "Total Customers", value: stats.customersCount, icon: Users, trend: 15, trendLabel: "vs last month" },
    { title: t("totalProducts"), value: stats.productsCount, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-safra-dark">{t("dashboard")}</h1>
        <p className="mt-1 text-safra-muted">{t("dashboardDesc")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={products} />
        </div>
      </div>

      <div>
        <LatestOrdersTable orders={orders} />
      </div>
    </div>
  );
}
