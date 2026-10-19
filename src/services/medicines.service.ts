import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export type DrugSchedule = "NONE" | "H" | "H1" | "X" | "NARCOTIC";

export interface Medicine {
  id: string;
  name: string;
  company: string | null;
  salt: string | null;
  form: string | null;
  packSize: string | null;
  unitsPerPack: number;
  mrp: number;
  gstPercent: number;
  hsnCode: string | null;
  schedule: DrugSchedule;
  barcode: string | null;
  rackLocation: string | null;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // aggregated from batches:
  totalStock?: number;
  nextExpiry?: string | null;
}

export interface CreateMedicineInput {
  name: string;
  company?: string;
  salt?: string;
  form?: string;
  packSize?: string;
  unitsPerPack?: number;
  mrp: number;
  gstPercent?: number;
  hsnCode?: string;
  schedule?: DrugSchedule;
  barcode?: string;
  rackLocation?: string;
  minStock?: number;
  masterMedicineId?: string;
}

export interface UpdateMedicineInput extends Partial<Omit<CreateMedicineInput, "masterMedicineId">> {}

export interface ListMedicinesQuery {
  search?: string;
  schedule?: DrugSchedule;
  form?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export async function listMedicines(query: ListMedicinesQuery = {}) {
  const q: Record<string, unknown> = { ...query };
  if (q.lowStock !== undefined) q.lowStock = String(q.lowStock);
  return api.get<{
    success: boolean;
    data: Medicine[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/medicines${buildQuery(q)}`);
}

export async function getMedicine(id: string) {
  return api.get<{ success: boolean; data: Medicine }>(`/medicines/${id}`);
}

export async function getSubstitutes(id: string) {
  return api.get<{ success: boolean; data: Medicine[] }>(`/medicines/${id}/substitutes`);
}

export async function createMedicine(input: CreateMedicineInput) {
  return api.post<{ success: boolean; data: Medicine }>(`/medicines`, input);
}

export async function updateMedicine(id: string, input: UpdateMedicineInput) {
  return api.patch<{ success: boolean; data: Medicine; message: string }>(`/medicines/${id}`, input);
}
