"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  X,
  Plus,
  Minus,
  ChevronDown,
  UserPlus,
  Loader2,
  FileText,
  Printer,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { MoneyText } from "@/components/shared/MoneyText";
import { ScheduleBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/Toast";
import { useMedicines } from "@/hooks/useMedicines";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";
import { useCreateSale } from "@/hooks/useSales";
import type { Medicine } from "@/services/medicines.service";
import type { Customer } from "@/services/customers.service";
import { formatMoney } from "@/lib/utils";
import { ApiError } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────

interface CartItem {
  medicine: Medicine;
  quantity: number;
  rate: number;
  discountPercent: number;
}

type PaymentMode = "CASH" | "UPI" | "CARD" | "CREDIT";

// Schedule drugs that need a prescription step
const NEEDS_PRESCRIPTION = new Set(["H", "H1", "X", "NARCOTIC"]);

// ── Schema for prescription step ──────────────────────────────────────────

const prescriptionSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientAddress: z.string().optional(),
  doctorName: z.string().min(1, "Doctor name is required"),
  doctorRegNo: z.string().optional(),
  prescriptionNo: z.string().optional(),
  prescriptionDate: z.string().optional(),
});
type PrescriptionForm = z.infer<typeof prescriptionSchema>;

// ── STEP 1: Add medicines ─────────────────────────────────────────────────

