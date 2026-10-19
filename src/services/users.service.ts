import { api } from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export type Role = "OWNER" | "PHARMACIST" | "CASHIER";

export interface StoreUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface InviteUserInput {
  name: string;
  email?: string;
  phone?: string;
  role?: Role;
}

export async function listUsers(query: { role?: Role; search?: string; page?: number; limit?: number } = {}) {
  return api.get<{
    success: boolean;
    data: StoreUser[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/users${buildQuery(query)}`);
}

export async function inviteUser(input: InviteUserInput) {
  return api.post<{ success: boolean; data: StoreUser }>(`/users`, input);
}

export async function updateUser(id: string, input: Partial<InviteUserInput & { isActive: boolean }>) {
  return api.patch<{ success: boolean; data: StoreUser }>(`/users/${id}`, input);
}

export async function deactivateUser(id: string) {
  return api.delete<{ success: boolean }>(`/users/${id}`);
}

export async function activateUser(id: string) {
  return api.post<{ success: boolean; data: StoreUser }>(`/users/${id}/activate`, {});
}
