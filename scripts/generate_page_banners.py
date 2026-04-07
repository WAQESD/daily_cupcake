from __future__ import annotations

from pathlib import Path
from random import Random

from PIL import Image, ImageColor, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "images"
SIZE = (1536, 768)

COLORS = {
    "white": "#fffdfd",
    "cream": "#fff8f6",
    "blush": "#ffdce9",
    "peach": "#ffd8bf",
    "rose": "#e98fb3",
    "rose_deep": "#d9759b",
    "butter": "#ffe794",
    "sky": "#c9e6ff",
    "wood": "#efcfaa",
    "cocoa": "#9e654f",
}


def rgba(color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    red, green, blue = ImageColor.getrgb(color)
    return red, green, blue, alpha


def gradient(size: tuple[int, int]) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    pixels = image.load()
    stops = ["#fffbf7", "#ffeaf2", "#ffd6e5"]

    for y in range(height):
        t = y / max(height - 1, 1)
        if t < 0.5:
            amount = t / 0.5
            left = ImageColor.getrgb(stops[0])
            right = ImageColor.getrgb(stops[1])
        else:
            amount = (t - 0.5) / 0.5
            left = ImageColor.getrgb(stops[1])
            right = ImageColor.getrgb(stops[2])
        line = tuple(int(left[i] + (right[i] - left[i]) * amount) for i in range(3))
        for x in range(width):
            pixels[x, y] = (*line, 255)

    return image


def fit_scene(filename: str, centering: tuple[float, float]) -> Image.Image:
    source = Image.open(ASSET_DIR / filename).convert("RGBA")
    return ImageOps.fit(source, SIZE, method=Image.Resampling.LANCZOS, centering=centering)


def add_blur_glow(image: Image.Image, bounds: tuple[float, float, float, float], color: str, alpha: int, blur_radius: int) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(bounds, fill=rgba(color, alpha))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur_radius)))


def add_stripes(image: Image.Image) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    width, height = image.size
    for y in range(0, height, 12):
        draw.line((0, y, width, y), fill=rgba(COLORS["white"], 24), width=2)
    image.alpha_composite(layer)


def add_speckles(image: Image.Image, seed: int) -> None:
    rng = Random(seed)
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    width, height = image.size
    palette = [COLORS["white"], COLORS["blush"], COLORS["peach"], COLORS["sky"]]
    for _ in range(96):
        radius = rng.randint(2, 6)
        x = rng.randint(0, width)
        y = rng.randint(0, height)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=rgba(rng.choice(palette), rng.randint(10, 34)))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(2)))


def draw_sparkle(draw: ImageDraw.ImageDraw, x: float, y: float, size: float) -> None:
    fill = rgba("#fff8df", 220)
    width = max(1, int(size * 0.18))
    draw.line((x, y - size, x, y + size), fill=fill, width=width)
    draw.line((x - size, y, x + size, y), fill=fill, width=width)
    draw.line((x - size * 0.55, y - size * 0.55, x + size * 0.55, y + size * 0.55), fill=fill, width=1)
    draw.line((x - size * 0.55, y + size * 0.55, x + size * 0.55, y - size * 0.55), fill=fill, width=1)


def draw_bow(draw: ImageDraw.ImageDraw, x: float, y: float, width: float, height: float, color: str) -> None:
    draw.polygon([(x - width * 0.5, y), (x - width * 0.14, y - height * 0.38), (x - width * 0.08, y), (x - width * 0.14, y + height * 0.38)], fill=rgba(color, 230))
    draw.polygon([(x + width * 0.5, y), (x + width * 0.14, y - height * 0.38), (x + width * 0.08, y), (x + width * 0.14, y + height * 0.38)], fill=rgba(color, 230))
    draw.rounded_rectangle((x - width * 0.12, y - height * 0.2, x + width * 0.12, y + height * 0.2), radius=10, fill=rgba(color, 255))
    draw.polygon([(x - width * 0.14, y + height * 0.16), (x - width * 0.24, y + height * 0.78), (x - width * 0.03, y + height * 0.3)], fill=rgba(color, 220))
    draw.polygon([(x + width * 0.14, y + height * 0.16), (x + width * 0.24, y + height * 0.78), (x + width * 0.03, y + height * 0.3)], fill=rgba(color, 220))


def element(width: int, height: int) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


def paste_rotated(base: Image.Image, image: Image.Image, center: tuple[float, float], angle: float) -> None:
    rotated = image.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    x = int(center[0] - rotated.width / 2)
    y = int(center[1] - rotated.height / 2)
    base.alpha_composite(rotated, (x, y))


