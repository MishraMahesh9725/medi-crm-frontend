"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStore, updateStore } from "@/services/stores.service";
import { useToast } from "@/components/shared/Toast";
import { FormSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Store name required").optional(),
  ownerName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Must be 6 digits").optional().or(z.literal("")),
  gstin: z.string().optional(),
  drugLicenseNo: z.string().optional(),
  invoicePrefix: z.string().max(10).optional(),
  upiId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function StoreSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["store"],
    queryFn: getStore,
  });

  const mutation = useMutation({
    mutationFn: (input: FormValues) =>
      updateStore({
        ...input,
        email: input.email || undefined,
        pincode: input.pincode || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store"] });
      toast("Settings saved");
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Could not save settings.", "error");
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      reset({
        name: s.name ?? "",
        ownerName: s.ownerName ?? "",
        phone: s.phone ?? "",
        email: s.email ?? "",
        address: s.address ?? "",
        city: s.city ?? "",
        state: s.state ?? "",
        pincode: s.pincode ?? "",
        gstin: s.gstin ?? "",
        drugLicenseNo: s.drugLicenseNo ?? "",
        invoicePrefix: s.invoicePrefix ?? "INV",
        upiId: s.upiId ?? "",
      });
    }
  }, [data, reset]);

  if (isLoading) return <div className="max-w-xl mx-auto"><FormSkeleton fields={6} /></div>;
  if (isError) return <div className="max-w-xl mx-auto"><ErrorMessage onRetry={() => refetch()} /></div>;

  const fields: { label: string; name: keyof FormValues; type?: string; placeholder?: string }[] = [
    { label: "Store name", name: "name", placeholder: "Sharma Medical Store" },
    { label: "Owner name", name: "ownerName", placeholder: "Rajesh Sharma" },
    { label: "Phone", name: "phone", type: "tel", placeholder: "9876543210" },
    { label: "Email", name: "email", type: "email", placeholder: "store@example.com" },
    { label: "Address", name: "address", placeholder: "12 MG Road" },
    { label: "City", name: "city", placeholder: "Ahmedabad" },
    { label: "State", name: "state", placeholder: "Gujarat" },
    { label: "Pincode", name: "pincode", placeholder: "380001" },
    { label: "GSTIN", name: "gstin", placeholder: "27AAAAA0000A1Z5" },
    { label: "Drug licence number", name: "drugLicenseNo", placeholder: "DL-GJ-123456" },
    { label: "Invoice prefix", name: "invoicePrefix", placeholder: "INV" },
    { label: "UPI ID (for QR on bill)", name: "upiId", placeholder: "store@upi" },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()}
          className="p-2 rounded-[8px] border border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Store details</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-4">
        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1F2D2B]">{f.label}</label>
            <input type={f.type ?? "text"} placeholder={f.placeholder} {...register(f.name)}
              className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
            {errors[f.name] && <p className="text-sm text-[#D94F4F]">{errors[f.name]?.message?.toString()}</p>}
          </div>
        ))}

        <button type="submit" disabled={isSubmitting || mutation.isPending || !isDirty}
          className="w-full min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
          {(isSubmitting || mutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
          Save settings
        </button>
      </form>
    </div>
  );
}
