import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export type StockReason = "DAMAGED" | "EXPIRED" | "RETURN_TO_SUPPLIER" | "CORRECTION" | "OPENING_STOCK";

export interface Batch {
  id: string;
  medicineId: string;
  batchNo: string;
  expiryDate: string;
  purchasePrice: number;
  mrp: number;
  quantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  medicine?: {
    id: string;
    name: string;
    company: string | null;
    minStock: number;
  };
}

export interface AddBatchInput {
  medicineId: string;
  batchNo: string;
  expiryDate: string; // ISO date string
  purchasePrice: number;
  mrp: number;
  quantity: number;
}

export interface AdjustStockInput {
  batchId: string;
  quantity: number; // negative = remove, positive = add
  reason: StockReason;
  note?: string;
}

export interface ListBatchesQuery {
  medicineId?: string;
  expiringSoon?: boolean;
  expired?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ExpiryAlert {
  id: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  mrp: number;
  medicine: {
    id: string;
    name: string;
    company: string | null;
  };
  daysLeft: number;
}

export async function listBatches(query: ListBatchesQuery = {}) {
  const q: Record<string, unknown> = { ...query };
  if (q.expiringSoon !== undefined) q.expiringSoon = String(q.expiringSoon);
  if (q.expired !== undefined) q.expired = String(q.expired);
  if (q.lowStock !== undefined) q.lowStock = String(q.lowStock);
  return api.get<{
    success: boolean;
    data: Batch[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/stock/batches${buildQuery(q)}`);
}

export async function getBatch(id: string) {
  return api.get<{ success: boolean; data: Batch }>(`/stock/batches/${id}`);
}

export async function addBatch(input: AddBatchInput) {
  return api.post<{ success: boolean; data: Batch }>(`/stock/batches`, input);
}

export async function adjustStock(input: AdjustStockInput) {
  return api.post<{ success: boolean; data: unknown }>(`/stock/adjust`, input);
}

export async function getExpiryAlerts(query: { days?: number; page?: number; limit?: number } = {}) {
  return api.get<{
    success: boolean;
    data: ExpiryAlert[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/stock/expiry-alerts${buildQuery(query)}`);
}
