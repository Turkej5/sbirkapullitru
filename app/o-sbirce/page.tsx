import type { Metadata } from "next";
import {
  getCelkemKusu,
  getPocetPivovaru,
  getPocetZemi,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "O sbírce",
  description:
    "O mé sbírce půllitrů, kdy začala a jak vznikla. Statistiky a kontakt.",
};

export default function OSbircePage() {
  const celkem = getCelkemKusu();
  const zemi = getPocetZemi();
  const pivovaru = getPocetPivovaru();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-8">
        O sbírce
      </h1>
      <div className="prose prose-lg max-w-none text-[var(--text)] leading-relaxed space-y-5">
        <p>
          Tato sbírka začala jako náhoda — pár půllitrů přivezených z cesty,
          dárky od přátel, kousky z pivovarských muzeí. Z náhody se postupně
          stala vášeň a dnes je v ní řada půllitrů z českých pivovarů i
          zahraničí.
        </p>
        <p>
          Sbírám hlavně půllitry pivovarní (s logem nebo značkou pivovaru),
          příležitostně i reklamní a akční edice. Zajímají mě klasické tvary
          i krajové specialitky.
        </p>
        <p className="text-[var(--text-soft)] italic">
          Tento web je v aktivním vývoji — texty i fotky budou přibývat.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4">
        <Stat label="kusů" value={celkem} />
        <Stat label="zemí" value={zemi} />
        <Stat label="pivovarů" value={pivovaru} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
      <div className="font-display text-3xl sm:text-4xl font-semibold text-[var(--accent)] tabular-nums">
        {value}
      </div>
      <div className="text-sm text-[var(--text-soft)] mt-1">{label}</div>
    </div>
  );
}
