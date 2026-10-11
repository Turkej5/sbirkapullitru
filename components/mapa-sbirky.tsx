"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ZemeFlag from "@/components/zeme-flag";
import type { Vyrez } from "@/lib/mapa";
import type { Zeme } from "@/lib/types";

export type MapaBod = {
  id: string;
  nazev: string;
  mesto: string | null;
  rok_zalozeni: number | null;
  zaniklo: number | null;
  pocet: number;
  zeme: Zeme;
  x: number;
  y: number;
  vlozka: boolean;
};

export type MapaPohled = {
  klic: string;
  nazev: string;
  vyrez: Vyrez;
  meritko: number;
  vlozka: { vyrez: Vyrez; popis: string } | null;
};

const VELIKOSTI_LEGENDY = [1, 5, 10];

function prumer(pocet: number, meritko: number): number {
  return Math.round((7 + 5.5 * Math.sqrt(pocet - 1)) * meritko);
}

function velikost(d: number): string {
  return `clamp(${(d * 0.55).toFixed(1)}px, ${(d / 9).toFixed(3)}cqw, ${d}px)`;
}

function vRozsahu(b: MapaBod, v: Vyrez): boolean {
  return b.x >= v.x && b.x <= v.x + v.w && b.y >= v.y && b.y <= v.y + v.h;
}

