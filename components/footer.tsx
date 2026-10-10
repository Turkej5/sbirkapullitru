import Link from "next/link";
import CookieResetButton from "@/components/cookie-reset-button";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-soft)]">
        <div>© {year} Sbírka půllitrů</div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/v-cislech" className="hover:text-[var(--accent)] transition">
            Sbírka v číslech
          </Link>
          <Link href="/o-sbirce" className="hover:text-[var(--accent)] transition">
            O sbírce
          </Link>
          <CookieResetButton />
        </div>
        <div className="italic">Vytvořeno s láskou k pivu.</div>
      </div>
    </footer>
  );
}
