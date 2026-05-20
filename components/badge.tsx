import { TYP_LABELS } from "@/lib/search";
import type { TypPullitru } from "@/lib/types";

const STYLES: Record<TypPullitru, string> = {
  pivovarni: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  reklamni: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  akcni: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
};

export function TypBadge({ typ }: { typ: TypPullitru }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STYLES[typ]}`}
    >
      {TYP_LABELS[typ]}
    </span>
  );
}
