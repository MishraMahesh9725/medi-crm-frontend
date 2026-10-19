"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { Supplier } from "@/services/suppliers.service";

export default function SuppliersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useSuppliers({ search: search || undefined, page, limit: 20 });

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      render: (row) => (
        <div>
          <p className="font-medium text-[#1F2D2B]">{row.name}</p>
          {row.phone && <p className="text-sm text-[#5A7370]">{row.phone}</p>}
        </div>
      ),
    },
    {
      key: "gstin",
      header: "GSTIN",
      render: (row) => (
        <span className="text-[#5A7370] text-[15px]">{row.gstin ?? "—"}</span>
      ),
    },
    {
      key: "balance",
      header: "You owe",
      render: (row) => (
        Number(row.balance) > 0
          ? <MoneyText value={row.balance} className="text-[#E8962A]" />
          : <span className="text-[#5A7370] text-[15px]">—</span>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Suppliers"
        help="Manage suppliers and track what you owe them."
        action={
          <button onClick={() => router.push("/suppliers/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]">
            <Plus className="w-4 h-4" /> Add supplier
          </button>
        }
      />

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7370]" />
          <input type="search" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search suppliers…"
            className="w-full min-h-[44px] pl-9 pr-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : query.isError ? (
        <ErrorMessage onRetry={() => query.refetch()} />
      ) : (query.data?.data ?? []).length === 0 ? (
        <EmptyState icon={Truck} title="No suppliers yet"
          message="Add your first supplier to track purchases and payments."
          action={
            <button onClick={() => router.push("/suppliers/new")}
              className="px-5 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65]">
              Add supplier
            </button>
          } />
      ) : (
        <>
          <DataTable columns={columns} data={query.data?.data ?? []} rowKey={(r) => r.id}
            onRowClick={(r) => router.push(`/suppliers/${r.id}`)} />
          {query.data && (
            <Pagination page={page} totalPages={query.data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
