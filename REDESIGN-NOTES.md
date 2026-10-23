# Redesign notes — Siva Swamy Services

## Why
The first build followed the reference site (vcare-home-appliance.com) section by section: announcement bar, flat 9-link header, split hero with a floating status card, numbered feature strip, card grid, brand cards, step cards, quote cards and a CTA band. This redesign keeps every business feature and route, and rebuilds the visual identity and composition.

## What changed

| Area | Before (mirrored reference) | Now |
|---|---|---|
| Visual identity | Teal tints, rounded cards, wave dividers, Manrope | "Workbench": warm paper base, deep-teal panels, sand accent, hairline rules, Bricolage Grotesque + Inter, numbered editorial section heads, no waves |
| Header | Announcement bar + 9 flat links + Rate us + Book | 6 primary links + accessible "More" menu, phone number, Book button; full-screen numbered drawer on mobile |
| Home hero | Copy left, photo right, floating "service ticket" card | Dark panel; copy left, **appliance picker** right (tap → booking form pre-filled), 4-fact rail |
| Brands | 3 large cards | One-line strip under the hero |
| Services | 4-column image card grid | Numbered **service index** with live image preview (desktop) |
| Process | Step cards | Vertical timeline beside a photo |
| Why us | Icon list beside stats | Dark section: stat band + ruled 3-column grid |
| Reviews | Equal quote cards | One featured quote + stacked quotes; masonry on the reviews page |
| Areas | Chip cloud | Sticky search + grouped columns (search now also on the home page) |
| Gallery / blog | Separate previews | Combined "workshop" section: bento gallery + article list |
| Closing CTA | Wave band | "Service desk" panel with phone, hours and address |
| Footer | Popular-search cloud + inline areas + rating strip | 4 columns + two ruled SEO link lists |
| Service pages | Stacked sections | Two-column with sticky price/booking card (first on mobile) |
| Pricing | Vertical appliance list + cards | Sticky horizontal tabs + ruled comparison table |
| Booking | Form + photo collage | Form card + "what happens next" rail |
| Mobile bar | Full-width bar | Floating dock (capped width on tablets) |

## Kept unchanged
Routes and URLs, data files, SEO tags, JSON-LD, sitemap, robots, 404, image pipeline, Web3Forms booking + WhatsApp send, OpenStreetMap picker, honeypot, validation, pricing hash links, lightbox, loader, host config files.

## Fixed during the redesign
- The `hidden` attribute is now always respected. Previously a component `display` rule could keep the booking form visible after a successful submit.
- Removed the unused `HERO_TICKET` sample data.
- Long emails/addresses wrap instead of overflowing on small phones.

---

# Round 3 — business corrections (Siva Swamy Services)

| Area | Change |
|---|---|
| Name & contact | "Siva Samy" → **Siva Swamy Services**. Real phone/WhatsApp (+91 89391 15649), email, Perambur address and Google Maps link, all from `SITE` in `data.mjs`. |
| Logo | `photos/logo.png` is the master. The build crops a square emblem (header, favicon, app icons) and a name lockup (footer, loader, social image). |
| Appliances | Now exactly four: Kitchen Chimneys, Built-in Hobs, **Water Heaters** (new), **Kitchen Hoods** (new). Refrigerator, washing machine, oven, microwave and dishwasher pages, prices, posts, icons and links removed. "Ovens" appears only on the Elica brand card/section as specified. |
| Home | Elica authorised band under the hero; three brand cards (Elica, Racold, Butterfly) with Service/Repair/Installation WhatsApp actions; hero photo layered into the hero. |
| Services | Image cards with real job photos and Service / Repair / Installation actions that open the booking form pre-filled. |
| Areas | All 47 supplied entries kept verbatim in `SUPPLIED_AREAS` and shown as 44 distinct localities in three groups; the build fails if any supplied entry is missing. Dummy per-area pages removed. |
| Gallery | 27 selected real photos (from 36 supplied) with category filters and a keyboard-friendly lightbox. |
| Blog | Fridge and washer posts removed; chimney post expanded; new water heater, built-in hob and kitchen hood posts. |
| About | Team photo removed; `photos/owner.jpeg` shown at its natural proportions. |
| Honesty | Dummy rating, reviews, founding year, repair counts, owner quote and dummy coordinates removed. Structured data contains verified facts only. |