def draw_top_trim(image: Image.Image) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    width, _ = image.size
    draw.rectangle((0, 0, width, 54), fill=rgba("#ffeef4", 215))
    draw.rectangle((0, 18, width, 26), fill=rgba(COLORS["rose"], 110))
    for x in range(-10, width + 30, 30):
        draw.ellipse((x, 26, x + 30, 54), fill=rgba(COLORS["white"], 165))
    image.alpha_composite(layer)


def draw_corner_cluster(base: Image.Image, side: str) -> None:
    width, _ = base.size
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    if side == "left":
        bow_x = 120
        cookies = (66, 540, 124, 598)
        flowers = [(178, 86, COLORS["peach"]), (212, 104, COLORS["sky"]), (156, 116, COLORS["white"])]
        bow_color = COLORS["rose"]
    else:
        bow_x = width - 120
        cookies = (width - 124, 540, width - 66, 598)
        flowers = [(width - 178, 86, COLORS["butter"]), (width - 212, 104, COLORS["white"]), (width - 156, 116, COLORS["sky"])]
        bow_color = COLORS["butter"]

    draw_bow(draw, bow_x, 72, 118, 52, bow_color)
    for x, y, color in flowers:
        draw.ellipse((x - 28, y - 28, x + 28, y + 28), fill=rgba(color, 220), outline=rgba(COLORS["white"], 170), width=2)
        draw.ellipse((x - 10, y - 10, x + 10, y + 10), fill=rgba(COLORS["rose"], 130))

    draw.rounded_rectangle(cookies, radius=22, fill=rgba(COLORS["butter"], 232), outline=rgba(COLORS["cocoa"], 90), width=2)
    draw.ellipse((cookies[0] + 18, cookies[1] + 18, cookies[0] + 28, cookies[1] + 28), fill=rgba(COLORS["cocoa"], 90))
    draw.ellipse((cookies[2] - 32, cookies[1] + 18, cookies[2] - 22, cookies[1] + 28), fill=rgba(COLORS["cocoa"], 90))
    draw.ellipse((cookies[0] + 24, cookies[3] - 30, cookies[0] + 34, cookies[3] - 20), fill=rgba(COLORS["cocoa"], 90))
    base.alpha_composite(layer)


def draw_shelf(base: Image.Image) -> None:
    width, height = base.size
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    top = height - 130
    draw.rounded_rectangle((44, top, width - 44, height - 36), radius=34, fill=rgba(COLORS["wood"], 205))
    draw.rectangle((78, top + 18, width - 78, top + 34), fill=rgba(COLORS["white"], 66))
    draw.rectangle((92, height - 84, width - 92, height - 74), fill=rgba(COLORS["cocoa"], 28))
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1)))


def draw_plate(base: Image.Image, center: tuple[float, float], width: int, height: int, color: str) -> None:
    image, draw = element(width + 80, height + 80)
    left = 40
    top = 28
    right = left + width
    bottom = top + height
    draw.ellipse((left, top, right, bottom), fill=rgba(color, 225), outline=rgba(COLORS["white"], 220), width=4)
    draw.ellipse((left + 30, top + 14, right - 30, bottom - 14), fill=rgba(COLORS["white"], 90))
    paste_rotated(base, image, center, 0)


def draw_parcel(base: Image.Image, center: tuple[float, float], width: int, height: int, body: str, ribbon: str, angle: float, with_window: bool = False) -> None:
    image, draw = element(width + 80, height + 110)
    left = 40
    top = 48
    right = left + width
    bottom = top + height
    draw.rounded_rectangle((left, top, right, bottom), radius=26, fill=rgba(body, 255), outline=rgba(COLORS["rose"], 160), width=3)
    draw.rounded_rectangle((left, top - 30, right, top + 34), radius=24, fill=rgba(COLORS["white"], 132), outline=rgba(COLORS["rose"], 120), width=2)
    draw.rectangle((left + width * 0.46, top - 18, left + width * 0.54, bottom), fill=rgba(ribbon, 232))
    draw.rectangle((left, top + height * 0.42, right, top + height * 0.56), fill=rgba(ribbon, 200))
    draw_bow(draw, left + width / 2, top + 12, width * 0.46, height * 0.25, ribbon)

    if with_window:
        draw.rounded_rectangle((left + width * 0.2, top + height * 0.2, right - width * 0.2, bottom - height * 0.14), radius=20, fill=rgba(COLORS["white"], 120), outline=rgba(COLORS["rose"], 130), width=2)
        draw.ellipse((left + width * 0.32, top + height * 0.32, left + width * 0.5, top + height * 0.5), fill=rgba("#ffc4d8", 230))
        draw.ellipse((left + width * 0.5, top + height * 0.3, left + width * 0.72, top + height * 0.52), fill=rgba("#fff1b0", 225))

    seal_x = right - 42
    seal_y = bottom - 34
    draw.ellipse((seal_x - 22, seal_y - 22, seal_x + 22, seal_y + 22), fill=rgba(COLORS["white"], 224), outline=rgba(COLORS["rose"], 160), width=2)
    draw.polygon([(seal_x, seal_y - 8), (seal_x + 8, seal_y + 2), (seal_x, seal_y + 12), (seal_x - 8, seal_y + 2)], fill=rgba(COLORS["rose_deep"], 255))
    paste_rotated(base, image, center, angle)


