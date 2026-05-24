"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { logOut } from "@/lib/firebase/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShoppingCart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { user, isAdmin, loading, clearSession } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
  ];

  async function handleLogout() {
    try {
      await logOut();
    } finally {
      clearSession();
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-safra-taupe/50 bg-safra-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold shadow-sm transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="Safra Store" width={40} height={40} />
          </div>
          <span className="text-xl font-bold text-safra-dark">
            {locale === "ar" ? (
              <>
                متجر <span className="text-safra-gold">سفرة</span>
              </>
            ) : (
              <>
                Safra <span className="text-safra-gold">Store</span>
              </>
            )}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-safra-gold",
                pathname === link.href ? "text-safra-gold" : "text-safra-olive"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-safra-olive transition-colors hover:bg-safra-light/50 hover:text-safra-dark"
            aria-label={t("cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-safra-bright text-xs font-bold text-safra-dark">
                {totalItems}
              </span>
            )}
          </Link>

          {!loading && (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg border border-safra-gold px-3 py-2 text-sm font-medium text-safra-gold transition-colors hover:bg-safra-gold hover:text-safra-dark md:block"
                >
                  {t("admin")}
                </Link>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="hidden rounded-lg bg-safra-olive px-4 py-2 text-sm font-medium text-safra-cream transition-colors hover:bg-safra-dark md:block"
                >
                  {t("logout")}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="hidden rounded-lg bg-safra-gold px-4 py-2 text-sm font-medium text-safra-dark transition-colors hover:bg-safra-deep-gold hover:text-safra-cream md:block"
                >
                  {t("login")}
                </Link>
              )}
            </>
          )}

          <button
            className="rounded-lg p-2 text-safra-olive md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-safra-taupe/30 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === link.href
                    ? "bg-safra-light text-safra-dark"
                    : "text-safra-olive"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!loading &&
              (isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-safra-gold px-3 py-2 text-sm font-medium text-safra-gold"
                >
                  {t("admin")}
                </Link>
              ) : null)}
            {!loading &&
              (user ? (
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-safra-olive px-3 py-2 text-start text-sm font-medium text-safra-cream"
                >
                  {t("logout")}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-safra-gold px-3 py-2 text-sm font-medium text-safra-dark"
                >
                  {t("login")}
                </Link>
              ))}
          </div>
        </nav>
      )}
    </header>
  );
}
