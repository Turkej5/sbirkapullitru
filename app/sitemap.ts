import type { MetadataRoute } from "next";
import {
  getAllPivovary,
  getAllPullitry,
  getAllZeme,
} from "@/lib/data";

const SITE_URL = "https://www.sbirkapullitru.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/sbirka`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/o-sbirce`, changeFrequency: "monthly", priority: 0.5 },
  ];
  const zeme = getAllZeme().map((z) => ({
    url: `${SITE_URL}/zeme/${z.kod}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const pivovary = getAllPivovary().map((p) => ({
    url: `${SITE_URL}/pivovar/${p.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const pullitry = getAllPullitry().map((p) => ({
    url: `${SITE_URL}/pullitr/${p.id}`,
    lastModified: new Date(p.pridano),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  return [...base, ...zeme, ...pivovary, ...pullitry];
}
