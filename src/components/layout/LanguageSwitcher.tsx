"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center rounded-lg border border-safra-taupe bg-white/60 p-0.5">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={cn(
            "rounded-md px-1.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium transition-colors",
            locale === loc
              ? "bg-safra-gold text-safra-dark shadow-sm"
              : "text-safra-olive hover:text-safra-dark"
          )}
          aria-label={loc === "ar" ? "العربية" : "English"}
        >
          {loc === "ar" ? "ع" : "EN"}
        </button>
      ))}
    </div>
  );
}
