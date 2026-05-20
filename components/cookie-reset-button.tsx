"use client";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "cookie-consent-change";

export default function CookieResetButton() {
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
  return (
    <button
      type="button"
      onClick={reset}
      className="hover:text-[var(--accent)] transition cursor-pointer"
    >
      Cookies
    </button>
  );
}
