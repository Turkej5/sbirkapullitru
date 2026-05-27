import type { Zeme } from "@/lib/types";

export default function ZemeFlag({
  zeme,
  className,
}: {
  zeme: Pick<Zeme, "kod" | "vlajka">;
  className?: string;
}) {
  if (zeme.kod === "reklamni") {
    return (
      <span className={className} role="img" aria-label="Reklamní">
        <TvIcon />
      </span>
    );
  }
  return <span className={className}>{zeme.vlajka}</span>;
}

function TvIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      aria-hidden="true"
      className="inline-block align-[-0.15em]"
    >
      <path
        d="M12 7.5 6.5 2.2M12 7.5 17.5 2.2"
        stroke="var(--text)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="6.5" cy="2.2" r="1.15" fill="var(--text)" />
      <circle cx="17.5" cy="2.2" r="1.15" fill="var(--text)" />
      <rect x="2" y="7" width="20" height="14" rx="2.8" fill="var(--accent)" />
      <rect x="4" y="9" width="12.5" height="10" rx="1.5" fill="var(--surface)" />
      <circle cx="19" cy="11" r="0.95" fill="var(--surface)" />
      <circle cx="19" cy="14" r="0.95" fill="var(--surface)" />
      <rect x="18" y="16.2" width="2" height="2.6" rx="0.6" fill="var(--surface)" />
      <path
        d="M7 21 5.4 22.9M17 21 18.6 22.9"
        stroke="var(--text)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
