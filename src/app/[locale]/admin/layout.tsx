import AdminGuard from "@/components/admin/AdminGuard";
import AdminNav from "@/components/admin/AdminNav";
import AdminNotifications from "@/components/admin/AdminNotifications";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-end border-b border-safra-taupe/30 px-4 py-2 sm:px-6">
          <AdminNotifications />
        </div>
        <div className="flex flex-col md:flex-row">
          <AdminNav />
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </AdminGuard>
  );
}
