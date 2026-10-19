"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdjustStock } from "@/hooks/useStock";
import { useBatches } from "@/hooks/useStock";
import { useMedicine } from "@/hooks/useMedicines";
import { useToast } from "@/components/shared/Toast";
import { ApiError } from "@/lib/api";
import { formatExpiry } from "@/lib/utils";

const REASONS = [
  { value: "DAMAGED", label: "Damaged" },
  { value: "EXPIRED", label: "Expired" },
  { value: "RETURN_TO_SUPPLIER", label: "Return to supplier" },
  { value: "CORRECTION", label: "Stock correction" },
  { value: "OPENING_STOCK", label: "Opening stock" },
];

const schema = z.object({
  batchId: z.string().min(1, "Select a batch"),
  direction: z.enum(["add", "remove"]),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  reason: z.enum(["DAMAGED", "EXPIRED", "RETURN_TO_SUPPLIER", "CORRECTION", "OPENING_STOCK"]),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AdjustStockPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const adjustStock = useAdjustStock();
  const { data: medData } = useMedicine(id);
  const batchQuery = useBatches({ medicineId: id, limit: 50 });
  const medicine = medData?.data;
  const batches = batchQuery.data?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { direction: "remove", reason: "CORRECTION" },
  });

  const direction = watch("direction");

  async function onSubmit(data: FormValues) {
    try {
      const qty = data.direction === "remove" ? -data.quantity : data.quantity;
      await adjustStock.mutateAsync({
        batchId: data.batchId,
        quantity: qty,
        reason: data.reason,
        note: data.note || undefined,
      });
      toast("Stock adjusted");
      router.push(`/inventory/${id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not adjust stock.", "error");
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
          <h1 className="text-xl font-semibold text-[#1F2D2B]">Adjust stock</h1>
          {medicine && <p className="text-sm text-[#5A7370]">{medicine.name}</p>}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-5"
      >
        {/* Batch */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">
            Batch <span className="text-[#D94F4F]">*</span>
          </label>
          <select
            {...register("batchId")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          >
            <option value="">Select batch…</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchNo} — exp {formatExpiry(b.expiryDate)} — {b.quantity} packs
              </option>
            ))}
          </select>
          {errors.batchId && <p className="text-sm text-[#D94F4F]">{errors.batchId.message}</p>}
        </div>

        {/* Add or remove */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#1F2D2B]">Adjustment type</p>
          <div className="grid grid-cols-2 gap-3">
            {(["remove", "add"] as const).map((d) => (
              <label
                key={d}
                className={`flex items-center justify-center gap-2 min-h-[52px] rounded-[10px] border-2 cursor-pointer font-medium text-base transition-colors ${
                  direction === d
                    ? d === "remove"
                      ? "border-[#D94F4F] bg-[#FDECEA] text-[#D94F4F]"
                      : "border-[#2F8F83] bg-[#E4F3F1] text-[#2F8F83]"
                    : "border-[#E2EEEC] text-[#5A7370] hover:border-[#1F2D2B]/20"
                }`}
              >
                <input
                  type="radio"
                  value={d}
                  {...register("direction")}
                  className="sr-only"
                />
                {d === "remove" ? "Remove stock" : "Add stock"}
              </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">
            Quantity (packs) <span className="text-[#D94F4F]">*</span>
          </label>
          <input
            type="number"
            min={1}
            {...register("quantity")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          />
          {errors.quantity && <p className="text-sm text-[#D94F4F]">{errors.quantity.message}</p>}
        </div>

        {/* Reason */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">
            Reason <span className="text-[#D94F4F]">*</span>
          </label>
          <select
            {...register("reason")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Note (optional)</label>
          <textarea
            rows={2}
            {...register("note")}
            placeholder="Any additional details…"
            className="px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] resize-none"
          />
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
            disabled={isSubmitting || adjustStock.isPending}
            className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {(isSubmitting || adjustStock.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            Save adjustment
          </button>
        </div>
      </form>
    </div>
  );
}
