"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAddBatch } from "@/hooks/useStock";
import { useMedicine } from "@/hooks/useMedicines";
import { useToast } from "@/components/shared/Toast";
import { ApiError } from "@/lib/api";

const schema = z.object({
  batchNo: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  purchasePrice: z.coerce.number().positive("Purchase price must be positive"),
  mrp: z.coerce.number().positive("MRP must be positive"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
});
type FormValues = z.infer<typeof schema>;

export default function AddBatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const addBatch = useAddBatch();
  const { data: medData } = useMedicine(id);
  const medicine = medData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      // expiryDate comes in as YYYY-MM, convert to last day of that month
      const [y, m] = data.expiryDate.split("-").map(Number);
      const lastDay = new Date(y, m, 0); // day 0 of next month = last day of this month
      await addBatch.mutateAsync({
        medicineId: id,
        batchNo: data.batchNo,
        expiryDate: lastDay.toISOString(),
        purchasePrice: data.purchasePrice,
        mrp: data.mrp,
        quantity: data.quantity,
      });
      toast("Batch added");
      router.push(`/inventory/${id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not add batch.", "error");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#1F2D2B]">Add batch</h1>
          {medicine && <p className="text-sm text-[#5A7370]">{medicine.name}</p>}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-4"
      >
        {(
          [
            { label: "Batch number", name: "batchNo", type: "text", placeholder: "ABC-123" },
            { label: "Purchase price (₹ per pack)", name: "purchasePrice", type: "number", placeholder: "0.00" },
            { label: "MRP (₹ per pack)", name: "mrp", type: "number", placeholder: "0.00" },
            { label: "Quantity (packs)", name: "quantity", type: "number", placeholder: "100" },
          ] as const
        ).map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1F2D2B]">
              {f.label} <span className="text-[#D94F4F]">*</span>
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              step={f.type === "number" ? "0.01" : undefined}
              {...register(f.name)}
              className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
            />
            {errors[f.name] && (
              <p className="text-sm text-[#D94F4F]">{errors[f.name]?.message}</p>
            )}
          </div>
        ))}

        {/* Expiry date — MM/YYYY format via month input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">
            Expiry date (MM/YYYY) <span className="text-[#D94F4F]">*</span>
          </label>
          <input
            type="month"
            {...register("expiryDate")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          />
          {errors.expiryDate && (
            <p className="text-sm text-[#D94F4F]">{errors.expiryDate.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 min-h-[52px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || addBatch.isPending}
            className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {(isSubmitting || addBatch.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            Add batch
          </button>
        </div>
      </form>
    </div>
  );
}
