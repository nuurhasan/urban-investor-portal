import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteContent(key: string) {
  return useQuery({
    queryKey: ["site_content", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, title, body }: { key: string; title?: string | null; body?: string | null }) => {
      const { error } = await supabase
        .from("site_content")
        .update({ title, body })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["site_content", vars.key] });
    },
  });
}
