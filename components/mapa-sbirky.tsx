"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
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
const MAX_PRIBLIZENI = 12;
const KROK_TLACITKA = 1.8;

function prumer(pocet: number, meritko: number): number {
  return Math.round((7 + 5.5 * Math.sqrt(pocet - 1)) * meritko);
}

function velikost(d: number): string {
  return `clamp(${(d * 0.55).toFixed(1)}px, ${(d / 9).toFixed(3)}cqw, ${d}px)`;
}

function vRozsahu(b: MapaBod, v: Vyrez): boolean {
  return b.x >= v.x && b.x <= v.x + v.w && b.y >= v.y && b.y <= v.y + v.h;
}

function priblizit(
  zaklad: Vyrez,
  aktualni: Vyrez,
  faktor: number,
  cx: number,
  cy: number,
): Vyrez {
  const w = Math.min(
    zaklad.w,
    Math.max(zaklad.w / MAX_PRIBLIZENI, aktualni.w / faktor),
  );
  const h = (w * zaklad.h) / zaklad.w;
  const x = cx - ((cx - aktualni.x) * w) / aktualni.w;
  const y = cy - ((cy - aktualni.y) * h) / aktualni.h;
  return omezit(zaklad, { x, y, w, h });
}

function omezit(zaklad: Vyrez, v: Vyrez): Vyrez {
  return {
    ...v,
    x: Math.min(Math.max(v.x, zaklad.x), zaklad.x + zaklad.w - v.w),
    y: Math.min(Math.max(v.y, zaklad.y), zaklad.y + zaklad.h - v.h),
  };
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
  const [zoom, setZoom] = useState<{ klic: string; vyrez: Vyrez } | null>(null);
  const [napoveda, setNapoveda] = useState(false);
  const [tahne, setTahne] = useState(false);
  const [sirka, setSirka] = useState(0);
  const dotyk = useRef(false);
  const mapaRef = useRef<HTMLDivElement>(null);
  const ukazatele = useRef(new Map<number, { x: number; y: number }>());
  const posun = useRef(0);
  const napovedaCasovac = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animace = useRef<number | null>(null);

  const pohled =
    pohledy.find((p) => p.klic === searchParams.get("pohled")) ?? pohledy[0];
  const zaklad = pohled.vyrez;
  const vyrez = zoom && zoom.klic === pohled.klic ? zoom.vyrez : zaklad;
  const priblizeni = zaklad.w / vyrez.w;
  const jePriblizeno = priblizeni > 1.001;
  const vyrezRef = useRef(vyrez);
  useLayoutEffect(() => {
    vyrezRef.current = vyrez;
  });

  const nastavit = useCallback(
    (v: Vyrez) => {
      vyrezRef.current = v;
      setZoom({ klic: pohled.klic, vyrez: v });
    },
    [pohled.klic],
  );

  const animovat = useCallback(
    (cil: Vyrez) => {
      if (animace.current) cancelAnimationFrame(animace.current);
      if (
        document.hidden ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        nastavit(cil);
        return;
      }
      const start = vyrezRef.current;
      const t0 = performance.now();
      const krok = (t: number) => {
        const p = Math.min(1, (t - t0) / 220);
        const e = 1 - (1 - p) ** 3;
        nastavit({
          x: start.x + (cil.x - start.x) * e,
          y: start.y + (cil.y - start.y) * e,
          w: start.w + (cil.w - start.w) * e,
          h: start.h + (cil.h - start.h) * e,
        });
        animace.current = p < 1 ? requestAnimationFrame(krok) : null;
      };
      animace.current = requestAnimationFrame(krok);
    },
    [nastavit],
  );

  const naMapu = useCallback((clientX: number, clientY: number) => {
    const el = mapaRef.current;
    const v = vyrezRef.current;
    if (!el) return { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    const r = el.getBoundingClientRect();
    return {
      x: v.x + ((clientX - r.left) / r.width) * v.w,
      y: v.y + ((clientY - r.top) / r.height) * v.h,
    };
  }, []);

  useEffect(() => {
    const el = mapaRef.current;
    if (!el) return;
    const kolecko = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setNapoveda(true);
        if (napovedaCasovac.current) clearTimeout(napovedaCasovac.current);
        napovedaCasovac.current = setTimeout(() => setNapoveda(false), 1400);
        return;
      }
      e.preventDefault();
      setNapoveda(false);
      setAktivni(null);
      const { x, y } = naMapu(e.clientX, e.clientY);
      const faktor = Math.exp(-e.deltaY * 0.0045);
      nastavit(priblizit(zaklad, vyrezRef.current, faktor, x, y));
    };
    el.addEventListener("wheel", kolecko, { passive: false });
    return () => el.removeEventListener("wheel", kolecko);
  }, [naMapu, nastavit, zaklad]);

  useEffect(() => {
    const el = mapaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSirka(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (napovedaCasovac.current) clearTimeout(napovedaCasovac.current);
      if (animace.current) cancelAnimationFrame(animace.current);
    },
    [],
  );

  function tlacitkoZoom(faktor: number) {
    setAktivni(null);
    const v = vyrezRef.current;
    animovat(priblizit(zaklad, v, faktor, v.x + v.w / 2, v.y + v.h / 2));
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    ukazatele.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    posun.current = 0;
    if (ukazatele.current.size === 2) {
      for (const id of ukazatele.current.keys()) {
        if (e.currentTarget.hasPointerCapture(id)) continue;
        try {
          e.currentTarget.setPointerCapture(id);
        } catch {}
      }
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const predtim = ukazatele.current.get(e.pointerId);
    if (!predtim) return;
    const el = mapaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (ukazatele.current.size === 2) {
      const [a, b] = [...ukazatele.current.entries()];
      const druhy = a[0] === e.pointerId ? b[1] : a[1];
      const puvodni = Math.hypot(predtim.x - druhy.x, predtim.y - druhy.y);
      const nova = Math.hypot(e.clientX - druhy.x, e.clientY - druhy.y);
      ukazatele.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (puvodni > 0) {
        const stred = naMapu(
          (e.clientX + druhy.x) / 2,
          (e.clientY + druhy.y) / 2,
        );
        nastavit(
          priblizit(zaklad, vyrezRef.current, nova / puvodni, stred.x, stred.y),
        );
        posun.current += 10;
        setAktivni(null);
      }
      return;
    }
    if (!jePriblizeno) return;
    const dx = e.clientX - predtim.x;
    const dy = e.clientY - predtim.y;
    ukazatele.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    posun.current += Math.abs(dx) + Math.abs(dy);
    if (posun.current > 4) {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }
      if (!tahne) setTahne(true);
      setAktivni(null);
      const v = vyrezRef.current;
      nastavit(
        omezit(zaklad, {
          ...v,
          x: v.x - (dx / r.width) * v.w,
          y: v.y - (dy / r.height) * v.h,
        }),
      );
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    ukazatele.current.delete(e.pointerId);
    if (ukazatele.current.size === 0) setTahne(false);
  }

  const zmenitPohled = useCallback(
    (klic: string) => {
      setAktivni(null);
      setZoom(null);
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
  const hlavniBody = serazene.filter((b) => !b.vlozka && vRozsahu(b, vyrez));
  const vlozkaBody =
    pohled.vlozka && !jePriblizeno
      ? serazene.filter((b) => b.vlozka && vRozsahu(b, pohled.vlozka!.vyrez))
      : [];
  const pocetVPohledu = hlavniBody.length + vlozkaBody.length;
  const pomer = zaklad.w / zaklad.h;
  const sPopiskem = new Map<string, boolean>();
  if (jePriblizeno && sirka > 0) {
    const vyska = sirka / pomer;
    const boxy: { l: number; r: number; t: number; b: number }[] = [
      { l: sirka - 60, r: sirka, t: 0, b: 150 },
    ];
    const tecky = hlavniBody.map((b) => {
      const x = ((b.x - vyrez.x) / vyrez.w) * sirka;
      const y = ((b.y - vyrez.y) / vyrez.h) * vyska;
      const r = prumer(b.pocet, pohled.meritko) / 2 + 1;
      return {
        id: b.id,
        x,
        y,
        box: { l: x - r, r: x + r, t: y - r, b: y + r },
      };
    });
    const prekryva = (
      a: { l: number; r: number; t: number; b: number },
      o: { l: number; r: number; t: number; b: number },
    ) => a.l < o.r && a.r > o.l && a.t < o.b && a.b > o.t;
    for (const { id, x, y } of tecky) {
      const b = hlavniBody.find((h) => h.id === id)!;
      const delka = b.nazev.length * 6 + 6;
      const doleva = x + 8 + delka > sirka - 8;
      const box = doleva
        ? { l: x - 8 - delka, r: x - 7, t: y - 7, b: y + 7 }
        : { l: x + 7, r: x + 8 + delka, t: y - 7, b: y + 7 };
      if (box.l < 0 && doleva) continue;
      if (boxy.some((o) => prekryva(box, o))) continue;
      if (tecky.some((t) => t.id !== id && prekryva(box, t.box))) continue;
      boxy.push(box);
      sPopiskem.set(b.id, doleva);
    }
  }

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
          draggable={false}
          onPointerDown={(e) => {
            dotyk.current = e.pointerType !== "mouse";
          }}
          onClick={(e) => {
            if (e.detail > 0 && posun.current > 4) {
              e.preventDefault();
              return;
            }
            if (dotyk.current && !jeAktivni) {
              e.preventDefault();
              setAktivni({ id: b.id, vlozka });
            }
          }}
          onMouseEnter={() => {
            if (!tahne) setAktivni({ id: b.id, vlozka });
          }}
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
          {sPopiskem.has(b.id) && !vlozka && (
            <span
              className={`pointer-events-none absolute ${
                sPopiskem.get(b.id) ? "right-full" : "left-full"
              } top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium leading-none text-[var(--text)] [text-shadow:0_0_3px_var(--surface),0_0_3px_var(--surface),0_0_2px_var(--surface)]`}
            >
              {b.nazev}
            </span>
          )}
        </Link>
      );
    });
  }

  function bublina(v: Vyrez, vlozka: boolean) {
    if (!aktivniBod || aktivni?.vlozka !== vlozka || tahne) return null;
    if (!vlozka && !vRozsahu(aktivniBod, v)) return null;
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

  const tlacitkoCls =
    "flex h-9 w-9 items-center justify-center bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--border)] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-[var(--surface)] cursor-pointer";

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
        <Legenda meritko={pohled.meritko} />
      </div>

      <div
        className="relative isolate mx-auto w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--border)_75%,var(--bg))] dark:bg-[var(--bg)]"
        style={{ aspectRatio: `${pomer}`, maxWidth: `calc(78vh * ${pomer})` }}
        onMouseLeave={() => setAktivni(null)}
      >
        <div
          ref={mapaRef}
          className={`absolute inset-0 overflow-hidden rounded-2xl select-none ${
            jePriblizeno ? (tahne ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          style={{ touchAction: jePriblizeno ? "none" : "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) return;
            const { x, y } = naMapu(e.clientX, e.clientY);
            animovat(priblizit(zaklad, vyrezRef.current, KROK_TLACITKA, x, y));
          }}
        >
          <svg
            viewBox={`${vyrez.x} ${vyrez.y} ${vyrez.w} ${vyrez.h}`}
            data-pohled={pohled.klic}
            className="mapa absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {zakladna}
          </svg>
          {vrstva(hlavniBody, vyrez, false)}
          {napoveda && (
            <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/25 p-4 text-center text-sm font-medium text-white">
              Pro přiblížení podržte Ctrl (na Macu ⌘) a točte kolečkem
            </div>
          )}
        </div>
        {bublina(vyrez, false)}

        <div className="absolute right-3 top-3 z-30 flex flex-col overflow-hidden rounded-lg border border-[var(--border)] shadow-sm">
          <button
            type="button"
            aria-label="Přiblížit"
            className={tlacitkoCls}
            disabled={priblizeni >= MAX_PRIBLIZENI - 0.01}
            onClick={() => tlacitkoZoom(KROK_TLACITKA)}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Oddálit"
            className={`${tlacitkoCls} border-t border-[var(--border)]`}
            disabled={!jePriblizeno}
            onClick={() => tlacitkoZoom(1 / KROK_TLACITKA)}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {jePriblizeno && (
            <button
              type="button"
              aria-label="Zobrazit celý výřez"
              title="Zobrazit celý výřez"
              className={`${tlacitkoCls} border-t border-[var(--border)]`}
              onClick={() => {
                setAktivni(null);
                animovat(zaklad);
              }}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
              </svg>
            </button>
          )}
        </div>

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
      <p className="mt-3 text-center text-xs text-[var(--text-soft)]">
        Přibližovat jde tlačítky +/−, dvojklikem, Ctrl + kolečkem nebo
        roztažením dvěma prsty. Přiblíženou mapou se posouvá tažením.
      </p>
    </div>
  );
}

function Legenda({ meritko }: { meritko: number }) {
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
