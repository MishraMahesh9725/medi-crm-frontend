"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge, ScheduleBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMedicines } from "@/hooks/useMedicines";
import { expiryStatus, formatExpiry } from "@/lib/utils";
import { Package } from "lucide-react";
import type { Medicine, DrugSchedule } from "@/services/medicines.service";

type FilterTab = "all" | "low-stock" | "expiring" | "schedule";

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>(
    (searchParams.get("filter") as FilterTab) ?? "all"
  );

  const query = useMedicines({
    search: search || undefined,
    lowStock: activeFilter === "low-stock" ? true : undefined,
    schedule:
      activeFilter === "schedule" ? undefined : undefined, // handled below via display
    page,
    limit: 20,
  });

  const medicines = query.data?.data ?? [];
  const filtered =
    activeFilter === "expiring"
      ? medicines.filter((m) => {
          if (!m.nextExpiry) return false;
          const d = expiryStatus(m.nextExpiry);
          return d.variant !== "ok";
        })
      : activeFilter === "schedule"
      ? medicines.filter((m) => m.schedule !== "NONE")
      : medicines;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "low-stock", label: "Low stock" },
    { key: "expiring", label: "Expiring soon" },
    { key: "schedule", label: "Schedule drugs" },
  ];

  const columns: Column<Medicine>[] = [
    {
      key: "name",
      header: "Medicine",
      render: (row) => (
        <div>
          <p className="font-medium text-[#1F2D2B]">{row.name}</p>
          {row.company && <p className="text-sm text-[#5A7370]">{row.company}</p>}
          {row.salt && <p className="text-xs text-[#5A7370]">{row.salt}</p>}
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (row) =>
        row.schedule !== "NONE" ? <ScheduleBadge schedule={row.schedule} /> : null,
    },
    {
      key: "stock",
      header: "In stock",
      render: (row) => (
        <span className="font-medium text-[#1F2D2B]">
          {row.totalStock ?? "—"} packs
        </span>
      ),
    },
    {
      key: "expiry",
      header: "Next expiry",
      render: (row) => {
        if (!row.nextExpiry) return <span className="text-[#5A7370]">—</span>;
        const { label, variant } = expiryStatus(row.nextExpiry);
        return (
          <div>
            <p className="text-[15px] text-[#1F2D2B]">{formatExpiry(row.nextExpiry)}</p>
            {variant !== "ok" && (
              <StatusBadge
                label={label}
                variant={variant === "expired" ? "danger" : "warning"}
              />
            )}
          </div>
        );
      },
    },
    {
      key: "mrp",
      header: "MRP",
      render: (row) => <MoneyText value={row.mrp} />,
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Inventory"
        help="Manage your medicines and stock."
        action={
          <button
            onClick={() => router.push("/inventory/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add medicine
          </button>
        }
      />

      {/* Search + tabs */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7370]" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or salt…"
            className="w-full min-h-[44px] pl-9 pr-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 border-b border-[#E2EEEC]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[40px] ${
              activeFilter === tab.key
                ? "border-[#2F8F83] text-[#2F8F83]"
                : "border-transparent text-[#5A7370] hover:text-[#1F2D2B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : query.isError ? (
        <ErrorMessage onRetry={() => query.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No medicines yet"
          message="Add your first medicine to get started."
          action={
            <button
              onClick={() => router.push("/inventory/new")}
              className="px-5 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65]"
            >
              Add medicine
            </button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(row) => row.id}
            onRowClick={(row) => router.push(`/inventory/${row.id}`)}
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
