
-- Financial metrics table
CREATE TABLE public.financial_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'revenue',
  label TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'FY2025',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial metrics"
  ON public.financial_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert financial metrics"
  ON public.financial_metrics FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update financial metrics"
  ON public.financial_metrics FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete financial metrics"
  ON public.financial_metrics FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_financial_metrics_updated_at
  BEFORE UPDATE ON public.financial_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial documents table
CREATE TABLE public.financial_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial documents"
  ON public.financial_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert financial documents"
  ON public.financial_documents FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update financial documents"
  ON public.financial_documents FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete financial documents"
  ON public.financial_documents FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_financial_documents_updated_at
  BEFORE UPDATE ON public.financial_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some initial financial metrics
INSERT INTO public.financial_metrics (category, label, value, period, sort_order) VALUES
  ('revenue', 'Total Revenue', 2450000, 'FY2025', 1),
  ('revenue', 'Net Operating Income', 1680000, 'FY2025', 2),
  ('revenue', 'Total Revenue', 2100000, 'FY2024', 3),
  ('revenue', 'Net Operating Income', 1420000, 'FY2024', 4),
  ('expense', 'Operating Expenses', 770000, 'FY2025', 1),
  ('expense', 'Management Fees', 245000, 'FY2025', 2),
  ('expense', 'Operating Expenses', 680000, 'FY2024', 3),
  ('expense', 'Management Fees', 210000, 'FY2024', 4),
  ('valuation', 'Portfolio Value', 18500000, 'FY2025', 1),
  ('valuation', 'Equity Value', 12200000, 'FY2025', 2),
  ('valuation', 'Portfolio Value', 16800000, 'FY2024', 3),
  ('valuation', 'Equity Value', 10900000, 'FY2024', 4);

-- Seed site_content
INSERT INTO public.site_content (key, title, body) VALUES
  ('financials_intro', 'Financials & Reporting', 'Key financial performance indicators and document library for USS investors.')
ON CONFLICT DO NOTHING;
