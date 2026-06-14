"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Order } from "@/lib/types";

interface RevenueChartProps {
  orders: Order[];
  selectedYear: number;
  selectedMonth: string | number; // "all" or 0-11
}

export default function RevenueChart({ orders, selectedYear, selectedMonth }: RevenueChartProps) {
  const t = useTranslations("admin");

  const data = useMemo(() => {
    // Filter orders to selected year and exclude cancelled
    const validOrders = orders.filter(o => {
      if (o.status === "cancelled") return false;
      const d = "seconds" in o.createdAt ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt as string | number | Date);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== "all" && d.getMonth() !== Number(selectedMonth)) return false;
      return true;
    });

    if (selectedMonth === "all") {
      // Group by Month (12 buckets)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData = months.map(m => ({ name: m, revenue: 0 }));
      
      validOrders.forEach(o => {
        const d = "seconds" in o.createdAt ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt as string | number | Date);
        monthlyData[d.getMonth()].revenue += o.total;
      });
      return monthlyData;
    } else {
      // Group by Day of selected month
      const daysInMonth = new Date(selectedYear, Number(selectedMonth) + 1, 0).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString(),
        revenue: 0
      }));

      validOrders.forEach(o => {
        const d = "seconds" in o.createdAt ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt as string | number | Date);
        dailyData[d.getDate() - 1].revenue += o.total;
      });
      return dailyData;
    }
  }, [orders, selectedYear, selectedMonth]);

  return (
    <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm h-full flex flex-col min-w-0 overflow-hidden">
      <h3 className="mb-4 font-semibold text-safra-dark shrink-0">Revenue Overview</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {selectedMonth === "all" ? (
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4dcbe" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8d8a5d", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8d8a5d", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#f0eed6" }}
                contentStyle={{ borderRadius: "8px", border: "1px solid #b5ae83", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#b9a81d" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4dcbe" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8d8a5d", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8d8a5d", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #b5ae83", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, "Revenue"]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#b9a81d" strokeWidth={3} dot={{ fill: "#b9a81d", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
