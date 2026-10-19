import { api } from "@/lib/api";

export interface Store {
  id: string;
  name: string;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstin: string | null;
  drugLicenseNo: string | null;
  invoicePrefix: string;
  nextInvoiceNo: number;
  language: string;
  upiId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStoreInput {
  name?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  drugLicenseNo?: string;
  invoicePrefix?: string;
  language?: "en" | "hi" | "gu";
  upiId?: string;
}

export async function getStore() {
  return api.get<{ success: boolean; data: Store }>(`/stores/me`);
}

export async function updateStore(input: UpdateStoreInput) {
  return api.patch<{ success: boolean; data: Store }>(`/stores/me`, input);
}
