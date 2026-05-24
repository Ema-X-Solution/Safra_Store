"use client";

import { FormEvent, useState, useEffect } from "react";
import { FirebaseError } from "firebase/app";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/context/AuthContext";
import { isAdminEmail } from "@/lib/admin";
import { checkIsAdmin } from "@/lib/firebase/admin-firestore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "emailInUse";
      case "auth/weak-password":
        return "weakPassword";
      case "auth/invalid-email":
        return "invalidEmail";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "loginError";
      case "auth/too-many-requests":
        return "tooManyRequests";
      default:
        return fallback;
    }
  }
  return fallback;
}

export default function LoginForm() {
  const t = useTranslations("auth");
  const { user, isAdmin, loading: authLoading, configured, setUserFromLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectParam = searchParams.get("redirect");
  const wantsAdmin = redirectParam === "/admin" || redirectParam?.startsWith("/admin");

  useEffect(() => {
    if (!authLoading && user) {
      const target = wantsAdmin || isAdmin ? "/admin" : "/";
      router.replace(target);
    }
  }, [authLoading, user, isAdmin, wantsAdmin, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const name = form.get("name") as string;

    try {
      const authUser = isRegister
        ? await signUp(email, password, name)
        : await signIn(email, password);

      setUserFromLogin(authUser);

      const admin =
        wantsAdmin || isAdminEmail(authUser.email) || (await checkIsAdmin(authUser.uid));

      router.replace(admin ? "/admin" : "/");
    } catch (err) {
      const key = getAuthErrorMessage(
        err,
        isRegister ? "registerError" : "loginError"
      );
      setError(
        t(
          key as
            | "registerError"
            | "loginError"
            | "emailInUse"
            | "weakPassword"
            | "invalidEmail"
            | "tooManyRequests"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-safra-taupe/40 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-safra-dark">
          {isRegister ? t("registerTitle") : t("loginTitle")}
        </h1>

        {!configured && (
          <p className="mt-4 rounded-lg bg-safra-light/50 p-3 text-sm text-safra-deep-gold">
            {t("firebaseNotConfigured")}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <Input name="name" label={t("name")} required autoComplete="name" />
          )}
          <Input name="email" type="email" label={t("email")} required autoComplete="email" />
          <Input
            name="password"
            type="password"
            label={t("password")}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" loading={loading} disabled={!configured}>
            {isRegister ? t("registerBtn") : t("loginBtn")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-safra-muted">
          {isRegister ? t("hasAccount") : t("noAccount")}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="font-medium text-safra-gold hover:text-safra-deep-gold"
          >
            {isRegister ? t("switchToLogin") : t("switchToRegister")}
          </button>
        </p>
      </div>
    </div>
  );
}
