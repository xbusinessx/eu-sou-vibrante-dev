"""Generate web-ready derivatives for the landing page's large source artwork."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / "src" / "assets" / "original"
OPTIMIZED = ROOT / "src" / "assets" / "optimized"
SLIDES = ROOT / "Repositório"
OPTIMIZED_SLIDES = SLIDES / "optimized"


def save_webp(source: Path, destination: Path, max_size: tuple[int, int], quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    hero_jobs = [
        ("hero-desktop.png", (2560, 1280), 84),
        ("hero-mobile.png", (900, 900), 84),
        ("meditation-energy-vector.png", (1440, 900), 84),
        ("offer-bg.png", (1600, 1000), 82),
    ]

    for filename, max_size, quality in hero_jobs:
        save_webp(
            ORIGINALS / filename,
            OPTIMIZED / f"{Path(filename).stem}.webp",
            max_size,
            quality,
        )

    for slide_number in range(5, 25):
        save_webp(
            SLIDES / f"{slide_number}.png",
            OPTIMIZED_SLIDES / f"{slide_number}.webp",
            (720, 1080),
            84,
        )


if __name__ == "__main__":
    main()
