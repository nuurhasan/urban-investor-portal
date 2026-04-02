
-- Create status enum
CREATE TYPE public.pipeline_status AS ENUM ('prospect', 'due_diligence', 'under_contract', 'completed');

-- Create growth pipeline table
CREATE TABLE public.growth_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  status pipeline_status NOT NULL DEFAULT 'prospect',
  estimated_value DOUBLE PRECISION DEFAULT 0,
  estimated_units INTEGER DEFAULT 0,
  target_close_date DATE,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.growth_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pipeline" ON public.growth_pipeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert pipeline" ON public.growth_pipeline FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update pipeline" ON public.growth_pipeline FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete pipeline" ON public.growth_pipeline FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_growth_pipeline_updated_at BEFORE UPDATE ON public.growth_pipeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed site_content for Growth page
INSERT INTO public.site_content (key, title, body) VALUES
  ('growth_header', 'Growth & Strategy', 'Our expansion roadmap and acquisition pipeline.'),
  ('growth_strategy', 'Strategic Initiatives', 'USS is pursuing a disciplined acquisition strategy focused on high-growth metropolitan corridors across Australia. Our pipeline targets facilities with strong occupancy fundamentals and value-add potential through operational improvements and technology integration.')
ON CONFLICT DO NOTHING;
