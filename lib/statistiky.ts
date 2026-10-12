import "server-only";
import {
  getAllPullitry,
  getPivovaryWithCounts,
  getZemeWithCounts,
  type PivovarWithCount,
  type ZemeWithCount,
} from "@/lib/data";
import type { Zeme } from "@/lib/types";

const PRAHA = { lat: 50.0755, lon: 14.4378 };

export function vzdalenostOdPrahyKm(lat: number, lon: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat - PRAHA.lat);
  const dLon = rad(lon - PRAHA.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(PRAHA.lat)) * Math.cos(rad(lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(a)));
}

export type PivovarZaznam = PivovarWithCount & { zemeInfo: Zeme };

export type KompasZaznam = {
  smery: string[];
  ikony: string[];
  pivovar: PivovarZaznam;
  km: number;
};

export type StoletiSloupec = { stoleti: number; pocet: number };

export type Statistiky = {
  celkem: number;
  zemi: number;
  pivovaru: number;
  zaniklych: number;
  typy: { pivovarni: number; reklamni: number; akcni: number };
  zeme: ZemeWithCount[];
  topPivovary: PivovarZaznam[];
  nejstarsi: PivovarZaznam;
  nejmladsi: PivovarZaznam;
  nejdelsiZivot: PivovarZaznam | null;
  nejkratsiZivot: PivovarZaznam | null;
  kompas: KompasZaznam[];
  nejvicMesto: { mesto: string; zeme: Zeme; pocet: number } | null;
  stoleti: StoletiSloupec[];
  zanikle: PivovarZaznam[];
};

const PSEUDO_ZEME = new Set(["ostatni", "reklamni"]);

export function getStatistiky(): Statistiky {
  const pullitry = getAllPullitry();
  const zeme = getZemeWithCounts();
  const zemeMap = new Map(zeme.map((z) => [z.kod, z]));
  const pivovary: PivovarZaznam[] = getPivovaryWithCounts().flatMap((p) => {
    const z = zemeMap.get(p.zeme);
    return z ? [{ ...p, zemeInfo: z }] : [];
  });

  const sRokem = pivovary.filter((p) => p.rok_zalozeni != null);
  const podleRoku = [...sRokem].sort(
    (a, b) => (a.rok_zalozeni as number) - (b.rok_zalozeni as number),
  );

  const zanikle = pivovary
    .filter((p) => p.zaniklo != null)
    .sort((a, b) => (a.zaniklo as number) - (b.zaniklo as number));
  const zivot = (p: PivovarZaznam) =>
    (p.zaniklo as number) - (p.rok_zalozeni as number);
  const zanikleSRokem = zanikle
    .filter((p) => p.rok_zalozeni != null)
    .sort((a, b) => zivot(b) - zivot(a));

  const sPolohou = pivovary.filter((p) => p.lat != null && p.lon != null);
  const extrem = (cmp: (a: PivovarZaznam, b: PivovarZaznam) => number) =>
    [...sPolohou].sort(cmp)[0];
  const smery: { smer: string; ikona: string; pivovar: PivovarZaznam }[] = [
    { smer: "nejsevernější", ikona: "sever", pivovar: extrem((a, b) => b.lat! - a.lat!) },
    { smer: "nejjižnější", ikona: "jih", pivovar: extrem((a, b) => a.lat! - b.lat!) },
    { smer: "nejvýchodnější", ikona: "vychod", pivovar: extrem((a, b) => b.lon! - a.lon!) },
    { smer: "nejzápadnější", ikona: "zapad", pivovar: extrem((a, b) => a.lon! - b.lon!) },
  ];
  const kompas: KompasZaznam[] = [];
  for (const sm of smery) {
    const existujici = kompas.find((k) => k.pivovar.id === sm.pivovar.id);
    if (existujici) {
      existujici.smery.push(sm.smer);
      existujici.ikony.push(sm.ikona);
      continue;
    }
    kompas.push({
      smery: [sm.smer],
      ikony: [sm.ikona],
      pivovar: sm.pivovar,
      km: vzdalenostOdPrahyKm(sm.pivovar.lat!, sm.pivovar.lon!),
    });
  }

  const mesta = new Map<string, { mesto: string; zeme: Zeme; pocet: number }>();
  for (const p of pivovary) {
    if (!p.mesto) continue;
    const mesto = /^Praha\b/.test(p.mesto) ? "Praha" : p.mesto;
    const k = `${p.zeme}:${mesto}`;
    const m = mesta.get(k) ?? { mesto, zeme: p.zemeInfo, pocet: 0 };
    m.pocet += 1;
    mesta.set(k, m);
  }
  const nejvicMesto =
    [...mesta.values()].sort((a, b) => b.pocet - a.pocet)[0] ?? null;

  const stoletiMap = new Map<number, number>();
  for (const p of sRokem) {
    const s = Math.floor(((p.rok_zalozeni as number) - 1) / 100) + 1;
    stoletiMap.set(s, (stoletiMap.get(s) ?? 0) + 1);
  }
  const stoletiKlice = [...stoletiMap.keys()];
  const stoleti: StoletiSloupec[] = [];
  for (let s = Math.min(...stoletiKlice); s <= Math.max(...stoletiKlice); s++) {
    stoleti.push({ stoleti: s, pocet: stoletiMap.get(s) ?? 0 });
  }

  return {
    celkem: pullitry.length,
    zemi: zeme.filter((z) => !PSEUDO_ZEME.has(z.kod)).length,
    pivovaru: pivovary.length,
    zaniklych: zanikle.length,
    typy: {
      pivovarni: pullitry.filter((p) => p.typ === "pivovarni").length,
      reklamni: pullitry.filter((p) => p.typ === "reklamni").length,
      akcni: pullitry.filter((p) => p.typ === "akcni").length,
    },
    zeme,
    topPivovary: [...pivovary]
      .sort((a, b) => b.pocet - a.pocet || a.nazev.localeCompare(b.nazev, "cs"))
      .slice(0, 10),
    nejstarsi: podleRoku[0],
    nejmladsi: podleRoku[podleRoku.length - 1],
    nejdelsiZivot: zanikleSRokem[0] ?? null,
    nejkratsiZivot: zanikleSRokem[zanikleSRokem.length - 1] ?? null,
    kompas,
    nejvicMesto: nejvicMesto && nejvicMesto.pocet > 1 ? nejvicMesto : null,
    stoleti,
    zanikle,
  };
}
