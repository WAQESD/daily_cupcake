from __future__ import annotations

from pathlib import Path
from random import Random
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


PALETTE = {
    "cream": (255, 248, 240),
    "soft_cream": (255, 243, 234),
    "warm_white": (255, 252, 250),
    "pink": (248, 193, 211),
    "pink_deep": (229, 137, 176),
    "pink_soft": (255, 220, 232),
    "blush": (255, 236, 242),
    "peach": (248, 214, 181),
    "gold": (246, 201, 123),
    "wood": (220, 177, 131),
    "wood_deep": (184, 132, 94),
    "brown": (145, 93, 79),
    "brown_dark": (117, 76, 67),
    "blue": (173, 214, 244),
    "blue_soft": (220, 240, 255),
    "green": (150, 195, 135),
    "green_deep": (102, 149, 96),
    "red": (235, 101, 126),
    "red_deep": (196, 69, 92),
    "shadow": (136, 93, 101),
}


RNG = Random(7)


def rgba(rgb: tuple[int, int, int], alpha: int = 255) -> tuple[int, int, int, int]:
    return rgb + (alpha,)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(lerp(a[i], b[i], t) for i in range(3))


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    width, height = size
    base = Image.new("RGBA", size)
    draw = ImageDraw.Draw(base)
    for y in range(height):
        t = y / max(height - 1, 1)
        draw.line([(0, y), (width, y)], fill=rgba(blend(top, bottom, t)))
    return base


def add_glow(image: Image.Image, bbox: tuple[int, int, int, int], color: tuple[int, int, int], blur: int, alpha: int) -> None:
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(bbox, fill=rgba(color, alpha))
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(blur)))


def add_shadow(image: Image.Image, bbox: tuple[int, int, int, int], blur: int = 18, alpha: int = 90) -> None:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse(bbox, fill=(94, 60, 72, alpha))
    image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(blur)))


