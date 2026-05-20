import Image from "next/image";
import Link from "next/link";

export default function Logo({ priority = false }: { priority?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 group"
      aria-label="Sbírka půllitrů — domů"
    >
      <span className="relative inline-block h-12 w-12 sm:h-14 sm:w-14">
        <Image
          src="/images/log/logo-mark.png"
          alt=""
          fill
          sizes="56px"
          priority={priority}
          className="object-contain block dark:hidden"
        />
        <Image
          src="/images/log/logo-mark-dark.png"
          alt=""
          fill
          sizes="56px"
          priority={priority}
          className="object-contain hidden dark:block"
        />
      </span>
      <span className="font-display leading-tight">
        <span className="block text-base sm:text-lg font-semibold tracking-wide">
          Sbírka
        </span>
        <span className="block text-base sm:text-lg font-semibold tracking-wide">
          půllitrů
        </span>
      </span>
    </Link>
  );
}
