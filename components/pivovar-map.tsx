import { getCountryShape, type Ring } from "@/lib/country-shapes";

type Props = {
  zemeKod: string;
  lat: number;
  lon: number;
  mesto?: string;
};

const PADDING_DEG = 0.35;
const MAX_W = 240;
const MAX_H = 220;

function ringBounds(rings: Ring[]) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return { minLon, maxLon, minLat, maxLat };
}

export default function PivovarMap({ zemeKod, lat, lon, mesto }: Props) {
  const shape = getCountryShape(zemeKod);
  if (!shape) return null;

  const raw = ringBounds(shape.rings);

  const outsideTolerance = 1.0;
  const pointOutside =
    lat < raw.minLat - outsideTolerance ||
    lat > raw.maxLat + outsideTolerance ||
    lon < raw.minLon - outsideTolerance ||
    lon > raw.maxLon + outsideTolerance;
  if (pointOutside) return null;

  const minLon = raw.minLon - PADDING_DEG;
  const maxLon = raw.maxLon + PADDING_DEG;
  const minLat = raw.minLat - PADDING_DEG;
  const maxLat = raw.maxLat + PADDING_DEG;

  const meanLat = (minLat + maxLat) / 2;
  const cosLat = Math.cos((meanLat * Math.PI) / 180);
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;
  const aspect = (lonSpan * cosLat) / latSpan;

  let width = MAX_W;
  let height = MAX_W / aspect;
  if (height > MAX_H) {
    height = MAX_H;
    width = MAX_H * aspect;
  }

  const project = (pLon: number, pLat: number): [number, number] => {
    const x = ((pLon - minLon) / lonSpan) * width;
    const y = ((maxLat - pLat) / latSpan) * height;
    return [x, y];
  };

  const pathD = shape.rings
    .map((ring) => {
      const [first, ...rest] = ring.map(([pLon, pLat]) => project(pLon, pLat));
      return (
        `M ${first[0].toFixed(2)} ${first[1].toFixed(2)} ` +
        rest.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") +
        " Z"
      );
    })
    .join(" ");

  const [dx, dy] = project(lon, lat);

  return (
    <figure className="w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width.toFixed(2)} ${height.toFixed(2)}`}
        width={width}
        height={height}
        className="max-w-full h-auto"
        role="img"
        aria-label={mesto ? `Poloha pivovaru — ${mesto}` : "Poloha pivovaru"}
      >
        <path
          d={pathD}
          fill="var(--border)"
          fillOpacity={0.55}
          stroke="var(--text-soft)"
          strokeOpacity={0.45}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <circle cx={dx} cy={dy} r={10} fill="var(--accent)" opacity={0.18} />
        <circle
          cx={dx}
          cy={dy}
          r={4.5}
          fill="var(--accent)"
          stroke="var(--surface)"
          strokeWidth={1.5}
        />
      </svg>
      {mesto && (
        <figcaption className="mt-2 text-center text-xs text-[var(--text-soft)]">
          {mesto}
        </figcaption>
      )}
    </figure>
  );
}
