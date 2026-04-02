import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type PipelineItem = Tables<"growth_pipeline">;

export function useGrowthPipeline() {
  return useQuery({
    queryKey: ["growth_pipeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("growth_pipeline")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as PipelineItem[];
    },
  });
}

export function useUpsertPipelineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: TablesInsert<"growth_pipeline"> & { id?: string }) => {
      const { error } = await supabase.from("growth_pipeline").upsert(item as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["growth_pipeline"] }),
  });
}

export function useDeletePipelineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("growth_pipeline").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["growth_pipeline"] }),
  });
}
