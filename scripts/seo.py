"""Keep the SEO plumbing of the static pages in sync. Run after adding or editing a page in public/ or index.html:

    python3 scripts/seo.py

For every page with a canonical URL it rewrites the block between <!-- seo --> and <!-- /seo --> in <head>
(favicons, Open Graph and Twitter tags, JSON-LD), draws the page's 1200x630 share image into public/og/, and
regenerates public/sitemap.xml with lastmod dates and the card previews each page shows. Pages without a
canonical (404) only get the favicons. Needs Pillow and rsvg-convert (brew install librsvg). Safe to run repeatedly.
"""

import datetime
import html
import json
import re
import subprocess
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
SITE = 'https://shaaditemplate.com'
AUTHOR = 'Ashok Lalakiya'
# Every page names the publisher in full, so the reference resolves inside each page's own graph.
ORG = {'@type': 'Organization', '@id': f'{SITE}/#org', 'name': 'ShaadiTemplate', 'url': f'{SITE}/', 'logo': f'{SITE}/icon-512.png',
       'sameAs': ['https://www.instagram.com/shaaditemplate/', 'https://in.pinterest.com/shaaditemplate/']}
HOME_CARDS = ['harmandir-gold-leaf', 'gota-patti', 'korvai-silk']  # featured designs for the homepage's structured data
FONTS = ROOT / 'node_modules/@fontsource'
WINE, WINE_DEEP, ZARI, ROSE = (74, 14, 28), (44, 7, 16), (201, 164, 92), (247, 237, 234)
TODAY = datetime.date.today().isoformat()
HEADLINES = {
    'home': 'Free Indian wedding invitation maker',
    'guides-gujarati-kankotri-lakhan': 'Gujarati kankotri wording (kankotri lakhan)',
    'guides-hindi-shadi-card-matter': 'Hindi shadi card matter',
    'guides-marathi-lagna-patrika': 'Marathi lagna patrika wording',
    'guides-chandla-vidhi-card-wording': 'Chandla vidhi card wording in Gujarati',
    'guides-simant-card-wording': 'Simant card wording in Gujarati',
}


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def icons():
    """PNG and ICO versions of the brand mark (public/favicon.svg) for browsers, Google results and the Organization logo."""
    for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (48, 'favicon-48.png')]:
        subprocess.run(['rsvg-convert', '-w', str(size), '-h', str(size), '-o', PUBLIC / name, PUBLIC / 'favicon.svg'], check=True)
    Image.open(PUBLIC / 'favicon-48.png').save(PUBLIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    (PUBLIC / 'favicon-48.png').unlink()


def wrap(draw, text, fnt, width):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line]


