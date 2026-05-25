import Link from "next/link";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import ZemeMenu from "@/components/zeme-menu";
import { getZemeWithCounts, type ZemeWithCount } from "@/lib/data";

export default function Header() {
  const zemeWithCounts = getZemeWithCounts();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Logo priority />
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/sbirka"
            className="px-3 py-2 rounded-md hover:bg-[var(--border)] transition"
          >
            Sbírka
          </Link>
          <ZemeMenu zeme={zemeWithCounts} />
          <Link
            href="/o-sbirce"
            className="px-3 py-2 rounded-md hover:bg-[var(--border)] transition"
          >
            O sbírce
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNav zeme={zemeWithCounts} />
        </div>
      </div>
    </header>
  );
}

function MobileNav({ zeme }: { zeme: ZemeWithCount[] }) {
  return (
    <details className="md:hidden relative">
      <summary
        className="list-none rounded-md p-2 hover:bg-[var(--border)] cursor-pointer"
        aria-label="Otevřít menu"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </summary>
      <div className="absolute right-0 top-full mt-2 w-72 max-h-[75vh] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
        <Link
          href="/sbirka"
          className="block px-4 py-3 hover:bg-[var(--border)] transition"
        >
          Sbírka
        </Link>
        <Link
          href="/o-sbirce"
          className="block px-4 py-3 hover:bg-[var(--border)] transition"
        >
          O sbírce
        </Link>
        <div className="border-t border-[var(--border)] px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-soft)]">
          Země
        </div>
        <div className="grid grid-cols-2 gap-0.5 px-2 pb-2">
          {zeme.map((z) => (
            <Link
              key={z.kod}
              href={`/zeme/${z.kod}`}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[var(--border)] transition"
            >
              <span>{z.vlajka}</span>
              <span className="truncate">{z.nazev}</span>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
