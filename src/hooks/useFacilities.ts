import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Facility {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  total_units: number | null;
  net_lettable_area: number | null;
  occupancy_pct: number | null;
  annual_revenue: number | null;
  net_operating_income: number | null;
  estimated_value: number | null;
  revenue_per_unit: number | null;
  overview_text: string | null;
  status: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface FacilityUnitMix {
  id: string;
  facility_id: string;
  unit_type: string;
  unit_count: number;
  unit_size_sqm: number | null;
  monthly_rate: number | null;
  sort_order: number;
}

export interface FacilityPhoto {
  id: string;
  facility_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

export function useFacilities() {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Facility[];
    },
  });
}

export function useFacilityUnitMixes(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["facility_unit_mixes", facilityId],
    enabled: !!facilityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_unit_mixes")
        .select("*")
        .eq("facility_id", facilityId!)
        .order("sort_order");
      if (error) throw error;
      return data as FacilityUnitMix[];
    },
  });
}

export function useFacilityPhotos(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["facility_photos", facilityId],
    enabled: !!facilityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_photos")
        .select("*")
        .eq("facility_id", facilityId!)
        .order("sort_order");
      if (error) throw error;
      return data as FacilityPhoto[];
    },
  });
}

// --- Mutations ---

export function useUpdateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Facility> & { id: string }) => {
      const { error } = await supabase
        .from("facilities")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

export function useUpsertUnitMix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<FacilityUnitMix, "id"> & { id?: string }) => {
      const { error } = await supabase
        .from("facility_unit_mixes")
        .upsert(row as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["facility_unit_mixes", vars.facility_id] });
    },
  });
}

export function useDeleteUnitMix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, facility_id }: { id: string; facility_id: string }) => {
      const { error } = await supabase
        .from("facility_unit_mixes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return facility_id;
    },
    onSuccess: (facility_id) => {
      qc.invalidateQueries({ queryKey: ["facility_unit_mixes", facility_id] });
    },
  });
}

export function useAddFacilityPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ facility_id, url, caption }: { facility_id: string; url: string; caption?: string }) => {
      const { error } = await supabase
        .from("facility_photos")
        .insert({ facility_id, url, caption: caption || null });
      if (error) throw error;
      return facility_id;
    },
    onSuccess: (facility_id) => {
      qc.invalidateQueries({ queryKey: ["facility_photos", facility_id] });
    },
  });
}

export function useDeleteFacilityPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, facility_id, url }: { id: string; facility_id: string; url: string }) => {
      // Delete DB record
      const { error } = await supabase
        .from("facility_photos")
        .delete()
        .eq("id", id);
      if (error) throw error;
      // Try to delete from storage (best effort)
      try {
        const path = new URL(url).pathname.split("/facility-photos/")[1];
        if (path) {
          await supabase.storage.from("facility-photos").remove([decodeURIComponent(path)]);
        }
      } catch {}
      return facility_id;
    },
    onSuccess: (facility_id) => {
      qc.invalidateQueries({ queryKey: ["facility_photos", facility_id] });
    },
  });
}
