"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CustomersTable from "@/components/admin/customers/CustomersTable";
import CustomerModal from "@/components/admin/customers/CustomerModal";
import { getCustomers, createCustomer } from "@/lib/firebase/services/customers-service";
import type { Customer } from "@/lib/types";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const t = useTranslations("admin");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCustomers(await getCustomers());
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    return c.name.toLowerCase().includes(term) || 
           c.email.toLowerCase().includes(term) || 
           c.phone.includes(term);
  });

  const handleSaveCustomer = async (data: { name: string; email: string; phone: string }) => {
    try {
      await createCustomer(data);
      toast.success("Customer added successfully");
      load();
    } catch (err) {
      toast.error("Failed to add customer");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-safra-dark">{t("customers")}</h1>
          <p className="mt-1 text-sm text-safra-muted">{t("customersDesc")}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          {t("addCustomer")}
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-safra-taupe/40 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-safra-muted" />
          <input
            type="text"
            placeholder={t("searchCustomers")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-safra-taupe/40 focus:outline-none focus:ring-1 focus:ring-safra-gold"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">{t("loading")}</div>
      ) : (
        <CustomersTable customers={filteredCustomers} />
      )}

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
