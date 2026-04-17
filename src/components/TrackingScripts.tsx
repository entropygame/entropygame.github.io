import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Injects GA4 and Meta Pixel scripts based on dynamic site_settings.
 * No-op on server. Safe to mount once at the root.
 */
export function TrackingScripts() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (typeof window === "undefined" || !settings) return;

    // ---- Google Analytics 4 ----
    const gaId = settings.ga_measurement_id?.trim();
    if (gaId && !document.getElementById("ga-script")) {
      const s1 = document.createElement("script");
      s1.id = "ga-script";
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s1);

      const s2 = document.createElement("script");
      s2.id = "ga-init";
      s2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(s2);
    }

    // ---- Meta Pixel ----
    const pixelId = settings.meta_pixel_id?.trim();
    if (pixelId && !document.getElementById("meta-pixel-script")) {
      const s = document.createElement("script");
      s.id = "meta-pixel-script";
      s.innerHTML = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
        n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(s);
    }
  }, [settings]);

  return null;
}
