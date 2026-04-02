import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KpiValue {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

export function useKpiValues() {
  return useQuery({
    queryKey: ["kpi_values"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kpi_values")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as KpiValue[];
    },
  });
}

export function useUpdateKpi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, label, value }: { id: string; label: string; value: string }) => {
      const { error } = await supabase
        .from("kpi_values")
        .update({ label, value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kpi_values"] });
    },
  });
}
