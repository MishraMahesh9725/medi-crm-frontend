import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPurchases,
  getPurchase,
  createPurchase,
  type ListPurchasesQuery,
  type CreatePurchaseInput,
} from "@/services/purchases.service";

export const purchaseKeys = {
  all: ["purchases"] as const,
  list: (q: ListPurchasesQuery) => ["purchases", "list", q] as const,
  detail: (id: string) => ["purchases", "detail", id] as const,
};

export function usePurchases(query: ListPurchasesQuery = {}) {
  return useQuery({
    queryKey: purchaseKeys.list(query),
    queryFn: () => listPurchases(query),
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => getPurchase(id),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePurchaseInput) => createPurchase(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
}
