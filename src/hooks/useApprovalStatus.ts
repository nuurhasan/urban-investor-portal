import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export function useApprovalStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["approval-status", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ApprovalStatus | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.approval_status as ApprovalStatus) ?? "pending";
    },
  });
}
