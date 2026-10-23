# Siva Swamy Services — Website Guide

A fast static website. Content lives in two data files, images in one folder. A small Node script builds every page into `dist/`, and `dist/` is what you upload to your host.

## 1. Folder structure

```
project/
├─ data.mjs              ← ALL content: business info, services, prices, areas, reviews, blog, FAQs
├─ seo-data.mjs          ← page titles, meta descriptions, footer "Popular searches"
├─ build.mjs             ← generates the site into dist/ (no need to edit)
├─ icons.mjs             ← line icons used across the site
├─ make-placeholders.mjs ← regenerates "Replace me" images for any missing photo
├─ assets/style.css      ← design system (colours at the top in :root)
├─ assets/main.js        ← loader, menu, pricing picker, area search, booking form, map picker, lightbox
├─ photos/               ← your images (same file name replaces the placeholder)
├─ verify/               ← search-engine verification files (copied to site root)
├─ serve.mjs             ← local preview server
├─ src/worker.js         ← Cloudflare Worker: redirects + secure /api/reviews endpoint
├─ server/php/           ← PHP version of /api/reviews for cPanel / Hostinger
├─ wrangler.jsonc        ← optional Cloudflare Workers config
├─ package.json
└─ dist/                 ← THE BUILT WEBSITE — upload this folder's contents
```

## 2. First-time setup

