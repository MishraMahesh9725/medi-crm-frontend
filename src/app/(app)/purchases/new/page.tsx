"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { MoneyText } from "@/components/shared/MoneyText";
import { useToast } from "@/components/shared/Toast";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMedicines } from "@/hooks/useMedicines";
import { ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import type { Medicine } from "@/services/medicines.service";
import type { Supplier } from "@/services/suppliers.service";

const STEPS = [
  { label: "Supplier & bill" },
  { label: "Add medicines" },
  { label: "Review & save" },
];

const itemSchema = z.object({
  medicineId: z.string().min(1, "Select a medicine"),
  medicineName: z.string(),
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"), // YYYY-MM from month input
  quantity: z.coerce.number().int().positive("Quantity required"),
  freeQuantity: z.coerce.number().int().min(0).default(0),
  purchasePrice: z.coerce.number().positive("Purchase price required"),
  mrp: z.coerce.number().positive("MRP required"),
  gstPercent: z.coerce.number().min(0).max(100).default(12),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
});

const schema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  supplierName: z.string(),
  billNo: z.string().min(1, "Bill number is required"),
  billDate: z.string().min(1, "Bill date is required"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  discount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
});
type FormValues = z.infer<typeof schema>;

export default function NewPurchasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createPurchase = useCreatePurchase();
  const [step, setStep] = useState(0);

  const [supplierSearch, setSupplierSearch] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [showSupDrop, setShowSupDrop] = useState(false);
  const [showMedDrop, setShowMedDrop] = useState(false);

  const supplierQuery = useSuppliers(supplierSearch.length >= 2 ? { search: supplierSearch, limit: 8 } : {});
  const medQuery = useMedicines(medSearch.length >= 2 ? { search: medSearch, limit: 10 } : {});

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { items: [], discount: 0, paidAmount: 0 } });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const supplierId = watch("supplierId");
  const supplierName = watch("supplierName");
  const items = watch("items");
  const discount = watch("discount");
  const paidAmount = watch("paidAmount");

  const subtotal = items.reduce((s, item) => s + (item.purchasePrice || 0) * (item.quantity || 0), 0);
  const total = Math.max(0, subtotal - (discount || 0));

  function selectSupplier(s: Supplier) {
    setValue("supplierId", s.id);
    setValue("supplierName", s.name);
    setSupplierSearch("");
    setShowSupDrop(false);
  }

  function addMedicine(m: Medicine) {
    append({
      medicineId: m.id,
      medicineName: m.name,
      batchNumber: "",
      expiryDate: "",
      quantity: 1,
      freeQuantity: 0,
      purchasePrice: 0,
      mrp: Number(m.mrp),
      gstPercent: Number(m.gstPercent),
      discountPercent: 0,
    });
    setMedSearch("");
    setShowMedDrop(false);
  }

  async function onSubmit(data: FormValues) {
    try {
      const result = await createPurchase.mutateAsync({
        supplierId: data.supplierId,
        billNo: data.billNo,
        billDate: new Date(data.billDate).toISOString(),
        items: data.items.map((item) => {
          const [y, m] = item.expiryDate.split("-").map(Number);
          const lastDay = new Date(y, m, 0);
          return {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            expiryDate: lastDay.toISOString(),
            quantity: item.quantity,
            freeQuantity: item.freeQuantity,
            mrp: item.mrp,
            purchasePrice: item.purchasePrice,
            gstPercent: item.gstPercent,
            discountPercent: item.discountPercent,
          };
        }),
        discount: data.discount,
        paidAmount: data.paidAmount,
      });
      toast("Purchase saved");
      router.push(`/purchases/${result.data.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast("A purchase with this bill number already exists for this supplier.", "error");
      } else {
        toast(err instanceof ApiError ? err.message : "Could not save purchase.", "error");
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#1F2D2B] mb-1">Add purchase</h1>
      <p className="text-[#5A7370] mb-6">Record a purchase from a supplier and update your stock.</p>

      <StepIndicator steps={STEPS} current={step} />

      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5">
        {/* ── STEP 0: Supplier & bill ── */}
        {step === 0 && (
          <div className="space-y-5">
            {/* Supplier */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1F2D2B]">Supplier <span className="text-[#D94F4F]">*</span></label>
              {supplierId ? (
                <div className="flex items-center justify-between bg-[#E4F3F1] rounded-[10px] px-4 py-3">
                  <span className="font-medium text-[#1F2D2B]">{supplierName}</span>
                  <button type="button" onClick={() => { setValue("supplierId", ""); setValue("supplierName", ""); }}
                    className="text-sm text-[#5A7370] hover:text-[#D94F4F]">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7370]" />
                  <input type="search" value={supplierSearch}
                    onChange={(e) => { setSupplierSearch(e.target.value); setShowSupDrop(true); }}
                    onFocus={() => setShowSupDrop(true)}
                    onBlur={() => setTimeout(() => setShowSupDrop(false), 200)}
                    placeholder="Search supplier…"
                    className="w-full min-h-[44px] pl-9 pr-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
                  {showSupDrop && (supplierQuery.data?.data ?? []).length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[10px] border border-[#E2EEEC] shadow z-20 max-h-48 overflow-y-auto">
                      {(supplierQuery.data?.data ?? []).map((s) => (
                        <button key={s.id} type="button" onMouseDown={() => selectSupplier(s)}
                          className="w-full text-left px-4 py-3 hover:bg-[#F3F7F6] border-b border-[#E2EEEC] last:border-0">
                          <p className="font-medium text-[#1F2D2B]">{s.name}</p>
                          {s.phone && <p className="text-sm text-[#5A7370]">{s.phone}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {errors.supplierId && <p className="text-sm text-[#D94F4F]">{errors.supplierId.message}</p>}
            </div>

            {/* Bill no & date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#1F2D2B]">Supplier bill no. <span className="text-[#D94F4F]">*</span></label>
                <input type="text" placeholder="INV-12345" {...register("billNo")}
                  className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
                {errors.billNo && <p className="text-sm text-[#D94F4F]">{errors.billNo.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#1F2D2B]">Bill date <span className="text-[#D94F4F]">*</span></label>
                <input type="date" {...register("billDate")}
                  className="min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
                {errors.billDate && <p className="text-sm text-[#D94F4F]">{errors.billDate.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Add items ── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Medicine search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7370]" />
              <input type="search" value={medSearch}
                onChange={(e) => { setMedSearch(e.target.value); setShowMedDrop(true); }}
                onFocus={() => setShowMedDrop(true)}
                onBlur={() => setTimeout(() => setShowMedDrop(false), 200)}
                autoFocus
                placeholder="Search medicines to add…"
                className="w-full min-h-[48px] pl-9 pr-3 rounded-[12px] border border-[#E2EEEC] text-base text-[#1F2D2B] bg-white placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]" />
              {showMedDrop && (medQuery.data?.data ?? []).length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[12px] border border-[#E2EEEC] shadow-lg z-20 max-h-60 overflow-y-auto">
                  {(medQuery.data?.data ?? []).map((m) => (
                    <button key={m.id} type="button" onMouseDown={() => addMedicine(m)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F3F7F6] border-b border-[#E2EEEC] last:border-0">
                      <p className="font-medium text-[#1F2D2B]">{m.name}</p>
                      <p className="text-sm text-[#5A7370]">{m.company ?? ""}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            {fields.length === 0 ? (
              <p className="text-center text-[#5A7370] py-8">Search and add medicines above.</p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, i) => (
                  <div key={field.id} className="bg-[#F3F7F6] rounded-[12px] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[#1F2D2B]">{watch(`items.${i}.medicineName`)}</p>
                      <button type="button" onClick={() => remove(i)}
                        className="p-1 rounded text-[#5A7370] hover:text-[#D94F4F]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">Batch no. *</label>
                        <input type="text" placeholder="ABC-123" {...register(`items.${i}.batchNumber`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                        {errors.items?.[i]?.batchNumber && <p className="text-xs text-[#D94F4F]">{errors.items[i].batchNumber?.message}</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">Expiry (MM/YYYY) *</label>
                        <input type="month" {...register(`items.${i}.expiryDate`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">Qty *</label>
                        <input type="number" min={1} {...register(`items.${i}.quantity`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">Free qty</label>
                        <input type="number" min={0} {...register(`items.${i}.freeQuantity`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">Purchase price (₹) *</label>
                        <input type="number" min={0} step={0.01} {...register(`items.${i}.purchasePrice`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">MRP (₹) *</label>
                        <input type="number" min={0} step={0.01} {...register(`items.${i}.mrp`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">GST %</label>
                        <input type="number" min={0} step={0.5} {...register(`items.${i}.gstPercent`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#5A7370]">Discount %</label>
                        <input type="number" min={0} step={0.5} {...register(`items.${i}.discountPercent`)}
                          className="min-h-[40px] px-2.5 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-sm text-[#D94F4F]">{errors.items.message}</p>
            )}
          </div>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-sm text-[#5A7370] space-y-1">
              <p>Supplier: <span className="text-[#1F2D2B] font-medium">{supplierName}</span></p>
              <p>Bill no.: <span className="text-[#1F2D2B] font-medium">{watch("billNo")}</span></p>
              <p>Items: <span className="text-[#1F2D2B] font-medium">{fields.length}</span></p>
            </div>

            <div className="rounded-[12px] border border-[#E2EEEC] divide-y divide-[#E2EEEC]">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div>
                    <p className="font-medium text-[#1F2D2B] text-[15px]">{item.medicineName}</p>
                    <p className="text-sm text-[#5A7370]">
                      {item.quantity} packs · Batch {item.batchNumber}
                    </p>
                  </div>
                  <MoneyText value={(item.purchasePrice || 0) * (item.quantity || 0)} />
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E2EEEC]">
              <div className="flex justify-between text-[15px]">
                <span className="text-[#5A7370]">Subtotal</span>
                <MoneyText value={subtotal} />
              </div>
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-[#5A7370]">Discount (₹)</span>
                <input type="number" min={0} step={0.01} {...register("discount")}
                  className="w-24 px-2 py-1 rounded-[8px] border border-[#E2EEEC] text-right text-[15px] text-[#1F2D2B] focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E2EEEC]">
                <span className="font-semibold text-[#1F2D2B]">Total</span>
                <MoneyText value={total} size="xl" />
              </div>
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-[#5A7370]">Paid now (₹)</span>
                <input type="number" min={0} step={0.01} {...register("paidAmount")}
                  className="w-24 px-2 py-1 rounded-[8px] border border-[#E2EEEC] text-right text-[15px] text-[#1F2D2B] focus:outline-none focus:ring-1 focus:ring-[#2F8F83]" />
              </div>
              {total - (paidAmount || 0) > 0 && (
                <div className="flex justify-between text-[15px]">
                  <span className="text-[#E8962A] font-medium">Balance owed to supplier</span>
                  <MoneyText value={total - (paidAmount || 0)} className="text-[#E8962A]" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 gap-3">
        <div />
        <div className="flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 border border-[#E2EEEC] rounded-[10px] text-[#1F2D2B] font-medium hover:bg-[#F3F7F6] min-h-[44px]">
              Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createPurchase.isPending}
              className="px-6 py-2.5 bg-[#2F8F83] text-white font-semibold rounded-[10px] hover:bg-[#236F65] disabled:opacity-60 flex items-center gap-2 min-h-[44px]">
              {(isSubmitting || createPurchase.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              Save purchase
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
