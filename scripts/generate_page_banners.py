from __future__ import annotations

from math import cos, pi, sin
from pathlib import Path
from random import Random

from PIL import Image, ImageColor, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "images"
SIZE = (1536, 768)
RNG = Random(20260407)


def to_rgba(value: str | tuple[int, int, int], alpha: int = 255) -> tuple[int, int, int, int]:
    if isinstance(value, str):
        rgb = ImageColor.getrgb(value)
        return rgb[0], rgb[1], rgb[2], alpha
    return value[0], value[1], value[2], alpha


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        round(a[0] + (b[0] - a[0]) * t),
        round(a[1] + (b[1] - a[1]) * t),
        round(a[2] + (b[2] - a[2]) * t),
    )


def gradient_canvas(size: tuple[int, int], top: str, bottom: str) -> Image.Image:
    width, height = size
    start = ImageColor.getrgb(top)
    end = ImageColor.getrgb(bottom)
    image = Image.new("RGBA", size)
    px = image.load()

    for y in range(height):
        mix = y / max(height - 1, 1)
        row = blend(start, end, mix)
        for x in range(width):
            px[x, y] = row + (255,)

    return image


def alpha_overlay(base: Image.Image, overlay: Image.Image) -> None:
    base.alpha_composite(overlay)


def add_blur_glow(
    base: Image.Image,
    box: tuple[int, int, int, int],
    color: str,
    blur_radius: int,
    alpha: int,
    shape: str = "ellipse",
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    fill = to_rgba(color, alpha)
    if shape == "rectangle":
        draw.rounded_rectangle(box, radius=min(box[2] - box[0], box[3] - box[1]) // 4, fill=fill)
    else:
        draw.ellipse(box, fill=fill)
    alpha_overlay(base, layer.filter(ImageFilter.GaussianBlur(blur_radius)))


def add_stripes(base: Image.Image, color: str, alpha: int, step: int = 28) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = base.size

    for y in range(0, height, step):
        draw.line((0, y, width, y), fill=to_rgba(color, alpha), width=1)

    alpha_overlay(base, overlay)


def add_dots(base: Image.Image, color: str, alpha: int, density: int) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = base.size

    for _ in range(density):
        radius = RNG.randint(3, 10)
        x = RNG.randint(0, width)
        y = RNG.randint(0, height)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=to_rgba(color, alpha))

    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(1)))


def add_vignette(base: Image.Image, color: str, alpha: int) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = base.size
    draw.rectangle((0, 0, width, height), fill=to_rgba(color, 0))
    for i in range(6):
        inset = i * 32
        opacity = round(alpha * (i + 1) / 6)
        draw.rounded_rectangle(
            (inset, inset, width - inset, height - inset),
            radius=54,
            outline=to_rgba(color, opacity),
            width=16,
        )
    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(18)))


def add_border(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = base.size

    draw.rounded_rectangle((18, 18, width - 18, height - 18), radius=52, outline=to_rgba("#ffffff", 210), width=8)
    draw.rounded_rectangle((42, 42, width - 42, height - 42), radius=42, outline=to_rgba("#f0b7ca", 170), width=3)

    alpha_overlay(base, overlay)


def add_sparkle(base: Image.Image, center: tuple[int, int], radius: int, color: str, alpha: int) -> None:
    cx, cy = center
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fill = to_rgba(color, alpha)
    points: list[tuple[float, float]] = []

    for index in range(8):
        angle = (pi / 4) * index
        outer = radius if index % 2 == 0 else radius * 0.35
        points.append((cx + cos(angle) * outer, cy + sin(angle) * outer))

    draw.polygon(points, fill=fill)
    draw.ellipse((cx - radius * 0.22, cy - radius * 0.22, cx + radius * 0.22, cy + radius * 0.22), fill=fill)
    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(0.4)))


def add_heart(base: Image.Image, center: tuple[int, int], size: int, color: str, alpha: int) -> None:
    cx, cy = center
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fill = to_rgba(color, alpha)
    half = size // 2
    draw.ellipse((cx - half, cy - half, cx, cy), fill=fill)
    draw.ellipse((cx, cy - half, cx + half, cy), fill=fill)
    draw.polygon(((cx - size, cy - 4), (cx + size, cy - 4), (cx, cy + size)), fill=fill)
    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(0.6)))


