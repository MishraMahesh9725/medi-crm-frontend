"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePurchase } from "@/hooks/usePurchases";
import { MoneyText } from "@/components/shared/MoneyText";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { FormSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatDate, formatExpiry, formatMoney } from "@/lib/utils";

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = usePurchase(id);
  const purchase = data?.data;

  if (isLoading) return <div className="max-w-2xl mx-auto"><FormSkeleton fields={5} /></div>;
  if (isError || !purchase) {
    return <div className="max-w-2xl mx-auto"><ErrorMessage message="Could not load purchase." onRetry={() => refetch()} /></div>;
  }

  const balance = Number(purchase.total) - Number(purchase.paidAmount);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#1F2D2B]">Purchase — {purchase.billNo}</h1>
          <p className="text-sm text-[#5A7370]">{purchase.supplier?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-[#5A7370]">Bill date</p><p className="font-medium text-[#1F2D2B]">{formatDate(purchase.billDate)}</p></div>
          <div><p className="text-[#5A7370]">Supplier</p><p className="font-medium text-[#1F2D2B]">{purchase.supplier?.name}</p></div>
        </div>

        {purchase.items && purchase.items.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#1F2D2B] mb-2">Items</h3>
            <div className="rounded-[10px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
              {purchase.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2.5 gap-3">
                  <div>
                    <p className="font-medium text-[#1F2D2B] text-[15px]">{item.batch.medicine.name}</p>
                    <p className="text-sm text-[#5A7370]">
                      Batch {item.batch.batchNo} · Exp {formatExpiry(item.batch.expiryDate)} · {item.quantity}{item.freeQuantity > 0 ? `+${item.freeQuantity}` : ""} packs · ₹{item.purchasePrice}/pk
                    </p>
                  </div>
                  <MoneyText value={item.lineTotal} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-[#E2EEEC]">
          <div className="flex justify-between text-[15px]"><span className="text-[#5A7370]">Subtotal</span><MoneyText value={purchase.subtotal} /></div>
          {Number(purchase.discount) > 0 && <div className="flex justify-between text-[15px]"><span className="text-[#5A7370]">Discount</span><span className="text-[#22A665]">−{formatMoney(purchase.discount)}</span></div>}
          <div className="flex justify-between text-[15px]"><span className="text-[#5A7370]">Tax</span><MoneyText value={purchase.taxAmount} /></div>
          <div className="flex justify-between pt-2 border-t border-[#E2EEEC]">
            <span className="font-semibold text-[#1F2D2B]">Total</span>
            <MoneyText value={purchase.total} size="xl" />
          </div>
          <div className="flex justify-between text-[15px]"><span className="text-[#5A7370]">Paid</span><MoneyText value={purchase.paidAmount} /></div>
          {balance > 0.01 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#E8962A] font-medium">Balance owed to supplier</span>
              <MoneyText value={balance} className="text-[#E8962A]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
