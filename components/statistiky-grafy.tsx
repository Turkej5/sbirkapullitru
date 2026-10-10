import Link from "next/link";
import type { ReactNode } from "react";

export type BarPolozka = {
  key: string;
  label: ReactNode;
  hodnota: number;
  href?: string;
  popis: string;
};

export function BarList({ polozky }: { polozky: BarPolozka[] }) {
  const max = Math.max(...polozky.map((p) => p.hodnota), 1);
  return (
    <ul className="space-y-0.5">
      {polozky.map((p) => {
        const obsah = (
          <>
            <span className="flex min-w-0 items-center gap-2 text-sm">
              {p.label}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="block h-3 rounded-r-[4px] bg-[var(--accent)] transition-opacity group-hover:opacity-80"
                style={{
                  width: `calc((100% - 2.75rem) * ${Math.max(p.hodnota / max, 0.015)})`,
                }}
                aria-hidden="true"
              />
              <span className="flex-shrink-0 text-sm tabular-nums text-[var(--text)]">
                {p.hodnota}
              </span>
            </span>
          </>
        );
        const cls =
          "group grid grid-cols-[minmax(0,9rem)_1fr] sm:grid-cols-[minmax(0,13rem)_1fr] items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--border)]";
        return (
          <li key={p.key}>
            {p.href ? (
              <Link href={p.href} className={cls} title={p.popis}>
                {obsah}
              </Link>
            ) : (
              <div className={cls} title={p.popis}>
                {obsah}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export type SloupecPolozka = {
  key: string;
  label: string;
  hodnota: number;
  popis: string;
};

export function SloupcovyGraf({
  sloupce,
  vyska = 180,
  popiskyJenNenulove = false,
}: {
  sloupce: SloupecPolozka[];
  vyska?: number;
  popiskyJenNenulove?: boolean;
}) {
  const max = Math.max(...sloupce.map((s) => s.hodnota), 1);
  return (
    <div>
      <div
        className="flex items-end gap-1 border-b border-[var(--border)]"
        style={{ height: vyska + 28 }}
      >
        {sloupce.map((s) => (
          <div
            key={s.key}
            className="group relative flex h-full flex-1 flex-col items-center justify-end"
          >
            {s.hodnota > 0 && (
              <span className="mb-1 text-xs tabular-nums text-[var(--text-soft)] group-hover:text-[var(--text)]">
                {s.hodnota}
              </span>
            )}
            <span
              className="block w-full max-w-6 rounded-t-[4px] bg-[var(--accent)] transition-opacity group-hover:opacity-80"
              style={{ height: (s.hodnota / max) * vyska }}
              aria-hidden="true"
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)] shadow-md group-hover:block">
              {s.popis}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        {sloupce.map((s) => (
          <div
            key={s.key}
            className="flex-1 text-center text-[11px] leading-tight text-[var(--text-soft)]"
          >
            {!popiskyJenNenulove || s.hodnota > 0 ? s.label : ""}
          </div>
        ))}
      </div>
      <table className="sr-only">
        <tbody>
          {sloupce.map((s) => (
            <tr key={s.key}>
              <th scope="row">{s.label}</th>
              <td>{s.hodnota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
