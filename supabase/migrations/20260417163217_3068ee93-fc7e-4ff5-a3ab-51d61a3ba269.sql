-- 1. Approval status enum
DO $$ BEGIN
  CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Add columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_status public.approval_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

-- 3. Helper function
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND approval_status = 'approved'
  ) OR public.has_role(_user_id, 'admin');
$$;

-- 4. Admin update policy on profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Update handle_new_user trigger to set status (admins auto-approved)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  _is_admin := public.has_role(NEW.id, 'admin');
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

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. If wes account already exists, grant admin + approve
DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'wes@urbanselfstorage.com.au' LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;
    UPDATE public.profiles
       SET approval_status = 'approved', approved_at = now()
     WHERE user_id = _uid;
  END IF;
END $$;

-- 7. Approve all existing users (so we don't lock out current testers)
UPDATE public.profiles SET approval_status = 'approved', approved_at = now()
WHERE approval_status = 'pending';