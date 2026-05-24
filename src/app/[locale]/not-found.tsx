"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

export default function NotFoundPage() {
  const t = useTranslations("products");

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-safra-dark">{t("notFound")}</h1>
      <Link href="/products" className="mt-8 inline-block">
        <Button>{t("backToProducts")}</Button>
      </Link>
    </div>
  );
}
