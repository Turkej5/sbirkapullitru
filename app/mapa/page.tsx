import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/json-ld";
import MapaSbirky, {
  type MapaBod,
  type MapaPohled,
} from "@/components/mapa-sbirky";
import {
  getPivovaryWithCounts,
  getPocetZemi,
  getZemeWithCounts,
} from "@/lib/data";
import { promitni, vyrezBodu, vyrezObdelniku } from "@/lib/mapa";
import { MAPA_ZEME } from "@/lib/mapa-evropy";
import { breadcrumbJsonLd, mapaJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mapa sbírky",
  description:
    "Všechny pivovary ze sbírky půllitrů na mapě Evropy a Česka. Velikost tečky odpovídá počtu půllitrů.",
};

const JIH_VLOZKY = 32;

export default function MapaPage() {
  const zeme = getZemeWithCounts();
  const zemeMap = new Map(zeme.map((z) => [z.kod, z]));
  const body: MapaBod[] = getPivovaryWithCounts()
    .filter((p) => p.lat != null && p.lon != null && zemeMap.has(p.zeme))
    .map((p) => {
      const z = zemeMap.get(p.zeme)!;
      const { x, y } = promitni(p.lat!, p.lon!);
      return {
        id: p.id,
        nazev: p.nazev,
        mesto: p.mesto ?? null,
        rok_zalozeni: p.rok_zalozeni ?? null,
        zaniklo: p.zaniklo ?? null,
        pocet: p.pocet,
        zeme: { kod: z.kod, nazev: z.nazev, vlajka: z.vlajka },
        x,
        y,
        vlozka: p.lat! < JIH_VLOZKY,
      };
    });

  const hlavni = body.filter((b) => !b.vlozka);
  const vlozka = body.filter((b) => b.vlozka);
  const pohledy: MapaPohled[] = [
    {
      klic: "evropa",
      nazev: "Evropa",
      vyrez: vyrezBodu(hlavni, 0.06, 1.35),
      meritko: 0.65,
      vlozka:
        vlozka.length > 0
          ? {
              vyrez: vyrezBodu(
                vlozka.flatMap((b) => [
                  { x: b.x - 260, y: b.y - 200 },
                  { x: b.x + 260, y: b.y + 200 },
                ]),
                0,
              ),
              popis: [
                ...new Set(
                  vlozka.map(
                    (b) =>
                      b.mesto?.match(/\(([^)]+)\)/)?.[1] ??
                      b.mesto ??
                      b.zeme.nazev,
                  ),
                ),
              ].join(", "),
            }
          : null,
    },
    {
      klic: "cesko",
      nazev: "Česko",
      vyrez: vyrezObdelniku(48.45, 51.2, 11.95, 18.95),
      meritko: 1,
      vlozka: null,
    },
  ];

  const zemeVeSbirce = new Set(zeme.map((z) => z.kod));
  const poradi = [
    ...MAPA_ZEME.filter((z) => z.kod !== "cz"),
    ...MAPA_ZEME.filter((z) => z.kod === "cz"),
  ];
  const zakladna = (
    <>
      <g>
        {poradi.map((z, i) => (
          <path
            key={`${z.kod}-${i}`}
            d={z.d}
            className="mapa-zeme"
            data-kod={z.kod}
            data-sbirka={zemeVeSbirce.has(z.kod) ? "" : undefined}
          />
        ))}
      </g>
      <g>
        {poradi.map((z, i) => (
          <path
            key={`${z.kod}-${i}`}
            d={z.d}
            className="mapa-hranice"
            data-kod={z.kod}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={[
          mapaJsonLd(body.length),
          breadcrumbJsonLd([{ name: "Mapa sbírky", url: "/mapa" }]),
        ]}
      />
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-2">
        Mapa sbírky
      </h1>
      <p className="text-[var(--text-soft)] mb-8 max-w-2xl">
        {body.length} pivovarů z {getPocetZemi()} zemí, odkud pocházejí půllitry
        ve sbírce. Čím větší tečka, tím víc kusů od daného pivovaru.
      </p>
      <Suspense
        fallback={<div className="text-[var(--text-soft)]">Načítám mapu…</div>}
      >
        <MapaSbirky body={body} pohledy={pohledy} zakladna={zakladna} />
      </Suspense>
      <p className="mt-6 text-sm text-[var(--text-soft)]">
        Všechny pivovary jako seznam najdeš v{" "}
        <Link href="/pivovary" className="text-[var(--accent)] hover:underline">
          přehledu pivovarů
        </Link>
        . Podklad mapy: Natural Earth.
      </p>
    </div>
  );
}
