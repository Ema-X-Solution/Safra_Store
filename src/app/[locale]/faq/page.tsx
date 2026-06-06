"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getFAQs } from "@/lib/firebase/services/faq-service";
import type { FAQ } from "@/lib/types";
import AnimatedFAQ from "@/components/home/AnimatedFAQ";
import type { Locale } from "@/i18n/routing";

export default function FAQPage() {
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFAQs()
      .then(setFaqs)
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

  if (faqs.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-dashed border-safra-taupe/40 bg-white p-12 text-center text-safra-muted">
          {isAr ? "لا توجد أسئلة شائعة حالياً." : "No FAQs available at the moment."}
        </div>
      </div>
    );
  }

  return (
    <AnimatedFAQ
      faqs={faqs}
      locale={locale}
      title={isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
      readMoreText=""
    />
  );
}
