"use client";

import { FormEvent, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/context/CartContext";
import { createOrder } from "@/lib/firebase/services/orders-service";
import { getShippingInfo } from "@/lib/firebase/services/shipping-service";
import { useAuth } from "@/lib/context/AuthContext";
import { getProductName } from "@/lib/types";
import type { ShippingZone, PaymentMethod, Locale } from "@/lib/types";
import Price from "@/components/ui/Price";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle, MapPin, CreditCard, Wallet, Banknote, ShieldCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Tag } from "lucide-react";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  const router = useRouter();
  
  const { user } = useAuth();
  const { items, totalPrice, clearCart, appliedCoupon } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Shipping
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [defaultFee, setDefaultFee] = useState(0);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [shippingFee, setShippingFee] = useState(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  useEffect(() => {
    async function loadShipping() {
      try {
        const info = await getShippingInfo();
        if (info) {
          const z = info.shippingZones || [];
          setZones(z);
          setDefaultFee(info.shippingFee || 0);
          if (z.length > 0) {
            setSelectedZone(z[0].name.en);
            setShippingFee(z[0].fee);
          } else {
            setShippingFee(info.shippingFee || 0);
          }
        }
      } catch (err) {
        console.error("Failed to load shipping info", err);
      }
    }
    loadShipping();
  }, []);

  const handleZoneChange = (zoneKey: string) => {
    setSelectedZone(zoneKey);
    if (zoneKey === "__default__") {
      setShippingFee(defaultFee);
    } else {
      const zone = zones.find(z => z.name.en === zoneKey);
      setShippingFee(zone ? zone.fee : defaultFee);
    }
  };

  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push("/cart");
    }
  }, [items.length, success, router]);

  if (items.length === 0 && !success) {
    return null;
  }

  if (success) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50 mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-safra-dark">{t("success")}</h1>
        <p className="mt-3 max-w-md text-lg text-safra-muted">{t("successDesc")}</p>
        <Link href="/products" className="mt-10 inline-block w-full sm:w-auto">
          <Button className="w-full h-14 px-10 text-lg rounded-full">{cartT("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  // Calculations
  const discountAmount = appliedCoupon ? (totalPrice * appliedCoupon.discountValue) / 100 : 0;
  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const shippingAddress = {
      fullName: form.get("fullName") as string,
      address: form.get("address") as string,
      city: selectedZone !== "__default__" ? selectedZone : (form.get("city") as string),
      postalCode: form.get("postalCode") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string || user?.email || "",
    };

    try {
      await createOrder({
        userId: user ? user.uid : "guest",
        items: items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          discountPrice: i.product.discountPrice,
          image: i.product.images?.[0] || i.product.image,
          quantity: i.quantity
        })),
        subtotal: totalPrice,
        shippingFee: shippingFee,
        discount: discountAmount,
        total: finalTotal,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        notes: form.get("notes") as string || "",
      });
      clearCart();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      toast.error(locale === "ar" ? "حدث خطأ أثناء إتمام الطلب" : "Failed to place order");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left Column - Form */}
      <div className="w-full lg:w-3/5 px-4 py-10 sm:px-10 lg:px-20 xl:px-32">
        <nav className="mb-10 flex items-center gap-2 text-sm text-safra-muted">
          <Link href="/cart" className="hover:text-safra-gold transition-colors">{cartT("title")}</Link>
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          <span className="font-semibold text-safra-dark">{t("title")}</span>
        </nav>

        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-12">
          {/* Contact & Shipping Section */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-safra-dark">{t("shippingInfo")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input name="fullName" label={t("fullName")} required className="h-12 bg-transparent" />
              </div>
              <div className="sm:col-span-1">
                <Input name="phone" label={t("phone")} type="tel" required className="h-12 bg-transparent" />
              </div>
              <div className="sm:col-span-1">
                <Input name="email" label={isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"} type="email" className="h-12 bg-transparent" />
              </div>
              
              <div className="sm:col-span-2 space-y-1.5 mt-2">
                <label className="text-sm font-medium text-safra-dark block">{t("city")}</label>
                {zones.length > 0 ? (
                  <select
                    value={selectedZone}
                    onChange={e => handleZoneChange(e.target.value)}
                    className="w-full rounded-lg border border-safra-taupe/60 bg-transparent px-4 py-3 text-safra-dark focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold transition-colors"
                  >
                    {zones.map(z => (
                      <option key={z.name.en} value={z.name.en}>
                        {isAr ? z.name.ar : z.name.en}
                      </option>
                    ))}
                    <option value="__default__">{isAr ? "أخرى" : "Other"}</option>
                  </select>
                ) : (
                  <Input name="city" label="" required className="h-12 bg-transparent" />
                )}
              </div>
              
              <div className="sm:col-span-2">
                <Input name="address" label={t("address")} required className="h-12 bg-transparent" />
              </div>
              
              <div className="sm:col-span-2">
                <Input name="postalCode" label={t("postalCode")} className="h-12 bg-transparent" />
              </div>
              
              <div className="sm:col-span-2 space-y-1.5 mt-2">
                <label className="text-sm font-medium text-safra-dark block">{isAr ? "ملاحظات إضافية" : "Order Notes"}</label>
                <textarea 
                  name="notes" 
                  rows={3} 
                  className="w-full rounded-lg border border-safra-taupe/60 bg-transparent p-4 text-safra-dark placeholder:text-safra-muted focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold transition-colors resize-none" 
                  placeholder={isAr ? "أي ملاحظات خاصة بالتوصيل؟" : "Any special delivery instructions?"}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-safra-dark">{isAr ? "طريقة الدفع" : "Payment Method"}</h2>
            <div className="space-y-3">
              <label className={`group flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-all duration-200 ${paymentMethod === "cod" ? "border-safra-gold bg-safra-gold/5 ring-1 ring-safra-gold" : "border-safra-taupe/30 hover:border-safra-taupe/60 bg-transparent"}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === "cod" ? "border-safra-gold" : "border-safra-taupe"}`}>
                    {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-safra-gold" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-safra-dark">{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
                    <span className="text-sm text-safra-muted">{isAr ? "ادفع نقداً عند استلام طلبك" : "Pay in cash when your order arrives"}</span>
                  </div>
                </div>
                <Banknote className="h-6 w-6 text-safra-gold opacity-80" />
              </label>
              
              <label className={`group flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-all duration-200 ${paymentMethod === "card" ? "border-safra-gold bg-safra-gold/5 ring-1 ring-safra-gold" : "border-safra-taupe/30 hover:border-safra-taupe/60 bg-transparent"}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === "card" ? "border-safra-gold" : "border-safra-taupe"}`}>
                    {paymentMethod === "card" && <div className="h-2.5 w-2.5 rounded-full bg-safra-gold" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-safra-dark">{isAr ? "البطاقة الائتمانية" : "Credit Card"}</span>
                    <span className="text-sm text-safra-muted">{isAr ? "دفع آمن وسريع" : "Fast and secure payment"}</span>
                  </div>
                </div>
                <CreditCard className="h-6 w-6 text-safra-gold opacity-80" />
              </label>

              <label className={`group flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-all duration-200 ${paymentMethod === "bank_transfer" ? "border-safra-gold bg-safra-gold/5 ring-1 ring-safra-gold" : "border-safra-taupe/30 hover:border-safra-taupe/60 bg-transparent"}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === "bank_transfer" ? "border-safra-gold" : "border-safra-taupe"}`}>
                    {paymentMethod === "bank_transfer" && <div className="h-2.5 w-2.5 rounded-full bg-safra-gold" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-safra-dark">{isAr ? "تحويل بنكي" : "Bank Transfer"}</span>
                    <span className="text-sm text-safra-muted">{isAr ? "تحويل مباشر لحسابنا" : "Direct transfer to our account"}</span>
                  </div>
                </div>
                <Wallet className="h-6 w-6 text-safra-gold opacity-80" />
              </label>
            </div>
          </section>

          {/* Mobile Submit Button (Hidden on Desktop) */}
          <div className="lg:hidden">
            <Button type="submit" form="checkout-form" loading={loading} className="w-full h-14 text-lg font-bold rounded-full shadow-lg">
              {t("placeOrder")}
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-safra-muted">
              <ShieldCheck className="h-4 w-4" />
              <span>{isAr ? "معلوماتك مشفرة ومحمية بالكامل" : "Your information is secure and encrypted"}</span>
            </div>
          </div>
        </form>
      </div>

      {/* Right Column - Order Summary */}
      <div className="w-full lg:w-2/5 bg-safra-light/10 border-t lg:border-t-0 lg:border-s border-safra-taupe/20 px-4 py-10 sm:px-10 lg:px-12 xl:px-16 flex flex-col h-full sticky top-0">
        <h2 className="text-xl font-bold text-safra-dark mb-6">{t("orderSummary")}</h2>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[40vh] lg:max-h-[50vh] mb-6">
          <ul className="space-y-4">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-safra-taupe/20 bg-white">
                  <Image 
                    src={product.images?.[0] || product.image} 
                    alt={getProductName(product, locale)} 
                    fill 
                    className="object-cover"
                  />
                  <span className="absolute -top-2 -end-2 flex h-5 w-5 items-center justify-center rounded-full bg-safra-dark text-[10px] font-bold text-white shadow-sm z-10">
                    {quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <span className="font-medium text-safra-dark line-clamp-2 text-sm">
                    {getProductName(product, locale)}
                  </span>
                  <span className="text-xs text-safra-muted mt-1">
                    <Price amount={product.discountPrice || product.price} /> {isAr ? "للقطعة" : "each"}
                  </span>
                </div>
                <div className="font-bold text-safra-dark whitespace-nowrap">
                  <Price amount={(product.discountPrice || product.price) * quantity} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto space-y-4 border-t border-safra-taupe/20 pt-6">
          <div className="flex justify-between text-safra-dark">
            <span>{cartT("subtotal")}</span>
            <span className="font-medium"><Price amount={totalPrice} /></span>
          </div>
          
          {appliedCoupon && (
            <div className="flex justify-between text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {isAr ? "الخصم" : "Discount"} ({appliedCoupon.discountValue}%)
              </span>
              <span>-<Price amount={discountAmount} /></span>
            </div>
          )}

          <div className="flex justify-between text-safra-dark">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-safra-muted" />
              <span>{cartT("shipping")}</span>
            </div>
            <span className="font-medium">
              {shippingFee === 0 ? <span className="text-green-600 uppercase text-xs font-bold tracking-wider">{cartT("free")}</span> : <Price amount={shippingFee} />}
            </span>
          </div>
          
          <div className="flex justify-between border-t border-safra-taupe/20 pt-5 text-2xl font-black text-safra-dark mt-2">
            <span>{cartT("total")}</span>
            <Price amount={finalTotal} />
          </div>
        </div>

        {/* Desktop Submit Button */}
        <div className="hidden lg:block mt-8">
          <Button type="submit" form="checkout-form" loading={loading} className="w-full h-14 text-lg font-bold rounded-full shadow-lg hover:-translate-y-0.5 transition-transform">
            {t("placeOrder")}
          </Button>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-safra-muted">
            <ShieldCheck className="h-4 w-4" />
            <span>{isAr ? "معلوماتك مشفرة ومحمية بالكامل" : "Your information is secure and encrypted"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
