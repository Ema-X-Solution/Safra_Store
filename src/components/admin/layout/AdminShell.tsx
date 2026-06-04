"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminGuard from "../AdminGuard";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-safra-cream/30 text-safra-dark font-sans">
        <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
