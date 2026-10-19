"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSupplier } from "@/hooks/useSuppliers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordPayment } from "@/services/payments.service";
import { useToast } from "@/components/shared/Toast";
import { MoneyText } from "@/components/shared/MoneyText";
import { ApiError } from "@/lib/api";
import { supplierKeys } from "@/hooks/useSuppliers";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  mode: z.enum(["CASH", "UPI", "CARD"]),
  reference: z.string().optional(),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function PaySupplierPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: supData } = useSupplier(id);
  const supplier = supData?.data;

  const mutation = useMutation({
    mutationFn: (input: FormValues) =>
      recordPayment({
        type: "SUPPLIER_PAYMENT",
        mode: input.mode,
        amount: input.amount,
        supplierId: id,
        reference: input.reference || undefined,
        note: input.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.all });
      toast("Payment recorded");
      router.push(`/suppliers/${id}`);
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Could not record payment.", "error");
    },
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { mode: "CASH" } });

  const mode = watch("mode");

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#1F2D2B]">Pay supplier</h1>
          {supplier && <p className="text-sm text-[#5A7370]">{supplier.name}</p>}
        </div>
      </div>

      {supplier && Number(supplier.balance) > 0 && (
        <div className="bg-[#FEF3E2] rounded-[12px] px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-sm text-[#7C4D0D]">Amount you owe</p>
          <MoneyText value={supplier.balance} className="text-[#E8962A]" size="lg" />
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Amount paid (₹) <span className="text-[#D94F4F]">*</span></label>
          <input type="number" min={0.01} step={0.01} {...register("amount")}
            className="min-h-[52px] px-3 rounded-[10px] border border-[#E2EEEC] text-lg font-semibold text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
          {errors.amount && <p className="text-sm text-[#D94F4F]">{errors.amount.message}</p>}
        </div>

        <div>
          <p className="text-sm font-medium text-[#1F2D2B] mb-2">Payment mode</p>
          <div className="grid grid-cols-3 gap-3">
            {(["CASH", "UPI", "CARD"] as const).map((m) => (
              <label key={m} className={`flex items-center justify-center min-h-[52px] rounded-[10px] border-2 cursor-pointer font-medium text-base transition-colors ${
                mode === m ? "border-[#2F8F83] bg-[#E4F3F1] text-[#2F8F83]" : "border-[#E2EEEC] text-[#5A7370] hover:border-[#2F8F83]/30"
              }`}>
                <input type="radio" value={m} {...register("mode")} className="sr-only" />
                {m}
              </label>
            ))}
          </div>
        </div>

        {(mode === "UPI" || mode === "CARD") && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1F2D2B]">Transaction reference</label>
            <input type="text" placeholder="UPI ID / cheque no." {...register("reference")}
              className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Note (optional)</label>
          <input type="text" {...register("note")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 min-h-[52px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6]">Cancel</button>
          <button type="submit" disabled={isSubmitting || mutation.isPending}
            className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2">
            {(isSubmitting || mutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            Pay supplier
          </button>
        </div>
      </form>
    </div>
  );
}
