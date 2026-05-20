export type TypPullitru = "pivovarni" | "reklamni" | "akcni";

export type Pullitr = {
  id: string;
  nazev_zobrazovany: string;
  pivovar_id: string | null;
  zeme: string;
  fotka: string;
  pridano: string;
  typ: TypPullitru;
};

export type Pivovar = {
  id: string;
  nazev: string;
  zeme: string;
  mesto?: string;
  popisek?: string;
  web?: string;
};

export type Zeme = {
  kod: string;
  nazev: string;
  vlajka: string;
};

export type PullitrEnhanced = Pullitr & {
  imageUrl: string;
  isPlaceholder: boolean;
  isNovy: boolean;
  pivovar: Pivovar | null;
  zemeInfo: Zeme;
};
