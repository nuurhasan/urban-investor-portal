import { useQuery } from "@tanstack/react-query";
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
