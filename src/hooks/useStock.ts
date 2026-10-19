import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBatches,
  addBatch,
  adjustStock,
  getExpiryAlerts,
  type ListBatchesQuery,
  type AddBatchInput,
  type AdjustStockInput,
} from "@/services/stock.service";

export const stockKeys = {
  all: ["stock"] as const,
  batches: (q: ListBatchesQuery) => ["stock", "batches", q] as const,
  alerts: (q: object) => ["stock", "alerts", q] as const,
};

export function useBatches(query: ListBatchesQuery = {}) {
  return useQuery({
    queryKey: stockKeys.batches(query),
    queryFn: () => listBatches(query),
  });
}

export function useExpiryAlerts(query: { days?: number; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: stockKeys.alerts(query),
    queryFn: () => getExpiryAlerts(query),
  });
}

export function useAddBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddBatchInput) => addBatch(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdjustStockInput) => adjustStock(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}
