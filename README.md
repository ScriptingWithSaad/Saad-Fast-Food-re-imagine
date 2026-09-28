# Saad Fast Food

A responsive food menu built with HTML, CSS and JavaScript. No framework, remote font or runtime dependency is needed. Versioned static assets are committed so the site runs directly on GitHub Pages.

[Website](https://scriptingwithsaad.github.io/Saad-Fast-Food-re-imagine/)

## Run locally

```sh
python -m http.server 8765
```

Open `http://localhost:8765`. Use a web server, since the JavaScript uses ES modules.

## Menu and bag

The menu has eight items, category filters, search and an accessible shopping-bag dialog. The bag supports quantities, removal, exact-cent totals and persistence on this device. It still works for the current visit if storage is unavailable. Without JavaScript, the full menu and contact links remain available.

The bag is a saved selection; this site has no checkout, payment or order-submission backend. The existing Instagram and Facebook links are used for contact. Prices remain in USD and match the previous displayed menu prices. Placeholder phone/address details and unrelated theme-advertising sections were removed.

To edit the menu, keep the static cards in `index.html` and the catalogue in `script/products.mjs` in sync. Catalogue prices are integer cents. Update the item count in the menu heading/filter if the catalogue changes.

After editing the CSS or JavaScript, run `python scripts/build_assets.py` and commit `index.html` together with `assets/site/`. The script versions the stylesheet and the complete module import chain by content, preventing previously cached CSS/JavaScript from being mixed with new HTML. Keep previous generated versions available for visitors with cached HTML.

The navbar stays at the top while scrolling. Small screens use a compact logo/bag row and a separate navigation row; larger screens use one row. Anchor offsets keep section headings below the sticky header.

## Image performance

The original page referenced 44,368,603 bytes of images. The redesigned page's largest intended image set (eight 640px menu images, 960px hero, chef logo and favicon) is 429,229 bytes, about 99% less. This is a file-size comparison, not a measured network-load time or Lighthouse score.

Images have responsive WebP sources, explicit dimensions and asynchronous decoding for menu photographs. The hero is prioritized, menu images load lazily, and there are no external font requests. Original images are kept for future editing but are not downloaded by the page, except the small existing favicon.

To regenerate the optimized files:

```sh
python -m pip install Pillow
python scripts/optimize_images.py
```

## Validation

```sh
node --test tests/cart.test.mjs
node --check script/script.js
python -m unittest discover -s tests -p "test_*.py"
```

The tests cover last-item removal, mixed totals, invalid saved data, quantity limits, combined menu filters and cache invalidation through the module graph. DOM integration was also checked for filtering, empty states, nested add-button clicks, bag totals, persistence, dialog controls, focus restoration and matching HTML/catalogue prices. Browser checks cover mobile, tablet and desktop layouts, sticky navigation, anchor targets and the bag.

[Earlier landing page](https://scriptingwithsaad.github.io/Saad-Fast-Food-Landing-Page/)
