import Image from "next/image";
import Link from "next/link";
import ZemeFlag from "@/components/zeme-flag";
import type { PullitrEnhanced } from "@/lib/types";

export default function PullitrCard({
  pullitr,
  priority = false,
  showPodtitulek = true,
}: {
  pullitr: PullitrEnhanced;
  priority?: boolean;
  showPodtitulek?: boolean;
}) {
  const podtitulek = pullitr.pivovar?.nazev ?? pullitr.zemeInfo.nazev;
  return (
    <Link
      href={`/pullitr/${pullitr.id}`}
      className="group flex h-full flex-col rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden bg-[#e9e5de]">
        <Image
          src={pullitr.imageUrl}
          alt={`Půllitr — ${pullitr.nazev_zobrazovany}`}
          fill
          sizes="(min-width: 1152px) 270px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          unoptimized={pullitr.isPlaceholder}
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <ZemeFlag
          zeme={pullitr.zemeInfo}
          className="absolute top-2 right-2 text-xl drop-shadow"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center p-3 text-center">
        <h3 className="text-sm font-medium text-[var(--text)] line-clamp-2">
          {pullitr.nazev_zobrazovany}
        </h3>
        {showPodtitulek && (
          <p className="mt-0.5 truncate text-xs text-[var(--text-soft)]">
            {podtitulek}
          </p>
        )}
      </div>
    </Link>
  );
}
