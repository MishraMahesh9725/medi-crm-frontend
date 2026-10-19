import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

// ── Types matching the backend exactly ────────────────────────────────────

export type PaymentMode = "CASH" | "UPI" | "CARD" | "CREDIT" | "MIXED";
export type SaleStatus = "COMPLETED" | "CANCELLED" | "RETURNED";

export interface SaleItemInput {
  medicineId: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
}

export interface CreateSaleInput {
  customerId?: string;
  items: SaleItemInput[];
  discount?: number;
  paymentMode: PaymentMode;
  paidAmount: number;
  doctorName?: string;
  notes?: string;
}

export interface SaleItem {
  id: string;
  quantity: number;
  mrp: number;
  rate: number;
  discountPercent: number;
  gstPercent: number;
  taxAmount: number;
  lineTotal: number;
  purchasePriceAtSale: number;
  batch: {
    id: string;
    batchNo: string;
    expiryDate?: string;
    medicine: {
      id: string;
      name: string;
      company: string | null;
      packSize?: string | null;
    };
  };
}

export interface Sale {
  id: string;
  invoiceNo: string;
  saleDate: string;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  status: SaleStatus;
  doctorName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    address?: string | null;
  } | null;
  user?: {
    id: string;
    name: string;
  } | null;
  items?: SaleItem[];
}

export interface ListSalesQuery {
  customerId?: string;
  paymentMode?: PaymentMode;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listSales(query: ListSalesQuery = {}): Promise<ListResponse<Sale>> {
  return api.get<ListResponse<Sale>>(`/sales${buildQuery(query)}`);
}

export async function getSale(id: string): Promise<{ success: boolean; data: Sale }> {
  return api.get(`/sales/${id}`);
}

export async function createSale(input: CreateSaleInput): Promise<{ success: boolean; data: Sale }> {
  return api.post(`/sales`, input);
}