export default function MapaSbirky({
  body,
  pohledy,
  zakladna,
}: {
  body: MapaBod[];
  pohledy: MapaPohled[];
  zakladna: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [aktivni, setAktivni] = useState<{
    id: string;
    vlozka: boolean;
  } | null>(null);
  const dotyk = useRef(false);

  const pohled =
    pohledy.find((p) => p.klic === searchParams.get("pohled")) ?? pohledy[0];

  const zmenitPohled = useCallback(
    (klic: string) => {
      setAktivni(null);
      const params = new URLSearchParams(searchParams.toString());
      if (klic === pohledy[0].klic) params.delete("pohled");
      else params.set("pohled", klic);
      const qs = params.toString();
      startTransition(() =>
        router.replace(qs ? `?${qs}` : "?", { scroll: false }),
      );
    },
    [pohledy, router, searchParams],
  );

  const serazene = useMemo(
    () => [...body].sort((a, b) => b.pocet - a.pocet),
    [body],
  );
  const hlavniBody = serazene.filter(
    (b) => !b.vlozka && vRozsahu(b, pohled.vyrez),
  );
  const vlozkaBody = pohled.vlozka
    ? serazene.filter((b) => b.vlozka && vRozsahu(b, pohled.vlozka!.vyrez))
    : [];
  const pocetVPohledu = hlavniBody.length + vlozkaBody.length;
  const { vyrez } = pohled;
  const pomer = vyrez.w / vyrez.h;

  const aktivniBod = aktivni
    ? (body.find((b) => b.id === aktivni.id) ?? null)
    : null;

  function vrstva(polozky: MapaBod[], v: Vyrez, vlozka: boolean) {
    return polozky.map((b) => {
      const d = prumer(b.pocet, pohled.meritko * (vlozka ? 0.85 : 1));
      const jeAktivni = aktivni?.id === b.id;
      return (
        <Link
          key={b.id}
          href={`/pivovar/${b.id}`}
          aria-label={`${b.nazev}, ${b.pocet} ${kusuSuffix(b.pocet)}`}
          onPointerDown={(e) => {
            dotyk.current = e.pointerType !== "mouse";
          }}
          onClick={(e) => {
            if (dotyk.current && !jeAktivni) {
              e.preventDefault();
              setAktivni({ id: b.id, vlozka });
            }
          }}
          onMouseEnter={() => setAktivni({ id: b.id, vlozka })}
          onMouseLeave={() => setAktivni((a) => (a?.id === b.id ? null : a))}
          onFocus={() => setAktivni({ id: b.id, vlozka })}
          onBlur={() => setAktivni((a) => (a?.id === b.id ? null : a))}
          className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 focus:outline-none"
          style={{
            left: `${((b.x - v.x) / v.w) * 100}%`,
            top: `${((b.y - v.y) / v.h) * 100}%`,
            zIndex: jeAktivni ? 20 : 1,
          }}
        >
          <span
            className={`block rounded-full shadow-[0_0_0_2px_var(--surface)] transition-transform group-hover:scale-125 group-focus-visible:scale-125 group-focus-visible:shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--text)] ${
              b.zaniklo != null
                ? "border-2 border-[var(--accent)] bg-[var(--surface)]"
                : "bg-[var(--accent)]"
            } ${jeAktivni ? "scale-125" : ""}`}
            style={{ width: velikost(d), height: velikost(d) }}
          />
        </Link>
      );
    });
  }

  function bublina(v: Vyrez, vlozka: boolean) {
    if (!aktivniBod || aktivni?.vlozka !== vlozka) return null;
    const left = ((aktivniBod.x - v.x) / v.w) * 100;
    const top = ((aktivniBod.y - v.y) / v.h) * 100;
    const posunX = left > 65 ? "-100%" : left < 35 ? "0%" : "-50%";
    const nahoru = !vlozka && top > 22;
    return (
      <div
        className="absolute z-30 w-60 max-w-[80vw] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          transform: `translate(${posunX}, ${nahoru ? "calc(-100% - 14px)" : "14px"})`,
        }}
        role="tooltip"
      >
        <div className="flex items-center gap-1.5 font-medium leading-snug">
          <ZemeFlag zeme={aktivniBod.zeme} className="flex-shrink-0" />
          <span>{aktivniBod.nazev}</span>
        </div>
        <div className="mt-0.5 text-xs text-[var(--text-soft)]">
          {[
            aktivniBod.mesto,
            aktivniBod.rok_zalozeni && aktivniBod.zaniklo
              ? `${aktivniBod.rok_zalozeni}–${aktivniBod.zaniklo}`
              : aktivniBod.rok_zalozeni
                ? `zal. ${aktivniBod.rok_zalozeni}`
                : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm">
          <span>
            <span className="font-semibold text-[var(--accent)]">
              {aktivniBod.pocet}
            </span>{" "}
            {kusuSuffix(aktivniBod.pocet)} ve sbírce
          </span>
          <Link
            href={`/pivovar/${aktivniBod.id}`}
            className="text-[var(--accent)] hover:underline"
          >
            Detail →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="[container-type:inline-size]">
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div
          role="tablist"
          aria-label="Výřez mapy"
          className="inline-flex rounded-full border border-[var(--border)] p-0.5"
        >
          {pohledy.map((p) => (
            <button
              key={p.klic}
              type="button"
              role="tab"
              aria-selected={p.klic === pohled.klic}
              onClick={() => zmenitPohled(p.klic)}
              className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
                p.klic === pohled.klic
                  ? "bg-[var(--accent)] text-white"
                  : "hover:bg-[var(--border)]"
              }`}
            >
              {p.nazev}
            </button>
          ))}
        </div>
        <span className="text-[var(--text-soft)]">
          {pocetVPohledu} {pivovaruSuffix(pocetVPohledu)} ve výřezu
        </span>
        <Legenda
          meritko={pohled.meritko}
          zemeVeSbirce={pohled.klic === "evropa"}
        />
      </div>

      <div
        className="relative mx-auto w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--border)_75%,var(--bg))] dark:bg-[var(--bg)]"
        style={{ aspectRatio: `${pomer}`, maxWidth: `calc(78vh * ${pomer})` }}
        onMouseLeave={() => setAktivni(null)}
      >
        <svg
          viewBox={`${vyrez.x} ${vyrez.y} ${vyrez.w} ${vyrez.h}`}
          data-pohled={pohled.klic}
          className="mapa absolute inset-0 h-full w-full rounded-2xl"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {zakladna}
        </svg>
        {vrstva(hlavniBody, vyrez, false)}
        {bublina(vyrez, false)}

        {pohled.vlozka && vlozkaBody.length > 0 && (
          <div
            className="absolute top-3 left-3 w-[20%] min-w-[96px] overflow-visible rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--border)_75%,var(--bg))] dark:bg-[var(--bg)] shadow-sm"
            style={{
              aspectRatio: `${pohled.vlozka.vyrez.w / pohled.vlozka.vyrez.h}`,
            }}
          >
            <svg
              viewBox={`${pohled.vlozka.vyrez.x} ${pohled.vlozka.vyrez.y} ${pohled.vlozka.vyrez.w} ${pohled.vlozka.vyrez.h}`}
              data-pohled={pohled.klic}
              className="mapa absolute inset-0 h-full w-full rounded-lg"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              {zakladna}
            </svg>
            {vrstva(vlozkaBody, pohled.vlozka.vyrez, true)}
            {bublina(pohled.vlozka.vyrez, true)}
            <span className="absolute left-1.5 top-1 text-[10px] leading-tight text-[var(--text-soft)]">
              {pohled.vlozka.popis}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Legenda({
  meritko,
  zemeVeSbirce,
}: {
  meritko: number;
  zemeVeSbirce: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-soft)] sm:ml-auto">
      <span className="flex items-center gap-2">
        {VELIKOSTI_LEGENDY.map((n) => {
          const d = prumer(n, meritko);
          return (
            <span key={n} className="flex items-center gap-1">
              <span
                className="block rounded-full bg-[var(--accent)]"
                style={{ width: velikost(d), height: velikost(d) }}
                aria-hidden="true"
              />
              {n}
            </span>
          );
        })}
        <span>kusů</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="block h-2.5 w-2.5 rounded-full border-2 border-[var(--accent)]"
          aria-hidden="true"
        />
        zaniklý
      </span>
      {zemeVeSbirce && (
        <span className="flex items-center gap-1.5">
          <span
            className="block h-2.5 w-3.5 rounded-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--accent)_24%,var(--surface))] dark:bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))]"
            aria-hidden="true"
          />
          země ve sbírce
        </span>
      )}
    </div>
  );
}

function kusuSuffix(n: number): string {
  if (n === 1) return "kus";
  if (n >= 2 && n <= 4) return "kusy";
  return "kusů";
}

function pivovaruSuffix(n: number): string {
  if (n === 1) return "pivovar";
  if (n >= 2 && n <= 4) return "pivovary";
  return "pivovarů";
}
