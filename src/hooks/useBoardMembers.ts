import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BoardMember = {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
};

export function useBoardMembers() {
  return useQuery({
    queryKey: ["board_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_members")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as BoardMember[];
    },
  });
}

export function useUpsertBoardMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: Partial<BoardMember> & { name: string; title: string }) => {
      if (member.id) {
        const { error } = await supabase.from("board_members").update(member).eq("id", member.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("board_members").insert(member);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board_members"] }),
  });
}

export function useDeleteBoardMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("board_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board_members"] }),
  });
}
