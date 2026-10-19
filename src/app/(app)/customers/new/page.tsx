"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useToast } from "@/components/shared/Toast";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  doctorName: z.string().optional(),
  creditLimit: z.coerce.number().min(0).default(0),
  whatsappOptIn: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createCustomer = useCreateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      const result = await createCustomer.mutateAsync({
        ...data,
        phone: data.phone || undefined,
        address: data.address || undefined,
        doctorName: data.doctorName || undefined,
      });
      toast("Customer added");
      router.push(`/customers/${result.data.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not add customer.", "error");
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
        <h1 className="text-xl font-semibold text-[#1F2D2B]">Add customer</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white rounded-[14px] border border-[#E2EEEC] p-5 space-y-4"
      >
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Name <span className="text-[#D94F4F]">*</span></label>
          <input type="text" placeholder="Ramesh Patel" {...register("name")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
          {errors.name && <p className="text-sm text-[#D94F4F]">{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Phone</label>
          <input type="tel" placeholder="9876543210" {...register("phone")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Address</label>
          <textarea rows={2} placeholder="12 MG Road, Ahmedabad" {...register("address")}
            className="px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] resize-none" />
        </div>

        {/* Doctor */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Regular doctor</label>
          <input type="text" placeholder="Dr. Sharma" {...register("doctorName")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
        </div>

        {/* Credit limit */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Credit limit (₹)</label>
          <input type="number" min={0} step={100} defaultValue={0} {...register("creditLimit")}
            className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
          <p className="text-xs text-[#5A7370]">Set to 0 to disable credit for this customer.</p>
        </div>

        {/* WhatsApp consent */}
        <label className="flex items-start gap-3 p-4 bg-[#F3F7F6] rounded-[10px] cursor-pointer">
          <input type="checkbox" {...register("whatsappOptIn")}
            className="mt-0.5 rounded min-h-0 accent-[#2F8F83]" />
          <div>
            <p className="text-sm font-medium text-[#1F2D2B]">WhatsApp messages</p>
            <p className="text-xs text-[#5A7370] mt-0.5">
              Customer agrees to receive bill confirmations and refill reminders on WhatsApp.
            </p>
          </div>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 min-h-[52px] border border-[#E2EEEC] text-[#1F2D2B] font-medium rounded-[12px] hover:bg-[#F3F7F6]">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || createCustomer.isPending}
            className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2">
            {(isSubmitting || createCustomer.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            Add customer
          </button>
        </div>
      </form>
    </div>
  );
}
