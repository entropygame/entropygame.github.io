import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  hero_cta_url: string;
  floating_cta_url: string;
  go_cta_url: string;
  ga_measurement_id: string | null;
  meta_pixel_id: string | null;
  meta_conversions_token: string | null;
  updated_at: string;
}

async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[useSiteSettings] error:", error);
    return null;
  }
  return data as SiteSettings | null;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });
}