def draw_cupcake(base: Image.Image, center: tuple[float, float], scale: float, wrapper: str, cake: str, cream: str, topper: str) -> None:
    width = int(170 * scale)
    height = int(190 * scale)
    image, draw = element(width + 120, height + 110)
    shadow_top = int(height * 0.74)
    draw.ellipse((34, shadow_top, 34 + width + 36, shadow_top + 28), fill=rgba(COLORS["cocoa"], 34))

    wrapper_left = 54
    wrapper_top = int(height * 0.66)
    wrapper_right = wrapper_left + width
    wrapper_bottom = wrapper_top + int(height * 0.27)
    draw.polygon([(wrapper_left + 12, wrapper_top), (wrapper_right - 12, wrapper_top), (wrapper_right, wrapper_bottom), (wrapper_left, wrapper_bottom)], fill=rgba(wrapper, 255), outline=rgba(COLORS["rose"], 145))
    for offset in range(wrapper_left + 14, wrapper_right - 10, max(int(18 * scale), 12)):
        draw.line((offset, wrapper_top + 2, offset + 5, wrapper_bottom - 4), fill=rgba(COLORS["white"], 180), width=3)

    cake_top = wrapper_top - int(height * 0.1)
    draw.rounded_rectangle((wrapper_left + 16, cake_top, wrapper_right - 16, wrapper_top + int(height * 0.08)), radius=18, fill=rgba(cake, 255))

    cream_base_y = cake_top - int(height * 0.08)
    for index, width_ratio in enumerate((0.92, 0.74, 0.54)):
        level_width = int(width * width_ratio)
        left = wrapper_left + (width - level_width) // 2
        top = cream_base_y - int(index * 24 * scale)
        right = left + level_width
        bottom = top + int(54 * scale)
        draw.ellipse((left, top, right, bottom), fill=rgba(cream, 255), outline=rgba(COLORS["white"], 190), width=3)

    topper_radius = int(18 * scale)
    topper_x = wrapper_left + width // 2
    topper_y = cream_base_y - int(24 * scale)
    draw.ellipse((topper_x - topper_radius, topper_y - topper_radius, topper_x + topper_radius, topper_y + topper_radius), fill=rgba(topper, 255), outline=rgba(COLORS["white"], 180), width=2)
    draw.ellipse((topper_x - topper_radius * 0.35, topper_y - topper_radius * 0.35, topper_x + topper_radius * 0.35, topper_y + topper_radius * 0.35), fill=rgba(COLORS["white"], 160))
    paste_rotated(base, image, center, 0)


def draw_recipe_card(base: Image.Image, center: tuple[float, float], width: int, height: int, paper: str, accent: str, angle: float) -> None:
    image, draw = element(width + 80, height + 80)
    left = 40
    top = 30
    right = left + width
    bottom = top + height
    draw.rounded_rectangle((left, top, right, bottom), radius=28, fill=rgba(paper, 250), outline=rgba(COLORS["rose"], 145), width=3)
    draw.rounded_rectangle((left + 18, top + 18, right - 18, bottom - 18), radius=22, outline=rgba(COLORS["white"], 170), width=2)
    draw.rounded_rectangle((left + 26, top + 26, left + 80, top + 80), radius=18, fill=rgba(accent, 255))
    draw.polygon([(left + 54, top + 40), (left + 66, top + 56), (left + 54, top + 74), (left + 42, top + 56)], fill=rgba(COLORS["white"], 232))
    for x in range(int(left + 26), int(right - 26), 42):
        draw.ellipse((x, top - 10, x + 18, top + 8), fill=rgba(COLORS["rose"], 195))
        draw.rectangle((x + 6, top - 6, x + 12, top + 14), fill=rgba(COLORS["white"], 215))
    draw.rounded_rectangle((right - 84, top - 8, right - 24, top + 26), radius=12, fill=rgba(accent, 215))
    draw.rounded_rectangle((left + 110, top + 40, right - 40, top + 64), radius=12, fill=rgba(COLORS["blush"], 205))
    draw.rounded_rectangle((left + 110, top + 78, right - 72, top + 102), radius=12, fill=rgba(COLORS["butter"], 188))
    draw.rounded_rectangle((left + 110, top + 116, right - 54, top + 140), radius=12, fill=rgba(COLORS["sky"], 180))
    draw.ellipse((right - 102, bottom - 98, right - 38, bottom - 34), fill=rgba(COLORS["peach"], 205), outline=rgba(COLORS["white"], 180), width=2)
    paste_rotated(base, image, center, angle)


