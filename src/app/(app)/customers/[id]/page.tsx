"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, MessageCircle } from "lucide-react";
import { useCustomer, useCustomerLedger } from "@/hooks/useCustomers";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { FormSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Pagination } from "@/components/shared/Pagination";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { useState } from "react";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data: custData, isLoading, isError, refetch } = useCustomer(id);
  const ledgerQuery = useCustomerLedger(id, { page, limit: 20 });

  const customer = custData?.data;
  const ledger = ledgerQuery.data;

  if (isLoading) return <div className="max-w-2xl mx-auto"><FormSkeleton fields={4} /></div>;
  if (isError || !customer) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage message="Could not load customer details." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]"
          aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-[#1F2D2B]">{customer.name}</h1>
          {customer.phone && <p className="text-sm text-[#5A7370]">{customer.phone}</p>}
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {customer.address && (
            <div className="col-span-2">
              <p className="text-[#5A7370]">Address</p>
              <p className="font-medium text-[#1F2D2B]">{customer.address}</p>
            </div>
          )}
          {customer.doctorName && (
            <div>
              <p className="text-[#5A7370]">Regular doctor</p>
              <p className="font-medium text-[#1F2D2B]">{customer.doctorName}</p>
            </div>
          )}
          <div>
            <p className="text-[#5A7370]">WhatsApp</p>
            <StatusBadge
              label={customer.whatsappOptIn ? "Opted in" : "No"}
              variant={customer.whatsappOptIn ? "success" : "neutral"}
            />
          </div>
        </div>

        {/* Balance row */}
        <div className="mt-5 pt-4 border-t border-[#E2EEEC] flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[#5A7370]">Outstanding balance (udhaar)</p>
            <MoneyText value={customer.balance} size="2xl"
              className={Number(customer.balance) > 0 ? "text-[#E8962A]" : ""} />
          </div>
          {Number(customer.creditLimit) > 0 && (
            <div>
              <p className="text-sm text-[#5A7370]">Credit limit</p>
              <MoneyText value={customer.creditLimit} size="lg" />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/customers/${id}/pay`}
          className="flex-1 flex items-center justify-center gap-2 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] text-base">
          <CreditCard className="w-4 h-4" /> Receive payment
        </Link>
        {customer.phone && customer.whatsappOptIn && (
          <a href={`https://wa.me/91${customer.phone}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 min-h-[52px] px-4 border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6] text-sm">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        )}
      </div>

      {/* Ledger */}
      <section>
        <h2 className="text-base font-semibold text-[#1F2D2B] mb-3">Account history</h2>
        {ledgerQuery.isLoading ? (
          <TableSkeleton rows={5} cols={3} />
        ) : ledgerQuery.isError ? (
          <ErrorMessage onRetry={() => ledgerQuery.refetch()} />
        ) : (ledger?.ledger ?? []).length === 0 ? (
          <p className="text-sm text-[#5A7370]">No transactions yet.</p>
        ) : (
          <>
            <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
              {ledger?.ledger.map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#1F2D2B] text-[15px]">
                      {entry.entryType === "DEBIT"
                        ? `Bill ${entry.invoiceNo ?? ""}`
                        : "Payment received"}
                    </p>
                    <p className="text-sm text-[#5A7370]">{formatDateTime(entry.date)}</p>
                    {entry.reference && (
                      <p className="text-xs text-[#5A7370]">Ref: {entry.reference}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {entry.entryType === "DEBIT" ? (
                      <MoneyText value={entry.total ?? 0} className="text-[#D94F4F]" />
                    ) : (
                      <MoneyText value={entry.amount ?? 0} className="text-[#22A665]" />
                    )}
                    <StatusBadge
                      label={entry.entryType === "DEBIT" ? "Debit" : "Credit"}
                      variant={entry.entryType === "DEBIT" ? "danger" : "success"}
                      className="text-xs mt-0.5"
                    />
                  </div>
                </div>
              ))}
            </div>
            {ledger?.meta && (
              <Pagination
                page={page}
                totalPages={ledger.meta.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
