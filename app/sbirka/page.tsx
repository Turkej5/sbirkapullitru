import { Suspense } from "react";
import type { Metadata } from "next";
import CollectionView from "@/components/collection-view";
import { getAllPullitry, getZemeWithCounts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Celá sbírka",
  description:
    "Kompletní galerie půllitrů v mé sbírce. Filtruj podle země a typu, hledej fulltextem.",
};

export default function SbirkaPage() {
  const pullitry = getAllPullitry();
  const zeme = getZemeWithCounts();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2">
        Celá sbírka
      </h1>
      <p className="text-[var(--text-soft)] mb-8">
        Všechny půllitry pohromadě. Použij vyhledávání nebo filtry.
      </p>
      <Suspense
        fallback={<div className="text-[var(--text-soft)]">Načítám…</div>}
      >
        <CollectionView pullitry={pullitry} zeme={zeme} />
      </Suspense>
    </div>
  );
}