def draw_stripes(draw: ImageDraw.ImageDraw, x0: int, x1: int, y0: int, y1: int, colors: Iterable[tuple[int, int, int]]) -> None:
    colors = list(colors)
    stripe_width = max((x1 - x0) // max(len(colors) * 2, 1), 6)
    current = x0
    index = 0
    while current < x1:
        draw.rectangle([current, y0, min(current + stripe_width, x1), y1], fill=rgba(colors[index % len(colors)], 180))
        current += stripe_width
        index += 1


def draw_window(image: Image.Image, center: tuple[int, int], radius: int) -> None:
    cx, cy = center
    window = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(window)
    outer = (cx - radius, cy - radius, cx + radius, cy + radius)
    inner = (cx - radius + 22, cy - radius + 22, cx + radius - 22, cy + radius - 22)
    draw.ellipse(outer, fill=rgba(PALETTE["peach"], 255), outline=rgba(PALETTE["gold"], 180), width=18)
    draw.ellipse(inner, fill=rgba(PALETTE["blue_soft"], 255))
    draw.ellipse((inner[0], cy + radius // 4, inner[2], inner[3]), fill=rgba(blend(PALETTE["gold"], PALETTE["cream"], 0.65), 90))
    for offset in (-14, 14):
        draw.rectangle((cx + offset - 7, inner[1], cx + offset + 7, inner[3]), fill=rgba(PALETTE["cream"], 210))
        draw.rectangle((inner[0], cy + offset - 7, inner[2], cy + offset + 7), fill=rgba(PALETTE["cream"], 210))
    for i, cloud_x in enumerate((cx - 90, cx + 40)):
        cloud_y = cy - 50 + i * 36
        for j in range(3):
            r = 24 + j * 6
            draw.ellipse((cloud_x + j * 24 - r, cloud_y - r, cloud_x + j * 24 + r, cloud_y + r), fill=rgba(PALETTE["warm_white"], 210))
    for dot in range(16):
        px = inner[0] + 40 + dot * 18
        py = inner[3] - 34 - (dot % 3) * 8
        draw.ellipse((px, py, px + 16, py + 16), fill=rgba(blend(PALETTE["green"], PALETTE["gold"], 0.2), 120))
    image.alpha_composite(window)
    add_glow(image, (cx - radius - 30, cy - radius - 10, cx + radius + 30, cy + radius + 30), PALETTE["warm_white"], 28, 70)


def draw_shelf(draw: ImageDraw.ImageDraw, x: int, y: int, width: int) -> None:
    draw.rounded_rectangle((x, y, x + width, y + 18), radius=9, fill=rgba(PALETTE["wood"], 255))
    draw.rounded_rectangle((x + 8, y + 8, x + width - 8, y + 18), radius=9, fill=rgba(PALETTE["wood_deep"], 70))
    draw.rounded_rectangle((x + 16, y + 18, x + 32, y + 70), radius=8, fill=rgba(PALETTE["wood"], 255))
    draw.rounded_rectangle((x + width - 32, y + 18, x + width - 16, y + 70), radius=8, fill=rgba(PALETTE["wood"], 255))


def draw_jar(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, height: int, fill: tuple[int, int, int], sprinkles: bool = False) -> None:
    draw.rounded_rectangle((x, y, x + width, y + height), radius=22, fill=rgba(PALETTE["warm_white"], 190), outline=rgba(PALETTE["peach"], 255), width=6)
    draw.rounded_rectangle((x + 18, y - 14, x + width - 18, y + 8), radius=10, fill=rgba(fill, 255))
    if sprinkles:
        for _ in range(26):
            px = RNG.randint(x + 18, x + width - 18)
            py = RNG.randint(y + 22, y + height - 22)
            dot = RNG.choice([PALETTE["pink_deep"], PALETTE["blue"], PALETTE["gold"], PALETTE["red"]])
            draw.ellipse((px, py, px + 10, py + 10), fill=rgba(dot, 180))
    else:
        shade = blend(fill, PALETTE["warm_white"], 0.3)
        draw.rounded_rectangle((x + 12, y + 18, x + width - 12, y + height - 12), radius=18, fill=rgba(shade, 120))


def draw_plate(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, height: int) -> None:
    draw.ellipse((x, y, x + width, y + height), fill=rgba(PALETTE["warm_white"], 255), outline=rgba(PALETTE["peach"], 170), width=12)
    draw.ellipse((x + 32, y + 18, x + width - 32, y + height - 24), outline=rgba(PALETTE["pink_soft"], 120), width=8)


def draw_topper(draw: ImageDraw.ImageDraw, kind: str, center: tuple[int, int], scale: float = 1.0) -> None:
    cx, cy = center
    if kind == "strawberry":
        draw.polygon(
            [
                (cx, cy - 28 * scale),
                (cx + 28 * scale, cy + 10 * scale),
                (cx, cy + 38 * scale),
                (cx - 28 * scale, cy + 10 * scale),
            ],
            fill=rgba(PALETTE["red"], 255),
        )
        draw.line((cx, cy - 30 * scale, cx + 8 * scale, cy - 54 * scale), fill=rgba(PALETTE["green_deep"], 255), width=max(round(4 * scale), 1))
        draw.polygon(
            [(cx, cy - 38 * scale), (cx + 22 * scale, cy - 20 * scale), (cx + 8 * scale, cy - 8 * scale)],
            fill=rgba(PALETTE["green"], 255),
        )
        draw.polygon(
            [(cx, cy - 38 * scale), (cx - 22 * scale, cy - 20 * scale), (cx - 8 * scale, cy - 8 * scale)],
            fill=rgba(PALETTE["green"], 255),
        )
        for dx in (-12, 0, 12):
            for dy in (-4, 12):
                draw.ellipse((cx + dx * scale - 2, cy + dy * scale - 2, cx + dx * scale + 2, cy + dy * scale + 2), fill=rgba(PALETTE["gold"], 200))
    elif kind == "cherry":
        draw.ellipse((cx - 18 * scale, cy - 16 * scale, cx + 18 * scale, cy + 20 * scale), fill=rgba(PALETTE["red"], 255))
        draw.line((cx, cy - 14 * scale, cx + 10 * scale, cy - 40 * scale), fill=rgba(PALETTE["brown_dark"], 255), width=max(round(4 * scale), 1))
        draw.ellipse((cx - 22 * scale, cy + 4 * scale, cx - 8 * scale, cy + 18 * scale), fill=rgba(PALETTE["warm_white"], 90))
        for offset in (-16, 4):
            draw.polygon(
                [(cx + offset * scale, cy + 28 * scale), (cx + (offset + 10) * scale, cy + 16 * scale), (cx + (offset + 18) * scale, cy + 30 * scale)],
                fill=rgba(PALETTE["pink_deep"], 220),
            )
    elif kind == "moon":
        draw.ellipse((cx - 24 * scale, cy - 24 * scale, cx + 24 * scale, cy + 24 * scale), fill=rgba(PALETTE["gold"], 255))
        draw.ellipse((cx - 12 * scale, cy - 22 * scale, cx + 24 * scale, cy + 18 * scale), fill=rgba(PALETTE["blue"], 255))
        for offset_x, offset_y in [(-30, 6), (22, -18), (36, 10)]:
            px = cx + offset_x * scale
            py = cy + offset_y * scale
            draw.polygon([(px, py - 8 * scale), (px + 4 * scale, py - 2 * scale), (px + 10 * scale, py - 2 * scale), (px + 5 * scale, py + 2 * scale), (px + 7 * scale, py + 9 * scale), (px, py + 5 * scale), (px - 7 * scale, py + 9 * scale), (px - 5 * scale, py + 2 * scale), (px - 10 * scale, py - 2 * scale), (px - 4 * scale, py - 2 * scale)], fill=rgba(PALETTE["gold"], 255))


def draw_frosting(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, height: int, color: tuple[int, int, int], accent: tuple[int, int, int]) -> None:
    layers = [
        (x + width * 0.12, y + height * 0.35, x + width * 0.88, y + height * 0.98),
        (x + width * 0.18, y + height * 0.12, x + width * 0.82, y + height * 0.72),
        (x + width * 0.28, y - height * 0.1, x + width * 0.72, y + height * 0.45),
    ]
    for index, layer in enumerate(layers):
        layer_color = blend(color, accent, index * 0.18)
        draw.ellipse(layer, fill=rgba(layer_color, 255), outline=rgba(PALETTE["warm_white"], 210), width=4)
        highlight = (
            int(layer[0] + (layer[2] - layer[0]) * 0.2),
            int(layer[1] + (layer[3] - layer[1]) * 0.15),
            int(layer[0] + (layer[2] - layer[0]) * 0.58),
            int(layer[1] + (layer[3] - layer[1]) * 0.5),
        )
        draw.ellipse(highlight, fill=rgba(PALETTE["warm_white"], 70))


def draw_wrapper(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, height: int, color: tuple[int, int, int]) -> None:
    points = [
        (x + width * 0.08, y),
        (x + width * 0.92, y),
        (x + width, y + height),
        (x, y + height),
    ]
    draw.polygon(points, fill=rgba(color, 255), outline=rgba(PALETTE["warm_white"], 220))
    stripe_top = y + 6
    stripe_bottom = y + height - 6
    draw_stripes(draw, int(x + 8), int(x + width - 8), int(stripe_top), int(stripe_bottom), [blend(color, PALETTE["warm_white"], 0.22), blend(color, PALETTE["warm_white"], 0.42)])


def draw_cupcake(image: Image.Image, center: tuple[int, int], scale: float, frosting: tuple[int, int, int], accent: tuple[int, int, int], wrapper: tuple[int, int, int], topper: str) -> None:
    cx, cy = center
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    wrapper_w = int(132 * scale)
    wrapper_h = int(84 * scale)
    wrapper_x = cx - wrapper_w // 2
    wrapper_y = cy + int(44 * scale)
    cake_box = (cx - int(58 * scale), cy + int(4 * scale), cx + int(58 * scale), cy + int(64 * scale))
    add_shadow(image, (cx - int(90 * scale), cy + int(92 * scale), cx + int(90 * scale), cy + int(130 * scale)), blur=int(18 * scale), alpha=75)
    draw.rounded_rectangle(cake_box, radius=int(26 * scale), fill=rgba(blend(wrapper, PALETTE["brown"], 0.35), 255), outline=rgba(PALETTE["warm_white"], 210), width=max(round(5 * scale), 1))
    draw_frosting(draw, cx - int(86 * scale), cy - int(68 * scale), int(172 * scale), int(160 * scale), frosting, accent)
    draw_wrapper(draw, wrapper_x, wrapper_y, wrapper_w, wrapper_h, wrapper)
    draw_topper(draw, topper, (cx, cy - int(28 * scale)), scale)
    image.alpha_composite(layer)


def draw_sparkles(image: Image.Image, count: int, region: tuple[int, int, int, int]) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = region
    for _ in range(count):
        cx = RNG.randint(x0, x1)
        cy = RNG.randint(y0, y1)
        radius = RNG.randint(6, 14)
        color = RNG.choice([PALETTE["warm_white"], PALETTE["gold"], PALETTE["pink_soft"]])
        draw.line((cx - radius, cy, cx + radius, cy), fill=rgba(color, 160), width=2)
        draw.line((cx, cy - radius, cx, cy + radius), fill=rgba(color, 160), width=2)
        draw.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=rgba(color, 180))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.5)))


