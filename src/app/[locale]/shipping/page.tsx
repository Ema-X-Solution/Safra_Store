"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getShippingInfo } from "@/lib/firebase/services/shipping-service";
import { getBilingualText, type ShippingInfo, type ShippingZone } from "@/lib/types";
import { Truck, MapPin, Clock, FileText, DollarSign } from "lucide-react";

export default function ShippingPage() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const [info, setInfo] = useState<ShippingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShippingInfo()
      .then(setInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-safra-muted">
        {isAr ? "جارِ التحميل..." : "Loading..."}
      </div>
    );
  }

  const zones = info?.shippingZones || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <Truck className="mx-auto h-14 w-14 text-safra-gold mb-4" />
        <h1 className="text-3xl font-bold text-safra-dark sm:text-4xl">
          {isAr ? "معلومات الشحن و التوصيل" : "Shipping & Delivery Information"}
        </h1>
        <p className="mt-3 text-safra-muted">
          {isAr
            ? "كل ما تحتاج معرفته عن سياسة الشحن والتوصيل لدينا."
            : "Everything you need to know about our shipping and delivery policies."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ── Left/Start Column: Info Cards ── */}
        <div className="space-y-8 order-2 lg:order-1">
          {/* Delivery Times */}
          {info?.deliveryTimes && getBilingualText(info.deliveryTimes, locale) && (
            <div className="rounded-2xl border border-safra-taupe/30 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                  <Clock className="h-5 w-5 text-safra-gold" />
                </div>
                <h2 className="text-xl font-bold text-safra-dark">
                  {isAr ? "مواعيد التوصيل" : "Delivery Times"}
                </h2>
              </div>
              <p className="text-safra-muted leading-relaxed whitespace-pre-line">
                {getBilingualText(info.deliveryTimes, locale)}
              </p>
            </div>
          )}

          {/* Delivery Areas */}
          {info?.deliveryAreas && getBilingualText(info.deliveryAreas, locale) && (
            <div className="rounded-2xl border border-safra-taupe/30 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                  <DollarSign className="h-5 w-5 text-safra-gold" />
                </div>
                <h2 className="text-xl font-bold text-safra-dark">
                  {isAr ? "نطاق التوصيل" : "Delivery Areas"}
                </h2>
              </div>
              <p className="text-safra-muted leading-relaxed whitespace-pre-line">
                {getBilingualText(info.deliveryAreas, locale)}
              </p>
            </div>
          )}

          {/* Shipping Policy */}
          {info?.policy && getBilingualText(info.policy, locale) && (
            <div className="rounded-2xl border border-safra-taupe/30 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                  <FileText className="h-5 w-5 text-safra-gold" />
                </div>
                <h2 className="text-xl font-bold text-safra-dark">
                  {isAr ? "سياسة الشحن" : "Shipping Policy"}
                </h2>
              </div>
              <p className="text-safra-muted leading-relaxed whitespace-pre-line">
                {getBilingualText(info.policy, locale)}
              </p>
            </div>
          )}
        </div>

        {/* ── Right/End Column: Zones Table ── */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-24">
          {zones.length > 0 && (
            <div className="rounded-2xl border border-safra-taupe/30 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-safra-gold/20">
                  <MapPin className="h-5 w-5 text-safra-gold" />
                </div>
                <h2 className="text-xl font-bold text-safra-dark">
                  {isAr ? "مناطق التوصيل و الأسعار" : "Delivery Zones & Pricing"}
                </h2>
              </div>
              <div className="overflow-hidden rounded-xl border border-safra-taupe/20">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-safra-light/30">
                      <th className="px-6 py-3 text-start font-semibold text-safra-dark">
                        {isAr ? "المنطقة" : "Zone"}
                      </th>
                      <th className="px-6 py-3 text-end font-semibold text-safra-dark">
                        {isAr ? "رسوم التوصيل" : "Delivery Fee"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone, i) => (
                      <tr key={i} className="border-t border-safra-taupe/15 hover:bg-safra-light/10 transition">
                        <td className="px-6 py-4 font-medium text-safra-dark">
                          {getBilingualText(zone.name, locale)}
                        </td>
                        <td className="px-6 py-4 text-end text-safra-olive font-semibold">
                          {zone.fee === 0 ? (
                            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              {isAr ? "مجاني" : "Free"}
                            </span>
                          ) : (
                            <>{zone.fee} {isAr ? "ج.م" : "EGP"}</>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {info?.shippingFee !== undefined && info.shippingFee > 0 && (
                <p className="mt-4 text-sm text-safra-muted">
                  {isAr
                    ? `* المناطق الغير مذكورة: رسوم التوصيل الافتراضية ${info.shippingFee} ج.م`
                    : `* Unlisted areas: Default shipping fee is ${info.shippingFee} EGP`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* No info fallback */}
        {!info && (
          <div className="col-span-full rounded-xl border border-dashed border-safra-taupe/40 bg-white p-12 text-center text-safra-muted">
            {isAr ? "لا تتوفر معلومات شحن حالياً." : "No shipping information available at the moment."}
          </div>
        )}
      </div>
    </div>
  );
}
