import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import PullitrGrid from "@/components/pullitr-grid";
import ZemeFlag from "@/components/zeme-flag";
import {
  getAllPivovary,
  getPivovarById,
  getPivovaryByZemeWithCounts,
  getPullitryByPivovar,
  getZemeByKod,
} from "@/lib/data";

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
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
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
        <div className="flex items-center gap-3 mb-2">
          {zeme && <ZemeFlag zeme={zeme} className="text-2xl" />}
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            {piv.nazev}
          </h1>
        </div>
        <div className="text-[var(--text-soft)] mb-4">
          {[piv.mesto, zeme?.nazev].filter(Boolean).join(", ")}
        </div>
        {piv.popisek && (
          <p className="text-[var(--text)] leading-relaxed max-w-prose">
            {piv.popisek}
          </p>
        )}
        {piv.web && (
          <a
            href={piv.web}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
          >
            Web pivovaru ↗
          </a>
        )}
      </div>
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
