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

## Adding or removing a template (same PR)

A template change is not done until its SEO surface matches it, in the same PR. When a template is added, removed, renamed or relabeled, also update:

- **Design page:** `public/templates/<id>.html` (every card page, artwork and invocation notes, sample wording without the sample family's names or numbers). Delete it when the template is removed.
- **Hubs and index:** the matching language and event hubs (`public/templates/<lang>-invitations.html`, `wedding-invitations.html`, etc.) and `public/templates/index.html`. Add or remove the card links and fix any design counts or "only"/"first" claims.
- **Keywords:** titles, descriptions and on-page wording that name the design, its god or symbol, language and event, so search terms match the gallery labels above.
- **Images:** `python3 scripts/previews.py <id>` (cover and page images) while `npm run dev` runs. On removal, delete its previews and `public/og/templates-<id>.jpg`.
- **Head tags, share images and sitemap:** run `python3 scripts/seo.py` last, then `node scripts/previews-check.mjs`.

## Gallery order (strict)

The gallery order lives in `ORDER` in `src/App.tsx`. Featured designs come first, then the rest, and within each group designs are ranked by how often they are opened (GA4 `template_open` count in the newest report under `doc/analytics/`, main checkout), most opened first; ties keep the previous order. Whenever a new analytics report lands, or a template is featured, unfeatured, added or removed, re-rank `ORDER` from the latest numbers and update the dated opens comment above it.

## Website music (strict)

A wedding website's music starts on its own as soon as the site opens: the couple's track, their YouTube song or a themed page's own `theme.mp3`. Browsers block sound until the guest taps, so where it is blocked it starts on the guest's first tap or key anywhere on the page (taps inside a themed page's frame count, via `microsite-tap`). Never make a guest press a play button first. Keep the button to pause it, pause while the tab is hidden, and don't autoplay in the editor's live preview. Every new design or music source must hold to this (see `Music` in `src/site/music.tsx`).