def add_star(base: Image.Image, center: tuple[int, int], size: int, color: str, alpha: int) -> None:
    cx, cy = center
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fill = to_rgba(color, alpha)
    points: list[tuple[float, float]] = []

    for index in range(10):
        angle = -pi / 2 + (pi / 5) * index
        radius = size if index % 2 == 0 else size * 0.42
        points.append((cx + cos(angle) * radius, cy + sin(angle) * radius))

    draw.polygon(points, fill=fill)
    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(0.3)))


def add_shadow(base: Image.Image, box: tuple[int, int, int, int], alpha: int, blur_radius: int) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse(box, fill=(106, 58, 78, alpha))
    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(blur_radius)))


def draw_bow(base: Image.Image, center: tuple[int, int], width: int, height: int, color: str) -> None:
    cx, cy = center
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    fill = to_rgba(color, 220)
    accent = to_rgba("#fffafc", 170)

    draw.ellipse((cx - width, cy - height, cx - 14, cy + height), fill=fill)
    draw.ellipse((cx + 14, cy - height, cx + width, cy + height), fill=fill)
    draw.ellipse((cx - 24, cy - 22, cx + 24, cy + 22), fill=to_rgba("#f6a3c2", 240))
    draw.polygon(((cx - 16, cy + 14), (cx - width + 10, cy + height + 34), (cx - 18, cy + height + 48)), fill=fill)
    draw.polygon(((cx + 16, cy + 14), (cx + width - 10, cy + height + 34), (cx + 18, cy + height + 48)), fill=fill)
    draw.arc((cx - width, cy - height, cx - 14, cy + height), 210, 330, fill=accent, width=5)
    draw.arc((cx + 14, cy - height, cx + width, cy + height), 210, 330, fill=accent, width=5)

    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(0.4)))


def draw_parcel(base: Image.Image, x: int, y: int, width: int, height: int, color: str, accent: str) -> None:
    add_shadow(base, (x + 10, y + height - 10, x + width - 10, y + height + 34), 44, 16)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    draw.rounded_rectangle((x, y, x + width, y + height), radius=28, fill=to_rgba(color, 255), outline=to_rgba("#fffafc", 220), width=4)
    draw.rectangle((x + width * 0.44, y, x + width * 0.56, y + height), fill=to_rgba(accent, 245))
    draw.rectangle((x, y + height * 0.42, x + width, y + height * 0.58), fill=to_rgba(accent, 245))
    draw.ellipse((x + width * 0.35, y + height * 0.12, x + width * 0.49, y + height * 0.28), fill=to_rgba(accent, 245))
    draw.ellipse((x + width * 0.51, y + height * 0.12, x + width * 0.65, y + height * 0.28), fill=to_rgba(accent, 245))
    draw.ellipse((x + width * 0.45, y + height * 0.12, x + width * 0.55, y + height * 0.26), fill=to_rgba("#ffddea", 220))
    draw.arc((x + 16, y + 14, x + width - 16, y + height - 16), 200, 340, fill=to_rgba("#fff7fb", 150), width=5)

    alpha_overlay(base, overlay)


def cupcake_sprite(size: tuple[int, int], wrapper: str, cake: str, cream: str, accent: str, topper: str) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    draw.ellipse((width * 0.18, height * 0.78, width * 0.82, height * 0.92), fill=(125, 83, 103, 42))
    draw.polygon(
        (
            (width * 0.2, height * 0.62),
            (width * 0.8, height * 0.62),
            (width * 0.72, height * 0.9),
            (width * 0.28, height * 0.9),
        ),
        fill=to_rgba(wrapper, 255),
        outline=to_rgba("#fffafc", 220),
    )

    for offset in range(3):
        stripe_x = width * (0.28 + offset * 0.15)
        draw.line((stripe_x, height * 0.64, stripe_x - width * 0.03, height * 0.88), fill=to_rgba("#fff7fb", 150), width=3)

    draw.rounded_rectangle((width * 0.26, height * 0.46, width * 0.74, height * 0.68), radius=22, fill=to_rgba(cake, 255))

    puff_boxes = (
        (width * 0.18, height * 0.26, width * 0.48, height * 0.58),
        (width * 0.34, height * 0.12, width * 0.66, height * 0.52),
        (width * 0.52, height * 0.26, width * 0.82, height * 0.58),
    )
    for box in puff_boxes:
        draw.ellipse(box, fill=to_rgba(cream, 255), outline=to_rgba("#fffafc", 200))

    draw.ellipse((width * 0.42, height * 0.03, width * 0.58, height * 0.19), fill=to_rgba(topper, 255), outline=to_rgba("#fffafc", 220))
    draw.ellipse((width * 0.39, height * 0.17, width * 0.61, height * 0.28), fill=to_rgba(accent, 245))
    draw.arc((width * 0.18, height * 0.22, width * 0.82, height * 0.68), 200, 340, fill=to_rgba("#fff7fb", 140), width=4)

    return image


