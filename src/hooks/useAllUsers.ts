import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = "admin" | "advisor" | "investor";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ManagedUser {
  user_id: string;
  full_name: string | null;
  company: string | null;
  approval_status: ApprovalStatus;
  approved_at: string | null;
  created_at: string;
  roles: AppRole[];
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async (): Promise<ManagedUser[]> => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, company, approval_status, approved_at, created_at")
        .order("approval_status", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: roleRows, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rErr) throw rErr;

      const rolesByUser = new Map<string, AppRole[]>();
      (roleRows ?? []).forEach((r) => {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role as AppRole);
        rolesByUser.set(r.user_id, arr);
      });

      return (profiles ?? []).map((p) => ({
        ...(p as Omit<ManagedUser, "roles">),
        roles: rolesByUser.get(p.user_id) ?? [],
      }));
    },
  });
}

export function useUpdateApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: ApprovalStatus }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: status,
          approved_at: status === "approved" ? new Date().toISOString() : null,
          approved_by: auth.user?.id ?? null,
        })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      toast.success(`User ${vars.status}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Role assigned");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: AppRole;
  company?: string;
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: input,
      });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.error ?? "Failed to create user");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("User created and approved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { userId },
      });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.error ?? "Failed to delete user");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("User deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Role removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
