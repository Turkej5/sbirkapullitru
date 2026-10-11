import { getZemeWithCounts } from "@/lib/data";
import { promitni, vyrezBodu } from "@/lib/mapa";
import { MAPA_ZEME_LEHKA } from "@/lib/mapa-evropy-lehka";
import { ZEME_STREDY } from "@/lib/zeme-stredy";

const CREAM = "#f4ecd9";

type M = { x: number; y: number; w: number; big: boolean };

function Mug({ x, y, w, big }: M) {
  const hw = w / 2;
  const h = w * 1.28;
  const top = y - h / 2;
  const foamH = w * 0.36;
  const glassTop = top + foamH;
  const bot = y + h / 2;
  const bodyH = bot - glassTop;
  const sw = Math.max(0.8, w * 0.05);
  return (
    <g
      stroke="var(--text)"
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path
        d={`M ${x + hw - sw},${glassTop + bodyH * 0.18} c ${w * 0.42},0 ${w * 0.42},${bodyH * 0.5} 0,${bodyH * 0.52}`}
        fill="none"
        strokeWidth={Math.max(1, w * 0.11)}
      />
      <rect
        x={x - hw}
        y={glassTop}
        width={w}
        height={bodyH}
        rx={Math.max(1.5, w * 0.12)}
        fill="var(--accent)"
      />
      {big && (
        <>
          <line
            x1={x - w / 6}
            y1={glassTop + 3}
            x2={x - w / 6}
            y2={bot - 3}
            stroke={CREAM}
            strokeWidth={w * 0.07}
            opacity={0.55}
          />
          <line
            x1={x + w / 6}
            y1={glassTop + 3}
            x2={x + w / 6}
            y2={bot - 3}
            stroke={CREAM}
            strokeWidth={w * 0.07}
            opacity={0.55}
          />
        </>
      )}
      <rect
        x={x - hw - sw}
        y={top}
        width={w + 2 * sw}
        height={foamH + sw * 2}
        rx={foamH * 0.8}
        fill={CREAM}
      />
    </g>
  );
}

const VELIKOST = 400;
const PSEUDO_ZEME = new Set(["ostatni", "reklamni"]);

function velikostHrnku(pocet: number): number {
  return Math.min(30, 9 + 2.2 * Math.sqrt(pocet));
}

export default function HeroMap() {
  const zeme = getZemeWithCounts().filter(
    (z) => !PSEUDO_ZEME.has(z.kod) && ZEME_STREDY[z.kod],
  );
  const nejvic = Math.max(...zeme.map((z) => z.pocet));
  const body = zeme.map((z) => {
    const [lat, lon] = ZEME_STREDY[z.kod];
    return { ...z, ...promitni(lat, lon) };
  });

  const ramec = vyrezBodu(body, 0.12);
  const strana = Math.max(ramec.w, ramec.h);
  const v = {
    x: ramec.x - (strana - ramec.w) / 2,
    y: ramec.y - (strana - ramec.h) / 2,
    w: strana,
  };
  const meritko = VELIKOST / v.w;

  const hrnky: (M & { kod: string; nazev: string; pocet: number })[] = body
    .map((b) => ({
      kod: b.kod,
      nazev: b.nazev,
      pocet: b.pocet,
      x: (b.x - v.x) * meritko,
      y: (b.y - v.y) * meritko,
      w: velikostHrnku(b.pocet),
      big: b.pocet === nejvic,
    }))
    .sort((a, b) => a.w - b.w);

  const popis = zeme.map((z) => `${z.nazev} ${z.pocet}`).join(", ");

  return (
    <svg
      viewBox={`0 0 ${VELIKOST} ${VELIKOST}`}
      className="h-full w-full"
      role="img"
      aria-label={`Mapa Evropy s půllitry ze sbírky: ${popis}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <g transform={`scale(${meritko}) translate(${-v.x} ${-v.y})`}>
        <g
          fill="var(--text-soft)"
          fillOpacity={0.07}
          stroke="var(--text-soft)"
          strokeOpacity={0.5}
          strokeWidth={0.8}
          strokeLinejoin="round"
        >
          {MAPA_ZEME_LEHKA.filter((z) => z.kod !== "cz").map((z, i) => (
            <path
              key={`${z.kod}-${i}`}
              d={z.d}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        {MAPA_ZEME_LEHKA.filter((z) => z.kod === "cz").map((z, i) => (
          <path
            key={`cz-${i}`}
            d={z.d}
            fill="var(--accent)"
            fillOpacity={0.16}
            stroke="var(--accent)"
            strokeOpacity={0.55}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {hrnky.map(({ kod, nazev, pocet, ...m }) => (
        <g key={kod}>
          <title>{`${nazev}: ${pocet}`}</title>
          <Mug {...m} />
        </g>
      ))}
    </svg>
  );
}
