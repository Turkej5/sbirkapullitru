import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionView from "@/components/collection-view";
import ZemeFlag from "@/components/zeme-flag";
import {
  getAllZeme,
  getPivovaryByZemeWithCounts,
  getPullitryByZeme,
  getZemeByKod,
  getZemeWithCounts,
} from "@/lib/data";

type Params = { kod: string };

export async function generateStaticParams() {
  return getAllZeme().map((z) => ({ kod: z.kod }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { kod } = await params;
  const z = getZemeByKod(kod);
  if (!z) return { title: "Země" };
  const pocet = getPullitryByZeme(z.kod).length;
  return {
    title: `${z.nazev} — ${pocet} půllitrů`,
    description: `Půllitry ze sbírky pocházející z ${z.nazev}. Celkem ${pocet} kusů.`,
  };
}

export default async function ZemePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { kod } = await params;
  const z = getZemeByKod(kod);
  if (!z) notFound();
  const pullitry = getPullitryByZeme(z.kod);
  const zemeList = getZemeWithCounts();
  const pivovary = getPivovaryByZemeWithCounts(z.kod);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-2">
        <ZemeFlag zeme={z} className="text-5xl sm:text-6xl leading-none" />
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            {z.nazev}
          </h1>
          <p className="text-[var(--text-soft)] mt-1">
            {pullitry.length} {pocetSuffix(pullitry.length)} ve sbírce
          </p>
        </div>
      </div>
      <div className="mt-8">
        <Suspense
          fallback={<div className="text-[var(--text-soft)]">Načítám…</div>}
        >
          <CollectionView
            pullitry={pullitry}
            zeme={zemeList}
            pivovary={pivovary}
            hiddenZeme
          />
        </Suspense>
      </div>
    </div>
  );
}

function pocetSuffix(n: number): string {
  if (n === 1) return "půllitr";
  if (n >= 2 && n <= 4) return "půllitry";
  return "půllitrů";
}
