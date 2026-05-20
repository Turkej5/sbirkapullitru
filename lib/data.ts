import "server-only";
import fs from "node:fs";
import path from "node:path";
import pullitryRaw from "@/data/pullitry.json";
import pivovaryRaw from "@/data/pivovary.json";
import zemeRaw from "@/data/zeme.json";
import type {
  Pivovar,
  Pullitr,
  PullitrEnhanced,
  Zeme,
} from "@/lib/types";

const pullitryDir = path.join(process.cwd(), "public", "images", "pullitry");

function resolveImageUrl(p: Pullitr): {
  imageUrl: string;
  isPlaceholder: boolean;
} {
  const localPath = path.join(pullitryDir, p.fotka);
  if (fs.existsSync(localPath)) {
    return { imageUrl: `/images/pullitry/${p.fotka}`, isPlaceholder: false };
  }
  return {
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p.id)}/800/800`,
    isPlaceholder: true,
  };
}

export function getAllZeme(): Zeme[] {
  return zemeRaw as Zeme[];
}

export function getAllPivovary(): Pivovar[] {
  return pivovaryRaw as Pivovar[];
}

const NOW = new Date();

export function getAllPullitry(): PullitrEnhanced[] {
  const pivovary = getAllPivovary();
  const zeme = getAllZeme();
  const pivMap = new Map(pivovary.map((p) => [p.id, p]));
  const zemMap = new Map(zeme.map((z) => [z.kod, z]));
  return (pullitryRaw as Pullitr[]).map((p) => {
    const { imageUrl, isPlaceholder } = resolveImageUrl(p);
    const pivovar = p.pivovar_id ? pivMap.get(p.pivovar_id) ?? null : null;
    const zemeInfo = zemMap.get(p.zeme);
    if (!zemeInfo) {
      throw new Error(`Pullitr ${p.id} odkazuje na neexistující zemi: ${p.zeme}`);
    }
    const added = new Date(p.pridano);
    const isNovy =
      (NOW.getTime() - added.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    return { ...p, imageUrl, isPlaceholder, isNovy, pivovar, zemeInfo };
  });
}

export function getPullitrById(id: string): PullitrEnhanced | null {
  return getAllPullitry().find((p) => p.id === id) ?? null;
}

export function getPullitryByZeme(kod: string): PullitrEnhanced[] {
  return getAllPullitry().filter((p) => p.zeme === kod);
}

export function getPullitryByPivovar(pivovarId: string): PullitrEnhanced[] {
  return getAllPullitry().filter((p) => p.pivovar_id === pivovarId);
}

export function getZemeByKod(kod: string): Zeme | null {
  return getAllZeme().find((z) => z.kod === kod) ?? null;
}

export function getPivovarById(id: string): Pivovar | null {
  return getAllPivovary().find((p) => p.id === id) ?? null;
}

export type ZemeWithCount = Zeme & { pocet: number };

export function getZemeWithCounts(): ZemeWithCount[] {
  const all = getAllPullitry();
  const zeme = getAllZeme();
  return zeme
    .map((z) => ({
      ...z,
      pocet: all.filter((p) => p.zeme === z.kod).length,
    }))
    .filter((z) => z.pocet > 0)
    .sort((a, b) => b.pocet - a.pocet);
}

export function getCelkemKusu(): number {
  return (pullitryRaw as Pullitr[]).length;
}

export function getPocetZemi(): number {
  return getZemeWithCounts().length;
}

export function getPocetPivovaru(): number {
  const all = getAllPullitry();
  const ids = new Set(all.map((p) => p.pivovar_id).filter(Boolean));
  return ids.size;
}

export function getNejnovejsi(limit = 4): PullitrEnhanced[] {
  return getAllPullitry()
    .slice()
    .sort((a, b) => b.pridano.localeCompare(a.pridano))
    .slice(0, limit);
}

export function getSortedChronologicky(): PullitrEnhanced[] {
  return getAllPullitry()
    .slice()
    .sort((a, b) => b.pridano.localeCompare(a.pridano));
}
