import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/json-ld";
import PivovarMap from "@/components/pivovar-map";
import PullitrGrid from "@/components/pullitr-grid";
import ZemeFlag from "@/components/zeme-flag";
import { getCountryShape } from "@/lib/country-shapes";
import {
  getAllPivovary,
  getPivovarById,
  getPivovaryByZemeWithCounts,
  getPullitryByPivovar,
  getZemeByKod,
} from "@/lib/data";
import { breadcrumbJsonLd, pivovarJsonLd } from "@/lib/seo";

type Params = { id: string };

function skloneniKusu(n: number): string {
  if (n === 1) return "kus";
  if (n >= 2 && n <= 4) return "kusy";
  return "kusů";
}

export async function generateStaticParams() {
  return getAllPivovary().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getPivovarById(id);
  if (!p) return { title: "Pivovar" };
  return {
    title: p.nazev,
    description: p.popisek ?? `Půllitry pivovaru ${p.nazev} ve sbírce.`,
  };
}

export default async function PivovarPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const piv = getPivovarById(id);
  if (!piv) notFound();
  const pullitry = getPullitryByPivovar(piv.id);
  const zeme = getZemeByKod(piv.zeme);
  const dalsiPivovary = zeme
    ? getPivovaryByZemeWithCounts(zeme.kod)
        .filter((p) => p.id !== piv.id)
        .slice(0, 6)
    : [];
  const location = [piv.mesto, zeme?.nazev].filter(Boolean).join(", ");
  const dlouheOdstavce = piv.popisek_dlouhy
    ? piv.popisek_dlouhy
        .split(/\n\s*\n/)
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  const breadcrumbs = [
    { name: "Sbírka", url: "/sbirka" },
    ...(zeme ? [{ name: zeme.nazev, url: `/zeme/${zeme.kod}` }] : []),
    { name: piv.nazev, url: `/pivovar/${piv.id}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={[
          pivovarJsonLd(piv, zeme, pullitry.length),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
      <nav className="mb-4 text-sm text-[var(--text-soft)]">
        <Link href="/sbirka" className="hover:text-[var(--accent)]">
          Sbírka
        </Link>
        {zeme && (
          <>
            {" / "}
            <Link
              href={`/zeme/${zeme.kod}`}
              className="hover:text-[var(--accent)]"
            >
              {zeme.nazev}
            </Link>
          </>
        )}
        {" / "}
        <span>{piv.nazev}</span>
      </nav>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 mb-10">
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {zeme && <ZemeFlag zeme={zeme} className="text-2xl" />}
              <h1 className="font-display text-3xl sm:text-4xl font-semibold">
                {piv.nazev}
              </h1>
              {piv.zaniklo && (
                <span className="rounded-full border border-[var(--border)] text-[var(--text-soft)] text-xs uppercase tracking-wider px-2.5 py-1">
                  Zaniklý
                </span>
              )}
            </div>

            {location && (
              <div className="text-[var(--text-soft)] mb-3">{location}</div>
            )}

            {(piv.rok_zalozeni || piv.zaniklo) && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--text-soft)] mb-4">
                {piv.rok_zalozeni && <span>Založeno {piv.rok_zalozeni}</span>}
                {piv.zaniklo && <span>Zaniklo {piv.zaniklo}</span>}
              </div>
            )}

            {piv.popisek && (
              <p className="text-[var(--text)] leading-relaxed text-lg">
                {piv.popisek}
              </p>
            )}
          </div>

          {piv.lat != null &&
            piv.lon != null &&
            getCountryShape(piv.zeme) && (
              <div className="mt-6 md:mt-0 md:w-64 md:flex-shrink-0">
                <PivovarMap
                  zemeKod={piv.zeme}
                  lat={piv.lat}
                  lon={piv.lon}
                  mesto={piv.mesto}
                />
              </div>
            )}
        </div>
      </div>

      {dlouheOdstavce.length > 0 && (
        <section className="mb-12">
          <div className="leading-relaxed text-[var(--text)] lg:columns-2 lg:gap-10">
            {dlouheOdstavce.map((odstavec, i) => (
              <p key={i} className="mb-4 break-inside-avoid">
                {odstavec}
              </p>
            ))}
          </div>
        </section>
      )}

      <h2 className="font-display text-2xl font-semibold mb-4">
        Půllitry ({pullitry.length})
      </h2>
      <PullitrGrid pullitry={pullitry} priorityCount={4} />

      {zeme && dalsiPivovary.length > 0 && (
        <section className="mt-16">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold">
              Další pivovary z této země
            </h2>
            <Link
              href={`/zeme/${zeme.kod}`}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Vše ze země →
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dalsiPivovary.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pivovar/${p.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition-colors"
                >
                  <div className="font-medium truncate">{p.nazev}</div>
                  <div className="text-xs text-[var(--text-soft)] mt-1">
                    {[p.mesto, `${p.pocet} ${skloneniKusu(p.pocet)}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
