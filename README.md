# Caucasus Sweets Home

Static website (Arabic / English) for دار الحلويات القوقازية, Amman. Plain HTML, CSS and JavaScript, no build step for the browser.

- `index.html`, `products.html`: the Arabic pages (the source of truth for text).
- `en/`: the English pages. They are generated: edit the Arabic page and `i18n.js` (English wording), then run `python build-en.py`.
  The same script rewrites the SEO tags (canonical, hreflang, social image, business data), `sitemap.xml` and `robots.txt`.
- `products-data.js`: menu items, sizes and prices (Arabic and English).
- `script.js`, `style.css`: behaviour and styling. `fonts/`, `img/`, `video/`: assets (images are WebP).
- `vercel.json`: caching and security headers. `.vercelignore`: files that are not deployed.

When a custom domain is connected, change `SITE` at the top of `build-en.py` and run it again.
