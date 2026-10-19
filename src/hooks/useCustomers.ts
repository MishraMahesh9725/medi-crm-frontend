import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  getCustomerLedger,
  type ListCustomersQuery,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/services/customers.service";

export const customerKeys = {
  all: ["customers"] as const,
  list: (q: ListCustomersQuery) => ["customers", "list", q] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
  ledger: (id: string, q: object) => ["customers", "ledger", id, q] as const,
};

export function useCustomers(query: ListCustomersQuery = {}) {
  return useQuery({
    queryKey: customerKeys.list(query),
    queryFn: () => listCustomers(query),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}

export function useCustomerLedger(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: customerKeys.ledger(id, query),
    queryFn: () => getCustomerLedger(id, query),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      updateCustomer(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}
