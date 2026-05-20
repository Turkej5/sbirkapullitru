import type { PullitrEnhanced } from "@/lib/types";

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function searchPullitry(
  data: PullitrEnhanced[],
  query: string,
): PullitrEnhanced[] {
  const q = normalize(query);
  if (!q) return data;
  return data.filter((p) => {
    const haystack = [
      p.nazev_zobrazovany,
      p.pivovar?.nazev ?? "",
      p.pivovar?.mesto ?? "",
      p.typ,
      p.zemeInfo.nazev,
    ]
      .map(normalize)
      .join(" ");
    return haystack.includes(q);
  });
}

export const TYP_LABELS: Record<string, string> = {
  pivovarni: "Pivovarní",
  reklamni: "Reklamní",
  akcni: "Akční",
};

export function isNovy(pridano: string, refDate = new Date()): boolean {
  const added = new Date(pridano);
  const diff = (refDate.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 30;
}
