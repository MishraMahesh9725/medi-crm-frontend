import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  drugLicenseNo: string | null;
  balance: number; // amount we owe
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  drugLicenseNo?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface ListSuppliersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listSuppliers(query: ListSuppliersQuery = {}) {
  return api.get<{
    success: boolean;
    data: Supplier[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/suppliers${buildQuery(query)}`);
}

export async function getSupplier(id: string) {
  return api.get<{ success: boolean; data: Supplier }>(`/suppliers/${id}`);
}

export async function createSupplier(input: CreateSupplierInput) {
  return api.post<{ success: boolean; data: Supplier }>(`/suppliers`, input);
}

export async function updateSupplier(id: string, input: UpdateSupplierInput) {
  return api.patch<{ success: boolean; data: Supplier }>(`/suppliers/${id}`, input);
}
