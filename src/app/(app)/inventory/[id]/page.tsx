"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Settings2 } from "lucide-react";
import { useMedicine, useSubstitutes } from "@/hooks/useMedicines";
import { useBatches } from "@/hooks/useStock";
import { PageHeader } from "@/components/shared/PageHeader";
import { MoneyText } from "@/components/shared/MoneyText";
import { ScheduleBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { FormSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatExpiry, expiryStatus, formatMoney } from "@/lib/utils";

export default function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMedicine(id);
  const batchQuery = useBatches({ medicineId: id, limit: 50 });
  const substituteQuery = useSubstitutes(id);
  const medicine = data?.data;

  if (isLoading) return <div className="max-w-2xl mx-auto"><FormSkeleton fields={5} /></div>;
  if (isError || !medicine) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage message="Could not load medicine details." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-[#1F2D2B] truncate">{medicine.name}</h1>
          {medicine.company && (
            <p className="text-sm text-[#5A7370]">{medicine.company}</p>
          )}
        </div>
        {medicine.schedule !== "NONE" && <ScheduleBadge schedule={medicine.schedule} />}
      </div>

      {/* Details card */}
      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {medicine.salt && (
            <div className="col-span-2">
              <p className="text-[#5A7370]">Salt / Composition</p>
              <p className="font-medium text-[#1F2D2B]">{medicine.salt}</p>
            </div>
          )}
          <div>
            <p className="text-[#5A7370]">MRP</p>
            <MoneyText value={medicine.mrp} size="lg" />
          </div>
          <div>
            <p className="text-[#5A7370]">GST</p>
            <p className="font-medium text-[#1F2D2B]">{medicine.gstPercent}%</p>
          </div>
          {medicine.form && (
            <div>
              <p className="text-[#5A7370]">Form</p>
              <p className="font-medium text-[#1F2D2B] capitalize">{medicine.form}</p>
            </div>
          )}
          {medicine.packSize && (
            <div>
              <p className="text-[#5A7370]">Pack size</p>
              <p className="font-medium text-[#1F2D2B]">{medicine.packSize}</p>
            </div>
          )}
          <div>
            <p className="text-[#5A7370]">Min stock</p>
            <p className="font-medium text-[#1F2D2B]">{medicine.minStock} packs</p>
          </div>
          {medicine.rackLocation && (
            <div>
              <p className="text-[#5A7370]">Rack</p>
              <p className="font-medium text-[#1F2D2B]">{medicine.rackLocation}</p>
            </div>
          )}
          {medicine.hsnCode && (
            <div>
              <p className="text-[#5A7370]">HSN code</p>
              <p className="font-medium text-[#1F2D2B]">{medicine.hsnCode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock actions */}
      <div className="flex gap-3">
        <Link
          href={`/inventory/${id}/add-batch`}
          className="flex-1 flex items-center justify-center gap-2 min-h-[48px] bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] text-sm"
        >
          <Plus className="w-4 h-4" /> Add batch
        </Link>
        <Link
          href={`/inventory/${id}/adjust`}
          className="flex-1 flex items-center justify-center gap-2 min-h-[48px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[10px] hover:bg-[#F3F7F6] text-sm"
        >
          <Settings2 className="w-4 h-4" /> Adjust stock
        </Link>
      </div>

      {/* Batches */}
      <section>
        <h2 className="text-base font-semibold text-[#1F2D2B] mb-3">Batches</h2>
        {batchQuery.isLoading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : batchQuery.isError ? (
          <ErrorMessage onRetry={() => batchQuery.refetch()} />
        ) : (batchQuery.data?.data ?? []).length === 0 ? (
          <div className="text-[#5A7370] text-sm bg-white rounded-[12px] border border-[#E2EEEC] p-4">
            No batches found. Add a batch to track stock.
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
            {batchQuery.data?.data?.map((batch) => {
              const { label, variant } = expiryStatus(batch.expiryDate);
              return (
                <div key={batch.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div>
                    <p className="font-medium text-[#1F2D2B] text-[15px]">
                      Batch {batch.batchNo}
                    </p>
                    <p className="text-sm text-[#5A7370]">
                      Expiry {formatExpiry(batch.expiryDate)} · MRP {formatMoney(batch.mrp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1F2D2B]">{batch.quantity} packs</p>
                    {variant !== "ok" && (
                      <StatusBadge
                        label={label}
                        variant={variant === "expired" ? "danger" : "warning"}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Substitutes */}
      <section>
        <h2 className="text-base font-semibold text-[#1F2D2B] mb-3">Same salt substitutes</h2>
        {substituteQuery.isLoading ? (
          <TableSkeleton rows={2} cols={3} />
        ) : (substituteQuery.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-[#5A7370]">No substitutes found with the same salt.</p>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
            {substituteQuery.data?.data?.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between px-4 py-3 gap-3 cursor-pointer hover:bg-[#F3F7F6]"
                onClick={() => router.push(`/inventory/${sub.id}`)}
              >
                <div>
                  <p className="font-medium text-[#1F2D2B]">{sub.name}</p>
                  <p className="text-sm text-[#5A7370]">{sub.company ?? ""}</p>
                </div>
                <MoneyText value={sub.mrp} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
