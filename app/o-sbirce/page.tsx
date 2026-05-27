import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import {
  getCelkemKusu,
  getPocetPivovaru,
  getPocetZemi,
} from "@/lib/data";

const PROJEKTY = [
  {
    nazev: "AI Webík",
    url: "https://www.aiwebik.cz",
    web: "aiwebik.cz",
    popis:
      "Moderní weby na míru s pomocí umělé inteligence — od nápadu k hotovému webu rychle a bez zbytečných cavyků.",
  },
  {
    nazev: "Ledgerly",
    url: "https://www.ledgerly.cz",
    web: "ledgerly.cz",
    popis:
      "Přehledná správa financí a fakturace online. Mít účetnictví pod kontrolou nemusí být věda.",
  },
  {
    nazev: "Audit PPC",
    url: "https://www.audit-ppc.cz",
    web: "audit-ppc.cz",
    popis:
      "Nezávislý audit a ladění PPC kampaní (Google Ads i Sklik) — víc výkonu z reklamy za méně peněz.",
  },
];

export const metadata: Metadata = {
  title: "O sbírce",
  description:
    "O mé sbírce půllitrů, kdy začala a jak vznikla. Statistiky a kontakt.",
};

export default function OSbircePage() {
  const celkem = getCelkemKusu();
  const zemi = getPocetZemi();
  const pivovaru = getPocetPivovaru();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-8">
        O sbírce
      </h1>
      <div className="prose prose-lg max-w-none text-[var(--text)] leading-relaxed space-y-5">
        <p>
          Nebyla to náhoda. Půllitry jsem začal sbírat postupně — nejdřív pár
          prvních kousků, pak přibývaly i z cest a nakonec mi je začali dávat
          přátelé a rodina. Z příležitostného koníčku se časem stala vášeň a
          dnes je ve sbírce řada půllitrů z českých pivovarů i ze zahraničí.
        </p>
        <p>
          Sbírám hlavně půllitry pivovarní (s logem nebo značkou pivovaru),
          příležitostně i reklamní a akční edice. Zajímají mě klasické tvary
          i krajové specialitky.
        </p>
        <p className="text-[var(--text-soft)] italic">
          Tento web je v aktivním vývoji — texty i fotky budou přibývat.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4">
        <Stat label="kusů" value={celkem} />
        <Stat label="zemí" value={zemi} />
        <Stat label="pivovarů" value={pivovaru} />
      </div>

      <section className="mt-16 border-t border-[var(--border)] pt-12">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
          Co mě ještě baví
        </h2>
        <p className="text-[var(--text-soft)] mb-6">
          Sbírka půllitrů je koníček. Kromě ní stojím i za těmito projekty:
        </p>
        <ul className="grid sm:grid-cols-3 gap-4">
          {PROJEKTY.map((p) => (
            <li key={p.url}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
              >
                <span className="font-display text-lg font-semibold group-hover:text-[var(--accent)]">
                  {p.nazev}
                </span>
                <span className="text-xs text-[var(--text-soft)] mb-2">
                  {p.web}
                </span>
                <span className="text-sm leading-relaxed text-[var(--text-soft)]">
                  {p.popis}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 border-t border-[var(--border)] pt-12">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
          Napište mi
        </h2>
        <p className="text-[var(--text-soft)] mb-6">
          Máte půllitr, který by se ve sbírce neztratil, nebo mi chcete jen
          něco vzkázat? Pokud byste mi chtěli darovat nějaký půllitr nebo
          poslat zprávu, ozvěte se.
        </p>
        <ContactForm />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
      <div className="font-display text-3xl sm:text-4xl font-semibold text-[var(--accent)] tabular-nums">
        {value}
      </div>
      <div className="text-sm text-[var(--text-soft)] mt-1">{label}</div>
    </div>
  );
}
