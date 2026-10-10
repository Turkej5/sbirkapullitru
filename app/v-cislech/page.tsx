import Link from "next/link";
import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import JsonLd from "@/components/json-ld";
import PivovarIkona from "@/components/pivovar-ikona";
import { BarList, SloupcovyGraf } from "@/components/statistiky-grafy";
import ZemeFlag from "@/components/zeme-flag";
import { getStatistiky, type PivovarZaznam } from "@/lib/statistiky";
import type { Zeme } from "@/lib/types";
import { breadcrumbJsonLd, statistikyJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sbírka v číslech",
  description:
    "Statistiky sbírky půllitrů: rekordy, nejstarší a nejmladší pivovary, kompas sbírky, rozložení podle zemí a století i zaniklé pivovary.",
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII"];

const cislo = (n: number) => n.toLocaleString("cs-CZ");

export default function VCislechPage() {
  const s = getStatistiky();
  const ceskoKusu = s.zeme.find((z) => z.kod === "cz")?.pocet ?? 0;
  const zahranici = s.zeme
    .filter((z) => !["cz", "ostatni", "reklamni"].includes(z.kod))
    .reduce((sum, z) => sum + z.pocet, 0);
  const sRokem = s.stoleti.reduce((sum, x) => sum + x.pocet, 0);

  const rekordy: RekordProps[] = [
    rekordPivovaru(s.nejstarsi, {
      ikona: "zalozeni",
      label: "Nejstarší pivovar",
      hodnota: String(s.nejstarsi.rok_zalozeni),
      detail: "rok založení",
    }),
    rekordPivovaru(s.nejmladsi, {
      ikona: "vystavba",
      label: "Nejmladší pivovar",
      hodnota: String(s.nejmladsi.rok_zalozeni),
      detail: "rok založení",
    }),
    rekordPivovaru(s.topPivovary[0], {
      ikona: "pivo",
      label: "Nejvíc kusů",
      hodnota: String(s.topPivovary[0].pocet),
      detail: `${kusuSuffix(s.topPivovary[0].pocet)} od jednoho pivovaru`,
    }),
  ];
  if (s.nejdelsiZivot) {
    const p = s.nejdelsiZivot;
    const roky = (p.zaniklo as number) - (p.rok_zalozeni as number);
    rekordy.push(
      rekordPivovaru(p, {
        ikona: "cas",
        label: "Nejdéle vařil",
        hodnota: `${roky} ${letSuffix(roky)}`,
        detail: `${p.rok_zalozeni}–${p.zaniklo}`,
      }),
    );
  }
  if (s.nejkratsiZivot) {
    const p = s.nejkratsiZivot;
    const roky = (p.zaniklo as number) - (p.rok_zalozeni as number);
    rekordy.push(
      rekordPivovaru(p, {
        ikona: "konec",
        label: "Nejkratší příběh",
        hodnota: `${roky} ${letSuffix(roky)}`,
        detail: `${p.rok_zalozeni}–${p.zaniklo}`,
      }),
    );
  }
  if (s.nejvicMesto) {
    const m = s.nejvicMesto;
    rekordy.push({
      ikona: "poloha",
      label: "Nejpivovarnější město",
      hodnota: String(m.pocet),
      detail: `${pivovaruSuffix(m.pocet)} z jednoho města`,
      href: `/pivovary?q=${encodeURIComponent(m.mesto)}&razeni=abeceda`,
      nazev: m.mesto,
      zeme: m.zeme,
    });
  }

  const hlavniZeme = s.zeme.filter((z) => z.pocet > 1);
  const jednotlive = s.zeme.filter((z) => z.pocet === 1);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={[
          statistikyJsonLd(),
          breadcrumbJsonLd([{ name: "Sbírka v číslech", url: "/v-cislech" }]),
        ]}
      />
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-2">
        Sbírka v číslech
      </h1>
      <p className="text-[var(--text-soft)] mb-10 max-w-2xl">
        Co se dá vyčíst z {cislo(s.celkem)} půllitrů, {s.pivovaru} pivovarů
        a {s.zemi} zemí. Čísla se počítají přímo z katalogu, takže s každým
        novým kouskem rostou.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat value={cislo(s.celkem)} label="půllitrů" />
        <Stat value={String(s.pivovaru)} label="pivovarů" />
        <Stat value={String(s.zemi)} label="zemí" />
        <Stat value={String(s.zaniklych)} label="zaniklých pivovarů" />
      </div>

      <Sekce nadpis="Rekordy" popis="Krajní hodnoty mezi pivovary ve sbírce.">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rekordy.map((r) => (
            <li key={r.label}>
              <Rekord {...r} />
            </li>
          ))}
        </ul>
      </Sekce>

      <Sekce
        nadpis="Kompas sbírky"
        popis="Pivovary na okrajích mapy a jejich vzdálenost od Prahy vzdušnou čarou."
      >
        <ul
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
            s.kompas.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {s.kompas.map((k) => (
            <li key={k.pivovar.id}>
              <Link
                href={`/pivovar/${k.pivovar.id}`}
                className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-soft)]">
                  <span className="flex flex-shrink-0">
                    {k.ikony.map((ik) => (
                      <PivovarIkona key={ik} ikona={ik} className="h-4 w-4 text-[var(--accent)]" />
                    ))}
                  </span>
                  {k.smery.join(" a ")}
                </div>
                <div className="mt-3 flex items-center gap-2 font-medium group-hover:text-[var(--accent)] transition-colors">
                  <ZemeFlag zeme={k.pivovar.zemeInfo} className="flex-shrink-0" />
                  <span className="truncate">{k.pivovar.nazev}</span>
                </div>
                <div className="mt-0.5 text-sm text-[var(--text-soft)]">
                  {[k.pivovar.mesto, k.pivovar.zemeInfo.nazev].filter(Boolean).join(", ")}
                </div>
                <div className="mt-auto pt-3 text-sm tabular-nums text-[var(--text)]">
                  {cislo(k.km)} km od Prahy
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Sekce>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
        <Sekce
          nadpis="Podle zemí"
          popis={`Česko drží ${ceskoKusu} kusů, ze zahraničí je ${zahranici}.`}
        >
          <BarList
            polozky={hlavniZeme.map((z) => ({
              key: z.kod,
              label: (
                <>
                  <ZemeFlag zeme={z} className="flex-shrink-0" />
                  <span className="truncate">{z.nazev}</span>
                </>
              ),
              hodnota: z.pocet,
              href: `/zeme/${z.kod}`,
              popis: `${z.nazev}: ${z.pocet} ${kusuSuffix(z.pocet)}`,
            }))}
          />
          {jednotlive.length > 0 && (
            <p className="mt-3 px-2 text-sm leading-relaxed text-[var(--text-soft)]">
              Po jednom kusu:{" "}
              {jednotlive.map((z, i) => (
                <Fragment key={z.kod}>
                  <Link
                    href={`/zeme/${z.kod}`}
                    className="whitespace-nowrap hover:text-[var(--accent)] transition-colors"
                  >
                    <ZemeFlag zeme={z} /> {z.nazev}
                  </Link>
                  {i < jednotlive.length - 1 ? ", " : ""}
                </Fragment>
              ))}
              .
            </p>
          )}
        </Sekce>
        <Sekce
          nadpis="Nejčastější pivovary"
          popis="Deset pivovarů s největším počtem půllitrů ve sbírce."
        >
          <BarList
            polozky={s.topPivovary.map((p) => ({
              key: p.id,
              label: (
                <>
                  <ZemeFlag zeme={p.zemeInfo} className="flex-shrink-0" />
                  <span className="truncate">{p.nazev}</span>
                </>
              ),
              hodnota: p.pocet,
              href: `/pivovar/${p.id}`,
              popis: `${p.nazev}: ${p.pocet} ${kusuSuffix(p.pocet)}`,
            }))}
          />
          <Link
            href="/pivovary?razeni=kusy"
            className="mt-4 inline-block px-2 text-sm text-[var(--accent)] hover:underline"
          >
            Všechny pivovary podle počtu kusů →
          </Link>
        </Sekce>
      </div>

      <Sekce
        nadpis="Kdy pivovary vznikly"
        popis={`Počet pivovarů podle století založení. Rok založení známe u ${sRokem} ze ${s.pivovaru} pivovarů.`}
      >
        <SloupcovyGraf
          sloupce={s.stoleti.map((x) => ({
            key: String(x.stoleti),
            label: `${ROMAN[x.stoleti] ?? x.stoleti}. stol.`,
            hodnota: x.pocet,
            popis: `${x.stoleti}. století: ${x.pocet} ${pivovaruSuffix(x.pocet)}`,
          }))}
        />
      </Sekce>

      <Sekce nadpis="Druhy půllitrů" popis="Jak se sbírka dělí podle původu kousku.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Podil label="Pivovarní" hodnota={s.typy.pivovarni} celkem={s.celkem} href="/sbirka?typ=pivovarni" />
          <Podil label="Reklamní" hodnota={s.typy.reklamni} celkem={s.celkem} href="/sbirka?typ=reklamni" />
          <Podil label="Ostatní" hodnota={s.typy.akcni} celkem={s.celkem} href="/sbirka?typ=akcni" />
        </div>
      </Sekce>

      <Sekce
        nadpis="Přírůstky podle roku"
        popis="Kolik kusů přibylo do katalogu v jednotlivých letech. Sbírka se doplňuje v dávkách."
      >
        <SloupcovyGraf
          vyska={150}
          popiskyJenNenulove
          sloupce={s.prirustky.map((x) => ({
            key: String(x.rok),
            label: String(x.rok),
            hodnota: x.pocet,
            popis: `${x.rok}: ${x.pocet} ${kusuSuffix(x.pocet)}`,
          }))}
        />
      </Sekce>

      {s.zanikle.length > 0 && (
        <Sekce
          nadpis="Zaniklé pivovary"
          popis="Pivovary, které už nevaří. Jejich půllitry zůstaly."
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {s.zanikle.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pivovar/${p.id}`}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)] transition-colors"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium group-hover:text-[var(--accent)] transition-colors">
                      <ZemeFlag zeme={p.zemeInfo} className="flex-shrink-0" />
                      <span className="truncate">{p.nazev}</span>
                    </span>
                    {p.mesto && (
                      <span className="block truncate text-xs text-[var(--text-soft)] mt-0.5">
                        {p.mesto}
                      </span>
                    )}
                  </span>
                  <span className="flex-shrink-0 text-sm tabular-nums text-[var(--text-soft)]">
                    {p.rok_zalozeni ? `${p.rok_zalozeni}–${p.zaniklo}` : `do ${p.zaniklo}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/pivovary?zanikle=1"
            className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            Zaniklé pivovary v přehledu →
          </Link>
        </Sekce>
      )}
    </div>
  );
}

function Sekce({
  nadpis,
  popis,
  children,
}: {
  nadpis: string;
  popis?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold">{nadpis}</h2>
      {popis && <p className="mt-1 mb-5 text-sm text-[var(--text-soft)]">{popis}</p>}
      {children}
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
      <div className="font-display text-3xl sm:text-4xl font-semibold text-[var(--accent)]">
        {value}
      </div>
      <div className="text-sm text-[var(--text-soft)] mt-1">{label}</div>
    </div>
  );
}

type RekordProps = {
  ikona: string;
  label: string;
  hodnota: string;
  detail: string;
  href: string;
  nazev: string;
  zeme: Zeme;
};

function rekordPivovaru(
  pivovar: PivovarZaznam,
  r: Pick<RekordProps, "ikona" | "label" | "hodnota" | "detail">,
): RekordProps {
  return {
    ...r,
    href: `/pivovar/${pivovar.id}`,
    nazev: pivovar.nazev,
    zeme: pivovar.zemeInfo,
  };
}

function Rekord({ ikona, label, hodnota, detail, href, nazev, zeme }: RekordProps) {
  return (
    <Link
      href={href}
      className="group flex h-full gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition-colors"
    >
      <span className="flex-shrink-0 mt-0.5">
        <PivovarIkona ikona={ikona} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs uppercase tracking-wider text-[var(--text-soft)]">
          {label}
        </span>
        <span className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold text-[var(--text)]">
            {hodnota}
          </span>
          <span className="text-xs text-[var(--text-soft)]">{detail}</span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-sm group-hover:text-[var(--accent)] transition-colors">
          <ZemeFlag zeme={zeme} className="flex-shrink-0" />
          <span className="truncate">{nazev}</span>
        </span>
      </span>
    </Link>
  );
}

function Podil({
  label,
  hodnota,
  celkem,
  href,
}: {
  label: string;
  hodnota: number;
  celkem: number;
  href: string;
}) {
  const procento = Math.round((hodnota / celkem) * 100);
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium group-hover:text-[var(--accent)] transition-colors">
          {label}
        </span>
        <span className="text-sm tabular-nums text-[var(--text-soft)]">
          {procento} %
        </span>
      </div>
      <div className="mt-1 font-display text-2xl font-semibold">{hodnota}</div>
      <div
        className="mt-3 h-1.5 rounded-full bg-[var(--border)]"
        role="img"
        aria-label={`${label}: ${procento} % sbírky`}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${Math.max(procento, 1)}%` }}
        />
      </div>
    </Link>
  );
}

function kusuSuffix(n: number): string {
  if (n === 1) return "kus";
  if (n >= 2 && n <= 4) return "kusy";
  return "kusů";
}

function pivovaruSuffix(n: number): string {
  if (n === 1) return "pivovar";
  if (n >= 2 && n <= 4) return "pivovary";
  return "pivovarů";
}

function letSuffix(n: number): string {
  if (n === 1) return "rok";
  if (n >= 2 && n <= 4) return "roky";
  return "let";
}
