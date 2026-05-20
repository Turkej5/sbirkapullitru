# Sbírka půllitrů

Osobní katalog/výstava sbírky půllitrů na [sbirkapullitru.cz](https://www.sbirkapullitru.cz).

## Tech stack

- **Next.js 16** (App Router, SSG, Turbopack)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **Google Fonts** (Inter + Fraunces)
- **Hosting:** Vercel
- **Repo:** GitHub

## Lokální vývoj

```bash
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

## Struktura dat

Data jsou statická v `/data/`:

- `pullitry.json` — všechny půllitry
- `pivovary.json` — popisky pivovarů
- `zeme.json` — kódy zemí s vlajkami

## Jak přidat nový půllitr

1. Nahraj fotku do `/public/images/pullitry/` jako `slug-pullitru.jpg` (čtvercová, ideálně 1600×1600).
2. V `data/pullitry.json` přidej nový záznam:
   ```json
   {
     "id": "krusovice-jubilejni-2026",
     "nazev_zobrazovany": "Krušovice Jubilejní",
     "pivovar_id": "krusovice",
     "zeme": "cz",
     "fotka": "krusovice-jubilejni-2026.jpg",
     "pridano": "2026-05-20",
     "typ": "akcni"
   }
   ```
3. Commit + push. Vercel automaticky zdeployuje.

## Jak přidat nový pivovar

V `data/pivovary.json`:

```json
{
  "id": "novy-pivovar",
  "nazev": "Nový pivovar",
  "zeme": "cz",
  "mesto": "Praha",
  "popisek": "Krátký popis pivovaru.",
  "web": "https://example.com"
}
```

## Konfigurace

`.env.local` (pro produkci nastav ve Vercel):

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

GA4 se aktivuje až po souhlasu uživatele (cookie lišta).

## Deploy

Automatický: každý push na `main` → Vercel build → produkce.

## Placeholder obrázky

Dokud nejsou ve `/public/images/pullitry/` reálné fotky, web zobrazuje placeholdery z [picsum.photos](https://picsum.photos) (deterministické podle `id` půllitru). Jakmile přidáš lokální soubor s názvem podle pole `fotka`, automaticky se použije ten.
