
-- Board members table
CREATE TABLE public.board_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  bio TEXT,
  photo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view board members"
  ON public.board_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert board members"
  ON public.board_members FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board members"
  ON public.board_members FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board members"
  ON public.board_members FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_board_members_updated_at
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed governance site_content keys
INSERT INTO public.site_content (key, title, body) VALUES
  ('governance_values', 'Our Values & Mission', 'We are committed to delivering secure, accessible, and high-quality self-storage solutions across regional Australia.'),
  ('governance_sha', 'Security Holders Agreement', 'The SHA governs the relationship between shareholders and outlines key rights, obligations, and decision-making processes.')
ON CONFLICT DO NOTHING;