---

# Round 4 — content, typography, gallery and local SEO

| Area | Change |
|---|---|
| Services | Three categories: Kitchen Chimneys, Water Heaters, Kitchen Hobs. Island/cylinder hood photos and content are now part of Kitchen Chimneys; `/services/kitchen-hood` removed. Hob URL is now `/services/kitchen-hob`. |
| Claims | Removed draft prices, same-day/24-hour promises, 90-day warranty, "pay after the job", opening hours. Pricing shows "Contact us for service pricing" with a data field per row for future prices. |
| Typography | Manrope (headings, nav, buttons, labels) + Inter (body, forms, prices). Bricolage removed. |
| Palette | Charcoal + gold from the logo, replacing teal. Tokens renamed `--brand-*`. |
| Home | New hero copy and CTAs, three service cards, Elica band, brands, why choose us, how it works, areas, work preview, FAQ (with FAQPage schema), care notes, contact CTA. |
| Services page | Three detailed alternating sections: offerings, common problems, safety note, Book / Call / WhatsApp. |
| Gallery | Rebuilt as "The Appliance Service Studio": asymmetric hero collage, sticky filters (All Work, Chimney, Water Heater, Hob, Installation, Maintenance & Repair), mixed-size masonry grid, detailed lightbox with focus handling, scroll lock, arrow keys and swipe, closing CTA. |
| Form | Shared on /book and /contact. Adds Required service and Preferred date. No success message unless delivery is confirmed; WhatsApp path no longer shows a false success. |
| Feedback | `/testimonials` explains the enquiry process and approach, and links to Google for reviews (no invented reviews). |
| Local SEO | New titles/descriptions per page, Perambur/Chennai keywords in copy, `Get Directions` links, location card, valid LocalBusiness JSON-LD with verified facts and logo. |

---

# Round 5 — Ocean Teal, new logo, Reviews

| Area | Change |
|---|---|
| Theme | Ocean Teal tokens (#064E50, #087F8C, #20B2AA, #B8F3E8, #F4FAF9, #172B2B, #607575, #D8E8E5) across every page, drawer, dock, modals, toasts and loader. Subtle teal gradients on dark panels. All text pairs checked for WCAG AA. |
| Logo | `new_logo.png` used whole (no crop/recolour) everywhere; `logo.png` and all crop code removed. Favicon is a simple teal mark because the full logo is illegible at icon size. Link-preview image is the full logo letterboxed. |
| Reviews | Feedback page renamed to **Reviews** at `/reviews`; `/testimonials` 301-redirects (Netlify/Cloudflare `_redirects`, Apache `.htaccess`, Worker) with a noindex fallback page. |
| Google reviews | Server-side endpoint (Cloudflare Worker + PHP) using Places API (New); key never reaches the browser. Page shows rating/count only when Google returns them, keyword-based category filters, polling, new-review toast and modal, graceful fallbacks. No review structured data. |
| Sample reviews | 8 labelled samples in `SAMPLE_REVIEWS`, included only by `npm run build:preview`, which also marks the site noindex. |

---

# Round 6 — updated logo, photos, reviews redesign, grid interactions

| Area | Change |
|---|---|
| Logo | `updated_logo.png`: circular emblem badge (aqua ring) in the header and favicon; full logo in a rounded teal-gradient frame in the footer, menu and loader; link-preview image letterboxed. `new_logo.png` removed. |
| About | Proprietor photo is now `proprietor_image.png` (natural proportions). |
| Services | New "How we work" feature band with `serviceman_image.png` under the hero. |
| Reviews | New card design for all reviews (sample, own and Google): gradient accent bar, quote watermark, gradient initials avatar, service · area line. 8 new sample reviews (2 each: chimney, water heater, hob, hood; installation / repair / service), preview build only. New Hood Services filter. |
| Grids | Ocean Teal interactions on every grid: service cards (lift, accent bar, image wash, floating icon tile), brand cards (gradient ring), why-us glass tiles, stat underlines, offers, values, contact cards, area columns, pricing rows, posts, gallery tiles, FAQ open state. All respect reduced-motion. |
