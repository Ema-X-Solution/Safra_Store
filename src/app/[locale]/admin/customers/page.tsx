"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import CustomersTable from "@/components/admin/customers/CustomersTable";
import { getCustomers } from "@/lib/firebase/services/customers-service";
import type { Customer } from "@/lib/types";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-safra-dark">Customers</h1>
        <p className="mt-1 text-sm text-safra-muted">View and manage your store customers.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-safra-taupe/40 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-safra-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-safra-taupe/40 focus:outline-none focus:ring-1 focus:ring-safra-gold"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-safra-muted">Loading...</div>
      ) : (
        <CustomersTable customers={filteredCustomers} />
      )}
    </div>
  );
}
