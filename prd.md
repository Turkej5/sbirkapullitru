# PRD — sbirkapullitru.cz

> Product Requirements Document pro osobní web prezentující sbírku půllitrů.
> Tento dokument slouží jako kompletní zadání pro Claude Code.

---

## 1. Přehled projektu

**Název webu:** Sbírka půllitrů
**URL:** https://www.sbirkapullitru.cz
**Účel:** Osobní katalog/výstava sbírky půllitrů (cca 150–300 kusů, postupně roste).
**Cílová skupina:**
1. **Majitel sbírky** — rychlé ověření, zda už daný kousek vlastní (např. při zvažování koupě)
2. **Veřejnost** — návštěvníci, kteří se chtějí podívat na sbírku

**Tone of voice:** Osobní, hrdé, ale střízlivé. Žádný komerční jazyk. Sbírka mluví sama za sebe skrz fotky.

---

## 2. Technologie a hosting

| Vrstva | Volba |
|--------|-------|
| Framework | **Next.js (App Router, TypeScript)** |
| Styling | Tailwind CSS |
| Hosting | Vercel (už nastaveno) |
| Repo | GitHub (už nastaveno) |
| Data | Lokální JSON soubory v repu |
| Obrázky | Lokální v `/public`, optimalizace přes `next/image` |
| Analytika | Google Analytics 4 (s cookie lištou) |
| Jazyk | Pouze čeština |

**Proč Next.js:** Statická generace stránek (SSG) → bleskové načítání, výborné SEO, Vercel ho podporuje nativně, do budoucna lze přidat ISR pokud by sbírka rostla do tisíců.

---

## 3. Datový model

### 3.1 Soubory v repu

```
/data/
  ├── pullitry.json      ← všechny záznamy půllitrů
  ├── pivovary.json      ← popisky pivovarů (sdílí je víc půllitrů)
  └── zeme.json          ← seznam zemí s metadaty (vlajka, název)

/public/images/
  ├── pullitry/          ← fotky půllitrů (např. plzen-prazdroj-2019.jpg)
  ├── log/               ← logo, favicon, OG obrázek
  └── og/                ← screenshoty pro Open Graph
```

### 3.2 Schema — `pullitry.json`

Pole objektů:

```json
{
  "id": "plzen-prazdroj-2019",
  "nazev_zobrazovany": "Plzeňský Prazdroj",
  "pivovar_id": "plzensky-prazdroj",
  "zeme": "cz",
  "fotka": "plzen-prazdroj-2019.jpg",
  "pridano": "2026-05-20",
  "typ": "pivovarni"
}
```

**Pole:**
- `id` *(string, povinné, unikátní)* — slug, používá se i v URL
- `nazev_zobrazovany` *(string, povinné)* — to, co se zobrazí pod fotkou (typicky shodné s názvem pivovaru, ale může se lišit u reklamních / akčních)
- `pivovar_id` *(string nebo null)* — reference do `pivovary.json`. **null** = reklamní/akční půllitr bez pivovaru
- `zeme` *(string, povinné)* — kód země (`cz`, `de`, `be`, …)
- `fotka` *(string, povinné)* — název souboru v `/public/images/pullitry/`
- `pridano` *(ISO datum, povinné)* — pro řazení a štítek „nový"
- `typ` *(enum)* — `pivovarni` | `reklamni` | `akcni`

### 3.3 Schema — `pivovary.json`

```json
{
  "id": "plzensky-prazdroj",
  "nazev": "Plzeňský Prazdroj",
  "zeme": "cz",
  "mesto": "Plzeň",
  "popisek": "Tradiční český pivovar založený 1842, kolébka piva typu Pilsner.",
  "web": "https://www.prazdroj.cz"
}
```

- `id`, `nazev`, `zeme` *(povinné)*
- `mesto`, `popisek`, `web` *(volitelné)*

### 3.4 Schema — `zeme.json`

```json
{
  "kod": "cz",
  "nazev": "Česko",
  "vlajka": "🇨🇿"
}
```

### 3.5 Validace

