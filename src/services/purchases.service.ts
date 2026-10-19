import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export interface PurchaseItemInput {
  medicineId: string;
  batchNumber: string;
  expiryDate: string; // ISO datetime
  quantity: number;
  freeQuantity?: number;
  mrp: number;
  purchasePrice: number;
  gstPercent: number;
  discountPercent?: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  billNo: string;
  billDate: string; // ISO datetime
  items: PurchaseItemInput[];
  discount?: number;
  paidAmount?: number;
  invoiceImageUrl?: string;
}

export interface PurchaseItem {
  id: string;
  quantity: number;
  freeQuantity: number;
  purchasePrice: number;
  mrp: number;
  gstPercent: number;
  discountPercent: number;
  lineTotal: number;
  batch: {
    id: string;
    batchNo: string;
    expiryDate: string;
    medicine: { id: string; name: string; company: string | null };
  };
}

export interface Purchase {
  id: string;
  billNo: string;
  billDate: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  invoiceImageUrl: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
    phone: string | null;
  };
  items?: PurchaseItem[];
}

export interface ListPurchasesQuery {
  supplierId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export async function listPurchases(query: ListPurchasesQuery = {}) {
  return api.get<{
    success: boolean;
    data: Purchase[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/purchases${buildQuery(query)}`);
}

export async function getPurchase(id: string) {
  return api.get<{ success: boolean; data: Purchase }>(`/purchases/${id}`);
}

export async function createPurchase(input: CreatePurchaseInput) {
  return api.post<{ success: boolean; data: Purchase }>(`/purchases`, input);
}
