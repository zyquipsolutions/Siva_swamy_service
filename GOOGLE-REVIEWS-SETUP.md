# Google Reviews setup — Siva Swamy Services

The Reviews page (`/reviews`) shows **genuine Google reviews** through a small server endpoint.
The Google API key lives only on the server — never in `data.mjs`, the HTML or the JavaScript.

Until this is set up, the page still works: it shows a "Read All Reviews on Google" card that opens your Google listing, and no rating or review is invented.

## What you need
1. **Google Business Profile** for Siva Swamy Services (verified, with reviews).
2. **Place ID** — open https://developers.google.com/maps/documentation/places/web-service/place-id, search "Siva Swamy Services Perambur", copy the ID (starts with `ChIJ`).
3. **Google Cloud API key** — in Google Cloud Console: create a project → enable **Places API (New)** → set up billing → Credentials → *Create API key* → restrict it to **Places API (New)**.
   Reviews are part of a paid Places data tier; the 10-minute cache keeps calls low, but check the current pricing and free credit in Google Cloud.

## Step 1 — website settings (`data.mjs`)
```js
googlePlaceId: 'ChIJ…',             // enables the "Write a Google Review" button
reviewsEndpoint: '/api/reviews',    // or '/api/reviews.php' on cPanel (see below)
reviewsRefreshMinutes: 15,          // how often an open Reviews page re-checks (min 10)
```
Run `npm run build`.

## Step 2 — the server endpoint (pick ONE)

### A. Cloudflare Workers (recommended)
1. Put the Place ID in `wrangler.jsonc` → `vars.GOOGLE_PLACE_ID`.
2. Store the key as a secret (it is never written to any file):
   ```
   npx wrangler login
   npx wrangler secret put GOOGLE_PLACES_API_KEY
   ```
3. `npm run deploy`. The Worker serves the site and answers `/api/reviews`.

### B. cPanel / Hostinger (PHP)
1. Upload `server/php/api/reviews.php` to `public_html/api/reviews.php`.
2. Copy `server/php/siva-reviews-config.example.php` to **one folder above** `public_html` as `siva-reviews-config.php` and fill in the key and Place ID. (Never inside `public_html`.)
3. In `data.mjs` set `reviewsEndpoint: '/api/reviews.php'`, rebuild and upload `dist/`.

### Check it
Open `https://your-domain/api/reviews` (or `/api/reviews.php`).
- `{"ok":true, … "reviews":[…]}` — working.
- `{"ok":false,"error":"not_configured"}` — key or Place ID missing.
- `{"ok":false,"error":"upstream","status":403}` — key not enabled for Places API (New), billing off, or key restrictions wrong.

## How the page behaves
- Loads reviews when opened; shows the Google rating and review count **only if Google returns them**.
- Re-checks every `reviewsRefreshMinutes` while the tab is visible. A new review is added to the top and a small notification offers **View Review**.
- Returning visitors get one notification for reviews added since their last visit. The same notification is never repeated in one browsing session.
- Remembers only review IDs in the visitor's browser (no names or text).
- Removes cards for reviews Google no longer returns; ignores duplicates; keeps showing the last good data if a refresh fails.
- Filters (Chimney / Water Heater / Hob) are based on which appliance a review mentions, and only appear when at least one review matches.

## Limits to know (Google's, not the website's)
- The Places API returns **up to 5 reviews** per place, chosen by Google (not necessarily the newest). New-review detection therefore only sees reviews inside that set. "Read All Reviews on Google" always links to the full list.
- There is no real-time push from Google; updates appear on the next refresh.
- Showing Google reviews does **not** make the page eligible for star ratings in search results, so the site adds no review structured data.
- Keep Google's attribution (the "Google" labels and author profile links) and review Google Maps Platform terms for caching and display before launch — the default edge/file cache is 10 minutes (`REVIEWS_CACHE_SECONDS`).

## Sample reviews (design/testing only)
`npm run build:preview` (or `npm run dev:preview`) adds 8 clearly labelled **Sample** reviews, a preview banner and a sample notification, and marks the whole site `noindex` with `robots.txt: Disallow: /`.
**Never upload a preview build.** `npm run build` (production) never includes them. To delete them, empty `SAMPLE_REVIEWS` in `data.mjs`.
