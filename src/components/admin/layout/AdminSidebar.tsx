"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Ticket,
  ShoppingBag,
  Users,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Truck
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sections = [
    {
      title: t("dashboard"),
      links: [{ href: "/admin", icon: LayoutDashboard, label: t("dashboard") }],
    },
    {
      title: t("catalog"),
      links: [
        { href: "/admin/products", icon: Package, label: t("products") },
        { href: "/admin/categories", icon: FolderOpen, label: t("categories") },
        { href: "/admin/coupons", icon: Ticket, label: t("coupons") },
      ],
    },
    {
      title: t("sales"),
      links: [
        { href: "/admin/orders", icon: ShoppingBag, label: t("orders") },
        { href: "/admin/customers", icon: Users, label: t("customers") },
      ],
    },
    {
      title: t("content"),
      links: [
        { href: "/admin/faq", icon: FileText, label: t("faq") },
        { href: "/admin/shipping", icon: Truck, label: t("shipping") },
        { href: "/admin/messages", icon: MessageSquare, label: t("messages") },
      ],
    },
    {
      title: t("settings"),
      links: [{ href: "/admin/settings", icon: Settings, label: t("settings") }],
    },
  ];

  const content = (
    <div className="flex h-full flex-col bg-white border-e border-safra-taupe/40 shadow-sm transition-all duration-300">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-safra-taupe/40">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-safra-gold">
              <Image src="/logo.png" alt="Logo" width={24} height={24} />
            </div>
            <span className="font-bold text-safra-dark truncate">Safra Admin</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-safra-gold">
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
          </div>
        )}

        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="text-safra-olive hover:text-safra-dark">
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-safra-olive hover:text-safra-dark"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {sections.map((section, i) => (
          <div key={i} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-safra-muted">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.links.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      collapsed ? "justify-center" : "gap-3",
                      active
                        ? "bg-safra-gold text-safra-dark shadow-sm"
                        : "text-safra-olive hover:bg-safra-light/50 hover:text-safra-dark"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-safra-dark" : "text-safra-olive")} />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block h-screen sticky top-0 z-40 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-safra-dark/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80%] h-full transform transition-transform duration-300 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
