CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_seed_admin boolean;
  _is_admin boolean;
BEGIN
  _is_seed_admin := lower(NEW.email) = 'wes@urbanselfstorage.com.au';

  -- Seed admin: insert role first so trigger sees it
  IF _is_seed_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  _is_admin := _is_seed_admin OR public.has_role(NEW.id, 'admin');

  INSERT INTO public.profiles (user_id, full_name, approval_status, approved_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN _is_admin THEN 'approved'::public.approval_status ELSE 'pending'::public.approval_status END,
    CASE WHEN _is_admin THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$$;