function Step1Medicines({
  cart,
  onAddItem,
  onRemoveItem,
  onUpdateQty,
  onUpdateDiscount,
}: {
  cart: CartItem[];
  onAddItem: (m: Medicine) => void;
  onRemoveItem: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onUpdateDiscount: (id: string, discount: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMedicines(
    search.length >= 2 ? { search, limit: 10 } : {}
  );

  const results = search.length >= 2 ? (data?.data ?? []) : [];

  // "/" shortcut focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function addToCart(m: Medicine) {
    onAddItem(m);
    setSearch("");
    setShowResults(false);
    searchRef.current?.focus();
  }

  return (
    <div>
      {/* Search box */}
      <div className="relative mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A7370]" />
          <input
            ref={searchRef}
            type="search"
            autoFocus
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search medicines by name or salt… (press / to focus)"
            className="w-full min-h-[52px] pl-11 pr-4 rounded-[12px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] bg-white"
            aria-label="Search medicines"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7370] animate-spin" />
          )}
        </div>

        {/* Dropdown results */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[12px] border border-[#E2EEEC] shadow-lg z-20 max-h-72 overflow-y-auto">
            {results.map((m) => (
              <button
                key={m.id}
                type="button"
                onMouseDown={() => addToCart(m)}
                className="w-full flex items-start justify-between px-4 py-3 hover:bg-[#F3F7F6] text-left gap-3 border-b border-[#E2EEEC] last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#1F2D2B] text-[15px]">{m.name}</p>
                  <p className="text-sm text-[#5A7370]">
                    {m.company ?? ""}{m.salt ? ` · ${m.salt}` : ""}
                    {m.packSize ? ` · ${m.packSize}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-[#1F2D2B] text-[15px]">
                    {formatMoney(m.mrp)}
                  </p>
                  {m.schedule !== "NONE" && (
                    <ScheduleBadge schedule={m.schedule} />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && search.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[12px] border border-[#E2EEEC] shadow z-20 px-4 py-3 text-sm text-[#5A7370]">
            No medicines found for "{search}"
          </div>
        )}
      </div>

      {/* Cart */}
      {cart.length === 0 ? (
        <div className="text-center py-10 text-[#5A7370] text-base">
          Search for a medicine above to add it to the bill.
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.medicine.id}
              className="bg-white rounded-[12px] border border-[#E2EEEC] p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#1F2D2B]">{item.medicine.name}</span>
                    {item.medicine.schedule !== "NONE" && (
                      <ScheduleBadge schedule={item.medicine.schedule} />
                    )}
                  </div>
                  <p className="text-sm text-[#5A7370]">{item.medicine.company ?? ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.medicine.id)}
                  className="p-1 rounded text-[#5A7370] hover:text-[#D94F4F] hover:bg-[#FDECEA] shrink-0"
                  aria-label={`Remove ${item.medicine.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Quantity stepper */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.medicine.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-[8px] border border-[#E2EEEC] flex items-center justify-center text-[#1F2D2B] hover:bg-[#F3F7F6]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-semibold text-[#1F2D2B]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.medicine.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-[8px] border border-[#E2EEEC] flex items-center justify-center text-[#1F2D2B] hover:bg-[#F3F7F6]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rate */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#5A7370]">Rate ₹</span>
                  <input
                    type="number"
                    value={item.rate}
                    min={0}
                    step={0.5}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        // update rate in cart — handled by parent via discount flow for now
                      }
                    }}
                    className="w-20 px-2 py-1 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] focus:outline-none focus:ring-1 focus:ring-[#2F8F83]"
                    readOnly
                    aria-label="Rate"
                  />
                </div>

                {/* Discount */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#5A7370]">Discount %</span>
                  <input
                    type="number"
                    value={item.discountPercent}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        onUpdateDiscount(item.medicine.id, val);
                      }
                    }}
                    className="w-16 px-2 py-1 rounded-[8px] border border-[#E2EEEC] text-sm text-[#1F2D2B] focus:outline-none focus:ring-1 focus:ring-[#2F8F83]"
                    aria-label="Discount percent"
                  />
                </div>

                {/* Line total preview */}
                <div className="ml-auto font-semibold text-[#1F2D2B]">
                  {formatMoney(
                    item.rate * item.quantity * (1 - item.discountPercent / 100)
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STEP 2: Customer & payment ────────────────────────────────────────────

function Step2Payment({
  selectedCustomer,
  onSelectCustomer,
  whatsappNumber,
  onWhatsappNumber,
  paymentMode,
  onPaymentMode,
  paidAmount,
  onPaidAmount,
  doctorName,
  onDoctorName,
  notes,
  onNotes,
  billTotal,
}: {
  selectedCustomer: Customer | null;
  onSelectCustomer: (c: Customer | null) => void;
  whatsappNumber: string;
  onWhatsappNumber: (number: string) => void;
  paymentMode: PaymentMode;
  onPaymentMode: (m: PaymentMode) => void;
  paidAmount: number;
  onPaidAmount: (n: number) => void;
  doctorName: string;
  onDoctorName: (s: string) => void;
  notes: string;
  onNotes: (s: string) => void;
  billTotal: number;
}) {
  const [search, setSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const createCustomer = useCreateCustomer();
  const { toast } = useToast();

  const customerQuery = useCustomers(search.length >= 2 ? { search, limit: 8 } : {});
  const results = search.length >= 2 ? (customerQuery.data?.data ?? []) : [];

  const udhaarAmount = paymentMode === "CREDIT" ? billTotal - paidAmount : 0;
  const creditLimitExceeded =
    paymentMode === "CREDIT" &&
    selectedCustomer &&
    udhaarAmount + selectedCustomer.balance > selectedCustomer.creditLimit &&
    selectedCustomer.creditLimit > 0;

  async function handleCreateCustomer() {
    if (!newCustName.trim()) return;
    try {
      const res = await createCustomer.mutateAsync({
        name: newCustName,
        phone: newCustPhone || undefined,
      });
      onSelectCustomer(res.data);
      setShowNewCustomer(false);
      setNewCustName("");
      setNewCustPhone("");
      toast("Customer added");
    } catch {
      toast("Could not add customer", "error");
    }
  }

  const pmButtons: { mode: PaymentMode; label: string }[] = [
    { mode: "CASH", label: "Cash" },
    { mode: "UPI", label: "UPI" },
    { mode: "CARD", label: "Card" },
    { mode: "CREDIT", label: "Credit (udhaar)" },
  ];

  return (
    <div className="space-y-6">
      {/* Customer */}
      <section>
        <h3 className="text-sm font-medium text-[#1F2D2B] mb-2">Customer</h3>

        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-[#E4F3F1] rounded-[10px] px-4 py-3">
            <div>
              <p className="font-medium text-[#1F2D2B]">{selectedCustomer.name}</p>
              {selectedCustomer.phone && (
                <p className="text-sm text-[#5A7370]">{selectedCustomer.phone}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelectCustomer(null)}
              className="text-sm text-[#5A7370] hover:text-[#D94F4F]"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowCustomerDrop(true);
                }}
                onFocus={() => setShowCustomerDrop(true)}
                onBlur={() => setTimeout(() => setShowCustomerDrop(false), 200)}
                placeholder="Search customer by name or phone…"
                className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] bg-white"
              />
              {showCustomerDrop && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[10px] border border-[#E2EEEC] shadow z-20 max-h-52 overflow-y-auto">
                  {results.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => {
                        onSelectCustomer(c);
                        setSearch("");
                        setShowCustomerDrop(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#F3F7F6] border-b border-[#E2EEEC] last:border-0"
                    >
                      <p className="font-medium text-[#1F2D2B]">{c.name}</p>
                      <p className="text-sm text-[#5A7370]">{c.phone ?? "No phone"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectCustomer(null)}
                className={`px-4 py-2 rounded-[10px] border text-sm font-medium transition-colors ${
                  !selectedCustomer
                    ? "border-[#2F8F83] bg-[#E4F3F1] text-[#2F8F83]"
                    : "border-[#E2EEEC] text-[#5A7370] hover:bg-[#F3F7F6]"
                }`}
              >
                Walk-in customer
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomer(true)}
                className="flex items-center gap-1.5 text-sm text-[#2F8F83] hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" /> New customer
              </button>
            </div>

            {/* Quick new customer */}
            {showNewCustomer && (
              <div className="bg-[#F3F7F6] rounded-[10px] p-4 space-y-3">
                <p className="text-sm font-medium text-[#1F2D2B]">Quick add customer</p>
                <input
                  type="text"
                  placeholder="Customer name *"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateCustomer}
                    disabled={createCustomer.isPending || !newCustName.trim()}
                    className="px-4 py-2 bg-[#2F8F83] text-white rounded-[8px] text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {createCustomer.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Add customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(false)}
                    className="px-4 py-2 border border-[#E2EEEC] text-[#5A7370] rounded-[8px] text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* WhatsApp delivery */}
      <section>
        <label className="text-sm font-medium text-[#1F2D2B] block mb-1.5">
          WhatsApp number <span className="text-[#5A7370] font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={whatsappNumber}
          onChange={(e) => onWhatsappNumber(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
        <p className="text-xs text-[#5A7370] mt-1">
          If provided, the bill PDF will be sent to this number after saving.
        </p>
      </section>

      {/* Payment mode */}
      <section>
        <h3 className="text-sm font-medium text-[#1F2D2B] mb-3">How are they paying?</h3>
        <div className="grid grid-cols-2 gap-3">
          {pmButtons.map((b) => (
            <button
              key={b.mode}
              type="button"
              onClick={() => {
                onPaymentMode(b.mode);
                if (b.mode !== "CREDIT") onPaidAmount(billTotal);
              }}
              disabled={b.mode === "CREDIT" && !selectedCustomer}
              className={`min-h-[60px] rounded-[12px] border-2 font-medium text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                paymentMode === b.mode
                  ? "border-[#2F8F83] bg-[#E4F3F1] text-[#2F8F83]"
                  : "border-[#E2EEEC] bg-white text-[#1F2D2B] hover:border-[#2F8F83]/30"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        {!selectedCustomer && (
          <p className="text-xs text-[#5A7370] mt-1.5">
            Select a customer to enable credit payment.
          </p>
        )}
      </section>

      {/* Paid amount */}
      <section>
        <label className="text-sm font-medium text-[#1F2D2B] block mb-1.5">
          Amount paid
        </label>
        <input
          type="number"
          value={paidAmount}
          min={0}
          max={billTotal}
          step={0.5}
          onChange={(e) => onPaidAmount(parseFloat(e.target.value) || 0)}
          className="w-full min-h-[48px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />

        {/* Udhaar notice */}
        {paymentMode === "CREDIT" && udhaarAmount > 0 && (
          <p
            className={`mt-2 text-sm px-3 py-2 rounded-[8px] ${
              creditLimitExceeded
                ? "bg-[#FDECEA] text-[#7A1F1F]"
                : "bg-[#FEF3E2] text-[#7C4D0D]"
            }`}
          >
            {creditLimitExceeded
              ? `⚠ This will exceed the credit limit of ${formatMoney(
                  selectedCustomer?.creditLimit ?? 0
                )}`
              : `${formatMoney(udhaarAmount)} will be added to udhaar`}
          </p>
        )}
      </section>

      {/* Doctor name */}
      <section>
        <label className="text-sm font-medium text-[#1F2D2B] block mb-1.5">
          Doctor name <span className="text-[#5A7370] font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={doctorName}
          onChange={(e) => onDoctorName(e.target.value)}
          placeholder="Dr. Sharma"
          className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
      </section>

      {/* Notes */}
      <section>
        <label className="text-sm font-medium text-[#1F2D2B] block mb-1.5">
          Notes <span className="text-[#5A7370] font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={2}
          placeholder="Any notes for this bill…"
          className="w-full px-3 py-2.5 rounded-[10px] border border-[#E2EEEC] text-base text-[#1F2D2B] placeholder:text-[#5A7370] focus:outline-none focus:ring-2 focus:ring-[#2F8F83] resize-none"
        />
      </section>
    </div>
  );
}

// ── STEP 3: Review ─────────────────────────────────────────────────────────

function Step3Review({
  cart,
  selectedCustomer,
  whatsappNumber,
  paymentMode,
  paidAmount,
  doctorName,
  notes,
  billDiscount,
  onBillDiscount,
  onSave,
  onSavePrint,
  isSaving,
}: {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  whatsappNumber: string;
  paymentMode: PaymentMode;
  paidAmount: number;
  doctorName: string;
  notes: string;
  billDiscount: number;
  onBillDiscount: (n: number) => void;
  onSave: () => void;
  onSavePrint: () => void;
  isSaving: boolean;
}) {
  const subtotal = cart.reduce(
    (s, item) => s + item.rate * item.quantity * (1 - item.discountPercent / 100),
    0
  );
  const total = Math.max(0, subtotal - billDiscount);
  const balance = total - paidAmount;

  return (
    <div className="space-y-6">
      {/* Items */}
      <div className="bg-white rounded-[12px] border border-[#E2EEEC]">
        {cart.map((item, i) => {
          const lineTotal = item.rate * item.quantity * (1 - item.discountPercent / 100);
          return (
            <div
              key={item.medicine.id}
              className={`flex items-center justify-between px-4 py-3 gap-3 ${
                i < cart.length - 1 ? "border-b border-[#E2EEEC]" : ""
              }`}
            >
              <div>
                <p className="font-medium text-[#1F2D2B] text-[15px]">{item.medicine.name}</p>
                <p className="text-sm text-[#5A7370]">
                  {item.quantity} × {formatMoney(item.rate)}
                  {item.discountPercent > 0 && ` (${item.discountPercent}% off)`}
                </p>
              </div>
              <MoneyText value={lineTotal} size="base" />
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-[12px] border border-[#E2EEEC] p-4 space-y-2">
        <div className="flex justify-between text-[15px]">
          <span className="text-[#5A7370]">Subtotal</span>
          <MoneyText value={subtotal} />
        </div>

        {/* Bill-level discount */}
        <div className="flex items-center justify-between text-[15px]">
          <span className="text-[#5A7370]">Bill discount (₹)</span>
          <input
            type="number"
            value={billDiscount}
            min={0}
            max={subtotal}
            onChange={(e) => onBillDiscount(parseFloat(e.target.value) || 0)}
            className="w-24 px-2 py-1 rounded-[8px] border border-[#E2EEEC] text-right text-[15px] text-[#1F2D2B] focus:outline-none focus:ring-1 focus:ring-[#2F8F83]"
          />
        </div>

        <div className="flex justify-between pt-2 border-t border-[#E2EEEC]">
          <span className="font-semibold text-[#1F2D2B]">Grand total</span>
          <MoneyText value={total} size="xl" />
        </div>

        <div className="flex justify-between text-[15px]">
          <span className="text-[#5A7370]">Paid</span>
          <MoneyText value={paidAmount} />
        </div>

        {balance > 0 && (
          <div className="flex justify-between text-[15px]">
            <span className="text-[#E8962A] font-medium">Balance (udhaar)</span>
            <MoneyText value={balance} className="text-[#E8962A]" />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-[#5A7370] space-y-1">
        <p>Customer: {selectedCustomer?.name ?? "Walk-in"}</p>
        {whatsappNumber && <p>WhatsApp bill: {whatsappNumber}</p>}
        <p>Payment: {paymentMode}</p>
        {doctorName && <p>Doctor: {doctorName}</p>}
        {notes && <p>Notes: {notes}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          <FileText className="w-4 h-4" />
          Save bill
        </button>
        <button
          type="button"
          onClick={onSavePrint}
          disabled={isSaving}
          className="flex-1 min-h-[52px] bg-white border border-[#E2EEEC] text-[#1F2D2B] font-semibold rounded-[12px] hover:bg-[#F3F7F6] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Save & print
        </button>
      </div>
    </div>
  );
}

// ── PRESCRIPTION STEP ──────────────────────────────────────────────────────

function StepPrescription({
  onSave,
}: {
  onSave: (data: PrescriptionForm) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionForm>({ resolver: zodResolver(prescriptionSchema) });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5">
      <p className="text-sm text-[#5A7370]">
        One or more medicines in this bill require a prescription. Please fill in the details below.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#1F2D2B]">Patient name *</label>
        <input
          type="text"
          {...register("patientName")}
          className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
        {errors.patientName && <p className="text-sm text-[#D94F4F]">{errors.patientName.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#1F2D2B]">Patient address</label>
        <input
          type="text"
          {...register("patientAddress")}
          className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#1F2D2B]">Doctor name *</label>
        <input
          type="text"
          {...register("doctorName")}
          className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
        {errors.doctorName && <p className="text-sm text-[#D94F4F]">{errors.doctorName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Doctor reg. no.</label>
          <input
            type="text"
            {...register("doctorRegNo")}
            className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1F2D2B]">Prescription no.</label>
          <input
            type="text"
            {...register("prescriptionNo")}
            className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#1F2D2B]">Prescription date</label>
        <input
          type="date"
          {...register("prescriptionDate")}
          className="w-full min-h-[44px] px-3 rounded-[10px] border border-[#E2EEEC] text-base focus:outline-none focus:ring-2 focus:ring-[#2F8F83]"
        />
      </div>

      <button
        type="submit"
        className="w-full min-h-[52px] bg-[#2F8F83] text-white font-semibold rounded-[12px] hover:bg-[#236F65]"
      >
        Save prescription details
      </button>
    </form>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function NewBillPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createSale = useCreateSale();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [paidAmount, setPaidAmount] = useState(0);
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [billDiscount, setBillDiscount] = useState(0);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionForm | null>(null);

  const hasScheduledDrug = cart.some((item) =>
    NEEDS_PRESCRIPTION.has(item.medicine.schedule)
  );

  // Build steps dynamically
  const allSteps = hasScheduledDrug
    ? [
        { label: "Add medicines" },
        { label: "Prescription details" },
        { label: "Customer & payment" },
        { label: "Review & save" },
      ]
    : [
        { label: "Add medicines" },
        { label: "Customer & payment" },
        { label: "Review & save" },
      ];

  const [stepIndex, setStepIndex] = useState(0);

  const billTotal = Math.max(
    0,
    cart.reduce(
      (s, item) => s + item.rate * item.quantity * (1 - item.discountPercent / 100),
      0
    ) - billDiscount
  );

  // Sync paidAmount with billTotal when mode isn't credit
  useEffect(() => {
    if (paymentMode !== "CREDIT") {
      setPaidAmount(billTotal);
    }
  }, [billTotal, paymentMode]);

  // F8 = save from anywhere on step 3
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F8") {
        e.preventDefault();
        if (stepIndex === allSteps.length - 1) handleSave(false);
      }
      if (e.key === "Escape" && stepIndex > 0) {
        setStepIndex((s) => s - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function addItem(m: Medicine) {
    setCart((prev) => {
      const existing = prev.find((i) => i.medicine.id === m.id);
      if (existing) {
        return prev.map((i) =>
          i.medicine.id === m.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { medicine: m, quantity: 1, rate: Number(m.mrp), discountPercent: 0 }];
    });
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.medicine.id !== id));
  }

  function updateQty(id: string, qty: number) {
    setCart((prev) =>
      prev.map((i) => (i.medicine.id === id ? { ...i, quantity: qty } : i))
    );
  }

  function updateDiscount(id: string, discount: number) {
    setCart((prev) =>
      prev.map((i) => (i.medicine.id === id ? { ...i, discountPercent: discount } : i))
    );
  }

  function handleNext() {
    if (stepIndex === 0 && cart.length === 0) {
      toast("Add at least one medicine to continue.", "error");
      return;
    }
    setStepIndex((s) => Math.min(s + 1, allSteps.length - 1));
  }

  function holdBill() {
    localStorage.setItem(
      "medibill_held_bill",
      JSON.stringify({ cart, selectedCustomer, whatsappNumber, paymentMode, paidAmount, doctorName, notes })
    );
    toast("Bill held. You can resume it later.");
  }

  async function handleSave(print: boolean) {
    try {
      const result = await createSale.mutateAsync({
        customerId: selectedCustomer?.id,
        whatsappNumber: whatsappNumber.trim() || undefined,
        items: cart.map((item) => ({
          medicineId: item.medicine.id,
          quantity: item.quantity,
          rate: item.rate,
          discountPercent: item.discountPercent,
        })),
        discount: billDiscount,
        paymentMode,
        paidAmount,
        doctorName: doctorName || undefined,
        notes: notes || undefined,
      });

      if (result.data.whatsapp?.status === "SENT") {
        toast("Bill saved and PDF sent via WhatsApp");
      } else if (result.data.whatsapp?.status === "QUEUED") {
        toast("Bill saved. Configure WhatsApp credentials to send bill PDFs.");
      } else if (result.data.whatsapp?.status === "FAILED") {
        toast("Bill saved, but WhatsApp delivery failed.", "error");
      } else {
        toast("Bill saved");
      }

      if (print) {
        router.push(`/sales/${result.data.id}?print=1`);
      } else {
        router.push(`/sales/${result.data.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.message, "error");
      } else {
        toast("Could not save bill. Please try again.", "error");
      }
    }
  }

  // Determine which step content to show
  const stepsFlat = hasScheduledDrug
    ? ["medicines", "prescription", "payment", "review"]
    : ["medicines", "payment", "review"];

  const currentStepName = stepsFlat[stepIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="New bill"
        help="Add medicines, pick a customer and choose how they pay."
      />

      <StepIndicator steps={allSteps} current={stepIndex} />

      {/* Step content */}
      <div className="bg-white rounded-[14px] border border-[#E2EEEC] p-5">
        {currentStepName === "medicines" && (
          <Step1Medicines
            cart={cart}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateQty={updateQty}
            onUpdateDiscount={updateDiscount}
          />
        )}

        {currentStepName === "prescription" && (
          <StepPrescription
            onSave={(data) => {
              setPrescriptionData(data);
              setStepIndex((s) => s + 1);
            }}
          />
        )}

        {currentStepName === "payment" && (
          <Step2Payment
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(customer) => {
              setSelectedCustomer(customer);
              setWhatsappNumber(customer?.phone ?? "");
            }}
            whatsappNumber={whatsappNumber}
            onWhatsappNumber={setWhatsappNumber}
            paymentMode={paymentMode}
            onPaymentMode={setPaymentMode}
            paidAmount={paidAmount}
            onPaidAmount={setPaidAmount}
            doctorName={doctorName}
            onDoctorName={setDoctorName}
            notes={notes}
            onNotes={setNotes}
            billTotal={billTotal}
          />
        )}

        {currentStepName === "review" && (
          <Step3Review
            cart={cart}
            selectedCustomer={selectedCustomer}
            whatsappNumber={whatsappNumber}
            paymentMode={paymentMode}
            paidAmount={paidAmount}
            doctorName={doctorName}
            notes={notes}
            billDiscount={billDiscount}
            onBillDiscount={setBillDiscount}
            onSave={() => handleSave(false)}
            onSavePrint={() => handleSave(true)}
            isSaving={createSale.isPending}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStepName !== "prescription" && currentStepName !== "review" && (
        <div className="flex items-center justify-between mt-4 gap-3">
          <button
            type="button"
            onClick={holdBill}
            className="text-sm text-[#5A7370] hover:text-[#1F2D2B] border border-[#E2EEEC] rounded-[8px] px-3 py-2"
          >
            Hold bill
          </button>
          <div className="flex gap-3">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((s) => s - 1)}
                className="px-5 py-2.5 border border-[#E2EEEC] rounded-[10px] text-[#1F2D2B] font-medium hover:bg-[#F3F7F6]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {currentStepName === "payment" && (
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={holdBill}
            className="text-sm text-[#5A7370] border border-[#E2EEEC] rounded-[8px] px-3 py-2"
          >
            Hold bill
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((s) => s - 1)}
              className="px-5 py-2.5 border border-[#E2EEEC] rounded-[10px] text-[#1F2D2B] font-medium hover:bg-[#F3F7F6]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#2F8F83] text-white font-medium rounded-[10px] hover:bg-[#236F65] min-h-[44px]"
            >
              Review bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
