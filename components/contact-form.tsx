"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [botcheck, setBotcheck] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  const emailValid = EMAIL_RE.test(email.trim());
  const messageValid = message.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid || !messageValid) {
      setError("Vyplňte prosím platný e-mail i zprávu.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          botcheck,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Zprávu se nepodařilo odeslat.");
      }
      setStatus("ok");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Něco se pokazilo.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <p className="font-display text-xl font-semibold mb-1">Díky! 🍺</p>
        <p className="text-[var(--text-soft)]">
          Zpráva dorazila. Ozvu se, jakmile to půjde.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-[var(--accent)] hover:underline cursor-pointer"
        >
          Napsat další zprávu
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4"
    >
      {/* honeypot – skrytý pro lidi, vyplní ho jen boti */}
      <input
        type="text"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        value={botcheck}
        onChange={(e) => setBotcheck(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="cf-email" className="block text-sm font-medium mb-1.5">
          Váš e-mail <span className="text-[var(--accent)]">*</span>
        </label>
        <input
          id="cf-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-sm font-medium mb-1.5">
          Zpráva <span className="text-[var(--accent)]">*</span>
        </label>
        <textarea
          id="cf-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Napište mi…"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-y"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] text-white px-5 py-3 text-sm font-medium hover:bg-[var(--accent-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === "sending" ? "Odesílám…" : "Odeslat zprávu"}
      </button>
    </form>
  );
}
