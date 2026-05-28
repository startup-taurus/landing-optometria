from __future__ import annotations

import base64
import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


SOURCE = Path(
    r"C:\Users\riden\Documents\Proyectos\Personales\PROYECTOS\LATAMSOFT\Proyectos\Optica\branding\Propuesta 2\dioptrika-brand-kit\assets\reference\dioptrika-ai-logo-reference.png"
)
ROOT = Path(__file__).resolve().parents[1]
MASTER_DIR = ROOT / "assets" / "master"
PNG_DIR = ROOT / "assets" / "png"
SVG_DIR = ROOT / "assets" / "svg"


COLORS = {
    "green_master_sample": "#01AF76",
    "green_brand": "#14B875",
    "green_deep": "#087A5A",
    "petroleum": "#123A43",
    "dark_bg": "#071A1F",
    "dark_surface": "#0D252C",
    "white_optical": "#F8FBFA",
    "graphite_sample": "#1F2B36",
    "muted_dark": "#B7D1D2",
    "gray": "#6B7280",
}


# Pixel coordinates measured from the provided master image.
# These crops preserve the original logo pixels, proportions, spacing, and colors.
CROPS = {
    "logo-principal-original-con-fondo.png": (187, 208, 1515, 572),
    "logo-horizontal-original-con-fondo.png": (187, 208, 1515, 500),
    "isologo-original-con-fondo.png": (675, 628, 971, 856),
}


