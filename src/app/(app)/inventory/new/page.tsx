"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/shared/Toast";
import { useCreateMedicine } from "@/hooks/useMedicines";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  salt: z.string().optional(),
  form: z.string().optional(),
  packSize: z.string().optional(),
  unitsPerPack: z.coerce.number().int().positive().default(1),
  mrp: z.coerce.number().positive("MRP must be positive"),
  gstPercent: z.coerce.number().min(0).max(100).default(12),
  hsnCode: z.string().optional(),
  schedule: z.enum(["NONE", "H", "H1", "X", "NARCOTIC"]).default("NONE"),
  barcode: z.string().optional(),
  rackLocation: z.string().optional(),
  minStock: z.coerce.number().int().min(0).default(0),
});
type FormValues = z.infer<typeof schema>;

const FORM_OPTIONS = {
  schedules: [
    { value: "NONE", label: "None" },
    { value: "H", label: "Schedule H" },
    { value: "H1", label: "Schedule H1" },
    { value: "X", label: "Schedule X" },
    { value: "NARCOTIC", label: "Narcotic" },
  ],
  forms: [
    { value: "", label: "Select form…" },
    { value: "tablet", label: "Tablet" },
    { value: "capsule", label: "Capsule" },
    { value: "syrup", label: "Syrup" },
    { value: "injection", label: "Injection" },
    { value: "drops", label: "Drops" },
    { value: "cream", label: "Cream / Ointment" },
    { value: "inhaler", label: "Inhaler" },
    { value: "powder", label: "Powder" },
    { value: "other", label: "Other" },
  ],
};

export default function NewMedicinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMedicine = useCreateMedicine();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      const result = await createMedicine.mutateAsync({
        ...data,
        company: data.company || undefined,
        salt: data.salt || undefined,
        form: data.form || undefined,
        packSize: data.packSize || undefined,
        hsnCode: data.hsnCode || undefined,
        barcode: data.barcode || undefined,
        rackLocation: data.rackLocation || undefined,
      });
      toast("Medicine added");
      router.push(`/inventory/${result.data.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not add medicine.", "error");
    }
  }

  function Field({
    label,
    name,
    type = "text",
    required,
    placeholder,
  }: {
    label: string;
    name: keyof FormValues;
    type?: string;
    required?: boolean;
    placeholder?: string;
  }) {
    const error = errors[name];
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#1F2D2B]">
          {label}
          {required && <span className="text-[#D94F4F] ml-1">*</span>}
        </label>
        <input
          type={type}
          placeholder={placeholder}
          step={type === "number" ? "0.01" : undefined}
          {...register(name)}
          className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
        {error && <p className="text-sm text-[#D94F4F]">{error.message?.toString()}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Add medicine</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-5"
      >
        {/* Basic info */}
        <section>
          <h2 className="text-sm font-semibold text-[#1F2D2B] mb-4 uppercase tracking-wide text-xs">
            Basic info
          </h2>
          <div className="space-y-4">
            <Field label="Medicine name" name="name" required placeholder="e.g. Paracetamol 500mg" />
            <Field label="Company" name="company" placeholder="e.g. Cipla" />
            <Field label="Salt / Composition" name="salt" placeholder="e.g. Paracetamol 500mg" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#1F2D2B]">Form</label>
                <select
                  {...register("form")}
                  className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
                >
                  {FORM_OPTIONS.forms.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <Field label="Pack size" name="packSize" placeholder="e.g. 10 tablets" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Units per pack" name="unitsPerPack" type="number" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#1F2D2B]">
                  Schedule <span className="text-[#D94F4F]">*</span>
                </label>
                <select
                  {...register("schedule")}
                  className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
                >
                  {FORM_OPTIONS.schedules.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-[#E2EEEC] pt-5">
          <h2 className="text-xs font-semibold text-[#1F2D2B] mb-4 uppercase tracking-wide">
            Pricing & GST
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="MRP (₹)" name="mrp" type="number" required placeholder="0.00" />
            <Field label="GST %" name="gstPercent" type="number" placeholder="12" />
            <Field label="HSN code" name="hsnCode" placeholder="30049099" />
            <Field label="Barcode" name="barcode" />
          </div>
        </section>

        {/* Stock */}
        <section className="border-t border-[#E2EEEC] pt-5">
          <h2 className="text-xs font-semibold text-[#1F2D2B] mb-4 uppercase tracking-wide">
            Stock settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Minimum stock (reorder level)" name="minStock" type="number" placeholder="5" />
            <Field label="Rack location" name="rackLocation" placeholder="A-12" />
          </div>
        </section>

        {/* Actions */}
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
            disabled={isSubmitting || createMedicine.isPending}
            className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {(isSubmitting || createMedicine.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Add medicine
          </button>
        </div>
      </form>
    </div>
  );
}
