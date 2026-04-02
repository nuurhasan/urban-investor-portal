
-- Site content for CMS-editable text blocks
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view site content"
  ON public.site_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KPI values table
CREATE TABLE public.kpi_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view KPIs"
  ON public.kpi_values FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert KPIs"
  ON public.kpi_values FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update KPIs"
  ON public.kpi_values FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete KPIs"
  ON public.kpi_values FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_kpi_values_updated_at
  BEFORE UPDATE ON public.kpi_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default welcome content
INSERT INTO public.site_content (key, title, body) VALUES
  ('welcome_title', 'Welcome to Urban Self Storage', NULL),
  ('welcome_body', NULL, 'Your secure portal for investment performance, asset data, and corporate documents. Explore the latest metrics and reports below.');

-- Seed default KPI values
INSERT INTO public.kpi_values (label, value, sort_order) VALUES
  ('Total Company Value', '$42.5M', 1),
  ('Facilities', '2', 2),
  ('Total Units', '385', 3),
  ('Avg Occupancy', '87%', 4),
  ('Dividend Yield', '6.2%', 5),
  ('Annual Revenue', '$3.8M', 6),
  ('NOI', '$1.2M', 7),
  ('YoY Revenue Growth', '12.4%', 8);

-- Storage bucket for documents/brochures
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Authenticated users can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
