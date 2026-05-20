import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="text-7xl mb-4">🍺</div>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-3">
        Tenhle půllitr ve sbírce nemám
      </h1>
      <p className="text-[var(--text-soft)] mb-8 text-lg">
        Stránka, kterou hledáš, neexistuje. Možná byla přesunutá, nebo jsi
        narazil na překlep v adrese.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] text-white px-5 py-3 text-sm font-medium hover:bg-[var(--accent-hover)] transition"
      >
        Zpět na úvod
      </Link>
    </div>
  );
}