def share_image(path, headline, cards):
    """Headline on the left, up to three card previews fanned on the right."""
    img = Image.new('RGB', (1200, 630), WINE)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 590, 1200, 630), fill=WINE_DEEP)
    d.line((0, 590, 1200, 590), fill=ZARI, width=3)
    d.text((64, 70), 'ShaadiTemplate', font=font('bodoni-moda/files/bodoni-moda-latin-400-italic.woff', 40), fill=ROSE)
    big = font('bodoni-moda/files/bodoni-moda-latin-400-normal.woff', 58)
    y = 170
    for line in wrap(d, headline, big, 500)[:4]:
        d.text((64, y), line, font=big, fill=ROSE)
        y += 70
    site = any(isinstance(c, Path) for c in cards)  # a themed website's own screen, not card previews
    d.text((64, 520), 'Free wedding website · RSVP · One link for every guest' if site else 'Free · No login · WhatsApp image and print PDF', font=font('bodoni-moda/files/bodoni-moda-latin-400-normal.woff', 24), fill=ZARI)
    cards = cards[:3]
    slots = {1: [(0, 0)], 2: [(-1, -5), (1, 5)], 3: [(-1, -7), (0, 0), (1, 7)]}[len(cards)]
    for i in sorted(range(len(cards)), key=lambda i: slots[i][0] == 0):  # the middle card goes on top
        src = cards[i] if isinstance(cards[i], Path) else PUBLIC / 'templates/previews' / f'{cards[i]}.webp'
        card = Image.open(src).convert('RGBA').resize((270, 480), Image.LANCZOS)
        card = card.rotate(-slots[i][1], expand=True, resample=Image.BICUBIC)
        img.paste(card, (920 + slots[i][0] * 108 - card.width // 2, 315 - card.height // 2), card)
    path.parent.mkdir(exist_ok=True)
    img.save(path, quality=84, optimize=True)


def website_images():
    """Share images for the wedding website pages (vite.config.ts points their og:image here): each design's hero photo,
    cropped to 1200x630 around its focal point, with the design's name and the photo's credit. The photos come from
    Wikimedia Commons once and are kept in node_modules/.cache/og-src."""
    designs = (ROOT / 'src/site/designs.ts').read_text()
    shots = {name: args for name, args in re.findall(r"^  (\w+): commons\((.*)\),$", (ROOT / 'src/site/photos.ts').read_text(), re.M)}
    cache = ROOT / 'node_modules/.cache/og-src'
    cache.mkdir(parents=True, exist_ok=True)
    looks = []
    for block in re.split(r"^    id: '", designs, flags=re.M)[1:]:
        look = re.match(r"[\w-]+", block).group(0)
        name = re.search(r"^    name: '([^']+)'", block, re.M).group(1)
        tradition = re.search(r"^    tradition: '([^']+)'", block, re.M).group(1).split(' · ')[0]
        hero = re.search(r"photos: \{ hero: SHOTS\.(\w+)", block).group(1)
        path, width, _alt, by, licence, *pos = [a.strip().strip("'") for a in re.findall(r"\s*('[^']*'|[^,]+)", shots[hero])]
        looks.append((look, name, tradition if 'wedding' in tradition.lower() else f'{tradition} wedding', path, int(width), by, licence, (pos or ['center'])[0]))
    out = {}
    for slug, headline, sub, path, width, by, licence, pos in [('websites', 'Free wedding website designs', 'RSVP and every function on one link', *looks[0][3:])] + \
            [(f'websites-{look}', name, f'A free {kind} website', *rest) for look, name, kind, *rest in looks]:
        file = path.rsplit('/', 1)[1]
        url = f'https://upload.wikimedia.org/wikipedia/commons/thumb/{path}/1280px-{file}' if width > 1280 else f'https://upload.wikimedia.org/wikipedia/commons/{path}'
        src = cache / re.sub(r'[^\w.-]', '_', f'{path}-1280')
        if not src.exists():
            req = urllib.request.Request(url, headers={'User-Agent': 'ShaadiTemplateBuild/1.0 (https://shaaditemplate.com)'})
            src.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        photo = Image.open(src).convert('RGB')
        scale = max(1200 / photo.width, 630 / photo.height)
        photo = photo.resize((round(photo.width * scale), round(photo.height * scale)), Image.LANCZOS)
        fx, fy = ([float(p.rstrip('%')) / 100 for p in pos.split()] + [0.5, 0.5])[:2] if pos != 'center' else (0.5, 0.5)
        left = min(max(round(fx * photo.width - 600), 0), photo.width - 1200)
        top = min(max(round(fy * photo.height - 315), 0), photo.height - 630)
        img = photo.crop((left, top, left + 1200, top + 630))
        shade = Image.new('L', (1200, 1))  # wine shade behind the words on the left, clear on the right
        shade.putdata([240 if x < 560 else max(0, 240 - (x - 560) * 240 // 380) for x in range(1200)])
        img = Image.composite(Image.new('RGB', img.size, WINE_DEEP), img, shade.resize(img.size))
        d = ImageDraw.Draw(img)
        d.rectangle((0, 590, 1200, 630), fill=WINE_DEEP)
        d.line((0, 590, 1200, 590), fill=ZARI, width=3)
        d.text((64, 70), 'ShaadiTemplate', font=font('bodoni-moda/files/bodoni-moda-latin-400-italic.woff', 40), fill=ROSE)
        big = font('bodoni-moda/files/bodoni-moda-latin-400-normal.woff', 64)
        y = 190
        for line in wrap(d, headline, big, 560)[:3]:
            d.text((64, y), line, font=big, fill=ROSE)
            y += 76
        d.text((64, y + 14), sub, font=font('bodoni-moda/files/bodoni-moda-latin-400-normal.woff', 30), fill=ZARI)
        small = font('bodoni-moda/files/bodoni-moda-latin-400-normal.woff', 18)
        credit = f'Photo: {by}, {licence}, Wikimedia Commons'
        # Photographers' names can need Latin Extended letters (Hałun), which the latin subset file lacks.
        ext = font('bodoni-moda/files/bodoni-moda-latin-ext-400-normal.woff', 18)
        pick = lambda ch: ext if ord(ch) > 0xff else small
        x = 1136 - sum(d.textlength(ch, font=pick(ch)) for ch in credit)
        tagline = 'Free wedding website · RSVP · One link for every guest'
        if 64 + d.textlength(tagline, font=small) + 32 <= x:  # a long credit needs the whole strip
            d.text((64, 600), tagline, font=small, fill=ZARI)
        for ch in credit:
            d.text((x, 600), ch, font=pick(ch), fill=ROSE)
            x += d.textlength(ch, font=pick(ch))
        img.save(PUBLIC / 'og' / f'{slug}.jpg', quality=84, optimize=True)
        out[slug] = f'{SITE}/og/{slug}.jpg'
    return out


def meta(page, pattern):
    m = re.search(pattern, page, re.S)
    return html.unescape(m.group(1).strip()) if m else ''


def text(fragment):
    return html.unescape(re.sub(r'<[^>]+>', '', fragment)).strip()


def crumbs(*items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]}


def last_changed(path):
    """Commit date while the file matches HEAD, else today."""
    rel = path.relative_to(ROOT)
    dirty = subprocess.run(['git', 'status', '--porcelain', '--', rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if dirty:
        return TODAY
    return subprocess.run(['git', 'log', '-1', '--format=%cs', '--', rel], cwd=ROOT, capture_output=True, text=True).stdout.strip() or TODAY


def card_ids(page):
    """Designs a page shows, in order: preview images first, then designs it links to."""
    ids = re.findall(r'previews/([\w-]+)\.webp', page) + re.findall(r'#template/([\w-]+)', page)
    known = {p.stem for p in (PUBLIC / 'templates/previews').glob('*.webp')}
    return list(dict.fromkeys(i for i in ids if i in known))


def structured(path, page, url, title, desc, image, cards):
    rel = path.relative_to(PUBLIC).as_posix() if path.is_relative_to(PUBLIC) else 'index.html'
    lang = meta(page, r'<html lang="([^"]+)"') or 'en'
    h1 = text(meta(page, r'<h1[^>]*>(.*?)</h1>')) or title
    home = ('Home', f'{SITE}/')
    designs = ('Designs', f'{SITE}/templates/')
    guides = ('Guides', f'{SITE}/guides/')
    if rel == 'index.html':
        return [
            {**ORG, 'email': 'hello@shaaditemplate.com',
             'founder': {'@type': 'Person', 'name': AUTHOR}, 'address': {'@type': 'PostalAddress', 'streetAddress': '17 Manmohan Society, LH Road',  # as on contact.html
                                                             'addressLocality': 'Surat', 'postalCode': '395010', 'addressRegion': 'Gujarat', 'addressCountry': 'IN'}},
            {'@type': 'WebSite', '@id': f'{SITE}/#website', 'name': 'ShaadiTemplate', 'url': f'{SITE}/', 'inLanguage': 'en', 'publisher': ORG},
            {'@type': 'WebApplication', 'name': 'ShaadiTemplate', 'url': f'{SITE}/', 'description': desc, 'applicationCategory': 'DesignApplication', 'operatingSystem': 'Any',
             'browserRequirements': 'Requires JavaScript', 'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'INR'},
             'inLanguage': ['en', 'hi', 'mr', 'gu', 'pa', 'ta'], 'image': image, 'publisher': ORG,
             'featureList': ['Invitations for Save the Date, Engagement (Ring Ceremony), Haldi, Mehendi, Sangeet, Wedding, Reception and Baby Shower (Simant)', 'English, Hindi, Marathi, Gujarati, Punjabi and Tamil',
                             'Phonetic typing in Indian scripts', '1080x1920 image for WhatsApp', '5x7 inch print-ready PDF', 'Free wedding website with RSVP', 'No login']},
        ]
    if rel in ('templates/index.html', 'guides/index.html'):
        return [{'@type': 'CollectionPage', 'name': h1, 'url': url, 'description': desc, 'inLanguage': lang, 'isPartOf': {'@id': f'{SITE}/#website'}},
                crumbs(home, designs if rel.startswith('templates') else guides)]
    if rel.endswith('-invitations.html'):  # ceremony and language hubs
        items = []
        for sid, body in re.findall(r'<section class="design" id="([\w-]+)">(.*?)</section>', page, re.S):
            heading = meta(body, r'<h[23]>(.*?)</h[23]>') or ''  # ceremony hubs use h2, language hubs h3
            name = text(heading)
            own = re.search(r'href="([\w-]+\.html)"', heading)
            items.append({'@type': 'ListItem', 'position': len(items) + 1, 'item': {'@type': 'CreativeWork', 'name': name,
                          'url': f'{SITE}/templates/{own.group(1)}' if own else f'{url}#{sid}', 'image': f'{SITE}/templates/previews/{sid}.webp'}})
        return [{'@type': 'CollectionPage', 'name': h1, 'url': url, 'description': desc, 'inLanguage': lang, 'isPartOf': {'@id': f'{SITE}/#website'},
                 'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(items), 'itemListElement': items}},
                crumbs(home, designs, (h1, url))]
    if rel.startswith('templates/'):  # a single design
        hub = re.search(r'<a href="([\w-]+-invitations\.html)">([^<]+)</a>\s*›', page)
        trail = [home, designs] + ([(text(hub.group(2)), f'{SITE}/templates/{hub.group(1)}')] if hub else []) + [(h1, url)]
        card_lang = meta(page, r'<blockquote lang="([^"]+)"') or lang
        big = PUBLIC / 'templates/previews/pages' / f'{path.stem}-1.webp'
        cover = f'{SITE}/templates/previews/' + (f'pages/{big.name}' if big.exists() else f'{path.stem}.webp')
        return [{'@type': 'CreativeWork', 'name': h1, 'url': url, 'description': desc, 'image': cover, 'inLanguage': card_lang,
                 'isAccessibleForFree': True, 'publisher': ORG, **({'isPartOf': {'@type': 'CollectionPage', 'url': trail[2][1]}} if hub else {})},
                crumbs(*trail)]
    if rel.startswith('guides/'):
        added = subprocess.run(['git', 'log', '--diff-filter=A', '--format=%cs', '--', path.relative_to(ROOT)], cwd=ROOT, capture_output=True, text=True).stdout.split()
        return [{'@type': 'Article', 'headline': h1, 'description': desc, 'url': url, 'mainEntityOfPage': url, 'image': image, 'inLanguage': lang,
                 'datePublished': added[-1] if added else TODAY, 'dateModified': last_changed(path),
                 'author': {'@type': 'Person', 'name': AUTHOR, 'url': f'{SITE}/about.html'}, 'publisher': ORG},
                crumbs(home, guides, (h1, url))]
    if rel == 'about.html':
        return [{'@type': 'AboutPage', 'name': h1, 'url': url, 'about': ORG}]
    if rel == 'contact.html':
        return [{'@type': 'ContactPage', 'name': h1, 'url': url, 'about': ORG}]
    return []


def head_block(path, page):
    prefix = '/'  # absolute paths work from every directory on the custom domain
    tags = [f'<link rel="icon" href="{prefix}favicon.svg" type="image/svg+xml" />',
            f'<link rel="icon" href="{prefix}favicon.ico" sizes="48x48" />',
            f'<link rel="icon" href="{prefix}icon-192.png" type="image/png" sizes="192x192" />',
            f'<link rel="apple-touch-icon" href="{prefix}apple-touch-icon.png" />']
    if path != ROOT / 'index.html':  # the app loads analytics itself (src/analytics.ts)
        tags.append(f'<script src="{prefix}analytics.js" defer></script>')
    url = meta(page, r'<link rel="canonical" href="([^"]+)"')
    if not url:
        return tags, None, []
    title = re.sub(r'\s*·\s*ShaadiTemplate$', '', meta(page, r'<title>(.*?)</title>'))
    desc = meta(page, r'<meta name="description" content="([^"]*)"')
    slug = url.removeprefix(SITE).strip('/').removesuffix('.html').replace('/', '-') or 'home'
    image = f'{SITE}/og/{slug}.jpg'
    cards = card_ids(page) or HOME_CARDS
    if path.is_relative_to(PUBLIC / 'microsites'):  # a themed website: its own opening screen
        cards = [path.parent / 'cover.webp']
    # Share images are drawn in Latin type, so pages titled in an Indian script need an English headline here.
    headline = HEADLINES.get(slug) or (title if title.isascii() else 'Indian wedding invitation wording')
    share_image(PUBLIC / 'og' / f'{slug}.jpg', headline, cards)
    article = path.is_relative_to(PUBLIC / 'guides') and path.name != 'index.html'
    locale = meta(page, r'<html lang="([^"]+)"') or 'en'
    e = lambda s: html.escape(s, quote=True)
    tags += [f'<meta property="og:type" content="{"article" if article else "website"}" />',
             '<meta property="og:site_name" content="ShaadiTemplate" />',
             f'<meta property="og:locale" content="{locale}_IN" />',
             f'<meta property="og:title" content="{e(title)}" />',
             f'<meta property="og:description" content="{e(desc)}" />',
             f'<meta property="og:url" content="{url}" />',
             f'<meta property="og:image" content="{image}" />',
             '<meta property="og:image:width" content="1200" />',
             '<meta property="og:image:height" content="630" />',
             f'<meta property="og:image:alt" content="{e(headline)}: ShaadiTemplate invitation designs" />',
             '<meta name="twitter:card" content="summary_large_image" />']
    graph = structured(path, page, url, title, desc, image, cards)
    if graph:
        ld = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
        tags.append(f'<script type="application/ld+json">{ld}</script>')
    # Every card preview the page shows, for the image sitemap.
    shown = re.findall(r'src="[^"]*?(previews/[^"]+\.webp)"', page)
    return tags, url, [f'{SITE}/templates/{i}' for i in dict.fromkeys(shown)]


def srcset(page):
    """Full-size page images (1080px) also come at 720px; let phones and the small gallery thumbnails pick that."""
    def add(m):
        tag, src = m.group(0), m.group(1)
        if 'srcset=' in tag or not (PUBLIC / 'templates' / src.replace('.webp', '-720.webp')).exists():
            return tag
        sizes = '(max-width: 352px) calc(100vw - 32px), 320px' if 'class="hero"' in tag else '(max-width: 600px) 45vw, 230px'
        return tag.replace(f'src="{src}"', f'src="{src}" srcset="{src.replace(".webp", "-720.webp")} 720w, {src} 1080w" sizes="{sizes}"')
    return re.sub(r'<img[^>]*src="(previews/pages/[\w-]+\.webp)"[^>]*>', add, page)


def main():
    icons()
    pages = [ROOT / 'index.html'] + sorted(PUBLIC.rglob('*.html'))
    entries = []
    for path in pages:
        page = path.read_text()
        page = re.sub(r'\n?[ \t]*<!-- seo -->.*?<!-- /seo -->', '', page, flags=re.S)
        page = re.sub(r'\n[ \t]*<link rel="(?:icon|apple-touch-icon)"[^>]*>', '', page)  # the block below carries them
        page = srcset(page)
        tags, url, images = head_block(path, page)
        indent = '    ' if path == ROOT / 'index.html' else ''
        block = '\n'.join(indent + t for t in ['<!-- seo -->', *tags, '<!-- /seo -->'])
        page = page.replace('</head>', block + '\n' + ('  ' if indent else '') + '</head>', 1)
        path.write_text(page)
        if url:
            entries.append((url, last_changed(path), images))
    # The wedding website pages come from the app, not from a file here: the build writes them (vite.config.ts) and
    # fails if a design in src/site/designs.ts is missing from the sitemap.
    designs = ROOT / 'src/site/designs.ts'
    looks = re.findall(r"^    id: '([\w-]+)',\n    name: '([^']+)',\n    blurb: '([^']+)',$", designs.read_text(), re.M)
    assert len(looks) == len(re.findall(r"^    id: '", designs.read_text(), re.M)), 'a design in designs.ts is not id, name, blurb in that order'
    shots = website_images()
    entries += [(f'{SITE}/websites/', last_changed(designs), [shots['websites']])]
    entries += [(f'{SITE}/websites/{i}/', last_changed(designs), [shots[f'websites-{i}']]) for i, _, _ in looks]
    # Those pages have no content in their HTML until the app runs, so nothing static links to each design. List
    # them between the <!-- websites --> marks, for crawlers to follow.
    for path, base, cls in [(ROOT / 'index.html', '', ' class="text-wine underline underline-offset-4"'), (PUBLIC / 'templates/index.html', '../', '')]:
        items = ['<!-- websites -->', *(f'<li><a{cls} href="{base}websites/{i}/">{html.escape(name)}</a>: {html.escape(blurb)}</li>' for i, name, blurb in looks), '<!-- /websites -->']
        page, n = re.subn(r'([ \t]*)<!-- websites -->.*?<!-- /websites -->', lambda m: '\n'.join(m[1] + t for t in items), path.read_text(), flags=re.S)
        assert n == 1, f'{path} has no <!-- websites --> marks'
        path.write_text(page)
    entries.sort(key=lambda x: (x[0].count('/'), x[0]))
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for url, mod, images in entries:
        imgs = ''.join(f'<image:image><image:loc>{i}</image:loc></image:image>' for i in images)
        out.append(f'  <url><loc>{url}</loc><lastmod>{mod}</lastmod>{imgs}</url>')
    (PUBLIC / 'sitemap.xml').write_text('\n'.join(out + ['</urlset>']) + '\n')
    print(f'{len(pages)} pages, {len(entries)} in sitemap')


if __name__ == '__main__':
    main()
