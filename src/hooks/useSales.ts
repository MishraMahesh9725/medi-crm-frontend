import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listSales, getSale, createSale, type ListSalesQuery, type CreateSaleInput } from "@/services/sales.service";

export const salesKeys = {
  all: ["sales"] as const,
  list: (q: ListSalesQuery) => ["sales", "list", q] as const,
  detail: (id: string) => ["sales", "detail", id] as const,
};

export function useSales(query: ListSalesQuery = {}) {
  return useQuery({
    queryKey: salesKeys.list(query),
    queryFn: () => listSales(query),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => getSale(id),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}
