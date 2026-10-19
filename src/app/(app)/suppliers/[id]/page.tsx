"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useSupplier } from "@/hooks/useSuppliers";
import { usePurchases } from "@/hooks/usePurchases";
import { MoneyText } from "@/components/shared/MoneyText";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { FormSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatDate, formatMoney } from "@/lib/utils";

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSupplier(id);
  const purchasesQuery = usePurchases({ supplierId: id, limit: 10 });
  const supplier = data?.data;

  if (isLoading) return <div className="max-w-2xl mx-auto"><FormSkeleton fields={4} /></div>;
  if (isError || !supplier) {
    return <div className="max-w-2xl mx-auto"><ErrorMessage message="Could not load supplier details." onRetry={() => refetch()} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-[#1F2D2B]">{supplier.name}</h1>
          {supplier.phone && <p className="text-sm text-[#5A7370]">{supplier.phone}</p>}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {supplier.email && <div><p className="text-[#5A7370]">Email</p><p className="font-medium text-[#1F2D2B]">{supplier.email}</p></div>}
          {supplier.gstin && <div><p className="text-[#5A7370]">GSTIN</p><p className="font-medium text-[#1F2D2B]">{supplier.gstin}</p></div>}
          {supplier.drugLicenseNo && <div><p className="text-[#5A7370]">Drug licence</p><p className="font-medium text-[#1F2D2B]">{supplier.drugLicenseNo}</p></div>}
          {supplier.address && <div className="col-span-2"><p className="text-[#5A7370]">Address</p><p className="font-medium text-[#1F2D2B]">{supplier.address}</p></div>}
        </div>

        <div className="mt-5 pt-4 border-t border-[#E2EEEC] flex items-center justify-between">
          <div>
            <p className="text-sm text-[#5A7370]">Amount you owe</p>
            <MoneyText value={supplier.balance} size="2xl"
              className={Number(supplier.balance) > 0 ? "text-[#E8962A]" : ""} />
          </div>
        </div>
      </div>

      {/* Pay supplier */}
      <Link href={`/suppliers/${id}/pay`}
        className="flex items-center justify-center gap-2 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] w-full">
        <CreditCard className="w-4 h-4" /> Pay supplier
      </Link>

      {/* Recent purchases */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1F2D2B]">Recent purchases</h2>
          <Link href={`/purchases?supplierId=${id}`} className="text-sm text-[#2F8F83] hover:underline">See all</Link>
        </div>
        {purchasesQuery.isLoading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : (purchasesQuery.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-[#5A7370]">No purchases from this supplier yet.</p>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
            {purchasesQuery.data?.data?.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-3 cursor-pointer hover:bg-[#F3F7F6]"
                onClick={() => router.push(`/purchases/${p.id}`)}>
                <div>
                  <p className="font-medium text-[#1F2D2B] text-[15px]">Bill {p.billNo}</p>
                  <p className="text-sm text-[#5A7370]">{formatDate(p.billDate)}</p>
                </div>
                <MoneyText value={p.total} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
