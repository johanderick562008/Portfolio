"""
Subsets the site's fonts to the characters it actually uses (about a third
smaller than Fontsource's full Latin files). The output is committed in
src/assets/fonts/, so this only needs re-running if you use new characters.

    pip install fonttools brotli
    python scripts/subset-fonts.py

Variable axes (opsz, wght, SOFT, WONK) are kept, and so is the `rvrn` feature
that swaps in Fraunces' wonky glyphs. A character outside this list still
renders, just in the fallback font, so add it here when you use one.
"""

import os

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NM = os.path.join(ROOT, "node_modules")
OUT = os.path.join(ROOT, "src", "assets", "fonts")

# ASCII, plus every non-ASCII character the site uses (scan dist/ to check).
UNICODES = (
    "0020-007E,00A0,00A7,00A9,00B7,00B9,00D7,00E9,"
    "2013,2014,2018,2019,201C,201D,2022,2026,203A,207B,"
    "2190-2193,2197,21B5,2212,2318"
)

FONTS = {
    "fraunces-normal": "@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
    "fraunces-italic": "@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2",
    "plex-sans-400": "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2",
    "plex-sans-500": "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2",
    "plex-mono-400": "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
    "kalam-400": "@fontsource/kalam/files/kalam-latin-400-normal.woff2",
}

os.makedirs(OUT, exist_ok=True)
for name, src in FONTS.items():
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "calt", "rvrn", "ccmp", "locl", "mark", "mkmk"]
    font = subset.load_font(os.path.join(NM, src), opts)
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    out = os.path.join(OUT, f"{name}.woff2")
    subset.save_font(font, out, opts)
    print(f"{name}: {os.path.getsize(os.path.join(NM, src)) // 1024} kB -> {os.path.getsize(out) // 1024} kB")
