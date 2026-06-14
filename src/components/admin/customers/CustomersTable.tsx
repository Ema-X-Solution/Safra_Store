"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "lucide-react";
import type { Customer } from "@/lib/types";
import { formatFirebaseDate } from "@/lib/types";
import Price from "@/components/ui/Price";

interface CustomersTableProps {
  customers: Customer[];
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const t = useTranslations("admin");

  if (!customers || customers.length === 0) {
    return (
      <div className="rounded-xl border border-safra-taupe/40 bg-white p-12 text-center shadow-sm">
        <p className="text-safra-muted">{t("noCustomersFound")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-safra-taupe/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-safra-light/20 text-start text-safra-olive">
            <tr>
              <th className="px-6 py-3 font-medium">{t("customerCol")}</th>
              <th className="px-6 py-3 font-medium">{t("contactCol")}</th>
              <th className="px-6 py-3 font-medium">{t("ordersCol")}</th>
              <th className="px-6 py-3 font-medium">{t("totalSpentCol")}</th>
              <th className="px-6 py-3 font-medium">{t("lastOrderCol")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-safra-taupe/20">
            {customers.map((customer) => (
              <tr key={customer.id} className="transition-colors hover:bg-safra-light/10">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-safra-gold/20 text-safra-deep-gold font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-safra-dark">{customer.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-safra-muted">
                  <p>{customer.email}</p>
                  <p className="text-xs">{customer.phone}</p>
                </td>
                <td className="px-6 py-3 font-medium text-safra-dark">
                  {customer.ordersCount}
                </td>
                <td className="px-6 py-3 font-medium text-safra-gold">
                  <Price amount={customer.totalSpending} />
                </td>
                <td className="px-6 py-3 text-safra-olive">
                  {formatFirebaseDate(customer.lastOrderDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
