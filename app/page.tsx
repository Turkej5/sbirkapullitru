import Image from "next/image";
import Link from "next/link";
import PullitrGrid from "@/components/pullitr-grid";
import {
  getCelkemKusu,
  getNejnovejsi,
  getPocetZemi,
  getZemeWithCounts,
} from "@/lib/data";

export default function Home() {
  const celkem = getCelkemKusu();
  const pocetZemi = getPocetZemi();
  const nejnovejsi = getNejnovejsi(4);
  const zeme = getZemeWithCounts();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Sbírka půllitrů
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-[var(--text-soft)] leading-relaxed max-w-prose">
              Soukromá sbírka českých i zahraničních půllitrů, postupně
              doplňovaná. Každý kousek má svůj příběh — od českého ležáku
              přes bavorské pšenice až po belgické trapisty.
            </p>
            <div className="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3">
              <span className="text-sm text-[var(--text-soft)]">Aktuálně</span>
              <span className="font-display text-2xl font-semibold text-[var(--accent)] tabular-nums">
                {celkem}
              </span>
              <span className="text-sm text-[var(--text-soft)]">kusů z</span>
              <span className="font-display text-2xl font-semibold text-[var(--accent)] tabular-nums">
                {pocetZemi}
              </span>
              <span className="text-sm text-[var(--text-soft)]">zemí</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sbirka"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] text-white px-5 py-3 text-sm font-medium hover:bg-[var(--accent-hover)] transition"
              >
                Prohlédnout sbírku
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link
                href="/o-sbirce"
                className="inline-flex items-center rounded-md border border-[var(--border)] px-5 py-3 text-sm font-medium hover:bg-[var(--border)] transition"
              >
                O sbírce
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-xl">
              <Image
                src="/images/log/logo-light.png"
                alt="Sbírka půllitrů"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                priority
                className="object-contain p-8 block dark:hidden"
              />
              <Image
                src="/images/log/logo-dark.png"
                alt="Sbírka půllitrů"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                priority
                className="object-contain p-8 hidden dark:block"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 border-t border-[var(--border)]">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            Nejnovější přírůstky
          </h2>
          <Link
            href="/sbirka"
            className="text-sm font-medium text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            Zobrazit všechny →
          </Link>
        </div>
        <PullitrGrid pullitry={nejnovejsi} />
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 border-t border-[var(--border)]">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-6">
          Sbírka podle zemí
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {zeme.map((z) => (
            <li key={z.kod}>
              <Link
                href={`/zeme/${z.kod}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl sm:text-4xl mb-2">{z.vlajka}</div>
                <div className="font-medium">{z.nazev}</div>
                <div className="text-sm text-[var(--text-soft)] mt-1">
                  {z.pocet} {pocetSuffix(z.pocet)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function pocetSuffix(n: number): string {
  if (n === 1) return "kus";
  if (n >= 2 && n <= 4) return "kusy";
  return "kusů";
}