def ensure_dirs() -> None:
    for directory in (MASTER_DIR, PNG_DIR, SVG_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def transparent_from_white(image: Image.Image) -> Image.Image:
    """Remove only the white/off-white background from the source crop."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            ink = max(255 - r, 255 - g, 255 - b)
            if ink <= 7:
                alpha = 0
            elif ink >= 88:
                alpha = 255
            else:
                alpha = int((ink - 7) / 81 * 255)
            pixels[x, y] = (r, g, b, alpha)
    return rgba


def save_embedded_svg(png_path: Path, svg_path: Path, title: str) -> None:
    image = Image.open(png_path)
    encoded = base64.b64encode(png_path.read_bytes()).decode("ascii")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{image.width}" height="{image.height}" viewBox="0 0 {image.width} {image.height}" role="img" aria-label="{title}">
  <image href="data:image/png;base64,{encoded}" width="{image.width}" height="{image.height}" />
</svg>
"""
    svg_path.write_text(svg, encoding="utf-8")


def paste_center(canvas: Image.Image, element: Image.Image, box: tuple[int, int, int, int]) -> None:
    max_w = box[2] - box[0]
    max_h = box[3] - box[1]
    element = element.copy()
    element.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    x = box[0] + (max_w - element.width) // 2
    y = box[1] + (max_h - element.height) // 2
    canvas.alpha_composite(element.convert("RGBA"), (x, y))


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\seguisb.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: str) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def build_layouts() -> None:
    logo_bg = Image.open(PNG_DIR / "logo-principal-original-con-fondo.png").convert("RGBA")
    logo_transparent = Image.open(PNG_DIR / "logo-principal-original-sin-fondo.png").convert("RGBA")
    iso_transparent = Image.open(PNG_DIR / "isologo-original-sin-fondo.png").convert("RGBA")
    iso_bg = Image.open(PNG_DIR / "isologo-original-con-fondo.png").convert("RGBA")

    avatar_light = Image.new("RGBA", (1080, 1080), COLORS["white_optical"])
    draw = ImageDraw.Draw(avatar_light)
    draw.ellipse((148, 148, 932, 932), fill="#FFFFFF", outline="#DCEBE7", width=6)
    paste_center(avatar_light, iso_transparent, (260, 285, 820, 795))
    avatar_light.save(PNG_DIR / "avatar-social-light.png")

    avatar_dark = Image.new("RGBA", (1080, 1080), COLORS["dark_bg"])
    draw = ImageDraw.Draw(avatar_dark)
    draw.ellipse((148, 148, 932, 932), fill=COLORS["white_optical"], outline="#DCEBE7", width=6)
    paste_center(avatar_dark, iso_transparent, (260, 285, 820, 795))
    avatar_dark.save(PNG_DIR / "avatar-social-dark.png")

    dark_safe = Image.new("RGBA", (1500, 520), COLORS["dark_bg"])
    draw = ImageDraw.Draw(dark_safe)
    shadow = Image.new("RGBA", dark_safe.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((74, 70, 1426, 450), radius=18, fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    dark_safe.alpha_composite(shadow)
    rounded_rect(draw, (80, 62, 1420, 442), 18, "#FFFFFF")
    paste_center(dark_safe, logo_bg, (116, 88, 1384, 416))
    dark_safe.save(PNG_DIR / "logo-principal-dark-safe.png")

    cover = Image.new("RGBA", (1500, 500), COLORS["dark_bg"])
    draw = ImageDraw.Draw(cover)
    draw.rectangle((0, 350, 1500, 500), fill=COLORS["dark_surface"])
    draw.line((1000, 108, 1370, 108), fill=COLORS["green_brand"], width=3)
    draw.line((1110, 148, 1438, 148), fill="#B7D1D2", width=3)
    rounded_rect(draw, (92, 90, 1090, 356), 16, "#FFFFFF")
    paste_center(cover, logo_bg, (118, 110, 1064, 334))
    draw.text((116, 404), "Software clinico especializado para opticas", font=font(30, True), fill=COLORS["green_brand"])
    cover.save(PNG_DIR / "portada-redes-dark.png")

    hero = Image.new("RGBA", (1920, 900), COLORS["dark_bg"])
    draw = ImageDraw.Draw(hero)
    draw.rectangle((0, 690, 1920, 900), fill=COLORS["dark_surface"])
    draw.line((1240, 160, 1760, 160), fill=COLORS["green_brand"], width=3)
    draw.line((1320, 218, 1840, 218), fill="#B7D1D2", width=3)
    rounded_rect(draw, (130, 110, 1470, 476), 18, "#FFFFFF")
    paste_center(hero, logo_bg, (170, 145, 1430, 438))
    draw.text((142, 590), "Precision clinica para gestionar opticas con claridad.", font=font(58, True), fill=COLORS["white_optical"])
    draw.text((146, 662), "Historias clinicas, ordenes de laboratorio, inventario y facturacion en un sistema especializado.", font=font(30), fill=COLORS["muted_dark"])
    rounded_rect(draw, (146, 722, 372, 782), 12, COLORS["green_brand"])
    draw.text((186, 737), "Solicitar demo", font=font(24, True), fill=COLORS["dark_bg"])
    hero.save(PNG_DIR / "hero-web-dark.png")

    # A compact safe version for white-background documents.
    doc_header = Image.new("RGBA", (1500, 420), "#FFFFFF")
    paste_center(doc_header, logo_bg, (70, 52, 1430, 368))
    doc_header.save(PNG_DIR / "documento-header-light.png")

    # Isologo centered inside a white field, useful when platforms do not support transparency.
    iso_safe = Image.new("RGBA", (720, 720), "#FFFFFF")
    paste_center(iso_safe, iso_bg, (140, 160, 580, 560))
    iso_safe.save(PNG_DIR / "isologo-white-safe.png")

    # Also include a transparent logo placed on a white canvas for simple preview.
    preview = Image.new("RGBA", (1500, 520), "#FFFFFF")
    paste_center(preview, logo_transparent, (90, 78, 1410, 442))
    preview.save(PNG_DIR / "logo-principal-preview-light.png")


def main() -> None:
    ensure_dirs()
    master = Image.open(SOURCE).convert("RGB")
    shutil.copy2(SOURCE, MASTER_DIR / "dioptrika-ai-logo-reference.png")

    for filename, box in CROPS.items():
        crop = master.crop(box)
        crop.save(PNG_DIR / filename)
        transparent = transparent_from_white(crop)
        transparent_name = filename.replace("-con-fondo", "-sin-fondo")
        transparent.save(PNG_DIR / transparent_name)

    # Friendly aliases requested by the user.
    shutil.copy2(PNG_DIR / "logo-principal-original-sin-fondo.png", PNG_DIR / "logo-sin-fondo.png")
    shutil.copy2(PNG_DIR / "isologo-original-sin-fondo.png", PNG_DIR / "isologo-sin-fondo.png")
    shutil.copy2(PNG_DIR / "isologo-original-sin-fondo.png", PNG_DIR / "isotipo-sin-fondo.png")

    build_layouts()

    svg_sources = {
        "logo-principal-original.svg": "logo-principal-original-con-fondo.png",
        "logo-sin-fondo.svg": "logo-principal-original-sin-fondo.png",
        "logo-horizontal-sin-fondo.svg": "logo-horizontal-original-sin-fondo.png",
        "isologo-sin-fondo.svg": "isologo-original-sin-fondo.png",
        "isotipo-sin-fondo.svg": "isologo-original-sin-fondo.png",
    }
    for svg_name, png_name in svg_sources.items():
        save_embedded_svg(PNG_DIR / png_name, SVG_DIR / svg_name, f"Dioptrika {svg_name}")

    metadata = {
        "source_master": str(SOURCE),
        "principle": "No redraw, no reinterpretation. Every logo asset is cropped or background-removed from the exact reference image.",
        "crops": CROPS,
        "colors": COLORS,
    }
    (ROOT / "tokens" / "dioptrika-exact-brand-tokens.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
