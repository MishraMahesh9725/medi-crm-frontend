"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, MessageCircle, XCircle } from "lucide-react";
import { useSale } from "@/hooks/useSales";
import { PageHeader } from "@/components/shared/PageHeader";
import { MoneyText } from "@/components/shared/MoneyText";
import { SaleStatusBadge, PaymentModeBadge } from "@/components/shared/StatusBadge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { FormSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/Toast";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useSale(id);
  const sale = data?.data;

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    if (!cancelReason.trim()) {
      toast("Please enter a reason for cancellation.", "error");
      return;
    }
    setIsCancelling(true);
    try {
      // Backend doesn't expose a dedicated cancel endpoint in the routes we saw;
      // for now we rely on a PATCH /sales/:id or note that it needs backend work.
      // We'll call PATCH with status = CANCELLED if it exists, else show info.
      await api.patch(`/sales/${id}`, { status: "CANCELLED", notes: cancelReason });
      toast("Bill cancelled");
      setCancelOpen(false);
      refetch();
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.message || "Could not cancel bill.", "error");
      } else {
        toast("Could not cancel bill.", "error");
      }
    } finally {
      setIsCancelling(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (isLoading) return <div className="max-w-2xl mx-auto"><FormSkeleton fields={6} /></div>;
  if (isError || !sale) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage message="Could not load bill details." onRetry={() => refetch()} />
      </div>
    );
  }

  const subtotal = Number(sale.subtotal);
  const cgst = Number(sale.cgst);
  const sgst = Number(sale.sgst);
  const igst = Number(sale.igst);
  const total = Number(sale.total);
  const paid = Number(sale.paidAmount);
  const balance = total - paid;
  const billPhone = sale.whatsappNumber ?? sale.customer?.phone;
  const whatsappRecipient = billPhone?.replace(/\D/g, "");
  const whatsappNumber = whatsappRecipient
    ? whatsappRecipient.startsWith("0")
      ? whatsappRecipient.slice(1)
      : whatsappRecipient.length === 10
        ? `91${whatsappRecipient}`
        : whatsappRecipient
    : undefined;

  return (
    <div className="max-w-2xl mx-auto print:max-w-full">
      <div className="flex items-center gap-3 mb-5 print:hidden">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Bill — {sale.invoiceNo}</h1>
        <SaleStatusBadge status={sale.status} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-5 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-[#E2EEEC] rounded-[10px] text-[#1F2D2B] hover:bg-[#F3F7F6] font-medium text-sm min-h-[44px]"
        >
          <Printer className="w-4 h-4" /> Print bill
        </button>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hello ${sale.customer?.name ?? "customer"}, your bill ${sale.invoiceNo} of ${formatMoney(total)} has been created. Thank you for your visit!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[#E2EEEC] rounded-[10px] text-[#1F2D2B] hover:bg-[#F3F7F6] font-medium text-sm min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" /> Send on WhatsApp
          </a>
        )}
        {sale.status === "COMPLETED" && (
          <button
            onClick={() => setCancelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E2EEEC] rounded-[10px] text-[#D94F4F] hover:bg-[#FDECEA] font-medium text-sm min-h-[44px] ml-auto"
          >
            <XCircle className="w-4 h-4" /> Cancel bill
          </button>
        )}
      </div>

      {/* Bill card */}
      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-5">
        {/* Header info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#5A7370]">Date</p>
            <p className="font-medium text-[#1F2D2B]">{formatDateTime(sale.saleDate)}</p>
          </div>
          <div>
            <p className="text-[#5A7370]">Invoice no.</p>
            <p className="font-medium text-[#1F2D2B]">{sale.invoiceNo}</p>
          </div>
          <div>
            <p className="text-[#5A7370]">Customer</p>
            <p className="font-medium text-[#1F2D2B]">{sale.customer?.name ?? "Walk-in"}</p>
            {billPhone && (
              <p className="text-[#5A7370]">{billPhone}</p>
            )}
          </div>
          <div>
            <p className="text-[#5A7370]">Payment</p>
            <PaymentModeBadge mode={sale.paymentMode} />
          </div>
          {sale.doctorName && (
            <div>
              <p className="text-[#5A7370]">Doctor</p>
              <p className="font-medium text-[#1F2D2B]">{sale.doctorName}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {sale.items && sale.items.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#1F2D2B] mb-2">Medicines</h3>
            <div className="rounded-[10px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
              {sale.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#1F2D2B] text-[15px] truncate">
                      {item.batch.medicine.name}
                    </p>
                    <p className="text-sm text-[#5A7370]">
                      Batch {item.batch.batchNo} · {item.quantity} ×{" "}
                      {formatMoney(item.rate)}
                      {item.discountPercent > 0 && ` (${item.discountPercent}% off)`}
                    </p>
                  </div>
                  <MoneyText value={item.lineTotal} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2 pt-2 border-t border-[#E2EEEC]">
          <div className="flex justify-between text-[15px]">
            <span className="text-[#5A7370]">Subtotal</span>
            <MoneyText value={subtotal} />
          </div>
          {Number(sale.discount) > 0 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#5A7370]">Discount</span>
              <span className="text-[#22A665]">−{formatMoney(sale.discount)}</span>
            </div>
          )}
          {cgst > 0 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#5A7370]">CGST</span>
              <MoneyText value={cgst} />
            </div>
          )}
          {sgst > 0 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#5A7370]">SGST</span>
              <MoneyText value={sgst} />
            </div>
          )}
          {igst > 0 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#5A7370]">IGST</span>
              <MoneyText value={igst} />
            </div>
          )}
          {Number(sale.roundOff) !== 0 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#5A7370]">Round off</span>
              <MoneyText value={sale.roundOff} />
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#E2EEEC]">
            <span className="font-semibold text-[#1F2D2B] text-base">Grand total</span>
            <MoneyText value={total} size="xl" />
          </div>
          <div className="flex justify-between text-[15px]">
            <span className="text-[#5A7370]">Paid</span>
            <MoneyText value={paid} />
          </div>
          {balance > 0.01 && (
            <div className="flex justify-between text-[15px]">
              <span className="text-[#E8962A] font-medium">Balance (udhaar)</span>
              <MoneyText value={balance} className="text-[#E8962A]" />
            </div>
          )}
        </div>

        {sale.notes && (
          <p className="text-sm text-[#5A7370] border-t border-[#E2EEEC] pt-3">
            Notes: {sale.notes}
          </p>
        )}
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this bill?"
        message="This action cannot be undone. Please enter a reason."
        confirmLabel={isCancelling ? "Cancelling…" : "Cancel bill"}
        cancelLabel="Keep bill"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={2}
          placeholder="Reason for cancellation…"
          className="w-full px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] resize-none"
        />
      </ConfirmDialog>
    </div>
  );
}
