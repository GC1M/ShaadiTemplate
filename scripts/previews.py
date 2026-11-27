"""Render template previews from the running dev server (npm run dev, port 5173):

    python3 scripts/previews.py gulabi-kankotri anand-karaj ...

For each template id it writes public/templates/previews/<id>.webp (540x960 cover, used by the gallery and hubs)
and, when the template has a design page (public/templates/<id>.html), public/templates/previews/pages/<id>-<n>.webp
(1080x1920, every page, plus a 720px copy for srcset).
Needs Pillow, Playwright for Python and Google Chrome.
"""

import io
import subprocess
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / 'public/templates/previews'
URL = 'http://localhost:5173/'


def main(ids):
    (OUT / 'pages').mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome')  # the installed Google Chrome
        for tid in ids:
            # A fresh context has no saved draft, so the #template link opens the card without a confirm prompt.
            # Reduced motion: animated cards (motion.ts) render still, as downloads do.
            ctx = browser.new_context(viewport={'width': 1400, 'height': 1000}, device_scale_factor=3, reduced_motion='reduce')
            page = ctx.new_page()
            page.goto(f'{URL}#template/{tid}')
            page.wait_for_selector('[data-page]')
            page.add_style_tag(content='[data-page] { opacity: 1 !important; outline: none !important; } [data-credit] { display: none !important; }')  # previews show the design, not the download credit
            page.evaluate('document.fonts.ready')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(800)
            cards = page.locator('[data-page] .pointer-events-none > div')
            design_page = (OUT.parent / f'{tid}.html').exists()
            for n in range(cards.count() if design_page else 1):
                card = cards.nth(n)
                card.scroll_into_view_if_needed()
                page.wait_for_timeout(200)
                img = Image.open(io.BytesIO(card.screenshot())).convert('RGB')
                if design_page:
                    img.resize((1080, 1920), Image.LANCZOS).save(OUT / 'pages' / f'{tid}-{n + 1}.webp', quality=80, method=6)
                    img.resize((720, 1280), Image.LANCZOS).save(OUT / 'pages' / f'{tid}-{n + 1}-720.webp', quality=80, method=6)
                if n == 0:
                    img.resize((540, 960), Image.LANCZOS).save(OUT / f'{tid}.webp', quality=82, method=6)
            print(tid, cards.count(), 'pages')
            ctx.close()
        browser.close()
    # Record these previews as fresh for the CI check.
    subprocess.run(['node', 'scripts/previews-check.mjs', '--write', *ids], cwd=OUT.parents[2], check=True)


if __name__ == '__main__':
    main(sys.argv[1:])
