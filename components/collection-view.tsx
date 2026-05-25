"use client";

import { useMemo, useState, useTransition, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PullitrGrid from "@/components/pullitr-grid";
import { TYP_LABELS, searchPullitry } from "@/lib/search";
import type { PullitrEnhanced, TypPullitru, Zeme } from "@/lib/types";

type SortKey = "nejnovejsi" | "nejstarsi" | "abeceda";

const SORT_LABELS: Record<SortKey, string> = {
  nejnovejsi: "Nejnovější",
  nejstarsi: "Nejstarší",
  abeceda: "Abecedně",
};

const ALL_TYPY: TypPullitru[] = ["pivovarni", "reklamni", "akcni"];

export default function CollectionView({
  pullitry,
  zeme,
  pivovary,
  hiddenZeme,
}: {
  pullitry: PullitrEnhanced[];
  zeme: (Zeme & { pocet: number })[];
  pivovary?: { id: string; nazev: string; pocet: number }[];
  hiddenZeme?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const initialQuery = searchParams.get("q") ?? "";
  const initialZeme = (searchParams.get("zeme") ?? "").split(",").filter(Boolean);
  const initialTyp = (searchParams.get("typ") ?? "").split(",").filter(Boolean) as TypPullitru[];
  const initialPivovar = searchParams.get("pivovar") ?? "";
  const initialSort = (searchParams.get("razeni") as SortKey) || "nejnovejsi";

  const [query, setQuery] = useState(initialQuery);
  const [selZeme, setSelZeme] = useState<string[]>(initialZeme);
  const [selTyp, setSelTyp] = useState<TypPullitru[]>(initialTyp);
  const [selPivovar, setSelPivovar] = useState<string>(initialPivovar);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  const updateUrl = useCallback(
    (next: {
      q?: string;
      zeme?: string[];
      typ?: TypPullitru[];
      pivovar?: string;
      razeni?: SortKey;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.zeme !== undefined) {
        if (next.zeme.length) params.set("zeme", next.zeme.join(","));
        else params.delete("zeme");
      }
      if (next.typ !== undefined) {
        if (next.typ.length) params.set("typ", next.typ.join(","));
        else params.delete("typ");
      }
      if (next.pivovar !== undefined) {
        if (next.pivovar) params.set("pivovar", next.pivovar);
        else params.delete("pivovar");
      }
      if (next.razeni !== undefined) {
        if (next.razeni !== "nejnovejsi") params.set("razeni", next.razeni);
        else params.delete("razeni");
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `?${qs}` : "?", { scroll: false });
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    updateUrl({ q: debouncedQuery });
  }, [debouncedQuery, updateUrl]);

  function toggleZeme(kod: string) {
    const next = selZeme.includes(kod)
      ? selZeme.filter((z) => z !== kod)
      : [...selZeme, kod];
    setSelZeme(next);
    updateUrl({ zeme: next });
  }

  function toggleTyp(t: TypPullitru) {
    const next = selTyp.includes(t) ? selTyp.filter((x) => x !== t) : [...selTyp, t];
    setSelTyp(next);
    updateUrl({ typ: next });
  }

  function changeSort(s: SortKey) {
    setSort(s);
    updateUrl({ razeni: s });
  }

  function changePivovar(id: string) {
    setSelPivovar(id);
    updateUrl({ pivovar: id });
  }

  function resetAll() {
    setQuery("");
    setSelZeme([]);
    setSelTyp([]);
    setSelPivovar("");
    setSort("nejnovejsi");
    startTransition(() => router.replace("?", { scroll: false }));
  }

  const hasActiveFilters =
    debouncedQuery !== "" ||
    selZeme.length > 0 ||
    selTyp.length > 0 ||
    selPivovar !== "" ||
    sort !== "nejnovejsi";

  const filtered = useMemo(() => {
    let list = pullitry;
    if (selZeme.length) list = list.filter((p) => selZeme.includes(p.zeme));
    if (selTyp.length) list = list.filter((p) => selTyp.includes(p.typ));
    if (selPivovar) list = list.filter((p) => p.pivovar_id === selPivovar);
    if (debouncedQuery) list = searchPullitry(list, debouncedQuery);
    list = [...list];
    if (sort === "nejnovejsi") list.sort((a, b) => b.pridano.localeCompare(a.pridano));
    else if (sort === "nejstarsi") list.sort((a, b) => a.pridano.localeCompare(b.pridano));
    else list.sort((a, b) => a.nazev_zobrazovany.localeCompare(b.nazev_zobrazovany, "cs"));
    return list;
  }, [pullitry, selZeme, selTyp, selPivovar, debouncedQuery, sort]);

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
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Hledat pivovar, město…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center text-sm">
          {!hiddenZeme && (
            <>
              <span className="text-[var(--text-soft)] mr-1">Země:</span>
              {zeme.map((z) => {
                const active = selZeme.includes(z.kod);
                return (
                  <button
                    key={z.kod}
                    type="button"
                    onClick={() => toggleZeme(z.kod)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition cursor-pointer ${
                      active
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <span>{z.vlajka}</span>
                    <span>{z.nazev}</span>
                    <span
                      className={`text-xs ${
                        active ? "opacity-90" : "text-[var(--text-soft)]"
                      }`}
                    >
                      {z.pocet}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {pivovary && pivovary.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="text-[var(--text-soft)] mr-1">Pivovar:</span>
            <select
              value={selPivovar}
              onChange={(e) => changePivovar(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 max-w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Všechny pivovary</option>
              {pivovary.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nazev} ({p.pocet})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-[var(--text-soft)] mr-1">Typ:</span>
          {ALL_TYPY.map((t) => {
            const active = selTyp.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTyp(t)}
                className={`rounded-full px-3 py-1.5 border transition cursor-pointer ${
                  active
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                {TYP_LABELS[t]}
              </button>
            );
          })}
          <span className="ml-auto flex items-center gap-2">
            <span className="text-[var(--text-soft)]">Řadit:</span>
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value as SortKey)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="text-[var(--accent)] hover:underline cursor-pointer"
              >
                Resetovat
              </button>
            )}
          </span>
        </div>

        <div className="text-sm text-[var(--text-soft)]">
          Zobrazeno {filtered.length} z {pullitry.length}
        </div>
      </div>

      <PullitrGrid pullitry={filtered} priorityCount={4} />
    </div>
  );
}
