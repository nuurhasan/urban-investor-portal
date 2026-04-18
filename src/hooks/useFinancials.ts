import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FinancialMetric = {
  id: string;
  category: string;
  label: string;
  value: number;
  period: string;
  sort_order: number;
};

export type FinancialDocument = {
  id: string;
  name: string;
  description: string | null;
  storage_path: string;
  category: string;
  sort_order: number;
  created_at: string;
};

export function useFinancialMetrics() {
  return useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_metrics")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as FinancialMetric[];
    },
  });
}

export function useUpsertFinancialMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metric: Partial<FinancialMetric> & { label: string }) => {
      if (metric.id) {
        const { error } = await supabase.from("financial_metrics").update(metric).eq("id", metric.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("financial_metrics").insert(metric);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial_metrics"] }),
  });
}

export function useDeleteFinancialMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_metrics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial_metrics"] }),
  });
}

export function useFinancialDocuments(opts?: { category?: string; excludeCategory?: string }) {
  const category = opts?.category;
  const excludeCategory = opts?.excludeCategory;
  return useQuery({
    queryKey: ["financial_documents", category ?? "all", excludeCategory ?? "none"],
    queryFn: async () => {
      let query = supabase.from("financial_documents").select("*").order("sort_order");
      if (category) query = query.eq("category", category);
      if (excludeCategory) query = query.neq("category", excludeCategory);
      const { data, error } = await query;
      if (error) throw error;
      return data as FinancialDocument[];
    },
  });
}

export function useAddFinancialDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Omit<FinancialDocument, "id" | "created_at" | "sort_order">) => {
      const { error } = await supabase.from("financial_documents").insert(doc);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial_documents"] }),
  });
}

export function useDeleteFinancialDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from("documents").remove([storagePath]);
      const { error } = await supabase.from("financial_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial_documents"] }),
  });
}