def draw_notebook(base: Image.Image, center: tuple[float, float], width: int, height: int, angle: float) -> None:
    image, draw = element(width + 100, height + 90)
    left = 50
    top = 38
    right = left + width
    bottom = top + height
    draw.rounded_rectangle((left, top, right, bottom), radius=34, fill=rgba("#fffaf7", 250), outline=rgba(COLORS["rose"], 140), width=3)
    draw.rectangle((left + 26, top + 18, left + 56, bottom - 18), fill=rgba(COLORS["rose"], 145))
    for y in range(top + 48, bottom - 30, 36):
        draw.ellipse((left + 8, y, left + 34, y + 26), fill=rgba(COLORS["white"], 232), outline=rgba(COLORS["rose"], 110), width=2)
    draw.rounded_rectangle((left + 86, top + 54, right - 58, top + 82), radius=12, fill=rgba(COLORS["blush"], 210))
    draw.rounded_rectangle((left + 86, top + 102, right - 82, top + 128), radius=12, fill=rgba(COLORS["peach"], 188))
    draw.rounded_rectangle((left + 86, top + 150, right - 70, top + 176), radius=12, fill=rgba(COLORS["sky"], 170))
    draw.rounded_rectangle((right - 86, top + 30, right - 26, top + 80), radius=18, fill=rgba(COLORS["butter"], 215))
    draw_bow(draw, right - 56, bottom - 72, 58, 38, COLORS["rose"])
    paste_rotated(base, image, center, angle)


def decorate(image: Image.Image, seed: int) -> None:
    add_stripes(image)
    add_blur_glow(image, (70, 70, 500, 360), COLORS["peach"], 92, 46)
    add_blur_glow(image, (1040, 80, 1460, 360), COLORS["sky"], 74, 54)
    add_blur_glow(image, (250, 120, 1286, 676), COLORS["white"], 150, 40)
    add_blur_glow(image, (520, 220, 1014, 610), "#fff7fb", 112, 46)
    add_speckles(image, seed)
    draw_top_trim(image)
    draw_corner_cluster(image, "left")
    draw_corner_cluster(image, "right")


def soften_scene(image: Image.Image, seed: int) -> None:
    image.alpha_composite(Image.new("RGBA", image.size, rgba("#fff3f7", 64)))
    add_blur_glow(image, (80, 90, 520, 360), COLORS["peach"], 58, 42)
    add_blur_glow(image, (1020, 70, 1460, 340), COLORS["sky"], 48, 48)
    add_blur_glow(image, (300, 120, 1230, 676), COLORS["white"], 112, 28)
    add_stripes(image)
    add_speckles(image, seed)


def frame_banner(image: Image.Image) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rounded_rectangle((26, 26, SIZE[0] - 26, SIZE[1] - 26), radius=36, outline=rgba(COLORS["white"], 130), width=4)
    draw.rounded_rectangle((44, 44, SIZE[0] - 44, SIZE[1] - 44), radius=30, outline=rgba(COLORS["rose"], 72), width=2)
    for x, y, size in [(514, 194, 18), (930, 166, 14), (1088, 224, 16), (730, 598, 12)]:
        draw_sparkle(draw, x, y, size)
    image.alpha_composite(layer)


def build_delivery() -> Path:
    image = fit_scene("oven-stage.png", (0.5, 0.46))
    soften_scene(image, 11)
    draw_parcel(image, (206, 576), 180, 136, "#ffd6e4", COLORS["rose"], -6)
    draw_parcel(image, (334, 622), 210, 154, "#ffe8b6", COLORS["rose"], 5, with_window=True)
    draw_parcel(image, (218, 682), 154, 116, "#fff1f5", COLORS["sky"], -8)
    draw_top_trim(image)
    frame_banner(image)
    output = ASSET_DIR / "delivery-banner.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG")
    return output


def build_collection() -> Path:
    image = fit_scene("showcase-shelf.png", (0.5, 0.46))
    soften_scene(image, 19)
    draw_recipe_card(image, (262, 582), 224, 284, "#fff8fb", COLORS["rose"], -8)
    draw_recipe_card(image, (382, 618), 208, 264, "#fff7ef", COLORS["butter"], 6)
    draw_notebook(image, (1300, 590), 246, 286, 7)
    frame_banner(image)
    output = ASSET_DIR / "collection-banner.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG")
    return output


def main() -> None:
    build_delivery()
    build_collection()


if __name__ == "__main__":
    main()
