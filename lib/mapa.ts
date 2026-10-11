import { PROJEKCE } from "@/lib/mapa-evropy";

export type Bod = { x: number; y: number };
export type Vyrez = { x: number; y: number; w: number; h: number };

export function promitni(lat: number, lon: number): Bod {
  const rad = Math.PI / 180;
  const l = (lon - PROJEKCE.lon0) * rad;
  const p = lat * rad;
  const p0 = PROJEKCE.lat0 * rad;
  const k = Math.sqrt(
    2 /
      (1 +
        Math.sin(p0) * Math.sin(p) +
        Math.cos(p0) * Math.cos(p) * Math.cos(l)),
  );
  return {
    x: PROJEKCE.r * k * Math.cos(p) * Math.sin(l),
    y: -PROJEKCE.r * k * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)),
  };
}

export function vyrezBodu(body: Bod[], okraj: number, minPomer?: number): Vyrez {
  const xs = body.map((b) => b.x);
  const ys = body.map((b) => b.y);
  let x = Math.min(...xs);
  let y = Math.min(...ys);
  let w = Math.max(...xs) - x;
  let h = Math.max(...ys) - y;
  const ox = w * okraj;
  const oy = h * okraj;
  x -= ox;
  y -= oy;
  w += 2 * ox;
  h += 2 * oy;
  if (minPomer && w / h < minPomer) {
    const nw = h * minPomer;
    x -= (nw - w) / 2;
    w = nw;
  }
  return { x, y, w, h };
}

export function vyrezObdelniku(
  jih: number,
  sever: number,
  zapad: number,
  vychod: number,
): Vyrez {
  const rohy = [
    promitni(jih, zapad),
    promitni(jih, vychod),
    promitni(sever, zapad),
    promitni(sever, vychod),
    promitni(sever, (zapad + vychod) / 2),
    promitni(jih, (zapad + vychod) / 2),
  ];
  return vyrezBodu(rohy, 0);
}
