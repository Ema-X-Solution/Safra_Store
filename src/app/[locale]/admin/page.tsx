"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Package, ShoppingBag, Clock, Users, DollarSign, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/firebase/services/analytics-service";
import { getAllOrders } from "@/lib/firebase/services/orders-service";
import { getProducts } from "@/lib/firebase/services/products-service";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import LatestOrdersTable from "@/components/admin/dashboard/LatestOrdersTable";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import type { DashboardStats } from "@/lib/firebase/services/analytics-service";
import type { Order, Product } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2020 + 1 }, (_, i) => 2020 + i);

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState<string | number>("all");

  useEffect(() => {
    async function load() {
      try {
        const [dashboardStats, latestOrders, allProducts] = await Promise.all([
          getDashboardStats(),
          getAllOrders(),
          getProducts(),
        ]);
        setStats(dashboardStats);
        setOrders(latestOrders);
        setProducts(allProducts);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── Dynamic stats based on filters ────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status === "cancelled") return false;
      const d = "seconds" in o.createdAt
        ? new Date(o.createdAt.seconds * 1000)
        : new Date(o.createdAt as any);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== "all" && d.getMonth() !== Number(selectedMonth)) return false;
      return true;
    });
  }, [orders, selectedYear, selectedMonth]);

  const allPeriodOrders = useMemo(() => {
    return orders.filter(o => {
      const d = "seconds" in o.createdAt
        ? new Date(o.createdAt.seconds * 1000)
        : new Date(o.createdAt as any);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== "all" && d.getMonth() !== Number(selectedMonth)) return false;
      return true;
    });
  }, [orders, selectedYear, selectedMonth]);

  const dynamicRevenue = useMemo(
    () => filteredOrders.reduce((s, o) => s + o.total, 0),
    [filteredOrders]
  );

  const dynamicOrdersCount = allPeriodOrders.length;
  const dynamicPendingCount = allPeriodOrders.filter(o => o.status === "pending").length;

  if (loading || !stats) {
    return <div className="flex h-[50vh] items-center justify-center text-safra-muted">{t("loading")}</div>;
  }

  const statCards = [
    { title: "Total Revenue", value: `$${dynamicRevenue.toFixed(2)}`, icon: DollarSign },
    { title: t("totalOrders"), value: dynamicOrdersCount, icon: ShoppingBag },
    { title: t("pendingOrders"), value: dynamicPendingCount, icon: Clock },
    { title: "Total Customers", value: stats.customersCount, icon: Users },
    { title: t("totalProducts"), value: stats.productsCount, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{t("dashboard")}</h1>
          <p className="mt-1 text-safra-muted">{t("dashboardDesc")}</p>
        </div>

        {/* ─── Filters ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-lg border border-safra-taupe/40 bg-white px-4 py-2 text-sm text-safra-dark focus:outline-none focus:ring-1 focus:ring-safra-gold"
          >
            <option value="all">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-safra-taupe/40 bg-white px-4 py-2 text-sm text-safra-dark focus:outline-none focus:ring-1 focus:ring-safra-gold"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      {/* ─── Chart + Top Products ───────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2">
          <RevenueChart
            orders={orders}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </div>
        <div className="lg:col-span-1 h-full">
          <TopProducts products={products} />
        </div>
      </div>

      {/* ─── Latest Orders ──────────────────────────────────────────── */}
      <div>
        <LatestOrdersTable orders={orders} />
      </div>
    </div>
  );
}
