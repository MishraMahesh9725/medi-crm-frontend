import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  getSubstitutes,
  type ListMedicinesQuery,
  type CreateMedicineInput,
  type UpdateMedicineInput,
} from "@/services/medicines.service";

export const medicineKeys = {
  all: ["medicines"] as const,
  list: (q: ListMedicinesQuery) => ["medicines", "list", q] as const,
  detail: (id: string) => ["medicines", "detail", id] as const,
  substitutes: (id: string) => ["medicines", "substitutes", id] as const,
};

export function useMedicines(query: ListMedicinesQuery = {}) {
  return useQuery({
    queryKey: medicineKeys.list(query),
    queryFn: () => listMedicines(query),
  });
}

export function useMedicine(id: string) {
  return useQuery({
    queryKey: medicineKeys.detail(id),
    queryFn: () => getMedicine(id),
    enabled: !!id,
  });
}

export function useSubstitutes(id: string) {
  return useQuery({
    queryKey: medicineKeys.substitutes(id),
    queryFn: () => getSubstitutes(id),
    enabled: !!id,
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMedicineInput) => createMedicine(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: medicineKeys.all });
    },
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMedicineInput }) =>
      updateMedicine(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: medicineKeys.all });
    },
  });
}
