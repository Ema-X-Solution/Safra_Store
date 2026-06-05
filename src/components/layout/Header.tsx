"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";
import type { CMSSettings } from "@/lib/types";

export default function Header({ branding }: { branding?: CMSSettings['branding'] }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/contact", label: t("contact") },
  ];


  return (
    <header className="sticky top-0 z-50 border-b border-safra-taupe/50 bg-safra-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold shadow-sm transition-transform group-hover:scale-105 overflow-hidden relative">
            {branding?.logoUrl ? (
              <Image src={branding.logoUrl} alt="Store Logo" fill className="object-cover" />
            ) : (
              <Leaf className="h-5 w-5 text-safra-dark" />
            )}
          </div>
          <span className="text-xl font-bold text-safra-dark">
            {branding?.storeName ? branding.storeName[locale as 'en' | 'ar'] : (
              locale === "ar" ? (
                <>متجر <span className="text-safra-gold">سفرة</span></>
              ) : (
                <>Safra <span className="text-safra-gold">Store</span></>
              )
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
            href="/wishlist"
            className="relative rounded-lg p-2 text-safra-olive transition-colors hover:bg-safra-light/50 hover:text-safra-dark"
            aria-label={t("wishlist") || "Wishlist"}
          >
            <Heart className="h-5 w-5" />
            {totalWishlistItems > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalWishlistItems}
              </span>
            )}
          </Link>

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

          </div>
        </nav>
      )}
    </header>
  );
}
