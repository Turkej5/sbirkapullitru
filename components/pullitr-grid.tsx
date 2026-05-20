import PullitrCard from "@/components/pullitr-card";
import type { PullitrEnhanced } from "@/lib/types";

export default function PullitrGrid({
  pullitry,
  priorityCount = 0,
}: {
  pullitry: PullitrEnhanced[];
  priorityCount?: number;
}) {
  if (pullitry.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-soft)]">
        Žádný půllitr neodpovídá filtru.
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {pullitry.map((p, i) => (
        <li key={p.id}>
          <PullitrCard pullitr={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
