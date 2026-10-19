"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Receipt, Plus, Truck, AlertCircle, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MoneyText } from "@/components/shared/MoneyText";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { CardSkeleton, Skeleton } from "@/components/shared/LoadingSkeleton";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useExpiryAlerts, useBatches } from "@/hooks/useStock";
import { formatExpiry, daysUntilExpiry } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5">
      <p className="text-sm font-medium text-[#5A7370] mb-2">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <div className="text-2xl font-semibold text-[#1F2D2B]">{value}</div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // Today's dates
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

  const todaySalesQuery = useSales({ startDate, endDate, limit: 100 });
  const customersQuery = useCustomers({ hasUdhaar: true, limit: 100 });
  const suppliersQuery = useSuppliers({ limit: 100 });
  const expiryQuery = useExpiryAlerts({ days: 90, limit: 5 });
  const lowStockQuery = useBatches({ lowStock: true, limit: 5 });

  const todaySales = todaySalesQuery.data?.data ?? [];
  const todayTotal = todaySales.reduce((s, sale) => s + Number(sale.total), 0);
  const todayCount = todaySales.length;

  const customersOwed = customersQuery.data?.data?.reduce(
    (s, c) => s + Number(c.balance),
    0
  ) ?? 0;

  const youOweSuppliers = suppliersQuery.data?.data?.reduce(
    (s, sup) => s + Number(sup.balance),
    0
  ) ?? 0;

  const statsLoading =
    todaySalesQuery.isLoading || customersQuery.isLoading || suppliersQuery.isLoading;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Home"
        help="Here's what's happening at your store today."
      />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Sales today"
          value={<MoneyText value={todayTotal} size="2xl" />}
          loading={statsLoading}
        />
        <StatCard
          label="Bills today"
          value={<span className="text-2xl font-semibold">{todayCount}</span>}
          loading={statsLoading}
        />
        <StatCard
          label="Customers owe you"
          value={<MoneyText value={customersOwed} size="2xl" />}
          loading={statsLoading}
        />
        <StatCard
          label="You owe suppliers"
          value={<MoneyText value={youOweSuppliers} size="2xl" />}
          loading={statsLoading}
        />
      </div>

      {/* ── Quick action buttons ── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => router.push("/billing/new")}
          className="bg-[#2F8F83] text-white rounded-[14px] p-5 flex flex-col items-center gap-2.5 hover:bg-[#236F65] transition-colors min-h-[90px] font-medium text-[15px]"
        >
          <Receipt className="w-6 h-6" />
          New bill
        </button>
        <button
          onClick={() => router.push("/purchases/new")}
          className="bg-white border border-[#E2EEEC] text-[#1F2D2B] rounded-[14px] p-5 flex flex-col items-center gap-2.5 hover:bg-[#F3F7F6] transition-colors min-h-[90px] font-medium text-[15px]"
        >
          <Truck className="w-6 h-6 text-[#2F8F83]" />
          Add purchase
        </button>
        <button
          onClick={() => router.push("/inventory/new")}
          className="bg-white border border-[#E2EEEC] text-[#1F2D2B] rounded-[14px] p-5 flex flex-col items-center gap-2.5 hover:bg-[#F3F7F6] transition-colors min-h-[90px] font-medium text-[15px]"
        >
          <Plus className="w-6 h-6 text-[#2F8F83]" />
          Add medicine
        </button>
      </div>

      {/* ── Expiring soon ── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1F2D2B]">Expiring soon</h2>
          <Link
            href="/inventory?filter=expiring"
            className="text-sm text-[#2F8F83] hover:underline flex items-center gap-1"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
          {expiryQuery.isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : expiryQuery.isError ? (
            <ErrorMessage onRetry={() => expiryQuery.refetch()} />
          ) : expiryQuery.data?.data?.length === 0 ? (
            <p className="text-[#5A7370] text-sm p-4">No medicines expiring soon.</p>
          ) : (
            expiryQuery.data?.data?.map((alert) => {
              const days = daysUntilExpiry(alert.expiryDate);
              const expired = (days ?? 0) <= 0;
              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[#1F2D2B] truncate">
                      {alert.medicine.name}
                    </p>
                    <p className="text-sm text-[#5A7370]">
                      {alert.medicine.company} · Batch {alert.batchNo} · Qty {alert.quantity}
                    </p>
                  </div>
                  <StatusBadge
                    label={expired ? "Expired" : "Expires soon"}
                    variant={expired ? "danger" : "warning"}
                  />
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── Low stock ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1F2D2B]">Low stock</h2>
          <Link
            href="/inventory?filter=low-stock"
            className="text-sm text-[#2F8F83] hover:underline flex items-center gap-1"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
          {lowStockQuery.isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : lowStockQuery.isError ? (
            <ErrorMessage onRetry={() => lowStockQuery.refetch()} />
          ) : lowStockQuery.data?.data?.length === 0 ? (
            <p className="text-[#5A7370] text-sm p-4">All stock levels look good.</p>
          ) : (
            lowStockQuery.data?.data?.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between px-4 py-3 gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-[#1F2D2B] truncate">
                    {batch.medicine?.name ?? "—"}
                  </p>
                  <p className="text-sm text-[#5A7370]">
                    {batch.medicine?.company} · {batch.quantity} packs left
                  </p>
                </div>
                <StatusBadge label="Low stock" variant="warning" />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