Build script (`scripts/validate-data.ts`) běží v rámci `next build` a kontroluje:
- Unikátnost `id` u všech entit
- Každý `pivovar_id` v `pullitry.json` existuje v `pivovary.json` (nebo je null)
- Každá `zeme` existuje v `zeme.json`
- Soubor uvedený v poli `fotka` reálně existuje na disku
- Datum `pridano` je validní ISO

---

## 4. Struktura webu (Information Architecture)

```
/                              ← Domovská stránka
/sbirka                        ← Galerie všech půllitrů (s filtry)
/zeme/[kod]                    ← Přehled pro danou zemi (např. /zeme/cz)
/pivovar/[id]                  ← Stránka pivovaru (popisek + jeho půllitry)
/pullitr/[id]                  ← Detail jednoho půllitru
/o-sbirce                      ← O sbírce / O mně
/404                           ← Custom 404
```

**Hlavní menu (header):**
- Logo (vlevo, vede na `/`)
- Sbírka (vede na `/sbirka`)
- Země ▾ (dropdown s vlajkami a počty: 🇨🇿 Česko (87), 🇩🇪 Německo (24)…)
- O sbírce
- Přepínač světlý/tmavý režim (ikonka vpravo)

**Footer:**
- Copyright + rok
- Odkaz na Instagram
- Drobný odkaz: "Vytvořeno s láskou k pivu" nebo podobně

---

## 5. Jednotlivé stránky — specifikace

### 5.1 Domovská stránka (`/`)

Mix podle požadavku uživatele — tři sekce pod sebou:

