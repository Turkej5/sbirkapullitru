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

export type PivovarFakt = {
  ikona?: string;
  label: string;
  hodnota: string;
};

export type Pivovar = {
  id: string;
  nazev: string;
  zeme: string;
  mesto?: string;
  popisek?: string;
  popisek_dlouhy?: string;
  rok_zalozeni?: number;
  zaniklo?: number;
  lat?: number;
  lon?: number;
  fakta?: PivovarFakt[];
};

export type Zeme = {
  kod: string;
  nazev: string;
  vlajka: string;
};

export type PullitrEnhanced = Pullitr & {
  imageUrl: string;
  isPlaceholder: boolean;
  pivovar: Pivovar | null;
  zemeInfo: Zeme;
};
