# Before you go live — Siva Swamy Services

Everything below lives in `data.mjs` unless stated.

## Must do
- [ ] **Domain** — `SITE.domain`, then rebuild.
- [ ] **Web3Forms key** — `SITE.web3formsKey` (free at web3forms.com, using sivaswamyservices@gmail.com). Until then the form sends nothing and points customers to WhatsApp or a call.
- [ ] **Check the gallery labels** — each photo's `work` tag (Installation / Maintenance & Repair) and title were assigned from what the photo shows. Correct any that don't match the actual job.
- [ ] **Brand logos** — add official files as `photos/badge-elica.png`, `badge-racold.png`, `badge-butterfly.png`. Until then the cards show the brand names in text.

- [ ] **Google reviews** — follow GOOGLE-REVIEWS-SETUP.md (Place ID + API key on the server). Until then the Reviews page links to your Google listing.
- [ ] **Sample reviews** — they appear only in `npm run build:preview`. Add genuine reviews (with permission) to `REVIEWS` in `data.mjs` to show them in the same card design on the live site; Google reviews appear automatically once connected.
- [ ] **Upload a production build only** — run `npm run build` (never `build:preview`) before uploading `dist/`.

## When you have them
- [ ] **Prices** — add confirmed prices to `SERVICES[].pricing[].price`. Until then every row says "Contact us for service pricing".
- [ ] **Opening hours** — `SITE.hours` (hidden while empty).
- [ ] **Google Maps embed** — `SITE.googleMapsEmbed` (Google Maps → Share → Embed a map → copy the `src`).
- [ ] **Owner's name** — `PROPRIETOR.name`.
- [ ] **Policies you want to advertise** — e.g. warranty, same-day visits or payment methods. Add them to `WHY` / FAQs only once you're sure you'll honour them.
- [ ] **Hero photo** — a real photo of your technician at work, landscape, would be the strongest image for `photos/hero.jpg`.
- [ ] **Clean logo file (optional)** — `SSS_logo.png` is in place; a transparent PNG or SVG from your designer would make the header badge and favicon even sharper.
