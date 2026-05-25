import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// jednoduchý best-effort rate limit (per instanci serverless funkce)
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;

function limited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to prosím za chvíli." },
      { status: 429 },
    );
  }

  let body: { email?: unknown; message?: unknown; botcheck?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  // honeypot – pokud je vyplněný, tváříme se úspěšně a zahodíme
  if (typeof body.botcheck === "string" && body.botcheck.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json(
      { error: "Zadejte platný e-mail." },
      { status: 422 },
    );
  }
  if (message.length < 1 || message.length > 5000) {
    return NextResponse.json(
      { error: "Napište prosím zprávu (max. 5000 znaků)." },
      { status: 422 },
    );
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Formulář zatím není připojený. Zkuste to prosím později." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "Nová zpráva ze Sbírky půllitrů",
        from_name: "Sbírka půllitrů",
        email,
        message,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    if (!res.ok || !data.success) {
      throw new Error("upstream");
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Odeslání se nezdařilo. Zkuste to prosím znovu." },
      { status: 502 },
    );
  }
}
