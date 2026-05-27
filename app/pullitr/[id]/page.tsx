import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { TypBadge } from "@/components/badge";
import PullitrNavigation from "@/components/pullitr-navigation";
import ZemeFlag from "@/components/zeme-flag";
import { getAllPullitry, getPullitrById, getSortedChronologicky } from "@/lib/data";

type Params = { id: string };

export async function generateStaticParams() {
  return getAllPullitry().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getPullitrById(id);
  if (!p) return { title: "Půllitr" };
  return {
    title: p.nazev_zobrazovany,
    description: p.pivovar?.popisek
      ? `${p.nazev_zobrazovany} — ${p.pivovar.popisek}`
      : `Půllitr ${p.nazev_zobrazovany} ve sbírce.`,
    openGraph: {
      images: [{ url: p.imageUrl, width: 800, height: 800 }],
    },
  };
}

export default async function PullitrPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const p = getPullitrById(id);
  if (!p) notFound();

  const all = getSortedChronologicky();
  const idx = all.findIndex((x) => x.id === p.id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <nav className="mb-6 text-sm text-[var(--text-soft)]">
        <Link href="/sbirka" className="hover:text-[var(--accent)]">
          Sbírka
        </Link>
        {" / "}
        <Link href={`/zeme/${p.zemeInfo.kod}`} className="hover:text-[var(--accent)]">
          {p.zemeInfo.nazev}
        </Link>
        {" / "}
        <span>{p.nazev_zobrazovany}</span>
      </nav>

      <article className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          <Image
            src={p.imageUrl}
            alt={`Půllitr — ${p.nazev_zobrazovany}`}
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            priority
            unoptimized={p.isPlaceholder}
            className="object-cover"
          />
          {p.isNovy && (
            <span className="absolute top-3 left-3 rounded-full bg-red-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 shadow">
              Nový
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <ZemeFlag zeme={p.zemeInfo} className="text-3xl" />
            <Link
              href={`/zeme/${p.zemeInfo.kod}`}
              className="text-[var(--text-soft)] hover:text-[var(--accent)]"
            >
              {p.zemeInfo.nazev}
            </Link>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight mb-4">
            {p.nazev_zobrazovany}
          </h1>
          <div className="mb-6">
            <TypBadge typ={p.typ} />
          </div>

          {p.pivovar ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-sm text-[var(--text-soft)] mb-1">Pivovar</div>
              <h2 className="font-display text-xl font-semibold mb-2">
                <Link
                  href={`/pivovar/${p.pivovar.id}`}
                  className="hover:text-[var(--accent)]"
                >
                  {p.pivovar.nazev}
                </Link>
              </h2>
              {p.pivovar.mesto && (
                <div className="text-sm text-[var(--text-soft)] mb-3">
                  {p.pivovar.mesto}
                </div>
              )}
              {p.pivovar.popisek && (
                <p className="leading-relaxed text-sm mb-3">{p.pivovar.popisek}</p>
              )}
              <Link
                href={`/pivovar/${p.pivovar.id}`}
                className="text-sm text-[var(--accent)] hover:underline inline-block"
              >
                Zobrazit všechny půllitry tohoto pivovaru →
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--text-soft)]">
                Reklamní nebo akční půllitr bez konkrétního pivovaru.
              </p>
            </div>
          )}

          <div className="mt-6 text-xs text-[var(--text-soft)]">
            Přidáno {new Date(p.pridano).toLocaleDateString("cs-CZ", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </article>

      <PullitrNavigation prevId={prev.id} nextId={next.id} />

      <div className="mt-12 flex items-center justify-between text-sm">
        <Link
          href={`/pullitr/${prev.id}`}
          className="flex items-center gap-2 text-[var(--text-soft)] hover:text-[var(--accent)] max-w-[45%]"
        >
          <span>←</span>
          <span className="truncate">{prev.nazev_zobrazovany}</span>
        </Link>
        <Link
          href={`/pullitr/${next.id}`}
          className="flex items-center gap-2 text-[var(--text-soft)] hover:text-[var(--accent)] max-w-[45%]"
        >
          <span className="truncate">{next.nazev_zobrazovany}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