def draw_cupcake(
    base: Image.Image,
    position: tuple[int, int],
    size: tuple[int, int],
    wrapper: str,
    cake: str,
    cream: str,
    accent: str,
    topper: str,
) -> None:
    sprite = cupcake_sprite(size, wrapper, cake, cream, accent, topper)
    x, y = position
    base.alpha_composite(sprite, (x, y))


def draw_plate(base: Image.Image, box: tuple[int, int, int, int], color: str) -> None:
    x1, y1, x2, y2 = box
    add_shadow(base, (x1 + 12, y2 - 8, x2 - 12, y2 + 26), 38, 14)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse(box, fill=to_rgba(color, 238), outline=to_rgba("#fffdfd", 220), width=4)
    inner = (x1 + 24, y1 + 10, x2 - 24, y2 - 14)
    draw.ellipse(inner, outline=to_rgba("#fff7fb", 160), width=3)
    alpha_overlay(base, overlay)


def recipe_card_sprite(size: tuple[int, int], card_color: str, tape_color: str) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((10, 10, width - 10, height - 10), radius=28, fill=to_rgba(card_color, 248), outline=to_rgba("#fffafc", 220), width=4)
    draw.rounded_rectangle((38, 52, width - 38, 78), radius=12, fill=to_rgba("#f7d6e5", 255))
    for index in range(3):
        top = 106 + index * 36
        draw.rounded_rectangle((46, top, width - 46, top + 10), radius=6, fill=to_rgba("#e8bfd0", 170))
    draw.rounded_rectangle((width * 0.35, -6, width * 0.65, 42), radius=12, fill=to_rgba(tape_color, 235))
    return image


def paste_rotated(base: Image.Image, sprite: Image.Image, center: tuple[int, int], angle: float) -> None:
    rotated = sprite.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    x = round(center[0] - rotated.width / 2)
    y = round(center[1] - rotated.height / 2)
    base.alpha_composite(rotated, (x, y))


def add_corner_flowers(base: Image.Image, anchor: tuple[int, int], flip: int) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    ax, ay = anchor

    for index, (offset, color) in enumerate(((0, "#ffd4e4"), (48, "#ffefb5"), (88, "#d7ebff"), (128, "#fceef6"))):
        cx = ax + offset * flip
        cy = ay + (14 if index % 2 else 0)
        draw.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), fill=to_rgba(color, 245))
        for petal_angle in range(5):
            angle = (2 * pi / 5) * petal_angle
            px = cx + cos(angle) * 30
            py = cy + sin(angle) * 30
            draw.ellipse((px - 18, py - 18, px + 18, py + 18), fill=to_rgba("#fff7fb", 240))

    alpha_overlay(base, overlay.filter(ImageFilter.GaussianBlur(0.6)))


def decorate_delivery(base: Image.Image) -> None:
    add_blur_glow(base, (90, 70, 580, 420), "#ffffff", 40, 120)
    add_blur_glow(base, (1020, 90, 1450, 390), "#fff6c8", 36, 96)
    add_blur_glow(base, (340, 360, 1210, 760), "#fffaf2", 48, 86)

    draw_bow(base, (220, 118), 84, 52, "#f8a8c4")
    draw_bow(base, (1316, 112), 94, 56, "#ffd67b")

    draw_parcel(base, 116, 362, 254, 184, "#ffe8cf", "#f7adc7")
    draw_parcel(base, 286, 286, 194, 154, "#fff4df", "#f2bfd3")
    draw_parcel(base, 168, 502, 168, 126, "#f8d9ef", "#8ec7f6")

    draw_plate(base, (1098, 456, 1452, 640), "#fff9fb")
    draw_cupcake(base, (1110, 332), (174, 244), "#ffd5df", "#ffc87d", "#fff6fb", "#ffa0b8", "#ff7c97")
    draw_cupcake(base, (1216, 318), (184, 252), "#ffe0a6", "#ffd982", "#fffaf9", "#ffb87d", "#ffd86f")
    draw_cupcake(base, (1328, 336), (166, 236), "#b8d9ff", "#ffd6a8", "#f4fdff", "#8bd0ff", "#ffdf82")

    for center, radius in (((652, 178), 22), ((742, 250), 18), ((880, 142), 16), ((980, 230), 14), ((640, 570), 20), ((882, 612), 24)):
        add_sparkle(base, center, radius, "#fffdfb", 210)

    for center, size in (((572, 204), 24), ((948, 170), 20), ((716, 610), 18), ((826, 548), 22)):
        add_heart(base, center, size, "#ffc0d6", 170)

    for center, size in (((820, 94), 16), ((1012, 624), 16), ((598, 642), 18)):
        add_star(base, center, size, "#ffe282", 210)


