"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { createOrder } from "@/lib/firebase/firestore";
import { getProductName } from "@/lib/types";
import Price from "@/components/ui/Price";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-safra-muted">{t("loginRequired")}</p>
        <Link href="/login" className="mt-4 inline-block">
          <Button>{t("loginRequired")}</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !success) {
    router.push("/cart");
    return null;
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-safra-gold" />
        <h1 className="mt-6 text-2xl font-bold text-safra-dark">{t("success")}</h1>
        <p className="mt-2 text-safra-muted">{t("successDesc")}</p>
        <Link href="/products" className="mt-8 inline-block">
          <Button variant="secondary">{cartT("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const shippingAddress = {
      fullName: form.get("fullName") as string,
      address: form.get("address") as string,
      city: form.get("city") as string,
      postalCode: form.get("postalCode") as string,
      phone: form.get("phone") as string,
    };

    try {
      await createOrder(user!.uid, items, totalPrice, shippingAddress);
      clearCart();
      setSuccess(true);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-safra-dark">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-safra-dark">{t("shippingInfo")}</h2>
          <Input name="fullName" label={t("fullName")} required />
          <Input name="address" label={t("address")} required />
          <Input name="city" label={t("city")} required />
          <Input name="postalCode" label={t("postalCode")} required />
          <Input name="phone" label={t("phone")} type="tel" required />
          <Button type="submit" loading={loading} className="w-full">
            {t("placeOrder")}
          </Button>
        </form>

        <div className="h-fit rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-safra-dark">{t("orderSummary")}</h2>
          <ul className="mt-4 space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span className="text-safra-olive">
                  {getProductName(product, locale)} × {quantity}
                </span>
                <span className="font-medium">
                  <Price amount={product.price * quantity} />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-safra-taupe/30 pt-4 text-lg font-bold text-safra-dark">
            <span>{cartT("total")}</span>
            <Price amount={totalPrice} />
          </div>
        </div>
      </div>
    </div>
  );
}