**Sekce 1 — Hero**
- Velký nadpis: „Sbírka půllitrů"
- Podtitul: jedna věta o sbírce (např. „Soukromá sbírka českých i zahraničních půllitrů, postupně doplňovaná od roku XXXX.")
- Počítadlo: **„Aktuálně **237** kusů z **14** zemí"** (čísla se počítají z dat při buildu)
- CTA tlačítko: „Prohlédnout sbírku" → `/sbirka`
- Vizuálně podpořeno hero fotkou (vybraný oblíbený půllitr nebo koláž)

**Sekce 2 — Nejnovější přírůstky**
- Nadpis: „Nejnovější přírůstky"
- 4 nejnovější půllitry (podle `pridano`) v gridu 4 sloupce
- Pod gridem: odkaz „Zobrazit všechny →" → `/sbirka`

**Sekce 3 — Země**
- Nadpis: „Sbírka podle zemí"
- Dlaždice zemí (každá: vlajka, název země, počet kusů)
- Grid 3–4 dlaždice na řádek
- Klik na dlaždici → `/zeme/[kod]`

### 5.2 Galerie sbírky (`/sbirka`)

- Nadpis: „Celá sbírka"
- Subtitle: počet zobrazených z celkového počtu (např. „Zobrazeno 237 z 237")
- **Vyhledávací pole** v horní části (fulltext přes název pivovaru, město, typ)
- **Filtry** (nad gridem, sklápěcí nebo jako chips):
  - Země (multi-select s vlajkami)
  - Typ (pivovarní / reklamní / akční)
  - Řazení (Nejnovější / Nejstarší / Abecedně)
- **Grid 4 sloupce** (na desktopu; 2 na tabletu, 1 na mobilu)
- Každá karta: fotka půllitru (čtvercový poměr) + pod fotkou jen **název pivovaru**
- Hover na kartu: jemné zvýraznění (lehký scale, stín)
- Štítek „Nový" v rohu karty pro půllitry přidané za posledních 30 dní
- Klik na kartu → `/pullitr/[id]`
- Pokud žádné výsledky filtru: friendly message „Žádný půllitr neodpovídá filtru."

### 5.3 Stránka země (`/zeme/[kod]`)

- Hlavička: velká vlajka + název země + počet kusů („🇨🇿 Česko · 87 půllitrů")
- Grid s půllitry pouze z této země (stejný layout jako `/sbirka`, ale bez filtru země)
- Filtry zde: jen typ + řazení

### 5.4 Stránka pivovaru (`/pivovar/[id]`)

- Hlavička: název pivovaru + země (vlajka) + město
- Popisek pivovaru (z `pivovary.json`)
- Volitelně: odkaz na web pivovaru
- Grid všech půllitrů od tohoto pivovaru (stejný karta-styl)

### 5.5 Detail půllitru (`/pullitr/[id]`)

Layout:
- **Levá polovina:** velká fotka půllitru (s možností lightbox/zoom na klik)
- **Pravá polovina:**
  - Název pivovaru (velký nadpis)
  - Země (vlajka + název) — link na `/zeme/[kod]`
  - Pivovar — link na `/pivovar/[id]` („Zobrazit všechny půllitry tohoto pivovaru")
  - Popisek pivovaru (krátký, 1–3 věty z `pivovary.json`)
  - Typ (badge: Pivovarní / Reklamní / Akční)
- **Pod tím:** Listování — „← Předchozí | Další →" (chronologicky podle `pridano`, kruhové)
- **Šipkové ovládání klávesnicí** (← →)
- Pokud `pivovar_id` je null (reklamní/akční bez pivovaru): místo bloku pivovaru zobrazit jen typ a popisek (pokud bude doplněn nějaký popisek do dat — to ale zatím nepotřebujeme).

### 5.6 O sbírce (`/o-sbirce`)

Statická stránka. Obsah:
- Krátký text o sbírce — kdy začala, motivace, jak sbírám (placeholder text, doplníš)
- Foto majitele s nějakým půllitrem (volitelné, doplníš)
- Statistiky: počet kusů, počet zemí, počet pivovarů
- Odkaz na Instagram
- (Žádný kontaktní formulář — uživatel nechce)

### 5.7 404 stránka

- Vtipný text v duchu „Tenhle půllitr ve sbírce nemám"
- Tlačítko zpět na hlavní

---

## 6. Vizuální styl

### 6.1 Barevná paleta — Jantarová klasika

**Světlý režim:**
- Pozadí stránky: `#F5EFE3` (světlý jantar)
- Karty / surface: `#FFFFFF`
- Akcentní barva: `#B8722C` (tmavší jantar, pro tlačítka, odkazy, čáry)
- Primární text: `#2C2C2A` (skoro černá, ne čistá)
- Sekundární text: `#5F5E5A`
- Hranice / divider: `#E5DCC4`

**Tmavý režim:**
- Pozadí: `#1A1814`
- Karty / surface: `#2A2722`
- Akcent: `#E8A33D` (jasnější jantar, ať svítí)
- Primární text: `#FAF5EA`
- Sekundární text: `#B4B2A9`
- Hranice: `#3A3530`

### 6.2 Typografie

- Hlavní písmo: **Inter** (Google Fonts) — moderní, čitelné, sans-serif
- Display / nadpisy: **Fraunces** nebo **Playfair Display** — serif pro „muzejní" pocit
  - (Claude Code, vyber lepší volbu při implementaci a doporuč)
- Velikosti: standardní Tailwind scale, hlavní nadpis ~48px, sekce ~32px

### 6.3 Logo

**Varianta 4 z konverzace** — ikona půllitru s pěnou vedle textu „Sbírka půllitrů" (serif).

Specifikace:
- Ikona: stylizovaný půllitr v jantarové (`#E8A33D`) s pěnou v krémové (`#FAF5EA`), kontura `#B8722C`
- Text: serif font, dvouřádkový („Sbírka" + „půllitrů") nebo jednořádkový — vyber lépe vypadající
- Použít SVG (vektor, škáluje)
- **Varianty k vygenerování:**
  - `logo.svg` — plnobarevné, pro hlavičku
  - `logo-mark.svg` — jen ikona bez textu (pro favicon, malé použití)
  - `favicon.ico` + `favicon-32.png` + `favicon-180.png` (apple-touch)
  - `og-image.png` — 1200×630px pro sociální sítě (logo + počet kusů sbírky)

### 6.4 Komponenty

- **Karty půllitrů:** poměr 1:1 fotka, pod tím název pivovaru centrovaný, jemný border, hover zvýraznění
- **Tlačítka:** zaoblené (rounded-md), akcentní barva, hover ztmavení
- **Badge (typ):** drobný pill s barvou podle typu — Pivovarní (zelený), Reklamní (modrý), Akční (fialový)
- **Štítek „Nový":** červený badge v rohu karty
- **Vlajky zemí:** emoji (jednoduché, fungují všude), fallback jen text

### 6.5 Responzivita

- Mobile-first
- Breakpointy: standardní Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280)
- Grid: 1 sloupec na mobilu, 2 na `sm`, 3 na `md`, 4 na `lg`+
- Header na mobilu: hamburger menu
- Lightbox/zoom v detailu: full-screen modal na mobilu

### 6.6 Přepínač režimu

- Ikonka slunce/měsíc v pravé části hlavičky
- Stav uložen v `localStorage`
- Respektuje `prefers-color-scheme` při první návštěvě
- Plynulý přechod (transition na barvy ~150ms)

---

## 7. Funkční požadavky

### 7.1 Vyhledávání

- Klient-side fulltext (na `/sbirka`)
- Hledá v: název pivovaru, město pivovaru, typ
- Bez diakritiky (normalizace: „Plzeň" = „plzen")
- Live výsledky při psaní (debounce 150ms)

### 7.2 Filtry

- Stav filtrů v URL (`?zeme=cz,de&typ=pivovarni&razeni=nejnovejsi`) — sdílitelné odkazy
- „Resetovat filtry" tlačítko, když je něco aktivní

### 7.3 Optimalizace obrázků

- Všechny obrázky přes `next/image`
- Automatické formáty (WebP, AVIF)
- Lazy loading mimo viewport
- Placeholder blur při načítání
- Doporučená velikost zdrojových fotek: 1600×1600 px, JPEG kvalita 85
- (Pokud uživatel nahraje větší fotky, build skript je může před commitem zmenšit — připrav `scripts/optimize-images.ts` jako utilitu)

### 7.4 SEO

- Meta tagy pro každou stránku (`title`, `description`, `og:image`)
- `sitemap.xml` automaticky generovaný
- `robots.txt` (povolit vše)
- Strukturovaná data (JSON-LD `CollectionPage` pro `/sbirka`, `ItemPage` pro detail)
- Sémantický HTML (`<main>`, `<article>`, `<nav>`)
- Alt texty u obrázků: „Půllitr — [název pivovaru]"

### 7.5 Analytika a cookies

- **Google Analytics 4** (GA4 ID se nastaví přes `.env.local` jako `NEXT_PUBLIC_GA_ID`)
- **Cookie lišta** dle GDPR:
  - Při první návštěvě: lišta dole s textem a tlačítky „Souhlasím" / „Pouze nezbytné"
  - GA4 se načte pouze po souhlasu
  - Volba uložena v `localStorage` (klíč `cookie-consent`)
  - Použít lehké řešení (vlastní komponenta, ne hotový plugin)
  - Odkaz „Cookies" v footeru pro reset volby

### 7.6 Přidání nového půllitru (workflow)

**Manuální workflow přes Claude Code:**

1. Uživatel řekne Claude Code: „Přidej nový půllitr: Krušovice, ČR, rok 2024"
2. Claude Code:
   - Najde fotku v `/uploads/` nebo se zeptá na cestu
   - Přejmenuje ji na `krusovice-2024.jpg` a nakopíruje do `/public/images/pullitry/`
   - Zkontroluje, zda `krusovice` existuje v `pivovary.json` (pokud ne, zeptá se na popisek a doplní)
   - Přidá záznam do `pullitry.json` s aktuálním datem v `pridano`
   - Spustí validační skript
   - Commitne s zprávou „Add pullitr: Krušovice 2024"
   - Volitelně pushne — Vercel automaticky zdeployuje

Tento workflow se popíše v `README.md` repa.

---

## 8. Performance cíle

- **Lighthouse skóre:** 95+ ve všech kategoriích
- **LCP:** < 2.0s
- **CLS:** < 0.05
- **Velikost první stránky:** < 200 KB JS
- Statická generace všech stránek (SSG) — žádné runtime API kromě GA

---

## 9. Struktura projektu

```
/
├── app/
│   ├── layout.tsx              ← root layout (header, footer, theme)
│   ├── page.tsx                ← homepage
│   ├── sbirka/page.tsx
│   ├── zeme/[kod]/page.tsx
│   ├── pivovar/[id]/page.tsx
│   ├── pullitr/[id]/page.tsx
│   ├── o-sbirce/page.tsx
│   ├── not-found.tsx           ← 404
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── pullitr-card.tsx
│   ├── pullitr-grid.tsx
│   ├── filters.tsx
│   ├── search-input.tsx
│   ├── theme-toggle.tsx
│   ├── cookie-banner.tsx
│   └── logo.tsx
├── lib/
│   ├── data.ts                 ← načítání a parsování JSON dat
│   ├── search.ts               ← logika vyhledávání
│   └── analytics.ts            ← GA4 wrapper
├── data/
│   ├── pullitry.json
│   ├── pivovary.json
│   └── zeme.json
├── public/
│   ├── images/pullitry/
│   ├── logo.svg
│   ├── logo-mark.svg
│   ├── favicon.ico
│   └── og-image.png
├── scripts/
│   ├── validate-data.ts
│   └── optimize-images.ts
├── styles/globals.css
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 10. README.md — co tam musí být

Claude Code připraví `README.md` s těmito sekcemi:

1. **O projektu** — co to je
2. **Tech stack** — použité technologie
3. **Lokální vývoj** — `npm install`, `npm run dev`
4. **Jak přidat nový půllitr** — krok za krokem (viz 7.6)
5. **Jak přidat nový pivovar** — krok za krokem
6. **Deploy** — automaticky přes Vercel po pushi na `main`
7. **Konfigurace** — `.env.local` proměnné (GA_ID)

---

## 11. Postup implementace (doporučené pořadí)

1. **Setup projektu:** Next.js + TypeScript + Tailwind + ESLint + Prettier
2. **Datová vrstva:** Schemata + příklady dat (5–10 půllitrů pro vývoj) + validační skript
3. **Logo a brand:** SVG logo, favicon, OG image
4. **Layout:** Header, Footer, Theme toggle, dark mode setup
5. **Komponenty:** PullitrCard, PullitrGrid
6. **Stránky:** Home → Sbírka → Detail → Země → Pivovar → O sbírce
7. **Filtry a vyhledávání**
8. **Cookie lišta + GA4**
9. **SEO meta + sitemap**
10. **Performance audit** (Lighthouse, oprava)
11. **README + nasazení**

---

## 12. Co NENÍ v rozsahu (Out of scope)

- Kontaktní formulář
- E-shop / nákup
- Komentáře / hodnocení
- Login / uživatelské účty
- Anglická / cizojazyčná verze
- Mobilní aplikace
- Admin rozhraní pro správu obsahu (řešeno přes Claude Code + git)
- Newsletter
- API pro třetí strany

---

## 13. Otevřené body k doplnění uživatelem

Před spuštěním nebo při finalizaci doplň:

- [ ] Text pro stránku „O sbírce" (1–3 odstavce)
- [ ] Rok začátku sbírky (pro hero subtitle)
- [ ] Instagram URL
- [ ] GA4 Measurement ID (`G-XXXXXXXXXX`)
- [ ] Hero fotka pro homepage (jeden oblíbený půllitr nebo koláž)
- [ ] Foto na stránku „O sbírce" (volitelné)
- [ ] Naplnit `pullitry.json` a `pivovary.json` reálnými daty

---

## 14. Akceptační kritéria

Web je hotový, když:

1. ✅ Web běží na `https://www.sbirkapullitru.cz`
2. ✅ Všech ~200 půllitrů je v datech a zobrazuje se
3. ✅ Vyhledávání funguje a hledá bez diakritiky
4. ✅ Filtry fungují a jsou v URL (sdílitelné)
5. ✅ Detail půllitru má funkční listování (← →) a proklik na pivovar
6. ✅ Stránky zemí a pivovarů fungují
7. ✅ Světlý/tmavý režim funguje, pamatuje si volbu
8. ✅ Cookie lišta funguje, GA4 se aktivuje až po souhlasu
9. ✅ Lighthouse 95+ ve všech kategoriích na hlavních stránkách
10. ✅ Web funguje na mobilu, tabletu i desktopu
11. ✅ README jasně popisuje, jak přidat další půllitr

---

*Dokument verze 1.0 — finalizováno 20. 5. 2026*
