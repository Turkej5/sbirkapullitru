"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "cookie-consent-change";

type Consent = "accepted" | "rejected" | null;

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Consent {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

function getServerSnapshot(): "pending" {
  return "pending";
}

export default function CookieBanner() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function decide(value: Exclude<Consent, null>) {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  if (consent === "pending" || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <p className="text-sm leading-relaxed flex-1">
            Tento web používá pouze technické cookies a (s vaším souhlasem)
            anonymní statistiky návštěvnosti přes Google Analytics. Žádné
            reklamní cookies. Volbu můžete kdykoli změnit v patičce.
          </p>
          <div className="flex flex-row gap-2 sm:flex-col">
            <button
              type="button"
              onClick={() => decide("accepted")}
              className="rounded-md bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] transition cursor-pointer"
            >
              Souhlasím
            </button>
            <button
              type="button"
              onClick={() => decide("rejected")}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)] transition cursor-pointer"
            >
              Pouze nezbytné
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
