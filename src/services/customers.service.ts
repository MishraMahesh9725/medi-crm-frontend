import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  doctorName: string | null;
  creditLimit: number;
  balance: number; // udhaar owed to store
  whatsappOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  address?: string;
  doctorName?: string;
  creditLimit?: number;
  whatsappOptIn?: boolean;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export interface ListCustomersQuery {
  search?: string;
  hasUdhaar?: boolean;
  page?: number;
  limit?: number;
}

export type LedgerEntryType = "DEBIT" | "CREDIT";

export interface LedgerEntry {
  entryType: LedgerEntryType;
  date: string;
  // DEBIT fields
  invoiceNo?: string;
  total?: number;
  paidAmount?: number;
  saleId?: string;
  // CREDIT fields
  amount?: number;
  reference?: string | null;
  note?: string | null;
  paymentId?: string;
}

export interface LedgerResponse {
  success: boolean;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    balance: number;
    creditLimit: number;
    availableCredit: number;
  };
  ledger: LedgerEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listCustomers(query: ListCustomersQuery = {}) {
  const q: Record<string, unknown> = { ...query };
  if (q.hasUdhaar !== undefined) q.hasUdhaar = String(q.hasUdhaar);
  return api.get<{
    success: boolean;
    data: Customer[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/customers${buildQuery(q)}`);
}

export async function getCustomer(id: string) {
  return api.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
}

export async function createCustomer(input: CreateCustomerInput) {
  return api.post<{ success: boolean; data: Customer }>(`/customers`, input);
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  return api.patch<{ success: boolean; data: Customer }>(`/customers/${id}`, input);
}

export async function getCustomerLedger(
  id: string,
  query: { page?: number; limit?: number } = {}
): Promise<LedgerResponse> {
  return api.get<LedgerResponse>(`/customers/${id}/ledger${buildQuery(query)}`);
}
