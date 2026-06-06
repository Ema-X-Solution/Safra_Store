"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { FAQ } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { getBilingualText } from "@/lib/types";
import { Link } from "@/i18n/navigation";

interface AnimatedFAQProps {
  faqs: FAQ[];
  locale: Locale;
  title: string;
  readMoreText: string;
}

export default function AnimatedFAQ({ faqs, locale, title, readMoreText }: AnimatedFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <HelpCircle className="mx-auto h-14 w-14 text-safra-gold mb-4" />
        <h2 className="text-3xl font-bold text-safra-dark md:text-4xl">{title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={faq.id} 
              className={`rounded-2xl border bg-white shadow-sm transition-all duration-300 h-max ${
                isOpen ? "border-safra-gold shadow-md" : "border-safra-taupe/30 hover:border-safra-gold/50"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full cursor-pointer items-center justify-between p-6 text-start font-semibold text-safra-dark focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-lg">{getBilingualText(faq.question, locale)}</span>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? "bg-safra-gold text-white" : "bg-safra-light text-safra-gold"}`}>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              <div 
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 leading-relaxed text-safra-muted">
                    {getBilingualText(faq.answer, locale)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {readMoreText && (
        <div className="mt-10 text-center">
          <Link href="/faq" className="inline-flex items-center gap-2 text-safra-olive font-semibold hover:text-safra-dark transition">
            {readMoreText}
          </Link>
        </div>
      )}
    </section>
  );
}
