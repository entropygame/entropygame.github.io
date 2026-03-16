
CREATE POLICY "Public can read tracking_config"
  ON public.tracking_config FOR SELECT TO anon
  USING (true);