def decorate_collection(base: Image.Image) -> None:
    add_blur_glow(base, (120, 92, 480, 300), "#ffffff", 32, 120)
    add_blur_glow(base, (1022, 80, 1420, 272), "#fff7da", 32, 100)
    add_blur_glow(base, (360, 160, 1180, 620), "#fffdfb", 44, 84, "rectangle")

    paper = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(paper)
    draw.rounded_rectangle((286, 116, 1250, 666), radius=52, fill=to_rgba("#fff8ee", 232), outline=to_rgba("#fffdfc", 220), width=6)
    draw.arc((332, 148, 1206, 644), 200, 340, fill=to_rgba("#fffefb", 125), width=6)
    alpha_overlay(base, paper.filter(ImageFilter.GaussianBlur(0.7)))

    paste_rotated(base, recipe_card_sprite((278, 368), "#fffaf6", "#ffd9ea"), (224, 250), -14)
    paste_rotated(base, recipe_card_sprite((258, 344), "#fffef9", "#d9efff"), (1294, 236), 11)
    paste_rotated(base, recipe_card_sprite((244, 328), "#fff6fb", "#ffe5ad"), (1188, 600), -10)

    draw_bow(base, (248, 108), 88, 54, "#f1a2c4")
    draw_bow(base, (1288, 116), 92, 56, "#ffd173")

    draw_plate(base, (114, 462, 404, 624), "#ffe8f1")
    draw_cupcake(base, (126, 336), (148, 212), "#ffc7d7", "#ffd39a", "#fff6fb", "#ffb4d0", "#ff7e9c")
    draw_cupcake(base, (230, 378), (132, 194), "#d8c5ff", "#ffdba7", "#fff8fb", "#cda4ff", "#9b6cf0")

    draw_plate(base, (1146, 458, 1432, 622), "#e4f0ff")
    draw_cupcake(base, (1158, 342), (144, 204), "#ffdca4", "#ffda9c", "#fffefc", "#ffb08d", "#ffa67c")
    draw_cupcake(base, (1266, 354), (154, 214), "#bee2ff", "#ffd8a8", "#f6fcff", "#8fd4ff", "#ffd973")

    add_corner_flowers(base, (136, 110), 1)
    add_corner_flowers(base, (1402, 118), -1)

    for center, radius in (((542, 180), 16), ((992, 174), 18), ((468, 590), 22), ((1062, 586), 18), ((772, 624), 14)):
        add_sparkle(base, center, radius, "#fffefc", 190)

    for center, size in (((458, 528), 18), ((1088, 514), 16), ((1258, 642), 18), ((278, 636), 20)):
        add_heart(base, center, size, "#ffc3d8", 155)

    for center, size in (((668, 124), 15), ((856, 124), 15), ((794, 664), 16)):
        add_star(base, center, size, "#ffe17a", 195)


def render_delivery_banner() -> Image.Image:
    image = gradient_canvas(SIZE, "#fffaf1", "#ffd9e4")
    add_stripes(image, "#fff6f9", 72, step=26)
    add_dots(image, "#ffffff", 88, density=46)
    decorate_delivery(image)
    add_vignette(image, "#f4bad0", 22)
    add_border(image)
    return image


def render_collection_banner() -> Image.Image:
    image = gradient_canvas(SIZE, "#fff7f0", "#ffdceb")
    add_stripes(image, "#fff8fc", 64, step=28)
    add_dots(image, "#fffdfa", 84, density=42)
    decorate_collection(image)
    add_vignette(image, "#edb3cd", 20)
    add_border(image)
    return image


def save_banner(filename: str, image: Image.Image) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / filename
    enhanced = ImageEnhance.Color(image).enhance(1.16)
    enhanced = ImageEnhance.Contrast(enhanced).enhance(1.08)
    enhanced = ImageEnhance.Sharpness(enhanced).enhance(1.12)
    enhanced.save(path, format="PNG", optimize=True)
    return path


def main() -> int:
    delivery = save_banner("delivery-banner.png", render_delivery_banner())
    collection = save_banner("collection-banner.png", render_collection_banner())
    print(f"Saved {delivery}")
    print(f"Saved {collection}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
