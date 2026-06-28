"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/context/CartContext";
import { getProductName, toDate } from "@/lib/types";
import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { useState } from "react";
import { getCouponByCode } from "@/lib/firebase/services/coupons-service";
import { toast } from "sonner";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { items, updateQuantity, removeItem, totalPrice, appliedCoupon, setCoupon } = useCart();
  
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || "");
  const [applying, setApplying] = useState(false);

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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setApplying(true);
    try {
      const coupon = await getCouponByCode(couponCode.trim());
      if (!coupon) {
        toast.error(locale === "ar" ? "كود خصم غير صالح" : "Invalid coupon code");
        return;
      }
      
      const now = new Date();
      if (coupon.expiryDate && toDate(coupon.expiryDate) < now) {
        toast.error(locale === "ar" ? "كود الخصم منتهي الصلاحية" : "Coupon is expired");
        return;
      }
      
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        toast.error(locale === "ar" ? "تم الوصول للحد الأقصى لاستخدام الكوبون" : "Coupon usage limit reached");
        return;
      }

      setCoupon({ code: coupon.code, discountValue: coupon.discountValue });
      toast.success(locale === "ar" ? "تم تطبيق الخصم بنجاح" : "Coupon applied successfully");
    } catch (err) {
      toast.error(locale === "ar" ? "حدث خطأ أثناء تطبيق الخصم" : "Failed to apply coupon");
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
  };

  const discountAmount = appliedCoupon ? (totalPrice * appliedCoupon.discountValue) / 100 : 0;
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-safra-dark">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity, selectedWeight }) => {
            // Determine effective price for this cart item
            const effectivePrice = selectedWeight
              ? (selectedWeight.discountPrice && selectedWeight.discountPrice < selectedWeight.price
                  ? selectedWeight.discountPrice
                  : selectedWeight.price)
              : (product.discountPrice || product.price);
            const originalPrice = selectedWeight ? selectedWeight.price : product.price;
            const hasItemDiscount = selectedWeight
              ? !!(selectedWeight.discountPrice && selectedWeight.discountPrice < selectedWeight.price)
              : !!(product.discountPrice && product.discountPrice < product.price);
            const cartKey = selectedWeight ? `${product.id}__${selectedWeight.id}` : product.id;
            return (
            <div
              key={cartKey}
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
                    {selectedWeight && (
                      <span className="inline-block mt-0.5 rounded-full bg-safra-light/60 border border-safra-taupe/30 px-2 py-0.5 text-xs font-medium text-safra-olive">
                        {selectedWeight.value} {selectedWeight.unit}
                      </span>
                    )}
                    <p className="mt-1 text-safra-deep-gold font-medium">
                      <Price amount={effectivePrice} />
                      {hasItemDiscount && (
                        <span className="ml-2 text-sm text-safra-muted line-through">
                          <Price amount={originalPrice} />
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(product.id, selectedWeight?.id)}
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
                      onClick={() => updateQuantity(product.id, quantity - 1, selectedWeight?.id)}
                      className="p-1.5 text-safra-olive hover:text-safra-dark"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1, selectedWeight?.id)}
                      className="p-1.5 text-safra-olive hover:text-safra-dark"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* Coupon Section */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-safra-dark mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-safra-olive" />
              {locale === "ar" ? "كود الخصم" : "Discount Coupon"}
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-safra-light/30 border border-safra-gold/30 rounded-lg p-3">
                <div>
                  <span className="font-medium text-safra-dark uppercase">{appliedCoupon.code}</span>
                  <p className="text-sm text-safra-olive">{appliedCoupon.discountValue}% {locale === "ar" ? "خصم" : "Off"}</p>
                </div>
                <button onClick={removeCoupon} className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder={locale === "ar" ? "أدخل كود الخصم..." : "Enter coupon code..."}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-safra-taupe/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-safra-gold uppercase"
                />
                <Button type="submit" loading={applying} disabled={!couponCode.trim()}>
                  {locale === "ar" ? "تطبيق" : "Apply"}
                </Button>
              </form>
            )}
          </div>

          {/* Total Section */}
          <div className="rounded-xl border border-safra-taupe/40 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-safra-dark">{t("orderSummary")}</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-safra-muted">
                <span>{t("subtotal")}</span>
                <Price amount={totalPrice} />
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-safra-gold font-medium">
                  <span>{locale === "ar" ? "الخصم" : "Discount"} ({appliedCoupon.discountValue}%)</span>
                  <span>-<Price amount={discountAmount} /></span>
                </div>
              )}

              <div className="flex justify-between text-safra-muted">
                <span>{t("shipping")}</span>
                <span className="text-xs">{locale === "ar" ? "يتم حسابه عند الدفع" : "Calculated at checkout"}</span>
              </div>
              
              <div className="flex justify-between border-t border-safra-taupe/30 pt-3 text-lg font-bold text-safra-dark">
                <span>{t("total")}</span>
                <Price amount={finalTotal} />
              </div>
            </div>
            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full">{t("checkout")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
