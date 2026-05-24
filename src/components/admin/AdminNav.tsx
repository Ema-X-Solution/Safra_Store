"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag, LayoutDashboard, FolderOpen } from "lucide-react";

const links = [
  { href: "/admin", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/admin/categories", icon: FolderOpen, key: "categories" as const },
  { href: "/admin/products", icon: Package, key: "products" as const },
  { href: "/admin/orders", icon: ShoppingBag, key: "orders" as const },
];

export default function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-b border-safra-taupe/40 bg-white p-4 md:w-56 md:border-b-0 md:border-e md:min-h-[calc(100vh-80px)]">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wide text-safra-muted">
        {t("panel")}
      </p>
      {links.map(({ href, icon: Icon, key }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-safra-gold text-safra-dark"
                : "text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark"
            )}
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
