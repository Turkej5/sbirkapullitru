"""Vygeneruje lib/mapa-evropy.ts z Natural Earth 1:50m.

Použití: python3 scripts/generuj-mapu.py ne_50m_admin_0_countries.geojson lib/mapa-evropy.ts
Zdroj: https://github.com/nvkelso/natural-earth-vector (geojson/ne_50m_admin_0_countries.geojson)
"""

import json
import math
import sys

src, out = sys.argv[1], sys.argv[2]
LAT0, LON0, R = 52.0, 10.0, 6371.0
def proj(lon, lat):
    l, p = math.radians(lon - LON0), math.radians(lat)
    p0 = math.radians(LAT0)
    k = math.sqrt(2 / (1 + math.sin(p0)*math.sin(p) + math.cos(p0)*math.cos(p)*math.cos(l)))
    x = R*k*math.cos(p)*math.sin(l)
    y = R*k*(math.cos(p0)*math.sin(p) - math.sin(p0)*math.cos(p)*math.cos(l))
    return x, -y
def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0]-a[0], b[1]-a[1]; n = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts)-1):
        d = abs(dy*pts[i][0] - dx*pts[i][1] + b[0]*a[1] - b[1]*a[0]) / n if (dx or dy) else math.hypot(pts[i][0]-a[0], pts[i][1]-a[1])
        if d > dmax: dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx+1], eps)[:-1] + rdp(pts[idx:], eps)
    return [a, b]
g = json.load(open(src))
res = []
for f in g['features']:
    pr = f['properties']
    kod = (pr.get('ISO_A2_EH') or pr.get('ISO_A2') or '').lower()
    geom = f['geometry']
    polys = geom['coordinates'] if geom['type']=='MultiPolygon' else [geom['coordinates']]
    parts = []
    for poly in polys:
        ring = poly[0]
        lons = [c[0] for c in ring]; lats = [c[1] for c in ring]
        if max(lons) < -32 or min(lons) > 62 or max(lats) < 24 or min(lats) > 74: continue
        pts = [proj(min(max(lo,-35),65), min(max(la,22),76)) for lo,la in ring]
        pts = rdp(pts, 1.2)
        if len(pts) < 4: continue
        xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
        if (max(xs)-min(xs)) < 4 and (max(ys)-min(ys)) < 4: continue
        parts.append('M' + 'L'.join(f'{round(x)},{round(y)}' for x,y in pts) + 'Z')
    if parts: res.append({'kod': kod, 'd': ''.join(parts)})
res.sort(key=lambda r: r['kod'])
with open(out,'w') as fo:
    fo.write('// Vygenerováno z Natural Earth 1:50m (public domain), Lambertova azimutální projekce\n')
    fo.write('// se středem 52° s. š., 10° v. d., jednotky = km. Skript: scripts/generuj-mapu.py\n\n')
    fo.write(f'export const PROJEKCE = {{ lat0: {LAT0}, lon0: {LON0}, r: {R} }} as const;\n\n')
    fo.write('export const MAPA_ZEME: { kod: string; d: string }[] = [\n')
    for r in res: fo.write(f'  {{ kod: "{r["kod"]}", d: "{r["d"]}" }},\n')
    fo.write('];\n')
print(len(res), sum(len(r['d']) for r in res))
