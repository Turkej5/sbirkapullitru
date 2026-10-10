"""Převede nové fotky půllitrů do public/images/pullitry/<slug>.webp.

Použití:
    python3 scripts/prevod-fotek.py "<složka s fotkami>" IMG_3020=nymburk-1 IMG_3021=nymburk-2 ...

Každý pár je <název souboru bez přípony>=<slug>. Fotka se otočí podle EXIF,
zmenší na max 1600 px a uloží jako WebP q78. Existující soubor nepřepíše.
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

CIL = Path(__file__).resolve().parent.parent / "public" / "images" / "pullitry"


def najdi_zdroj(slozka: Path, jmeno: str) -> Path:
    for pripona in (".webp", ".jpg", ".jpeg", ".png", ".heic", ".JPG", ".JPEG", ".PNG"):
        p = slozka / f"{jmeno}{pripona}"
        if p.exists():
            return p
    raise SystemExit(f"Nenalezeno: {slozka / jmeno}.*")


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    slozka = Path(sys.argv[1])
    pary = [a.split("=", 1) for a in sys.argv[2:]]
    for jmeno, slug in pary:
        vystup = CIL / f"{slug}.webp"
        if vystup.exists():
            raise SystemExit(f"Už existuje: {vystup.name}")
        zdroj = najdi_zdroj(slozka, jmeno)
        im = ImageOps.exif_transpose(Image.open(zdroj)).convert("RGB")
        im.thumbnail((1600, 1600), Image.LANCZOS)
        im.save(vystup, "WEBP", quality=78, method=4)
        print(f"{zdroj.name} → {vystup.name} {im.size} {vystup.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
