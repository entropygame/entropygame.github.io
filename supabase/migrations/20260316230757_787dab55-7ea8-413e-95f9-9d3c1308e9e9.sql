
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS on user_roles: only admins can read
CREATE POLICY "Admins can read user_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Drop old permissive policies on tracking_config
DROP POLICY IF EXISTS "Authenticated users can read tracking_config" ON public.tracking_config;
DROP POLICY IF EXISTS "Authenticated users can update tracking_config" ON public.tracking_config;
DROP POLICY IF EXISTS "Authenticated users can insert tracking_config" ON public.tracking_config;

-- 6. Restrict tracking_config write to admins only
CREATE POLICY "Admins can update tracking_config"
  ON public.tracking_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tracking_config"
  ON public.tracking_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
