"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-safra-muted">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
