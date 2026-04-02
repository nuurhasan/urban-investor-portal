
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-photos', 'facility-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view facility photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'facility-photos');

CREATE POLICY "Admins can upload facility photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'facility-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update facility photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'facility-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete facility photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'facility-photos' AND public.has_role(auth.uid(), 'admin'));
