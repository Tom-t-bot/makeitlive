# Make It Live

Landing page for Make It Live — Belgian event agency. Static HTML/CSS/JS, no build step, deployed on Vercel.

- `index.html` — all content, in both NL and EN (`data-l="nl"` / `data-l="en"`)
- `styles.css` — styling
- `main.js` — language switch, scroll reveals, copy-email

## Editing content

Every translatable piece of text exists twice, side by side:

```html
<span data-l="nl">Wat we doen</span><span data-l="en">What we do</span>
```

Change both. The inactive language is hidden with CSS based on `<html lang>`.

Anything not ready yet says **Setting the stage**.

## Run locally

```bash
python3 -m http.server 4173
```

## Deploy

Pushing to `main` deploys to production through the Vercel ↔ GitHub integration.

## Theme

Light is the default; the sun/moon button switches to dark and the choice is remembered. Colours are tokens
at the top of `styles.css` (`:root` = light, `html[data-theme="dark"]` = dark). `/brand-kit` is always dark.

## Hero video

Drop footage in `assets/video/hero.mp4` (and ideally `hero.webm`) and it fades in behind the hero by itself —
text, logo and nav switch to white automatically. No file → the pastel (light) / club-beam (dark) background stays.

- Landscape 16:9, 1920×1080, 10–20 s seamless loop, no audio
- Keep it under ~8 MB (H.264 `.mp4`, ~2–3 Mbit/s; the `.webm` can be smaller)
- Skipped automatically for visitors with reduced-motion or data-saver on

## Contact form

The form posts to `api/contact.js` (a Vercel function) which emails `hello@makeitlive.agency` through
[Resend](https://resend.com). Until it is configured the function answers 503 and the page falls back to a
prefilled `mailto:` link, so no enquiry is lost. To switch it on, add in Vercel → Settings → Environment Variables:

| Variable | Required | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | API key from Resend (and verify `makeitlive.agency` there) |
| `CONTACT_TO` | no | inbox that receives enquiries (default `hello@makeitlive.agency`) |
| `CONTACT_FROM` | no | verified sender (default `Make It Live <noreply@makeitlive.agency>`) |

## Draft sections (references + testimonials)

The rolling reference banner and testimonials exist but are **not on the public page**: they live in
`partials/drafts.html` and are only loaded with `?preview` (e.g. `https://www.makeitlive.agency/?preview`).
The quotes are sample copy and the reference names are unconfirmed. When you have real, approved ones, paste the
two blocks into `index.html` between *WHO FOR* and *CONTACT* and delete the partial.

## Unlisted pages

`/join` (`join.html`) holds the open positions. Nothing on the site links to it: it is not in the navigation,
footer or sitemap, and it is `noindex, nofollow` (meta tag + `X-Robots-Tag` header in `vercel.json`) so search
engines skip it. Share the URL directly with candidates. `/brand-kit` and `/partials/*` are treated the same way.
Unlisted is not private: anyone with the link can open it.

## Service pages (wireframes)

Each of the five service cards has an unlisted placeholder page built from dashed *content slots*:
`/dj`, `/live-musicians`, `/live-bands`, `/performers`, `/photo-video` (`dj.html`, … , `pages.css`).
They are `noindex` and not linked from the public site. Opening `/?preview` adds a link layer to the five cards
so the team can click through.

- Every slot says what content goes there and which question to answer; the box at the top of each page lists
  *what matters on this page*. The yellow bar toggles **Team notes** ⇄ **Visitor view** (the latter shows only a
  calm "Setting the stage").
- Fill a slot by replacing the whole `<div class="slot …">…</div>` with the real image/video/text.
- To publish a page: replace its slots, remove the yellow `.pg-bar`, then (1) delete `.core-link` generation in
  `main.js` (preview block) and instead wrap the card in `<a href="/dj">`, and (2) drop its path from the
  `noindex` rule in `vercel.json`.
- The contact CTA on each page opens the form with that service pre-selected (`/?service=DJ#contact`).

## Brand kit

`/brand-kit` is a partner-facing page (`brand-kit.html`, `brand-kit.css`). The downloadable logo files in
`assets/brand/` — including the `.zip` — are generated, so don't edit them by hand. To change the logo
artwork, edit the paths in `scripts/build_brand.py` (and the hero SVG in `index.html`) and rebuild:

```bash
python3 scripts/build_brand.py   # needs Inkscape (brew install inkscape)
```
