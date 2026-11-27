"""Mark the built site's images as ours. Runs on dist/ after npm run build (the deploy workflow does this), so the
images in the repository stay untouched and the preview fingerprints (previews-check.mjs) stay valid:

    python3 scripts/protect.py               mark dist/
    python3 scripts/protect.py check FILE    how much of our invisible watermark FILE carries

- Artwork (templates/*/ outside previews, site-art/, the themed websites' covers) gets an invisible watermark: a 64-bit
  code added faintly to two DCT coefficients of every 8x8 block of brightness, tiled across the picture. `check` on
  a copy reads it back: about 100% means it is ours, about 50% is chance. It survives re-saving, JPEG compression and
  cropping (check tries every offset), not resizing.
- Card previews (templates/previews/) get a small visible "shaaditemplate.com" at the foot; downloads made in the
  editor carry no visible mark.
Needs numpy, opencv-python (headless is enough) and Pillow.
"""

import hashlib
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
FONT = ROOT / 'node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-400-italic.woff'
BITS = np.unpackbits(np.frombuffer(hashlib.sha256(b'shaaditemplate.com').digest()[:8], np.uint8)).reshape(8, 8)
A = 4.0  # strength added to each carrying coefficient: under 2 brightness levels per pixel
CARRY = [(2, 3), (3, 2)]  # mid-frequency DCT coefficients that carry a block's bit
K, N = np.mgrid[0:8, 0:8]
D = (np.cos(np.pi * (2 * N + 1) * K / 16) * np.where(K == 0, np.sqrt(1 / 8), np.sqrt(2 / 8))).astype(np.float32)  # orthonormal 8x8 DCT: dct(B) = D @ B @ D.T


def blocks(y):
    h, w = y.shape[0] // 8, y.shape[1] // 8
    return y[:h * 8, :w * 8].reshape(h, 8, w, 8).transpose(0, 2, 1, 3), h, w


def dct(b):
    return np.einsum('ij,hwjk,lk->hwil', D, b, D)


def embed(rgb):
    ycc = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb).astype(np.float32)
    y = ycc[:, :, 0]
    b, h, w = blocks(y)
    c = dct(b)
    sign = np.where(np.tile(BITS, (h // 8 + 1, w // 8 + 1))[:h, :w] == 1, A, -A)
    for u, v in CARRY:
        c[:, :, u, v] += sign  # spread spectrum: a small push in the bit's direction, in every block
    y[:h * 8, :w * 8] = np.einsum('ji,hwjk,kl->hwil', D, c, D).transpose(0, 2, 1, 3).reshape(h * 8, w * 8)
    ycc[:, :, 0] = y
    return cv2.cvtColor(np.clip(np.round(ycc), 0, 255).astype(np.uint8), cv2.COLOR_YCrCb2RGB)


def score(rgb, search=False):
    """Share of the 64 code bits the picture carries: each bit is the sign of its blocks' summed carrying coefficients,
    after taking out the picture's own average (shared by all 64 positions). search=True also tries every crop offset
    (pixel shift within a block, block shift within the 8x8 tile) and keeps the best; by chance that best stays under
    about 80%, so 90% or more means the code is there."""
    y = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb).astype(np.float32)[:, :, 0]
    if min(y.shape) < 64:
        return 0.0
    best = 0.0
    for dy, dx in [(dy, dx) for dy in range(8) for dx in range(8)] if search else [(0, 0)]:
        b, h, w = blocks(y[dy:, dx:])
        c = dct(b)
        m = sum(c[:, :, u, v] for u, v in CARRY)
        means = np.array([[m[i::8, j::8].mean() for j in range(8)] for i in range(8)])
        read = (means > means.mean()).astype(np.uint8)
        for ry, rx in [(ry, rx) for ry in range(8) for rx in range(8)] if search else [(0, 0)]:
            best = max(best, float((np.roll(read, (ry, rx), (0, 1)) == BITS).mean()))
    return best


def mark_art(path):
    img = Image.open(path)
    if min(img.size) < 256:
        return False
    alpha = img.convert('RGBA').getchannel('A') if 'A' in img.getbands() or 'transparency' in img.info else None
    out = Image.fromarray(embed(np.asarray(img.convert('RGB'))))
    if alpha is not None:
        out.putalpha(alpha)
    ext = path.suffix.lower()
    if ext == '.png':
        out.save(path, optimize=True)
    elif ext in ('.jpg', '.jpeg'):
        out.save(path, quality=92, optimize=True)
    else:
        out.save(path, quality=90, method=6)
    return True


def stamp(path):
    img = Image.open(path).convert('RGB')
    size = max(11, img.width // 36)
    fnt = ImageFont.truetype(str(FONT), size)
    layer = Image.new('RGBA', img.size)
    d = ImageDraw.Draw(layer)
    text = 'shaaditemplate.com'
    tw = d.textlength(text, font=fnt)
    x, y = (img.width - tw) / 2, img.height - size * 2.2
    d.rounded_rectangle((x - size * 0.6, y - size * 0.25, x + tw + size * 0.6, y + size * 1.3), radius=size * 0.8, fill=(0, 0, 0, 80))
    d.text((x, y), text, font=fnt, fill=(255, 255, 255, 215))
    Image.alpha_composite(img.convert('RGBA'), layer).convert('RGB').save(path, quality=82, method=6)


def main():
    if not (DIST / 'index.html').exists():
        sys.exit('No dist/: run npm run build first')
    previews = DIST / 'templates/previews'
    art = [p for p in [*(DIST / 'templates').rglob('*'), *(DIST / 'site-art').rglob('*'), *(DIST / 'microsites').glob('*/cover.webp')]
           if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp') and not p.is_relative_to(previews)]
    marked = sum(mark_art(p) for p in art)
    shots = sorted(previews.rglob('*.webp'))
    for p in shots:
        stamp(p)
    print(f'watermarked {marked} of {len(art)} artwork files, stamped {len(shots)} previews')


if __name__ == '__main__':
    if sys.argv[1:2] == ['check']:
        for f in sys.argv[2:]:
            print(f'{score(np.asarray(Image.open(f).convert("RGB")), search=True):.0%} {f}')
    else:
        main()
