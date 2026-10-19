"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SaleStatusBadge, PaymentModeBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Pagination } from "@/components/shared/Pagination";
import { useSales } from "@/hooks/useSales";
import { formatDateTime } from "@/lib/utils";
import type { Sale, SaleStatus, PaymentMode } from "@/services/sales.service";

export default function SalesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SaleStatus | "">("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const query = useSales({
    page,
    limit: 20,
    status: status || undefined,
    paymentMode: paymentMode || undefined,
    startDate: startDate || undefined,
    endDate: endDate ? new Date(endDate + "T23:59:59").toISOString() : undefined,
  });

  const columns: Column<Sale>[] = [
    {
      key: "invoiceNo",
      header: "Invoice",
      render: (row) => (
        <span className="font-medium text-[#2F8F83]">{row.invoiceNo}</span>
      ),
    },
    {
      key: "saleDate",
      header: "Date & time",
      render: (row) => (
        <span className="text-[#5A7370]">{formatDateTime(row.saleDate)}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <span>{row.customer?.name ?? "Walk-in"}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (row) => <MoneyText value={row.total} />,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "paymentMode",
      header: "Paid by",
      render: (row) => <PaymentModeBadge mode={row.paymentMode} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <SaleStatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Sales"
        help="View all bills and payments."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83] min-h-[44px]"
          aria-label="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83] min-h-[44px]"
          aria-label="End date"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as SaleStatus | ""); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83] min-h-[44px]"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURNED">Returned</option>
        </select>
        <select
          value={paymentMode}
          onChange={(e) => { setPaymentMode(e.target.value as PaymentMode | ""); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83] min-h-[44px]"
          aria-label="Filter by payment mode"
        >
          <option value="">All payment modes</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
          <option value="CREDIT">Credit</option>
        </select>
      </div>

      {/* Table */}
      {query.isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : query.isError ? (
        <ErrorMessage onRetry={() => query.refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={query.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => router.push(`/sales/${row.id}`)}
            emptyMessage="No bills yet. Create your first bill from the home screen."
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
