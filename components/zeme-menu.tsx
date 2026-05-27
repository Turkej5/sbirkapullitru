import Link from "next/link";
import ZemeFlag from "@/components/zeme-flag";
import type { ZemeWithCount } from "@/lib/data";

export default function ZemeMenu({ zeme }: { zeme: ZemeWithCount[] }) {
  return (
    <details className="group relative">
      <summary className="list-none px-3 py-2 rounded-md hover:bg-[var(--border)] transition cursor-pointer flex items-center gap-1">
        Země
        <svg
          className="h-3 w-3 transition-transform group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden z-40">
        <ul className="max-h-96 overflow-y-auto py-1">
          {zeme.map((z) => (
            <li key={z.kod}>
              <Link
                href={`/zeme/${z.kod}`}
                className="flex items-center justify-between px-4 py-2 hover:bg-[var(--border)] transition"
              >
                <span className="flex items-center gap-2">
                  <ZemeFlag zeme={z} className="text-xl leading-none" />
                  <span>{z.nazev}</span>
                </span>
                <span className="text-xs text-[var(--text-soft)] tabular-nums">
                  {z.pocet}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
