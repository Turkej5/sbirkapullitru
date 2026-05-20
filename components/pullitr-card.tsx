import Image from "next/image";
import Link from "next/link";
import type { PullitrEnhanced } from "@/lib/types";

export default function PullitrCard({
  pullitr,
  priority = false,
}: {
  pullitr: PullitrEnhanced;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/pullitr/${pullitr.id}`}
      className="group block rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--border)]">
        <Image
          src={pullitr.imageUrl}
          alt={`Půllitr — ${pullitr.nazev_zobrazovany}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          unoptimized={pullitr.isPlaceholder}
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        {pullitr.isNovy && (
          <span className="absolute top-2 left-2 rounded-full bg-red-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shadow">
            Nový
          </span>
        )}
        <span className="absolute top-2 right-2 text-xl drop-shadow">
          {pullitr.zemeInfo.vlajka}
        </span>
      </div>
      <div className="p-3 text-center">
        <h3 className="text-sm font-medium text-[var(--text)] line-clamp-2">
          {pullitr.nazev_zobrazovany}
        </h3>
      </div>
    </Link>
  );
}
