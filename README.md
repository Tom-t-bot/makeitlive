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

## Brand kit

`/brand-kit` is a partner-facing page (`brand-kit.html`, `brand-kit.css`). The downloadable logo files in
`assets/brand/` — including the `.zip` — are generated, so don't edit them by hand. To change the logo
artwork, edit the paths in `scripts/build_brand.py` (and the hero SVG in `index.html`) and rebuild:

```bash
python3 scripts/build_brand.py   # needs Inkscape (brew install inkscape)
```
