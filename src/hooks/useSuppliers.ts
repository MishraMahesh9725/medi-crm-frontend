import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  type ListSuppliersQuery,
  type CreateSupplierInput,
  type UpdateSupplierInput,
} from "@/services/suppliers.service";

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (q: ListSuppliersQuery) => ["suppliers", "list", q] as const,
  detail: (id: string) => ["suppliers", "detail", id] as const,
};

export function useSuppliers(query: ListSuppliersQuery = {}) {
  return useQuery({
    queryKey: supplierKeys.list(query),
    queryFn: () => listSuppliers(query),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => getSupplier(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSupplierInput) => createSupplier(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierInput }) =>
      updateSupplier(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: supplierKeys.all });
      qc.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}
