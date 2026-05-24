"use client";

import { ReactNode, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("admin");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/admin");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-safra-muted">
        {t("loading")}
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-safra-dark">{t("accessDenied")}</h1>
        <p className="mt-2 text-safra-muted">{t("accessDeniedDesc")}</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>{t("backToStore")}</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
