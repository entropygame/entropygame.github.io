-- Allow authenticated admins to read tracking_config
CREATE POLICY "Authenticated can read tracking_config"
  ON public.tracking_config FOR SELECT TO authenticated
  USING (true);
