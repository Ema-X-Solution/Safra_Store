"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, Store, UserCircle } from "lucide-react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import AdminNotifications from "../AdminNotifications";
import { useAuth } from "@/lib/context/AuthContext";
import { logOut } from "@/lib/firebase/auth";
import { useState } from "react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const t = useTranslations("admin");
  const { user, clearSession } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    await logOut();
    clearSession();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-safra-taupe/40 bg-white/80 px-4 backdrop-blur-md shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-safra-olive hover:text-safra-dark p-1 rounded-md hover:bg-safra-light/30 transition"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-safra-taupe/40 px-3 py-1.5 text-sm font-medium text-safra-olive transition-colors hover:bg-safra-light/30 hover:text-safra-dark"
        >
          <Store className="h-4 w-4" />
          {t("visitStore")}
        </Link>

        <LanguageSwitcher />

        <div className="h-6 w-px bg-safra-taupe/30" />

        <AdminNotifications />

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border border-safra-taupe/30 bg-safra-cream p-1 transition-colors hover:border-safra-gold"
          >
            <UserCircle className="h-7 w-7 text-safra-dark" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute end-0 top-full z-50 mt-2 w-56 rounded-xl border border-safra-taupe/40 bg-white shadow-lg py-2">
                <div className="px-4 py-2 border-b border-safra-taupe/20 mb-2">
                  <p className="text-sm font-semibold text-safra-dark truncate">{user?.displayName || "Admin"}</p>
                  <p className="text-xs text-safra-muted truncate">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-safra-gold/20 px-2 py-0.5 text-[10px] font-bold text-safra-deep-gold uppercase">
                    Super Admin
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  {t("logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
