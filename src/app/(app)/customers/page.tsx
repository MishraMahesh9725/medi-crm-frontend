"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer } from "@/services/customers.service";

export default function CustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hasUdhaar, setHasUdhaar] = useState(false);

  const query = useCustomers({
    search: search || undefined,
    hasUdhaar: hasUdhaar || undefined,
    page,
    limit: 20,
  });

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-[#1F2D2B]">{row.name}</p>
          {row.phone && <p className="text-sm text-[#5A7370]">{row.phone}</p>}
        </div>
      ),
    },
    {
      key: "balance",
      header: "Owes you",
      render: (row) => (
        <div>
          {Number(row.balance) > 0 ? (
            <MoneyText value={row.balance} className="text-[#E8962A]" />
          ) : (
            <span className="text-[#5A7370] text-[15px]">—</span>
          )}
        </div>
      ),
    },
    {
      key: "creditLimit",
      header: "Credit limit",
      render: (row) => (
        Number(row.creditLimit) > 0
          ? <MoneyText value={row.creditLimit} />
          : <span className="text-[#5A7370] text-[15px]">None</span>
      ),
    },
    {
      key: "whatsapp",
      header: "WhatsApp",
      render: (row) => (
        <StatusBadge
          label={row.whatsappOptIn ? "Opted in" : "No"}
          variant={row.whatsappOptIn ? "success" : "neutral"}
        />
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Customers"
        help="Manage your customers and udhaar accounts."
        action={
          <button
            onClick={() => router.push("/customers/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add customer
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7370]" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone…"
            className="w-full min-h-[44px] pl-9 pr-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          />
        </div>
        <label className="flex items-center gap-2 px-4 min-h-[44px] border border-[#E2EEEC] rounded-[10px] bg-white cursor-pointer text-sm font-medium text-[#1F2D2B]">
          <input
            type="checkbox"
            checked={hasUdhaar}
            onChange={(e) => { setHasUdhaar(e.target.checked); setPage(1); }}
            className="rounded min-h-0"
          />
          Has udhaar
        </label>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : query.isError ? (
        <ErrorMessage onRetry={() => query.refetch()} />
      ) : (query.data?.data ?? []).length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          message="Add your first customer to track purchases and udhaar."
          action={
            <button
              onClick={() => router.push("/customers/new")}
              className="px-5 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65]"
            >
              Add customer
            </button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={query.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => router.push(`/customers/${row.id}`)}
          />
          {query.data && (
            <Pagination
              page={page}
              totalPages={query.data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
