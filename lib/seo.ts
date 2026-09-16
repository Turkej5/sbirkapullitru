import type { Pivovar, PullitrEnhanced, Zeme } from "@/lib/types";
import { TYP_LABELS } from "@/lib/search";

export const SITE_URL = "https://www.sbirkapullitru.cz";
export const SITE_NAME = "Sbírka půllitrů";

const abs = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type JsonLdBreadcrumbItem = { name: string; url: string };

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "cs-CZ",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/sbirka?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: JsonLdBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export function pivovarJsonLd(
  piv: Pivovar,
  zeme: Zeme | null,
  pullitrCount: number,
) {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: piv.nazev,
    url: abs(`/pivovar/${piv.id}`),
    "@id": abs(`/pivovar/${piv.id}#pivovar`),
  };
  if (piv.popisek) org.description = piv.popisek;
  if (piv.rok_zalozeni) org.foundingDate = String(piv.rok_zalozeni);
  if (piv.zaniklo) org.dissolutionDate = String(piv.zaniklo);
  if (piv.mesto || zeme) {
    org.address = {
      "@type": "PostalAddress",
      ...(piv.mesto ? { addressLocality: piv.mesto } : {}),
      ...(zeme ? { addressCountry: zeme.nazev } : {}),
    };
  }
  org.subjectOf = {
    "@type": "CollectionPage",
    name: `${piv.nazev} — půllitry ve sbírce`,
    numberOfItems: pullitrCount,
  };
  return org;
}

export function pullitrJsonLd(p: PullitrEnhanced) {
  const item: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nazev_zobrazovany,
    url: abs(`/pullitr/${p.id}`),
    image: abs(p.imageUrl),
    category: TYP_LABELS[p.typ] ?? p.typ,
    countryOfOrigin: p.zemeInfo.nazev,
    dateCreated: p.pridano,
  };
  if (p.pivovar) {
    item.brand = {
      "@type": "Organization",
      name: p.pivovar.nazev,
      url: abs(`/pivovar/${p.pivovar.id}`),
    };
  }
  return item;
}

export function zemeJsonLd(zeme: Zeme, pocet: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Půllitry — ${zeme.nazev}`,
    url: abs(`/zeme/${zeme.kod}`),
    inLanguage: "cs-CZ",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: { "@type": "Country", name: zeme.nazev },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pocet,
    },
  };
}

export function sbirkaJsonLd(pocet: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Celá sbírka — ${SITE_NAME}`,
    url: abs("/sbirka"),
    inLanguage: "cs-CZ",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pocet,
    },
  };
}

export function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `O sbírce — ${SITE_NAME}`,
    url: abs("/o-sbirce"),
    inLanguage: "cs-CZ",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}
