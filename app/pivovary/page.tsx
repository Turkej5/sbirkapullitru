import { Suspense } from "react";
import type { Metadata } from "next";
import JsonLd from "@/components/json-ld";
import PivovaryView, { type PivovarPolozka } from "@/components/pivovary-view";
import { getPivovaryWithCounts, getPocetZemi, getZemeWithCounts } from "@/lib/data";
import { pivovaryJsonLd } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const pocet = getPivovaryWithCounts().length;
  return {
    title: `Pivovary — ${pocet} pivovarů ve sbírce`,
    description: `Přehled všech ${pocet} pivovarů, jejichž půllitry jsou ve sbírce. Řazení podle země, roku založení nebo počtu kusů, včetně zaniklých pivovarů.`,
  };
}

export default function PivovaryPage() {
  const zeme = getZemeWithCounts();
  const zemeMap = new Map(zeme.map((z) => [z.kod, z]));
  const pivovary: PivovarPolozka[] = getPivovaryWithCounts()
    .sort((a, b) => a.nazev.localeCompare(b.nazev, "cs"))
    .flatMap((p) => {
      const z = zemeMap.get(p.zeme);
      if (!z) return [];
      return [
        {
          id: p.id,
          nazev: p.nazev,
          mesto: p.mesto ?? null,
          rok_zalozeni: p.rok_zalozeni ?? null,
          zaniklo: p.zaniklo ?? null,
          pocet: p.pocet,
          foto: p.foto,
          fotoPlaceholder: p.fotoPlaceholder,
          zeme: { kod: z.kod, nazev: z.nazev, vlajka: z.vlajka },
        },
      ];
    });
  const zemeSPivovary = zeme.filter((z) =>
    pivovary.some((p) => p.zeme.kod === z.kod),
  );
  const zemi = getPocetZemi();
  const sRokem = pivovary
    .filter((p) => p.rok_zalozeni != null)
    .sort((a, b) => (a.rok_zalozeni as number) - (b.rok_zalozeni as number));
  const nejstarsi = sRokem[0];
  const nejmladsi = sRokem[sRokem.length - 1];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={pivovaryJsonLd(pivovary)} />
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-2">
        Pivovary
      </h1>
      <p className="text-[var(--text-soft)] mb-8 max-w-2xl">
        {pivovary.length} pivovarů z {zemi} zemí, ke kterým patří aspoň jeden
        půllitr ve sbírce.{" "}
        {`Nejstarší je ${nejstarsi.nazev} (${nejstarsi.rok_zalozeni}), nejmladší ${nejmladsi.nazev} (${nejmladsi.rok_zalozeni}).`}
      </p>
      <Suspense
        fallback={<div className="text-[var(--text-soft)]">Načítám…</div>}
      >
        <PivovaryView pivovary={pivovary} zemeOrder={zemeSPivovary.map((z) => z.kod)} />
      </Suspense>
    </div>
  );
}
