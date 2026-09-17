import {
  Ban,
  Banknote,
  BarChart3,
  Beer,
  Building,
  Calendar,
  Copyright,
  Crown,
  Cylinder,
  Drama,
  Droplet,
  Factory,
  Flame,
  FlaskConical,
  GraduationCap,
  Globe,
  Hammer,
  Landmark,
  MapPin,
  PartyPopper,
  PawPrint,
  RefreshCw,
  Scale,
  ScrollText,
  Sparkles,
  Truck,
  Trophy,
  User,
  Users,
  Wheat,
} from "lucide-react";

const ikonaMap = {
  zalozeni: ScrollText,
  budova: Landmark,
  pivo: Beer,
  vlastnik: Factory,
  statistika: BarChart3,
  osoba: User,
  konec: Ban,
  datum: Calendar,
  oceneni: Trophy,
  koruna: Crown,
  svet: Globe,
  chmel: Wheat,
  penize: Banknote,
  vystavba: Hammer,
  laborator: FlaskConical,
  kultura: Drama,
  pozar: Flame,
  rodina: Users,
  zvire: PawPrint,
  znamka: Copyright,
  zmena: RefreshCw,
  festival: PartyPopper,
  voda: Droplet,
  doprava: Truck,
  spor: Scale,
  skolstvi: GraduationCap,
  poloha: MapPin,
  plechovka: Cylinder,
} as const;

export type IkonaKlic = keyof typeof ikonaMap;

export default function PivovarIkona({
  ikona,
  className,
}: {
  ikona: string;
  className?: string;
}) {
  const Ikona =
    (ikonaMap as Record<string, typeof Building>)[ikona] ?? Sparkles;
  return (
    <Ikona
      className={className ?? "h-5 w-5 text-[var(--accent)]"}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}
