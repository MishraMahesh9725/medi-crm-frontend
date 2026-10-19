"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/components/shared/Toast";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  drugLicenseNo: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewSupplierPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createSupplier = useCreateSupplier();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      const result = await createSupplier.mutateAsync({
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        gstin: data.gstin || undefined,
        drugLicenseNo: data.drugLicenseNo || undefined,
      });
      toast("Supplier added");
      router.push(`/suppliers/${result.data.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not add supplier.", "error");
    }
  }

  const fields = [
    { label: "Supplier name", name: "name" as const, required: true, placeholder: "ABC Pharma Dist." },
    { label: "Phone", name: "phone" as const, type: "tel", placeholder: "9876543210" },
    { label: "Email", name: "email" as const, type: "email", placeholder: "supplier@example.com" },
    { label: "GSTIN", name: "gstin" as const, placeholder: "27AAAAA0000A1Z5" },
    { label: "Drug licence number", name: "drugLicenseNo" as const, placeholder: "DL-MH-123456" },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Add supplier</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-4">

        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1F2D2B]">
              {f.label}{f.required && <span className="text-[#D94F4F] ml-1">*</span>}
            </label>
            <input type={f.type ?? "text"} placeholder={f.placeholder} {...register(f.name)}
              className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
            {errors[f.name] && <p className="text-sm text-[#D94F4F]">{errors[f.name]?.message}</p>}
          </div>
        ))}

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Address</label>
          <textarea rows={2} placeholder="Shop address…" {...register("address")}
            className="px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 min-h-[52px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6]">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || createSupplier.isPending}
            className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2">
            {(isSubmitting || createSupplier.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            Add supplier
          </button>
        </div>
      </form>
    </div>
  );
}
