
CREATE TABLE public.tracking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_config ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read/write (admin will be authenticated)
CREATE POLICY "Authenticated users can read tracking_config"
  ON public.tracking_config FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update tracking_config"
  ON public.tracking_config FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can insert tracking_config"
  ON public.tracking_config FOR INSERT TO authenticated
  WITH CHECK (true);

-- Seed default rows
INSERT INTO public.tracking_config (key, value, enabled) VALUES
  ('google_analytics', '', false),
  ('meta_pixel', '', false),
  ('tiktok_pixel', '', false),
  ('meta_conversion_api', '', false);
