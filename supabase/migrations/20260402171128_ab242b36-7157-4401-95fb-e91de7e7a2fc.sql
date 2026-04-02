
-- Facilities table
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'Australia',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  total_units INTEGER DEFAULT 0,
  net_lettable_area DOUBLE PRECISION DEFAULT 0,
  occupancy_pct DOUBLE PRECISION DEFAULT 0,
  annual_revenue DOUBLE PRECISION DEFAULT 0,
  net_operating_income DOUBLE PRECISION DEFAULT 0,
  estimated_value DOUBLE PRECISION DEFAULT 0,
  revenue_per_unit DOUBLE PRECISION DEFAULT 0,
  overview_text TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view facilities" ON public.facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert facilities" ON public.facilities FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update facilities" ON public.facilities FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete facilities" ON public.facilities FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Facility photos
CREATE TABLE public.facility_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.facility_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view facility photos" ON public.facility_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert facility photos" ON public.facility_photos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update facility photos" ON public.facility_photos FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete facility photos" ON public.facility_photos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Unit mix
CREATE TABLE public.facility_unit_mixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  unit_type TEXT NOT NULL,
  unit_count INTEGER NOT NULL DEFAULT 0,
  unit_size_sqm DOUBLE PRECISION,
  monthly_rate DOUBLE PRECISION,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.facility_unit_mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view unit mixes" ON public.facility_unit_mixes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert unit mixes" ON public.facility_unit_mixes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update unit mixes" ON public.facility_unit_mixes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete unit mixes" ON public.facility_unit_mixes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
