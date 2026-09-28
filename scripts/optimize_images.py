"""Rebuild display assets: python -m pip install Pillow; python scripts/optimize_images.py."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets' / 'images'
DEST = ROOT / 'assets' / 'optimized'
IMAGES = {
    'classic-burger': 'burger.png',
    'cheeseburger': 'Cheeseburger.png',
    'pizza': 'Pizza.png',
    'hot-dog': 'Hot dog.png',
    'roast-chicken': 'roast chicken.png',
    'chocolate-muffin': 'Muffin.png',
    'chocolate-shake': 'choclate Milkshake.png',
    'strawberry-shake': 'stawberry Milkshake.png',
}

def build():
    DEST.mkdir(exist_ok=True)
    for slug, filename in IMAGES.items():
        with Image.open(SOURCE / filename) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            for width in (320, 640):
                resized = ImageOps.fit(image, (width, width), method=Image.Resampling.LANCZOS)
                resized.save(DEST / f'{slug}-{width}.webp', quality=78, method=6)
            if slug == 'cheeseburger':
                for width in (480, 960):
                    resized = ImageOps.fit(image, (width, width), method=Image.Resampling.LANCZOS)
                    resized.save(DEST / f'hero-{width}.webp', quality=82, method=6)
    with Image.open(SOURCE / 'Saad_fast_food-removebg-preview (1).png') as original:
        image = original.convert('RGBA')
        image = image.crop(image.getbbox())
        image.thumbnail((160, 160), Image.Resampling.LANCZOS)
        image.save(DEST / 'chef.webp', quality=85, method=6)
    print(f'Generated {len(list(DEST.glob("*.webp")))} images: '
          f'{sum(p.stat().st_size for p in DEST.glob("*.webp")):,} bytes total.')

if __name__ == '__main__':
    build()
