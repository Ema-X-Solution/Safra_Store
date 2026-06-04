"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
];

export default function RevenueChart() {
  const t = useTranslations("admin");

  return (
    <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-semibold text-safra-dark">Revenue Overview</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4dcbe" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8d8a5d", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8d8a5d", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "#f0eed6" }}
              contentStyle={{ borderRadius: "8px", border: "1px solid #b5ae83", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Bar dataKey="revenue" fill="#b9a81d" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