You need Node.js 18 or newer (https://nodejs.org).

```bash
npm install          # installs sharp (image resizing to WebP)
npm run build        # builds dist/
npm run serve        # preview at http://localhost:4173
# or both at once:
npm run dev
```

The build also works without `npm install`. Images are then copied as-is instead of being converted to WebP in three sizes. Always run `npm install` before the final build for best speed.

## 3. Editing content

Open `data.mjs`, change a value, save, then run `npm run build`. Only publish facts the business has confirmed — values marked `// OPTIONAL` stay hidden until you fill them in.

| What | Where in data.mjs |
|---|---|
| Name, phone, WhatsApp, email, address, Maps link, domain | `SITE` |
| Phone links | `SITE.phoneLocal` (`tel:8939115649`); WhatsApp uses `SITE.phoneDigits` (`918939115649`) |
| Opening hours, Google rating, founded year | `SITE.hours`, `SITE.rating`, `SITE.founded` — hidden while empty |
| Google Maps embed (optional) | `SITE.googleMapsEmbed` — paste the `src` from Google Maps → Share → Embed a map. Until then the site shows a location card with **Get Directions** |
| Owner name | `PROPRIETOR.name` (blank shows "Proprietor") |
| Facts under the hero / stat band | `HIGHLIGHTS`, `STATS` |
| Why choose us, How it works, Our approach | `WHY`, `STEPS`, `APPROACH` |
| Services: description, the four offerings, common problems, safety note, FAQs | `SERVICES` |
| Prices | `SERVICES[].pricing[].price` — a number shows `₹…`; `null` shows **Contact us for service pricing** |
| Home and pricing FAQs | `HOME_FAQS`, `PRICING_FAQS` |
| Elica section and brand cards | `AUTHORISED`, `BRANDS` |
| Service areas | `SUPPLIED_AREAS` + `AREA_GROUPS` |
| Google reviews | `googlePlaceId`, `reviewsEndpoint`, `reviewsRefreshMinutes` — see **GOOGLE-REVIEWS-SETUP.md** |
| Your own reviews | `REVIEWS` — genuine reviews you have permission to publish |
| Sample reviews | `SAMPLE_REVIEWS` — preview build only (`npm run build:preview`) |
| Gallery | `GALLERY` — see below |
| Blog posts | `BLOG` — body blocks `['p', text]`, `['h2', text]`, `['ul', [items]]`, `['related', serviceSlug]` |

Page titles and descriptions are in `seo-data.mjs` — keep each one unique.

**Adding a service area:** add `[original, display]` to `SUPPLIED_AREAS` and the display name to one `AREA_GROUPS` group. The build stops with an error if a supplied area is missing from the groups.

**Gallery items:** `{ file, cat, work, size, title, desc }`.
- `file` — photo name in `photos/` without the extension.
- `cat` — `kitchen-chimney`, `water-heater` or `kitchen-hob` (drives the appliance filters).
- `work` — `Installation` or `Maintenance & Repair` (drives those two filters). **These were assigned from what each photo shows — please check them.**
- `size` — `feature` (big), `wide`, `tall` or `small`; mix them for a good layout.
- `title` / `desc` — describe what the photo shows. Don't claim outcomes or customers.

## 4. Replacing photos and logo

Drop a file with the **same name** into `photos/`, delete the old placeholder, then rebuild. `.jpg`, `.png` and `.webp` all work. Upload large originals (1440 px+ wide) and the build resizes them.

| File | Used for | Best shape |
|---|---|---|
| `SSS_logo.png` | The logo (`SITE.logoFile`). Full logo in a rounded frame in the footer, menu, loader and link previews. A circular emblem cut from it (`SITE.logoMarkCrop`) is the header badge and favicon | any — update `logoMarkCrop` if you replace it |
| `favicon.png` | **Optional** square 512 px icon. Without it the favicon is the circular logo emblem | square |
| `hero.jpg` | Home hero background + booking page | landscape, subject on the right |
| `proprietor_image.png` | About page proprietor photo, shown at its natural proportions (`PROPRIETOR.photo`) | portrait |
| `serviceman_image.png` | Services page feature band ("How we work") | landscape 3:2 |
| `prod-chimney.jpg`, `prod-hob.jpg`, `prod-water-heater.jpg` | Service cards, services page, service pages | portrait or 4:3, appliance centred |
| `gallery-<appliance>-NN.jpg` | Gallery, home preview and blog (listed in `GALLERY` / `BLOG`) | any |
| `badge-elica.png`, `badge-racold.png`, `badge-butterfly.png` | Official brand logos for the brand cards and Elica section (name must match `BRANDS[].slug`) | ~3:1, transparent PNG or SVG |
| `og-image.jpg` | **Optional** link preview. If absent, one is made from the logo | 1200×630 |

**Adding a gallery photo:** put it in `photos/` (e.g. `gallery-hob-07.jpg`) and add an item to `GALLERY` (fields above).

## 5. Design system (colours, fonts, spacing)

All visual decisions are tokens at the top of `assets/style.css` (`:root`) — the **Ocean Teal** collection.

| Token | Colour | Used for |
|---|---|---|
| `--brand-900` / `--brand-600` | `#064E50` Deep Ocean Teal | Primary: hero, dark sections, primary buttons |
| `--brand-500` | `#087F8C` Ocean Teal | Secondary: icons, hovers, focus rings |
| `--aqua` / `--sand` | `#20B2AA` Aqua Teal | Accent: dots, lines, large figures on dark (not small text — contrast) |
| `--brand-300` / `--gold` | `#B8F3E8` Light Aqua | Highlights: text on dark, light buttons on dark |
| `--paper` | `#F4FAF9` Soft Sea Mist | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--ink` / `--muted` | `#172B2B` / `#607575` | Primary / secondary text |
| `--line` | `#D8E8E5` | Borders |
| `--brand-700` | `#066B74` | Links on light backgrounds (darker than #087F8C for AA contrast) |
| `--font-head` / `--font-body` | Manrope / Inter | Headings, nav, buttons / body, forms |

All text/background pairs used were checked against WCAG AA.

## 6. Enquiry form (Web3Forms)

The same form appears on **/book** and **/contact**: name, phone, appliance, required service, location (with optional map pin), preferred date and details.

1. Go to https://web3forms.com, enter sivaswamyservices@gmail.com and get a free **Access Key**.
2. Paste it into `SITE.web3formsKey` in `data.mjs` and rebuild.
3. Send a test request from the live site. The email subject reads "New service request — <Appliance> — <Service> — <Name>".

How the form behaves:
- **Without a key:** pressing **Send service request** sends nothing and says so, pointing the customer to WhatsApp or a call. It never shows a success message.
- **With a key:** a success message appears only after Web3Forms confirms delivery, and it states that the visit is confirmed only after you speak with the customer.
- **Send on WhatsApp:** opens WhatsApp with the details filled in and tells the customer to press Send. It doesn't claim the request was delivered.

The map picker uses OpenStreetMap (free, no key; fair-use limited).

## 7. Hosting (when you're ready)

Upload the **contents** of `dist/` to any static host.

- **Cloudflare Pages / Netlify:** drag-and-drop `dist/`, or connect the repo with build command `npm run build` and output folder `dist`. `_headers` sets security and cache headers automatically. Clean URLs (`/about`) work out of the box.
- **cPanel / Apache hosting:** upload into `public_html`. The included `.htaccess` handles clean URLs, HTTPS + non-www redirect, the 404 page and caching.
- **Nginx:** add `try_files $uri $uri.html $uri/ =404;` and `error_page 404 /404.html;`.
- **Cloudflare Workers (optional):** `src/worker.js` and `wrangler.jsonc` are included. Set your domain in `wrangler.jsonc`, then run `npx wrangler login` once and `npm run deploy`. The worker 301-redirects `www.` to the bare domain and serves `dist/` with clean URLs.

Before going live, set `SITE.domain` to your real domain (no trailing slash) and rebuild. Canonical URLs, the sitemap and social previews depend on it.

## 8. SEO checklist after launch

1. **Domain:** set `SITE.domain` and rebuild — canonicals, sitemap, robots.txt and social previews use it.
2. **Google Search Console:** add the domain, verify (HTML file in `verify/` + rebuild, or DNS), then submit `https://your-domain/sitemap.xml`.
3. **Google Business Profile:** keep the name, phone (+91 8939115649), address and category identical to the website. Add the website URL to the profile.
4. **Map embed (optional):** paste the official embed `src` into `SITE.googleMapsEmbed`.
5. **Reviews:** ask happy customers to review you on Google; add genuine ones to `REVIEWS` with permission.
6. **Test:** https://search.google.com/test/rich-results and https://pagespeed.web.dev.

Built in: unique titles and descriptions, one H1 per page, breadcrumbs, canonical tags, Open Graph/Twitter cards, JSON-LD (HomeAndConstructionBusiness, Service, FAQPage, BreadcrumbList, BlogPosting, ImageGallery) with verified facts only, sitemap.xml, robots.txt and a noindex 404.

Target searches are worked naturally into titles, headings and copy: chimney service / cleaning / repair in Chennai and Perambur, water heater service / repair, hob service / kitchen hob repair, and appliance installation.

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| Changes don't show | Run `npm run build` again. Hard-refresh the browser (Ctrl+Shift+R). |
| "WebP resizing: off" in build output | Run `npm install`. |
| `npm install` fails on sharp | Update Node to 18+, or build without it (images are copied as-is). |
| Old photo still appears | Delete the placeholder in `photos/` with the same name but a different extension. |
| Booking emails not arriving | Check the Web3Forms key, check spam, and confirm the email in your Web3Forms dashboard. |
| Map picker won't open | The browser needs internet access to load the map. Typing the address still works. |
| Pages 404 on the host (except home) | The host isn't serving `about.html` for `/about`. See section 7 for your host type. |
| Loading screen | Shows once per browser session, never more than 2.5 s, and is skipped with reduced motion. To remove it, delete the `.loader` line in `build.mjs`. |
