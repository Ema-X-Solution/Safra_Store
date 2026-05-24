"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/context/CartContext";
import { getProductName } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto h-16 w-16 text-safra-taupe" />
        <h1 className="mt-6 text-2xl font-bold text-safra-dark">{t("empty")}</h1>
        <p className="mt-2 text-safra-muted">{t("emptyDesc")}</p>
        <Link href="/products" className="mt-8 inline-block">
          <Button>{t("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-safra-dark">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-xl border border-safra-taupe/40 bg-white p-4 shadow-sm"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={getProductName(product, locale)}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-safra-dark">
                      {getProductName(product, locale)}
                    </h3>
                    <p className="text-safra-deep-gold">{formatPrice(product.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-safra-muted transition-colors hover:text-red-600"
                    aria-label={t("remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-safra-muted">{t("quantity")}:</span>
                  <div className="flex items-center rounded-md border border-safra-taupe">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1.5 text-safra-olive hover:text-safra-dark"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-1.5 text-safra-olive hover:text-safra-dark"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-safra-dark">{t("total")}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-safra-muted">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-safra-muted">
              <span>{t("shipping")}</span>
              <span>{t("free")}</span>
            </div>
            <div className="flex justify-between border-t border-safra-taupe/30 pt-2 text-lg font-bold text-safra-dark">
              <span>{t("total")}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button className="w-full">{t("checkout")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
