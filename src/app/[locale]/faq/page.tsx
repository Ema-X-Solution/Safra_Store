"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getFAQs } from "@/lib/firebase/services/faq-service";
import { getBilingualText, type FAQ } from "@/lib/types";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function FAQPage() {
  const locale = useLocale() as "en" | "ar";
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <HelpCircle className="mx-auto h-14 w-14 text-safra-gold mb-4" />
        <h1 className="text-3xl font-bold text-safra-dark sm:text-4xl">
          {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h1>
        <p className="mt-3 text-safra-muted">
          {isAr
            ? "إجابات على أكثر الأسئلة شيوعاً حول متجرنا وخدماتنا."
            : "Answers to common questions about our store and services."}
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-safra-taupe/40 bg-white p-12 text-center text-safra-muted">
          {isAr ? "لا توجد أسئلة شائعة حالياً." : "No FAQs available at the moment."}
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={faq.id}
              className="group rounded-xl border border-safra-taupe/30 bg-white shadow-sm transition-shadow hover:shadow-md [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-safra-gold/20 text-sm font-bold text-safra-gold">
                    {index + 1}
                  </span>
                  <span className="text-lg font-semibold text-safra-dark">
                    {getBilingualText(faq.question, locale)}
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 text-safra-gold transition-transform duration-300 group-open:-rotate-180" />
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-safra-taupe/20 pt-4">
                  <p className="leading-relaxed text-safra-muted whitespace-pre-line">
                    {getBilingualText(faq.answer, locale)}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
