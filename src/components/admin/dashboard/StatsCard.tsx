import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // e.g. +5, -2
  trendLabel?: string;
  className?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, trendLabel, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-safra-muted">{title}</p>
          <p className="mt-2 text-3xl font-bold text-safra-dark">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safra-light/30">
          <Icon className="h-6 w-6 text-safra-gold" />
        </div>
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend !== undefined && (
            <span
              className={cn(
                "font-medium",
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-safra-olive"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
          {trendLabel && <span className="text-safra-muted">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