def add_noise(image: Image.Image, opacity: int = 24) -> None:
    noise = Image.effect_noise(image.size, 11).convert("L")
    tint = Image.new("RGBA", image.size, rgba(PALETTE["warm_white"], 0))
    tint.putalpha(noise.point(lambda value: min(opacity, max(0, value // 7))))
    image.alpha_composite(tint)


def finish_image(image: Image.Image, *, color: float, contrast: float, sharpness: float) -> Image.Image:
    rgb = image.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(color)
    rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    rgb = ImageEnhance.Sharpness(rgb).enhance(sharpness)
    return rgb.convert("RGBA")


def make_hero(path: Path) -> None:
    image = vertical_gradient((1024, 1536), PALETTE["blush"], PALETTE["soft_cream"])
    wall = Image.new("RGBA", image.size, (0, 0, 0, 0))
    wall_draw = ImageDraw.Draw(wall)
    for row in range(6):
        top = 230 + row * 108
        offset = 34 if row % 2 else 0
        for col in range(7):
            left = 72 + col * 132 - offset
            wall_draw.rounded_rectangle((left, top, left + 124, top + 98), radius=22, fill=rgba(blend(PALETTE["pink_soft"], PALETTE["cream"], 0.45), 110), outline=rgba(PALETTE["warm_white"], 100), width=2)
    image.alpha_composite(wall)
    add_glow(image, (248, 140, 774, 736), PALETTE["warm_white"], 26, 54)
    draw_window(image, (512, 400), 238)
    shelf_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shelf_draw = ImageDraw.Draw(shelf_layer)
    draw_shelf(shelf_draw, 88, 174, 184)
    draw_shelf(shelf_draw, 780, 174, 156)
    draw_shelf(shelf_draw, 96, 432, 170)
    draw_shelf(shelf_draw, 788, 432, 160)
    draw_jar(shelf_draw, 116, 76, 58, 104, PALETTE["gold"])
    draw_jar(shelf_draw, 184, 58, 66, 122, PALETTE["cream"])
    draw_jar(shelf_draw, 820, 88, 66, 92, PALETTE["pink_soft"], sprinkles=True)
    draw_jar(shelf_draw, 894, 88, 64, 92, PALETTE["pink"], sprinkles=False)
    draw_jar(shelf_draw, 120, 346, 62, 96, PALETTE["cream"])
    draw_jar(shelf_draw, 194, 360, 54, 82, PALETTE["gold"])
    draw_jar(shelf_draw, 820, 348, 92, 114, PALETTE["pink_soft"], sprinkles=True)
    draw_jar(shelf_draw, 860, 492, 82, 104, PALETTE["pink"])
    shelf_draw.rounded_rectangle((0, 1120, 1024, 1536), radius=0, fill=rgba(PALETTE["wood"], 255))
    for band in range(18):
        y = 1144 + band * 18
        shelf_draw.line((0, y, 1024, y), fill=rgba(blend(PALETTE["wood"], PALETTE["warm_white"], 0.26), 120), width=3)
    image.alpha_composite(shelf_layer)
    plate_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    plate_draw = ImageDraw.Draw(plate_layer)
    draw_plate(plate_draw, 188, 1040, 648, 232)
    image.alpha_composite(plate_layer)
    draw_cupcake(image, (306, 986), 1.0, PALETTE["pink"], PALETTE["pink_soft"], PALETTE["brown"], "cherry")
    draw_cupcake(image, (518, 952), 1.16, PALETTE["cream"], PALETTE["warm_white"], PALETTE["gold"], "strawberry")
    draw_cupcake(image, (724, 1002), 0.96, PALETTE["blue"], PALETTE["blue_soft"], PALETTE["blue"], "moon")
    utensil_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    utensil_draw = ImageDraw.Draw(utensil_layer)
    utensil_draw.rounded_rectangle((44, 866, 110, 1040), radius=18, fill=rgba(PALETTE["soft_cream"], 255), outline=rgba(PALETTE["peach"], 180), width=4)
    for handle_x, angle in [(58, -26), (78, -6), (98, 16)]:
        utensil_draw.line((handle_x, 950, handle_x + angle, 880), fill=rgba(PALETTE["wood"], 255), width=12)
        utensil_draw.ellipse((handle_x + angle - 10, 866, handle_x + angle + 24, 906), outline=rgba(PALETTE["warm_white"], 200), width=4)
    utensil_draw.rounded_rectangle((70, 1060, 144, 1128), radius=18, fill=rgba(PALETTE["pink_soft"], 255))
    utensil_draw.polygon([(840, 944), (974, 1002), (922, 1126), (792, 1068)], fill=rgba(PALETTE["warm_white"], 255))
    utensil_draw.polygon([(806, 1080), (946, 1150), (936, 1180), (798, 1114)], fill=rgba(PALETTE["pink_soft"], 180))
    image.alpha_composite(utensil_layer)
    draw_sparkles(image, 24, (160, 150, 872, 900))
    add_noise(image, 18)
    finish_image(image, color=1.34, contrast=1.12, sharpness=1.16).save(path)


def draw_bowl(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, height: int, fill: tuple[int, int, int], accent: tuple[int, int, int]) -> None:
    draw.ellipse((x, y, x + width, y + height), fill=rgba(fill, 255), outline=rgba(PALETTE["warm_white"], 210), width=6)
    draw.ellipse((x + 18, y + 14, x + width - 18, y + height - 36), fill=rgba(blend(fill, PALETTE["warm_white"], 0.35), 180))
    draw.arc((x + 22, y + 18, x + width - 18, y + height - 42), 190, 355, fill=rgba(accent, 200), width=9)


def draw_whisk(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float) -> None:
    draw.line((x, y, x + 96 * scale, y + 102 * scale), fill=rgba(PALETTE["brown_dark"], 255), width=max(round(16 * scale), 1))
    for offset in (-24, -8, 8, 24):
        draw.arc((x + 40 * scale + offset, y + 30 * scale, x + 138 * scale + offset, y + 134 * scale), 205, 320, fill=rgba(PALETTE["warm_white"], 230), width=max(round(6 * scale), 1))


def draw_piping_bag(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float) -> None:
    draw.polygon(
        [(x, y), (x + 164 * scale, y + 36 * scale), (x + 74 * scale, y + 204 * scale)],
        fill=rgba(PALETTE["warm_white"], 240),
        outline=rgba(PALETTE["blue"], 200),
    )
    draw.polygon(
        [(x + 36 * scale, y + 28 * scale), (x + 144 * scale, y + 54 * scale), (x + 86 * scale, y + 164 * scale)],
        fill=rgba(PALETTE["blue_soft"], 170),
    )
    draw.ellipse((x + 70 * scale, y + 184 * scale, x + 92 * scale, y + 208 * scale), fill=rgba(PALETTE["blue"], 255))


def draw_cloth(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, height: int, color: tuple[int, int, int]) -> None:
    draw.polygon([(x, y + 18), (x + width - 12, y), (x + width, y + height - 20), (x + 18, y + height)], fill=rgba(color, 220))
    step_x = max(width // 8, 12)
    step_y = max(height // 8, 12)
    for line in range(1, 8):
        draw.line((x + line * step_x, y + 6, x + line * step_x, y + height - 6), fill=rgba(PALETTE["warm_white"], 80), width=2)
        draw.line((x + 6, y + line * step_y, x + width - 6, y + line * step_y), fill=rgba(PALETTE["warm_white"], 80), width=2)


def make_oven_stage(path: Path) -> None:
    image = vertical_gradient((1536, 1024), blend(PALETTE["wood"], PALETTE["cream"], 0.22), blend(PALETTE["wood"], PALETTE["soft_cream"], 0.08))
    wood = ImageDraw.Draw(image)
    for stripe in range(20):
        y = stripe * 52
        wood.line((0, y, 1536, y), fill=rgba(blend(PALETTE["wood"], PALETTE["warm_white"], 0.18), 70), width=3)
    accent_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    accent = ImageDraw.Draw(accent_layer)
    draw_cloth(accent, -12, -8, 250, 324, PALETTE["pink_soft"])
    draw_cloth(accent, 1176, 728, 268, 224, PALETTE["blue_soft"])
    draw_cloth(accent, 1266, 34, 218, 194, PALETTE["soft_cream"])
    draw_cloth(accent, 0, 700, 260, 324, PALETTE["blush"])
    image.alpha_composite(accent_layer)
    paper_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    paper = ImageDraw.Draw(paper_layer)
    paper_points = [
        (354, 136),
        (1176, 114),
        (1292, 212),
        (1252, 854),
        (1134, 958),
        (364, 930),
        (256, 794),
        (248, 240),
    ]
    paper.polygon(paper_points, fill=rgba(PALETTE["warm_white"], 238), outline=rgba(PALETTE["peach"], 160))
    for edge in range(10):
        paper.line((330 + edge * 90, 164 + (edge % 3) * 12, 1178 - edge * 62, 892 - (edge % 4) * 10), fill=rgba(PALETTE["cream"], 70), width=2)
    image.alpha_composite(paper_layer.filter(ImageFilter.GaussianBlur(0.3)))
    add_glow(image, (414, 150, 1122, 840), PALETTE["warm_white"], 28, 32)
    props = Image.new("RGBA", image.size, (0, 0, 0, 0))
    props_draw = ImageDraw.Draw(props)
    draw_bowl(props_draw, 56, 60, 272, 176, PALETTE["pink"], PALETTE["pink_soft"])
    draw_whisk(props_draw, 164, 36, 1.0)
    draw_bowl(props_draw, 1114, 20, 256, 168, blend(PALETTE["gold"], PALETTE["cream"], 0.36), PALETTE["gold"])
    props_draw.ellipse((90, 198, 134, 242), fill=rgba(PALETTE["peach"], 255))
    props_draw.ellipse((136, 186, 188, 238), fill=rgba(PALETTE["peach"], 255))
    draw_bowl(props_draw, 88, 252, 116, 76, PALETTE["brown_dark"], PALETTE["brown"])
    draw_bowl(props_draw, 1268, 110, 118, 72, PALETTE["blue"], PALETTE["blue_soft"])
    draw_piping_bag(props_draw, 1272, 124, 1.0)
    draw_cupcake(props, (160, 650), 0.54, PALETTE["pink"], PALETTE["pink_soft"], PALETTE["pink"], "cherry")
    draw_cupcake(props, (210, 702), 0.62, PALETTE["pink"], PALETTE["warm_white"], PALETTE["pink_soft"], "strawberry")
    draw_cupcake(props, (1324, 826), 0.7, blend(PALETTE["gold"], PALETTE["cream"], 0.2), PALETTE["pink_soft"], PALETTE["gold"], "cherry")
    draw_cupcake(props, (1418, 544), 0.74, PALETTE["blue"], PALETTE["blue_soft"], PALETTE["pink"], "moon")
    props_draw.rounded_rectangle((54, 822, 226, 880), radius=24, fill=rgba(PALETTE["wood"], 255))
    props_draw.rectangle((46, 848, 244, 868), fill=rgba(PALETTE["wood_deep"], 255))
    props_draw.ellipse((1216, 856, 1366, 942), fill=rgba(PALETTE["pink_soft"], 255))
    for _ in range(24):
        px = RNG.randint(1228, 1350)
        py = RNG.randint(868, 928)
        color = RNG.choice([PALETTE["pink_deep"], PALETTE["warm_white"], PALETTE["peach"]])
        props_draw.polygon([(px, py), (px + 9, py + 6), (px, py + 12), (px - 9, py + 6)], fill=rgba(color, 220))
    for _ in range(40):
        px = RNG.randint(182, 1340)
        py = RNG.randint(140, 904)
        color = RNG.choice([PALETTE["pink_deep"], PALETTE["gold"], PALETTE["blue"], PALETTE["warm_white"]])
        props_draw.ellipse((px, py, px + 10, py + 10), fill=rgba(color, 180))
    image.alpha_composite(props.filter(ImageFilter.GaussianBlur(0.2)))
    draw_sparkles(image, 18, (96, 70, 1446, 936))
    add_noise(image, 18)
    finish_image(image, color=1.3, contrast=1.1, sharpness=1.12).save(path)


def draw_pedestal(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, color: tuple[int, int, int]) -> None:
    draw.ellipse((x, y, x + 210 * scale, y + 52 * scale), fill=rgba(blend(color, PALETTE["warm_white"], 0.1), 255), outline=rgba(PALETTE["warm_white"], 200), width=max(round(6 * scale), 1))
    draw.rounded_rectangle((x + 84 * scale, y + 24 * scale, x + 126 * scale, y + 120 * scale), radius=18, fill=rgba(color, 255))
    draw.ellipse((x + 42 * scale, y + 102 * scale, x + 168 * scale, y + 146 * scale), fill=rgba(blend(color, PALETTE["warm_white"], 0.2), 255))


def draw_bow(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, color: tuple[int, int, int]) -> None:
    cx, cy = center
    draw.ellipse((cx - 26 * scale, cy - 18 * scale, cx + 26 * scale, cy + 18 * scale), fill=rgba(color, 255))
    draw.polygon([(cx - 14 * scale, cy), (cx - 88 * scale, cy - 52 * scale), (cx - 48 * scale, cy + 10 * scale)], fill=rgba(color, 235))
    draw.polygon([(cx + 14 * scale, cy), (cx + 88 * scale, cy - 52 * scale), (cx + 48 * scale, cy + 10 * scale)], fill=rgba(color, 235))
    draw.polygon([(cx - 16 * scale, cy + 14 * scale), (cx - 58 * scale, cy + 92 * scale), (cx - 2 * scale, cy + 54 * scale)], fill=rgba(blend(color, PALETTE["warm_white"], 0.16), 220))
    draw.polygon([(cx + 16 * scale, cy + 14 * scale), (cx + 58 * scale, cy + 92 * scale), (cx + 2 * scale, cy + 54 * scale)], fill=rgba(blend(color, PALETTE["warm_white"], 0.16), 220))


def draw_flower(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, color: tuple[int, int, int]) -> None:
    cx, cy = center
    for angle_x, angle_y in [(-14, 0), (14, 0), (0, -14), (0, 14), (-10, -10), (10, 10)]:
        draw.ellipse((cx + angle_x * scale - 12 * scale, cy + angle_y * scale - 12 * scale, cx + angle_x * scale + 12 * scale, cy + angle_y * scale + 12 * scale), fill=rgba(color, 230))
    draw.ellipse((cx - 8 * scale, cy - 8 * scale, cx + 8 * scale, cy + 8 * scale), fill=rgba(PALETTE["gold"], 255))


def make_showcase(path: Path) -> None:
    image = vertical_gradient((1536, 1024), blend(PALETTE["blush"], PALETTE["warm_white"], 0.3), blend(PALETTE["soft_cream"], PALETTE["blue_soft"], 0.2))
    background = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(background)
    for column in range(18):
        x = column * 88
        tone = blend(PALETTE["warm_white"], PALETTE["pink_soft"], 0.18 if column % 2 else 0.06)
        draw.rectangle((x, 0, x + 88, 1024), fill=rgba(tone, 120))
    draw.rectangle((0, 0, 1536, 44), fill=rgba(PALETTE["pink_soft"], 180))
    for scallop in range(0, 1536, 56):
        draw.ellipse((scallop, 26, scallop + 52, 82), fill=rgba(PALETTE["warm_white"], 180))
    draw.rectangle((0, 868, 1536, 924), fill=rgba(PALETTE["pink_soft"], 180))
    image.alpha_composite(background)
    add_glow(image, (260, 140, 1276, 820), PALETTE["warm_white"], 34, 44)
    shelf = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shelf_draw = ImageDraw.Draw(shelf)
    draw_bow(shelf_draw, (170, 74), 1.2, PALETTE["pink"])
    draw_bow(shelf_draw, (1364, 74), 1.2, PALETTE["gold"])
    for flower in [((130, 118), PALETTE["pink_soft"]), ((206, 124), PALETTE["blue_soft"]), ((1366, 118), PALETTE["cream"]), ((1292, 126), PALETTE["pink_soft"])]:
        draw_flower(shelf_draw, flower[0], 1.0, flower[1])
    draw_pedestal(shelf_draw, 124, 574, 1.0, PALETTE["pink"])
    draw_pedestal(shelf_draw, 1202, 576, 1.0, PALETTE["blue"])
    draw_cupcake(shelf, (246, 454), 0.82, PALETTE["pink"], PALETTE["pink_soft"], PALETTE["pink"], "strawberry")
    draw_cupcake(shelf, (196, 548), 0.74, blend(PALETTE["pink"], PALETTE["blue"], 0.32), PALETTE["pink_soft"], blend(PALETTE["pink"], PALETTE["brown"], 0.25), "cherry")
    draw_cupcake(shelf, (314, 548), 0.74, PALETTE["cream"], PALETTE["warm_white"], blend(PALETTE["pink"], PALETTE["gold"], 0.3), "strawberry")
    draw_cupcake(shelf, (1310, 454), 0.82, PALETTE["cream"], PALETTE["warm_white"], PALETTE["blue"], "cherry")
    draw_cupcake(shelf, (1260, 548), 0.74, blend(PALETTE["pink"], PALETTE["cream"], 0.35), PALETTE["pink_soft"], PALETTE["gold"], "strawberry")
    draw_cupcake(shelf, (1380, 548), 0.74, PALETTE["blue"], PALETTE["blue_soft"], PALETTE["blue"], "moon")
    for cookie_x, cookie_y in [(124, 690), (204, 742), (1396, 688), (1328, 740)]:
        shelf_draw.rounded_rectangle((cookie_x, cookie_y, cookie_x + 62, cookie_y + 52), radius=18, fill=rgba(PALETTE["gold"], 255))
        shelf_draw.rounded_rectangle((cookie_x + 12, cookie_y + 10, cookie_x + 50, cookie_y + 42), radius=14, outline=rgba(PALETTE["warm_white"], 180), width=4)
    shelf_draw.rectangle((0, 860, 1536, 894), fill=rgba(PALETTE["warm_white"], 70))
    image.alpha_composite(shelf)
    draw_sparkles(image, 42, (84, 96, 1452, 868))
    add_noise(image, 16)
    finish_image(image, color=1.32, contrast=1.11, sharpness=1.14).save(path)


def main() -> None:
    assets_dir = Path(__file__).resolve().parents[1] / "assets" / "images"
    assets_dir.mkdir(parents=True, exist_ok=True)
    make_hero(assets_dir / "hero-bakery-v2.png")
    make_oven_stage(assets_dir / "oven-stage-v2.png")
    make_showcase(assets_dir / "showcase-shelf-v2.png")


if __name__ == "__main__":
    main()
