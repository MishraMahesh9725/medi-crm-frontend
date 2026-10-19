import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export type PaymentType = "RECEIPT" | "REFUND" | "SUPPLIER_PAYMENT";
export type PaymentMode = "CASH" | "UPI" | "CARD" | "CREDIT" | "MIXED";

export interface RecordPaymentInput {
  type: PaymentType;
  mode?: PaymentMode;
  amount: number;
  customerId?: string;
  supplierId?: string;
  saleId?: string;
  reference?: string;
  note?: string;
}

export interface Payment {
  id: string;
  type: PaymentType;
  mode: PaymentMode;
  amount: number;
  customerId: string | null;
  supplierId: string | null;
  saleId: string | null;
  reference: string | null;
  note: string | null;
  paidAt: string;
}

export async function recordPayment(input: RecordPaymentInput) {
  return api.post<{ success: boolean; data: Payment }>(`/payments`, input);
}

export async function listPayments(query: {
  type?: PaymentType;
  customerId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  return api.get<{
    success: boolean;
    data: Payment[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/payments${buildQuery(query)}`);
}
