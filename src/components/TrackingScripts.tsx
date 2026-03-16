import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Injects tracking scripts (GA4, Meta Pixel, TikTok Pixel) based on
 * the tracking_config table. Runs once on mount (public, no auth needed).
 * Uses anon key SELECT policy — we add a public read policy below.
 */
const TrackingScripts = () => {
  useEffect(() => {
    const inject = async () => {
      const { data } = await supabase.from("tracking_config").select("key, value, enabled");
      if (!data) return;

      for (const row of data) {
        if (!row.enabled || !row.value) continue;

        if (row.key === "google_analytics") {
          // gtag.js
          const s = document.createElement("script");
          s.async = true;
          s.src = `https://www.googletagmanager.com/gtag/js?id=${row.value}`;
          document.head.appendChild(s);

          const s2 = document.createElement("script");
          s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${row.value}');`;
          document.head.appendChild(s2);
        }

        if (row.key === "meta_pixel") {
          const s = document.createElement("script");
          s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${row.value}');fbq('track','PageView');`;
          document.head.appendChild(s);
        }

        if (row.key === "tiktok_pixel") {
          const s = document.createElement("script");
          s.textContent = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e+\"_\"+n]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${row.value}');ttq.page();}(window,document,'ttq');`;
          document.head.appendChild(s);
        }
      }
    };

    inject();
  }, []);

  return null;
};

export default TrackingScripts;
