# ShaadiTemplate

## Gallery labels (strict)

Customers find designs only through the gallery filters (event, language, God or sacred symbol), so every template's labels must match what the card actually shows. Check this every time a template is added or its artwork changes.

- **Symbol:** every god, deity or sacred figure visible anywhere on the card (painted art, emblem, shloka) must be a filter option, and the template must be tagged with it. `symbol` is the main one (it drives the cover invocation and emblem); put any others in `also`.
- **Missing symbol:** if the figure has no option yet, add it. That means a new id in `SYMBOL_IDS` (`src/types.ts`), its label in `SYMBOLS` (`src/i18n.ts`), its invocation in every `src/samples/*.ts`, and its drawing in `Emblem` (`src/card/motifs.tsx`). Never tag the card with the nearest existing option instead.
- **Event and language:** `event` and `lang` must match the card's occasion and the script its sample text is written in.
- Use `floral` only for cards with no sacred figure at all.

## Static pages and SEO

See `doc/SEO.md` for the plan (the `doc/` folder is private and gitignored; it lives in the main checkout). After adding or editing anything in `public/*.html` or `index.html`, run `python3 scripts/seo.py` to refresh head tags, share images and the sitemap. A new template needs its cover preview at `public/templates/previews/<id>.webp` (540x960); render it with `python3 scripts/previews.py <id>` while `npm run dev` runs. Re-render whenever a template's sample text, design or artwork changes: CI runs `node scripts/previews-check.mjs` and fails on stale previews.

## Switching language (strict)

Changing a card's language must keep its format exactly the same: the same pages, the same sections in the same order, the same sizes, artwork and ornaments. Only the words change. Every template added from now on must hold to this.

- A template with its own `pages` (a copied printed card) needs `tr` with every other language in `LANG_IDS`, page for page and section for section, in `src/card/tr/<id>.ts`. Keep every mark (`*`, `**`, `~`, `<<`, `>>`, `<>`, `___`) and every `[[ornament]]` name; translate only the words.
- Artwork with words painted on it (a lettered title, a ribbon, a label under joined hands) must not show those words in other languages. Mark the cut-out with `gujarati()` in `src/card/designs-f.tsx` and give it its words as `[[name|words]]`; if the piece has a part worth keeping without the words, save it as `<name>-plain.png` and list it with where the words go (`over`, `below` or `above`). A whole page with painted words gets a `plain` page artwork (see Sandhya).
- Run `node scripts/languages-check.mjs` (CI runs it) and look at the card in every language before calling it done.

## Plain text in every box (strict)

Families edit only plain words. No text box in the card editor or the website editor may show a formatting mark (`~names~`, `**big**`, `*accent*`, `^^spaced^^`, `{{chip}}`, `[[ornament|words]]`, `<>`, `//`, `<<`, `>>`, `___`), and no one should need to type one. Every format (story and print) and every website holds to this.

- Card text boxes go through `Field` in `src/Editor.tsx`, which shows `toPlain(text)` and saves with `fromPlain(typed, text)` (`src/card/plain.ts`): the marks stay hidden in the saved text around the words they belong to, so typing never changes the card's format. A new text box on a card gets the same treatment.
- A painted cut-out with words (`[[title|words]]`) must switch to the typed words once they differ from the painted ones, in the card's own language too (`painted` in `src/card/Card.tsx`). Never leave a box whose edits don't show on the card.
- Text that leaves the card (a website started from a card, share text, page names) is passed through `toPlain` first.
- A new mark, or sample text that uses marks in a new way, must pass `node scripts/plain-check.mjs` (CI runs it): every sample in every language shows no marks, and typing or deleting anywhere keeps the box and the format intact.

## Adding or removing a template (same PR)

A template change is not done until its SEO surface matches it, in the same PR. When a template is added, removed, renamed or relabeled, also update:

- **Design page:** `public/templates/<id>.html` (every card page, artwork and invocation notes, sample wording without the sample family's names or numbers). Delete it when the template is removed.
- **Hubs and index:** the matching language and event hubs (`public/templates/<lang>-invitations.html`, `wedding-invitations.html`, etc.) and `public/templates/index.html`. Add or remove the card links and fix any design counts or "only"/"first" claims.
- **Keywords:** titles, descriptions and on-page wording that name the design, its god or symbol, language and event, so search terms match the gallery labels above.
- **Images:** `python3 scripts/previews.py <id>` (cover and page images) while `npm run dev` runs. On removal, delete its previews and `public/og/templates-<id>.jpg`.
- **Head tags, share images and sitemap:** run `python3 scripts/seo.py` last, then `node scripts/previews-check.mjs`.

## Gallery order (strict)

The gallery order lives in `ORDER` in `src/App.tsx`. Featured designs come first, then the rest, and within each group designs are ranked by how often they are opened (GA4 `template_open` count in the newest report under `doc/analytics/`, main checkout), most opened first; ties keep the previous order. The event tabs (Save the Date, Engagement, Wedding...) are ranked by the average opens per design in each event (the event's total opens divided by its number of designs), most first, with ties in `EVENT_IDS` order; they follow `OPENS` on their own. Whenever a new analytics report lands, or a template is featured, unfeatured, added or removed, replace `OPENS` with the latest per-design counts, re-rank `ORDER` from them and update the dated comments above both.

## Website music (strict)

A wedding website's music starts on its own as soon as the site opens: the couple's track, their YouTube song or a themed page's own `theme.mp3`. Browsers block sound until the guest taps, so where it is blocked it starts on the guest's first tap, key or scroll anywhere on the page (a scroll plays only where the browser already allows sound) (taps inside a themed page's frame count, via `microsite-tap`). Never make a guest press a play button first. Keep the button to pause it, pause while the tab is hidden, and don't autoplay in the editor's live preview (there it starts on a tap or scroll in the preview, and it and the editor's song samples pause each other). Every new design or music source must hold to this (see `Music` in `src/site/music.tsx`).

## Copy protection

Designs, artwork, website themes and code are copyrighted (`LICENSE`, `public/terms.html#copying`). Keep every layer in place when adding pages, art or themes:

- **Notices:** every static page's footer carries the `class="copy"` line; `python3 scripts/seo.py` adds the copyright, `noai` and TDM meta tags and the `copyrightHolder`/`license` structured data. `public/robots.txt` blocks AI training crawlers but not search or AI answer crawlers; `public/llms.txt` tells AI assistants not to recreate designs and to send people to the design's page.
- **Themed websites:** each `public/microsites/<id>/index.html` starts with the `<!-- © 2026 ShaadiTemplate ...` comment and loads `fill.js`, which shows a "copied from ShaadiTemplate" bar off our domain (`src/main.tsx` does the same for the app). `npm run build` minifies them (`scripts/minify-microsites.mjs`). If the site moves host (Cloudflare Pages), add its preview domain to both host checks.
- **Images:** the deploy runs `python3 scripts/protect.py` on `dist/`: invisible watermark on artwork, small visible mark on card previews. Repo images stay unmarked. `python3 scripts/protect.py check <file>` tells whether a found copy is ours (90% or more).
