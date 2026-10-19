"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePurchases } from "@/hooks/usePurchases";
import { formatDate } from "@/lib/utils";
import type { Purchase } from "@/services/purchases.service";
import { Truck } from "lucide-react";

export default function PurchasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const supplierId = searchParams.get("supplierId") ?? undefined;

  const query = usePurchases({ supplierId, page, limit: 20 });

  const columns: Column<Purchase>[] = [
    {
      key: "supplier",
      header: "Supplier",
      render: (row) => <span className="font-medium text-[#1F2D2B]">{row.supplier?.name ?? "—"}</span>,
    },
    {
      key: "billNo",
      header: "Bill no.",
      render: (row) => <span className="text-[#2F8F83] font-medium">{row.billNo}</span>,
    },
    {
      key: "billDate",
      header: "Date",
      render: (row) => <span className="text-[#5A7370]">{formatDate(row.billDate)}</span>,
    },
    {
      key: "total",
      header: "Total",
      render: (row) => <MoneyText value={row.total} />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "paid",
      header: "Paid",
      render: (row) => <MoneyText value={row.paidAmount} />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "balance",
      header: "Balance",
      render: (row) => {
        const bal = Number(row.total) - Number(row.paidAmount);
        return bal > 0
          ? <MoneyText value={bal} className="text-[#E8962A]" />
          : <span className="text-[#22A665] text-[15px]">Paid</span>;
      },
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Purchases"
        help="Track what you buy from suppliers."
        action={
          <button onClick={() => router.push("/purchases/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]">
            <Plus className="w-4 h-4" /> Add purchase
          </button>
        }
      />

      {query.isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : query.isError ? (
        <ErrorMessage onRetry={() => query.refetch()} />
      ) : (query.data?.data ?? []).length === 0 ? (
        <EmptyState icon={Truck} title="No purchases yet"
          message="Record your first purchase from a supplier."
          action={
            <button onClick={() => router.push("/purchases/new")}
              className="px-5 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65]">
              Add purchase
            </button>
          } />
      ) : (
        <>
          <DataTable columns={columns} data={query.data?.data ?? []} rowKey={(r) => r.id}
            onRowClick={(r) => router.push(`/purchases/${r.id}`)} />
          {query.data && (
            <Pagination page={page} totalPages={query.data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
