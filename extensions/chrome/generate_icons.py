import os
import struct
import zlib


def create_png(width, height, color_bg, color_fg):
    """
    Creates a valid RGBA PNG image with a stylish rounded badge and lightning bolt / 'R' icon.
    Pure standard library: requires only zlib and struct.
    """
    raw_data = bytearray()
    center_x = width / 2.0
    center_y = height / 2.0
    radius = min(width, height) * 0.45

    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = (dx * dx + dy * dy) ** 0.5

            if dist > radius:
                # Transparent outer
                raw_data.extend([0, 0, 0, 0])
            elif dist > radius - 1.5:
                # Border anti-aliasing
                raw_data.extend([color_bg[0], color_bg[1], color_bg[2], 180])
            else:
                # Inside badge: check if part of the lightning/chevron glyph
                norm_x = (x - center_x) / radius
                norm_y = (y - center_y) / radius

                # Simple stylish lightning glyph
                is_glyph = (
                    (-0.25 <= norm_x <= 0.25 and -0.5 <= norm_y <= 0.5 and abs(norm_x * 1.5 + norm_y) < 0.45)
                    or (-0.15 <= norm_x <= 0.3 and -0.1 <= norm_y <= 0.1)
                )

                if is_glyph:
                    raw_data.extend([color_fg[0], color_fg[1], color_fg[2], 255])
                else:
                    raw_data.extend([color_bg[0], color_bg[1], color_bg[2], 255])

    # Compress raster data
    compressed_data = zlib.compress(bytes(raw_data), level=9)

    # Helper to construct PNG chunks
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return c + struct.pack(">I", crc)

    # IHDR Chunk
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)

    # PNG File Structure: Signature + IHDR + IDAT + IEND
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", compressed_data)
        + chunk(b"IEND", b"")
    )
    return png


def main():
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    os.makedirs(icons_dir, exist_ok=True)

    # Theme colors: Indigo/Violet #6366f1 (99, 102, 241) and White #ffffff
    bg = (79, 70, 229)    # Indigo 600
    fg = (255, 255, 255)  # White

    for size in (16, 48, 128):
        png_bytes = create_png(size, size, bg, fg)
        path = os.path.join(icons_dir, f"icon{size}.png")
        with open(path, "wb") as f:
            f.write(png_bytes)
        print(f"Generated {path} ({len(png_bytes)} bytes)")


if __name__ == "__main__":
    main()
