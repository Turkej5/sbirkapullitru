import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import PullitrGrid from "@/components/pullitr-grid";
import {
  getAllPivovary,
  getPivovarById,
  getPullitryByPivovar,
  getZemeByKod,
} from "@/lib/data";

type Params = { id: string };

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
          {zeme && <span className="text-2xl">{zeme.vlajka}</span>}
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
    </div>
  );
}
