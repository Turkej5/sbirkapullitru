"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "cookie-consent-change";
const GTM_ID = "GTM-K3KQ2T88";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): null {
  return null;
}

export default function GoogleTagManager() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Kontejner se načte vždy, ale tracking je dle Consent Mode zakázaný,
  // dokud návštěvník nepotvrdí souhlas. Tady jen reagujeme na jeho volbu.
  useEffect(() => {
    if (consent !== "accepted" && consent !== "rejected") return;
    const v = consent === "accepted" ? "granted" : "denied";
    window.gtag?.("consent", "update", {
      ad_storage: v,
      ad_user_data: v,
      ad_personalization: v,
      analytics_storage: v,
    });
  }, [consent]);

  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}
