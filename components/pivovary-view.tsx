"use client";

import { useCallback, useDeferredValue, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ZemeFlag from "@/components/zeme-flag";
import { normalize } from "@/lib/search";
import type { Zeme } from "@/lib/types";

export type PivovarPolozka = {
  id: string;
  nazev: string;
  mesto: string | null;
  rok_zalozeni: number | null;
  zaniklo: number | null;
  pocet: number;
  foto: string;
  fotoPlaceholder: boolean;
  zeme: Zeme;
};

type SortKey = "zeme" | "abeceda" | "kusy" | "nejstarsi" | "nejmladsi";

const SORT_LABELS: Record<SortKey, string> = {
  zeme: "Podle země",
  abeceda: "Abecedně",
  kusy: "Nejvíc kusů",
  nejstarsi: "Nejstarší",
  nejmladsi: "Nejmladší",
};

export default function PivovaryView({
  pivovary,
  zemeOrder,
}: {
  pivovary: PivovarPolozka[];
  zemeOrder: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const paramSort = searchParams.get("razeni") as SortKey | null;
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>(
    paramSort && paramSort in SORT_LABELS ? paramSort : "zeme",
  );
  const [jenZanikle, setJenZanikle] = useState(searchParams.get("zanikle") === "1");
  const deferredQuery = useDeferredValue(query);

  const updateUrl = useCallback(
    (next: { q?: string; razeni?: SortKey; zanikle?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.razeni !== undefined) {
        if (next.razeni !== "zeme") params.set("razeni", next.razeni);
        else params.delete("razeni");
      }
      if (next.zanikle !== undefined) {
        if (next.zanikle) params.set("zanikle", "1");
        else params.delete("zanikle");
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `?${qs}` : "?", { scroll: false });
      });
    },
    [router, searchParams],
  );

  const pocetZaniklych = pivovary.filter((p) => p.zaniklo != null).length;

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    let list = pivovary;
    if (jenZanikle) list = list.filter((p) => p.zaniklo != null);
    if (q) {
      list = list.filter((p) =>
        normalize([p.nazev, p.mesto ?? "", p.zeme.nazev].join(" ")).includes(q),
      );
    }
    list = [...list];
    const abc = (a: PivovarPolozka, b: PivovarPolozka) =>
      a.nazev.localeCompare(b.nazev, "cs");
    const rok = (p: PivovarPolozka, fallback: number) => p.rok_zalozeni ?? fallback;
    if (sort === "kusy") list.sort((a, b) => b.pocet - a.pocet || abc(a, b));
    else if (sort === "nejstarsi")
      list.sort((a, b) => rok(a, Infinity) - rok(b, Infinity) || abc(a, b));
    else if (sort === "nejmladsi")
      list.sort((a, b) => rok(b, -Infinity) - rok(a, -Infinity) || abc(a, b));
    else list.sort(abc);
    return list;
  }, [pivovary, deferredQuery, jenZanikle, sort]);

  const skupiny = useMemo(() => {
    if (sort !== "zeme") return null;
    return zemeOrder
      .map((kod) => {
        const polozky = filtered.filter((p) => p.zeme.kod === kod);
        return { zeme: polozky[0]?.zeme, polozky };
      })
      .filter((s): s is { zeme: Zeme; polozky: PivovarPolozka[] } => s.polozky.length > 0);
  }, [filtered, sort, zemeOrder]);

  const hasActiveFilters = deferredQuery !== "" || jenZanikle || sort !== "zeme";

  function resetAll() {
    setQuery("");
    setJenZanikle(false);
    setSort("zeme");
    startTransition(() => router.replace("?", { scroll: false }));
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-soft)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Hledat pivovar, město, zemi…"
            aria-label="Hledat pivovar"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateUrl({ q: e.target.value });
            }}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center text-sm">
          <button
            type="button"
            onClick={() => {
              setJenZanikle(!jenZanikle);
              updateUrl({ zanikle: !jenZanikle });
            }}
            aria-pressed={jenZanikle}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition cursor-pointer ${
              jenZanikle
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "border-[var(--border)] hover:border-[var(--accent)]"
            }`}
          >
            {jenZanikle && <CheckIcon />}
            Jen zaniklé
            <span className={`text-xs ${jenZanikle ? "opacity-90" : "text-[var(--text-soft)]"}`}>
              {pocetZaniklych}
            </span>
          </button>
          <span className="ml-auto flex items-center gap-2">
            <span className="text-[var(--text-soft)]">Řadit:</span>
            <select
              value={sort}
              aria-label="Řazení pivovarů"
              onChange={(e) => {
                const s = e.target.value as SortKey;
                setSort(s);
                updateUrl({ razeni: s });
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-[var(--border)]">
        <span className="text-lg font-medium">
          {filtered.length === pivovary.length
            ? `${pivovary.length} ${pivovaruSuffix(pivovary.length)}`
            : `${filtered.length} z ${pivovary.length}`}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="ml-auto text-sm text-[var(--accent)] hover:underline cursor-pointer"
          >
            Vyčistit vše
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-soft)]">
          Žádný pivovar neodpovídá hledání.
        </div>
      ) : skupiny ? (
        <div className="space-y-12">
          {skupiny.map(({ zeme, polozky }) => {
            const kusu = polozky.reduce((s, p) => s + p.pocet, 0);
            return (
              <section key={zeme.kod} aria-labelledby={`zeme-${zeme.kod}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-4">
                  <h2
                    id={`zeme-${zeme.kod}`}
                    className="flex items-center gap-2.5 font-display text-2xl font-semibold"
                  >
                    <ZemeFlag zeme={zeme} className="text-2xl" />
                    {zeme.nazev}
                    <span className="font-sans text-sm font-normal text-[var(--text-soft)]">
                      {polozky.length} {pivovaruSuffix(polozky.length)} · {kusu}{" "}
                      {kusuSuffix(kusu)}
                    </span>
                  </h2>
                  <Link
                    href={`/zeme/${zeme.kod}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Půllitry ze země →
                  </Link>
                </div>
                <PivovarList polozky={polozky} showFlag={false} />
              </section>
            );
          })}
        </div>
      ) : (
        <PivovarList polozky={filtered} showFlag />
      )}
    </div>
  );
}

function PivovarList({
  polozky,
  showFlag,
}: {
  polozky: PivovarPolozka[];
  showFlag: boolean;
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {polozky.map((p) => (
        <li key={p.id}>
          <PivovarKarta pivovar={p} showFlag={showFlag} />
        </li>
      ))}
    </ul>
  );
}

function PivovarKarta({
  pivovar: p,
  showFlag,
}: {
  pivovar: PivovarPolozka;
  showFlag: boolean;
}) {
  const roky =
    p.rok_zalozeni && p.zaniklo
      ? `${p.rok_zalozeni}–${p.zaniklo}`
      : p.rok_zalozeni
        ? `zal. ${p.rok_zalozeni}`
        : null;
  return (
    <Link
      href={`/pivovar/${p.id}`}
      className="group flex h-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 pr-4 hover:border-[var(--accent)] transition-colors"
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#e9e5de]">
        <Image
          src={p.foto}
          alt=""
          fill
          sizes="56px"
          unoptimized={p.fotoPlaceholder}
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-medium leading-snug">
          {showFlag && <ZemeFlag zeme={p.zeme} className="flex-shrink-0" />}
          <span className="truncate group-hover:text-[var(--accent)] transition-colors">
            {p.nazev}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-soft)]">
          <span className="truncate">
            {[p.mesto, roky].filter(Boolean).join(" · ")}
          </span>
          {p.zaniklo != null && p.rok_zalozeni == null && (
            <span className="flex-shrink-0 rounded-full border border-[var(--border)] px-1.5 py-px text-[10px] uppercase tracking-wider">
              Zaniklý
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="font-display text-lg font-semibold leading-none text-[var(--accent)]">
          {p.pocet}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--text-soft)]">
          {kusuSuffix(p.pocet)}
        </div>
      </div>
    </Link>
  );
}

function pivovaruSuffix(n: number): string {
  if (n === 1) return "pivovar";
  if (n >= 2 && n <= 4) return "pivovary";
  return "pivovarů";
}

function kusuSuffix(n: number): string {
  if (n === 1) return "kus";
  if (n >= 2 && n <= 4) return "kusy";
  return "kusů";
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
