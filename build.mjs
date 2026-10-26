// ============================================================================
//  build.mjs — generates the whole website into dist/
//  Usage: node build.mjs      (optional: `npm install` enables WebP resizing via sharp)
//  You should not need to edit this file to change content — use data.mjs / seo-data.mjs.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  SITE, PROPRIETOR, HIGHLIGHTS, STATS, WHY, STEPS, APPROACH, BRANDS, AUTHORISED, WORK_TYPES, SERVICES,
  HOME_FAQS, PRICING_FAQS, SUPPLIED_AREAS, AREA_GROUPS, REVIEWS, SAMPLE_REVIEWS, SAMPLE_REVIEW_GRID, GALLERY, BLOG,
} from './data.mjs';
import { PAGE_META, SERVICE_PAGES, POPULAR } from './seo-data.mjs';
import { icon } from './icons.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PHOTOS = path.join(ROOT, 'photos');

// Preview build (`npm run build:preview`): adds labelled sample reviews and marks every page noindex.
const PREVIEW = process.argv.includes('--preview');

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* optional */ }

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'img'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, extra = {}) => s.replace(/\{(\w+)\}/g, (_, k) => extra[k] ?? { city: SITE.city, name: SITE.name, areas: AREA_GROUPS.reduce((n, g) => n + g.areas.length, 0) }[k] ?? `{${k}}`);
const abs = (p) => SITE.domain + (p === '/' ? '/' : p);
const wa = (msg) => `https://wa.me/${SITE.phoneDigits}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
const tel = `tel:${SITE.phoneLocal}`;
const ALL_AREAS = AREA_GROUPS.flatMap((g) => g.areas.map((name) => ({ name, group: g.name })));
// every supplied service-area entry must be shown on the site
{
  const shown = new Set(ALL_AREAS.map((a) => a.name));
  const missing = SUPPLIED_AREAS.filter(([, d]) => !shown.has(d));
  if (missing.length) throw new Error('Service areas missing from AREA_GROUPS: ' + missing.map((m) => m[0]).join(', '));
}

const price = (p) => (p == null ? 'On inspection' : `₹${p.toLocaleString('en-IN')}`);
const stars = (n = 5) => `<span class="stars" aria-label="${n} out of 5 stars">${'★'.repeat(n)}</span>`;
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);

// ---------- images ----------
const IMG = {};
const WIDTHS = [480, 960, 1440];
const DEFAULT_DIMS = { hero: [1440, 1080], team: [1440, 960], proprietor: [960, 1200], 'og-image': [1200, 630] };

async function processImages() {
  if (!fs.existsSync(PHOTOS)) return;
  for (const file of fs.readdirSync(PHOTOS)) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
    const name = path.basename(file, ext);
    const src = path.join(PHOTOS, file);
    if (name.startsWith('logo') || name === 'favicon' || (SITE.logoFile && name === SITE.logoFile.replace(/\.\w+$/, ''))) continue; // handled separately
    if (sharp) {
      const meta = await sharp(src).rotate().metadata();
      if (meta.orientation >= 5) [meta.width, meta.height] = [meta.height, meta.width];
      const ws = WIDTHS.filter((w) => w <= meta.width);
      if (!ws.length) ws.push(meta.width);
      const set = [];
      for (const w of ws) {
        const out = `${name}-${w}.webp`;
        await sharp(src).rotate().resize({ width: w }).webp({ quality: name.startsWith('badge') ? 90 : 72 }).toFile(path.join(DIST, 'img', out));
        set.push([`/img/${out}`, w]);
      }
      const last = set[set.length - 1];
      IMG[name] = { src: last[0], srcset: set.map(([u, w]) => `${u} ${w}w`).join(', '), w: meta.width, h: meta.height, fallback: set[Math.min(1, set.length - 1)][0] };
      if (name === 'og-image') {
        await sharp(src).rotate().resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 82 }).toFile(path.join(DIST, 'img', 'og-image.jpg'));
        IMG[name].og = '/img/og-image.jpg';
      }
    } else {
      fs.copyFileSync(src, path.join(DIST, 'img', file));
      const [w, h] = DEFAULT_DIMS[name] || (name.startsWith('badge') ? [360, 120] : name.startsWith('gallery') ? [960, 960] : [960, 720]);
      IMG[name] = { src: `/img/${file}`, w, h, og: `/img/${file}` };
    }
  }
}

function pic(name, alt, { sizes = '(min-width: 1000px) 50vw, 100vw', eager = false, cls = '' } = {}) {
  const im = IMG[name];
  if (!im) return `<div class="img-missing ${cls}" role="img" aria-label="${esc(alt)}">${esc(name)}</div>`;
  return `<img src="${im.fallback || im.src}"${im.srcset ? ` srcset="${im.srcset}" sizes="${sizes}"` : ''} width="${im.w}" height="${im.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ''}>`;
}

// ---------- logo ----------
// photos/SSS_logo.png (SITE.logoFile): the full logo appears in the footer, menu, loader and
// link previews in a rounded square. A circular emblem cut from it (SITE.logoMarkCrop) is the
// header badge and favicon. The original file is copied unchanged.
const LOGO_FILE = SITE.logoFile && fs.existsSync(path.join(PHOTOS, SITE.logoFile)) ? SITE.logoFile : null;
const LOGO = { src: null, srcset: '', w: 0, h: 0, mark: null, mark2: null };
async function processLogo() {
  if (!LOGO_FILE) return;
  const src = path.join(PHOTOS, LOGO_FILE);
  fs.copyFileSync(src, path.join(DIST, 'img', LOGO_FILE));
  if (!sharp) { Object.assign(LOGO, { src: `/img/${LOGO_FILE}`, w: 674, h: 560 }); return; }
  const m = await sharp(src).metadata();
  const base = LOGO_FILE.replace(/\.\w+$/, '');
  const widths = [160, 320, 640, 900].filter((w) => w <= m.width);
  for (const w of widths) await sharp(src).resize({ width: w }).webp({ quality: 90 }).toFile(path.join(DIST, 'img', `${base}-${w}.webp`));
  Object.assign(LOGO, { src: `/img/${base}-${widths[1] || widths[0]}.webp`, srcset: widths.map((w) => `/img/${base}-${w}.webp ${w}w`).join(', '), w: m.width, h: m.height });
  // circular emblem (transparent outside the circle)
  const c = SITE.logoMarkCrop;
  if (c) {
    const area = { left: Math.round(c[0] * m.width), top: Math.round(c[1] * m.height), width: Math.round(c[2] * m.width), height: Math.round(c[3] * m.height) };
    for (const sz of [96, 192, 512]) {
      const mask = Buffer.from(`<svg width="${sz}" height="${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${sz / 2}" fill="#fff"/></svg>`);
      await sharp(src).extract(area).resize(sz, sz).composite([{ input: mask, blend: 'dest-in' }]).png().toFile(path.join(DIST, 'img', `logo-badge-${sz}.png`));
    }
    Object.assign(LOGO, { mark: '/img/logo-badge-96.png', mark2: '/img/logo-badge-192.png' });
  }
  if (!fs.existsSync(path.join(PHOTOS, 'og-image.jpg'))) {
    await sharp(src).resize({ width: 1200, height: 630, fit: 'contain', background: '#2a2c30' }).jpeg({ quality: 86 }).toFile(path.join(DIST, 'img', 'og-image.jpg'));
  }
}
const logoImg = (cls, sizes, lazy = false) => (LOGO.src
  ? `<img src="${LOGO.src}"${LOGO.srcset ? ` srcset="${LOGO.srcset}" sizes="${sizes}"` : ''} alt="Siva Swamy Services logo" class="${cls}" width="${LOGO.w}" height="${LOGO.h}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`
  : '');
const MARK = `<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="24" fill="#064E50"/><path d="M12 24 24 13l12 11M16 21v13h16V21" fill="none" stroke="#B8F3E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const logo = (variant = '') => {
  // the loader logo is visible on first load; the footer and menu copies can load lazily
  if (variant.includes('lockup')) return `<span class="logo-frame ${variant}">${logoImg('logo-full', variant.includes('logo-xl') ? '260px' : variant.includes('drawer-logo') ? '120px' : '200px', !variant.includes('logo-xl')) || MARK}</span>`;
  const badge = LOGO.mark ? `<img src="${LOGO.mark}" srcset="${LOGO.mark} 1x, ${LOGO.mark2} 2x" alt="Siva Swamy Services logo" class="logo-badge" width="48" height="48">` : MARK;
  return `<span class="logo ${variant}">${badge}<span class="logo-text" aria-hidden="true"><b>${esc(SITE.shortName)}</b><small>Services</small></span></span>`;
};

// ---------- assets ----------
const CSS = fs.readFileSync(path.join(ROOT, 'assets/style.css'), 'utf8');
const JS = fs.readFileSync(path.join(ROOT, 'assets/main.js'), 'utf8');
const V = hash(CSS + JS);
fs.writeFileSync(path.join(DIST, 'assets', `style.${V}.css`), CSS);
fs.writeFileSync(path.join(DIST, 'assets', `main.${V}.js`), JS);

// ---------- schema ----------
const ADDRESS_LINE = `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.city} ${SITE.address.postal}`;
// Structured data contains only confirmed business facts (no rating, coordinates or unverified hours).
const BUSINESS_LD = {
  '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', '@id': SITE.domain + '/#business',
  name: SITE.name, description: SITE.description, url: SITE.domain + '/', telephone: SITE.phone, email: SITE.email,
  logo: LOGO_FILE ? { '@type': 'ImageObject', url: abs(`/img/${LOGO_FILE}`) } : abs('/img/logo-badge-512.png'), image: abs('/img/og-image.jpg'), hasMap: SITE.googleMapsLink,
  address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: `${SITE.address.locality}, ${SITE.address.city}`, addressRegion: SITE.region, postalCode: SITE.address.postal, addressCountry: SITE.address.country },
  areaServed: ALL_AREAS.map((a) => ({ '@type': 'Place', name: `${a.name}, ${SITE.city}` })),
  knowsAbout: ['Kitchen chimney installation', 'Kitchen chimney cleaning', 'Water heater repair', 'Water heater installation', 'Kitchen hob service'],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Appliance services', itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: `${s.name} installation, maintenance and repair`, url: abs(`/services/${s.slug}`) } })) },
  ...(Object.values(SITE.social).some(Boolean) ? { sameAs: Object.values(SITE.social).filter(Boolean) } : {}),
};
const WEBSITE_LD = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.domain + '/#website', name: SITE.name, url: SITE.domain + '/', inLanguage: 'en-IN', publisher: { '@id': SITE.domain + '/#business' } };
const pageLD = (p, title, description) => ({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': abs(p) + '#webpage', url: abs(p), name: title, description, inLanguage: 'en-IN', isPartOf: { '@id': SITE.domain + '/#website' }, about: { '@id': SITE.domain + '/#business' } });
const crumbsLD = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(u) })) });
const faqLD = (faqs) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

// ---------- shared chunks ----------
const NAV_PRIMARY = [['Services', '/services'], ['Pricing', '/pricing'], ['Service Areas', '/areas'], ['Gallery', '/gallery'], ['About', '/about'], ['Contact', '/contact']];
const NAV_MORE = [['Blog', '/blog'], ['Reviews', '/reviews']];
const NAV_ALL = [['Home', '/'], ...NAV_PRIMARY, ...NAV_MORE];
const PRICE_TEXT = 'Contact us for service pricing';
const priceText = (p) => (p == null ? PRICE_TEXT : `₹${p.toLocaleString('en-IN')}`);
const bookUrl = (name, need) => `/book?appliance=${encodeURIComponent(name)}${need ? `&need=${encodeURIComponent(need)}` : ''}`;
const ext = 'target="_blank" rel="noopener"';
const areaCount = ALL_AREAS.length;
const svcBySlug = (slug) => SERVICES.find((s) => s.slug === slug);
const callBtn = (cls = 'btn-ghost', label = `Call ${SITE.phone}`) => `<a class="btn ${cls}" href="${tel}">${icon('phone', 'ic', 20)} ${esc(label)}</a>`;
const waBtn = (msg, label = 'Chat on WhatsApp', cls = '') => `<a class="btn btn-wa ${cls}" href="${wa(msg)}" ${ext}>${icon('whatsapp', 'ic', 20)} ${esc(label)}</a>`;
const dirBtn = (cls = 'btn-ghost') => `<a class="btn ${cls}" href="${SITE.googleMapsLink}" ${ext}>${icon('pin', 'ic', 20)} Get Directions</a>`;

function breadcrumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([n, u], i) => i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol></nav>`;
}

function header(active) {
  const on = (u) => (u === '/' ? active === '/' : active === u || active.startsWith(u + '/'));
  const cur = (u) => (on(u) ? ' aria-current="page"' : '');
  const moreActive = NAV_MORE.some(([, u]) => on(u));
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-in">
    <a href="/" class="brand">${logo()}</a>
    <nav class="nav" aria-label="Main">
      <ul class="nav-list">
        ${NAV_PRIMARY.map(([n, u]) => `<li><a href="${u}"${cur(u)}>${n}</a></li>`).join('')}
        <li class="nav-more${moreActive ? ' is-active' : ''}"><details><summary>More</summary><ul>${NAV_MORE.map(([n, u]) => `<li><a href="${u}"${cur(u)}>${n}</a></li>`).join('')}</ul></details></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a class="header-phone" href="${tel}">${icon('phone', 'ic', 20)}<span><small>Call or WhatsApp</small><b>${esc(SITE.phone)}</b></span></a>
      <a class="btn btn-primary btn-sm" href="/book">Book a Service</a>
      <button class="menu-btn" type="button" aria-controls="drawer" aria-expanded="false">${icon('menu', 'ic i-open', 20)}${icon('close', 'ic i-close', 20)}<span>Menu</span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" hidden>
  <nav aria-label="Mobile"><ol>${NAV_ALL.map(([n, u]) => `<li><a href="${u}"${cur(u)}>${n}</a></li>`).join('')}</ol></nav>
  <div class="drawer-actions">
    <a class="btn btn-accent btn-lg" href="/book">Book a Service</a>
    ${waBtn('Hi, I need help with an appliance.', 'Chat on WhatsApp', 'btn-lg')}
    ${callBtn('btn-ghost-light btn-lg')}
  </div>
  <div class="drawer-foot">${logo('lockup drawer-logo')}<p>${esc(ADDRESS_LINE)}</p></div>
</div>`;
}

const contactDesk = () => `
<section class="desk" aria-labelledby="desk-h"><div class="wrap"><div class="desk-in">
  <div class="desk-main">
    <p class="sec-label">Talk to us</p>
    <h2 id="desk-h">Need help with your chimney, water heater or hob?</h2>
    <p>Call or WhatsApp us with your appliance and location. We'll talk through what you need and confirm a visit.</p>
    <div class="btn-row">${callBtn('btn-accent btn-lg', 'Call Now')}${waBtn('Hi, I need help with an appliance.', 'Chat on WhatsApp', 'btn-lg')}</div>
  </div>
  <dl class="desk-facts">
    <div><dt>Call or WhatsApp</dt><dd><a href="${tel}">${esc(SITE.phone)}</a></dd></div>
    <div><dt>Email</dt><dd><a class="desk-mail" href="mailto:${SITE.email}">${esc(SITE.email)}</a></dd></div>
    <div><dt>Address</dt><dd>${esc(ADDRESS_LINE)}<br><a class="desk-map" href="${SITE.googleMapsLink}" ${ext}>${icon('pin', 'ic', 16)} Get Directions</a></dd></div>
  </dl>
</div></div></section>`;

function footer(showDesk = true) {
  return `${showDesk ? contactDesk() : ''}
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand"><a href="/" class="foot-logo">${logo('lockup')}</a><p>Installation, maintenance and repair for kitchen chimneys, water heaters and kitchen hobs in Perambur and across Chennai.</p></div>
      <nav class="foot-col" aria-label="Company"><h3>Company</h3><ul><li><a href="/about">About us</a></li><li><a href="/gallery">Gallery</a></li><li><a href="/blog">Blog</a></li><li><a href="/reviews">Reviews</a></li><li><a href="/areas">Service areas</a></li><li><a href="/contact">Contact</a></li></ul></nav>
      <nav class="foot-col" aria-label="Services"><h3>Services</h3><ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}">${esc(s.name)}</a></li>`).join('')}<li><a href="/pricing">Pricing</a></li><li><a href="/book">Book a Service</a></li></ul></nav>
      <div><h3>Contact</h3><ul class="foot-contact">
        <li>${icon('phone', 'ic', 18)}<a href="${tel}">${esc(SITE.phone)}</a></li>
        <li>${icon('whatsapp', 'ic', 18)}<a href="${wa()}" ${ext}>WhatsApp us</a></li>
        <li>${icon('mail', 'ic', 18)}<a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>
        <li>${icon('pin', 'ic', 18)}<span>${esc(ADDRESS_LINE)}<br><a href="${SITE.googleMapsLink}" ${ext}>Get Directions</a></span></li>
        ${SITE.hours ? `<li>${icon('clock', 'ic', 18)}<span>${esc(SITE.hours)}</span></li>` : ''}</ul></div>
    </div>
    <div class="foot-seo">
      <div><h3>Popular searches</h3><ul class="foot-links">${POPULAR.map(([t, u]) => `<li><a href="${u}">${esc(t)}</a></li>`).join('')}</ul></div>
      <div><h3>Areas we serve</h3><ul class="foot-links">${AREA_GROUPS.map((g) => `<li><a href="/areas#${slugify(g.name)}">${esc(g.name)} (${g.areas.length})</a></li>`).join('')}<li><a href="/areas">All ${areaCount} areas</a></li></ul></div>
    </div>
    <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</span><span>Perambur, Chennai ${esc(SITE.address.postal)}</span></div>
  </div>
</footer>
<div class="dock"><a href="${wa()}" class="d-wa" ${ext}>${icon('whatsapp', 'ic', 20)} WhatsApp</a><a href="${tel}" class="d-call">${icon('phone', 'ic', 20)} Call</a><a href="/book" class="d-book">Book</a></div>
<a class="float-wa" href="${wa()}" ${ext} aria-label="Chat on WhatsApp">${icon('whatsapp', 'ic', 28)}</a>`;
}

function layout({ path: p, title, description, body, schema = [], ogImage, ogImageAlt, ogType = 'website', ogExtra = '', noindex = false, bodyClass = '' }) {
  const og = abs(ogImage || IMG['og-image']?.og || '/img/og-image.jpg');
  const ogAlt = ogImageAlt || (ogImage ? title : `${SITE.name} logo`);
  const ld = [BUSINESS_LD, ...(noindex ? [] : [WEBSITE_LD, pageLD(p, title, description)]), ...schema].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '' : `<link rel="canonical" href="${abs(p)}">\n`}<meta name="robots" content="${noindex || PREVIEW ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta name="theme-color" content="${SITE.themeColor}">
<meta name="geo.region" content="IN-TN"><meta name="geo.placename" content="${esc(SITE.address.locality)}, ${esc(SITE.city)}">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="${esc(SITE.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">${noindex ? '' : `<meta property="og:url" content="${abs(p)}">`}<meta property="og:image" content="${og}"><meta property="og:image:alt" content="${esc(ogAlt)}"><meta property="og:locale" content="en_IN">${ogExtra}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${og}"><meta name="twitter:image:alt" content="${esc(ogAlt)}">
${FAVICON_LINKS}
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="/assets/style.${V}.css">
<script>document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('ss-seen')){document.documentElement.classList.add('loading');sessionStorage.setItem('ss-seen','1')}}catch(e){}</script>
${ld}
</head>
<body class="${bodyClass}">
<div class="loader" aria-hidden="true">${logo('lockup logo-xl')}<span class="loader-bar"></span></div>
${header(p)}
<main id="main">
${body}
</main>
${footer(!['/book', '/contact', '/gallery'].includes(p))}
<script src="/assets/main.${V}.js" defer></script>
</body>
</html>`;
}

// ---------- reusable components ----------
const secHead = ({ n = '', label = '', title, lede = '', action = '', id = '', stack = false }) => `<header class="sec-head${stack ? ' stack' : ''}">
  ${label ? `<p class="sec-label">${n ? `<span>${n}</span>` : ''}${esc(label)}</p>` : '<span></span>'}
  <div class="sec-title"><h2${id ? ` id="${id}"` : ''}>${title}</h2>${lede ? `<p>${lede}</p>` : ''}</div>
  ${action ? `<div class="sec-action">${action}</div>` : ''}
</header>`;
const arrowLink = (href, text) => `<a class="link-arrow" href="${href}">${esc(text)}${icon('arrow', 'ic', 18)}</a>`;

const svcActions = (s) => `<div class="svc-actions" role="group" aria-label="Request ${esc(s.single)} service">${WORK_TYPES.map((n) => `<a class="chip-link" href="${bookUrl(s.name, n)}">${n}</a>`).join('')}</div>`;
const svcCard = (s, i, h = 'h3') => `<article class="svc-card">
  <a class="svc-card-img" href="/services/${s.slug}" tabindex="-1" aria-hidden="true">${pic(s.image, '', { sizes: '(min-width: 1000px) 33vw, (min-width: 760px) 50vw, 100vw', eager: i < 1 })}</a>
  <div class="svc-card-body">
    <span class="svc-ic">${icon(s.icon, 'ic', 22)}</span>
    <${h}><a href="/services/${s.slug}">${esc(s.name)}</a></${h}>
    <p>${esc(s.blurb)}</p>
    ${svcActions(s)}
    ${arrowLink(`/services/${s.slug}`, `${s.name} service details`)}
  </div>
</article>`;

const quote = (r) => `<figure class="quote"><span class="tag">${esc(r.appliance)}</span><blockquote>${esc(r.text)}</blockquote><figcaption class="q-who"><span class="avatar" aria-hidden="true">${esc(r.name[0])}</span><span><strong>${esc(r.name)}</strong><small>${esc(r.area)}</small></span></figcaption></figure>`;

const catName = (slug) => svcBySlug(slug)?.name || 'Appliance care';
const postRow = (b, h = 'h3') => `<li><a class="post-row" href="/blog/${b.slug}"><span class="pr-img">${pic(b.image, '', { sizes: '(min-width: 760px) 300px, 96px' })}</span><span><span class="pr-meta"><span class="tag">${esc(catName(b.category))}</span><time datetime="${b.date}">${fmtDate(b.date)}</time></span><${h}>${esc(b.title)}</${h}><p>${esc(b.excerpt)}</p></span></a></li>`;

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const areaList = (areas) => `<ul class="area-list">${areas.map((a) => `<li><span data-area="${esc(a.toLowerCase())}"${a === SITE.address.locality ? ' class="is-base"' : ''}>${icon('pin', 'ic', 16)}${esc(a)}${a === SITE.address.locality ? ' <em>our base</em>' : ''}</span></li>`).join('')}</ul>`;
const areaCols = () => `<div class="area-cols">${AREA_GROUPS.map((g) => `<div id="${slugify(g.name)}"><h3>${esc(g.name)} <span class="muted">(${g.areas.length})</span></h3>${areaList(g.areas)}</div>`).join('')}</div>`;
const areaSearch = (extra = '') => `<form class="area-search" role="search" onsubmit="return false">
  <label for="area-q">Check your area</label>
  <div class="area-input">${icon('search', 'ic', 20)}<input id="area-q" type="search" placeholder="Type your locality, e.g. Kolathur" autocomplete="off"></div>
  <p class="area-result" id="area-result" aria-live="polite"></p>${extra}
</form>`;
const areaMissing = (h = 'h3') => `<div class="area-missing"><${h}>Not on the list?</${h}><p>Send us your locality and we'll tell you whether we can reach you.</p>${waBtn('Hi, do you serve my area? My locality is: ', 'Ask on WhatsApp', 'btn-sm')}</div>`;

const locationCard = (h = 'h2') => `<div class="loc-card">
  <div class="loc-card-body">
    <p class="sec-label">${icon('pin', 'ic', 16)} Our location</p>
    <${h}>${esc(SITE.name)}</${h}>
    <address>${esc(SITE.address.street)},<br>${esc(SITE.address.locality)}, ${esc(SITE.address.city)} ${esc(SITE.address.postal)}</address>
    <div class="btn-row">${dirBtn('btn-accent')}${callBtn('btn-ghost-light')}</div>
  </div>
  ${SITE.googleMapsEmbed ? `<div class="loc-map"><iframe title="Map showing ${esc(SITE.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${esc(SITE.googleMapsEmbed)}"></iframe></div>` : ''}
</div>`;

const faqList = (faqs) => `<div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const ticks = (items) => `<ul class="ticks">${items.map((i) => `<li>${icon('check', 'ic', 18)}<span>${esc(i)}</span></li>`).join('')}</ul>`;

const pageHero = ({ title, lede = '', crumbs, extra = '', aside = '' }) => `<section class="page-hero"><div class="wrap ph-in${aside ? ' has-aside' : ''}">
  <div>${breadcrumbs(crumbs)}<h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}${extra}</div>
  ${aside ? `<aside class="ph-aside">${aside}</aside>` : ''}
</div></section>`;
const factCard = () => `<div class="fact-card">${HIGHLIGHTS.map((t) => `<p class="fc-row">${icon('check', 'ic', 20)}${esc(t)}</p>`).join('')}</div>`;

const priceTable = (s) => `<div class="price-table" role="table" aria-label="${esc(s.name)} pricing">
  ${s.pricing.map((r) => `<div class="pt-row" role="row"><div role="cell" class="pt-name"><strong>${esc(r.label)}</strong><span class="tag">${esc(r.work)}</span></div><div role="cell" class="pt-price${r.price == null ? ' is-enquire' : ''}">${priceText(r.price)}</div><div role="cell" class="pt-cta"><a class="btn btn-ghost btn-sm" href="${bookUrl(s.name, r.work)}">Enquire</a></div></div>`).join('')}
</div>`;

const safetyNote = (s) => `<p class="safety">${icon('shield', 'ic', 20)}<span><strong>Safety first.</strong> ${esc(s.safety)}</span></p>`;

const brandLogo = (b, cls = 'bc-logo') => (IMG[`badge-${b.slug}`]
  ? `<span class="${cls}">${pic(`badge-${b.slug}`, `${b.name} logo`, { sizes: '200px' })}</span>`
  : `<span class="${cls} is-text">${esc(b.name)}</span>`);
const brandCard = (b) => `<article class="brand-card${b.authorised ? ' is-auth' : ''}">
  <div class="bc-head">${brandLogo(b)}${b.authorised ? `<span class="brand-auth">${icon('shield', 'ic', 14)} Authorised</span>` : ''}</div>
  <h3>${esc(b.name)}</h3>
  <p class="bc-desig">${esc(b.designation)}</p>
  <p class="bc-apps">${b.appliances.map(esc).join(' · ')}</p>
  <ul class="bc-services" aria-label="${esc(b.name)} services">${b.services.map((x) => `<li><a class="chip-link" href="${wa(`Hi, I need ${b.name} ${x.toLowerCase()} (${b.appliances.join(', ').toLowerCase()}).`)}" ${ext}>${icon('check', 'ic', 14)}${esc(x)}</a></li>`).join('')}</ul>
  <a class="btn btn-ghost btn-block bc-cta" href="${wa(`Hi, I'd like to enquire about ${b.name} service.`)}" ${ext}>${icon('whatsapp', 'ic', 18)} Enquire about ${esc(b.name)}</a>
</article>`;

// enquiry form — used on /book and /contact
const enquiryForm = (h = 'h2', title = 'Book a service', lede = 'Tell us about your appliance. We\'ll contact you to discuss it and confirm a visit.') => `
<div class="book-card">
  <${h} class="form-title">${esc(title)}</${h}>
  <p class="lede">${esc(lede)}</p>
  <form id="book-form" class="book-form" novalidate data-key="${esc(SITE.web3formsKey)}" data-wa="${SITE.phoneDigits}" data-phone="${esc(SITE.phone)}" data-site="${esc(SITE.name)}">
    <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input type="hidden" name="Map_location" value="">
    <div class="field"><label for="f-name">Your name <span aria-hidden="true">*</span></label><input id="f-name" name="Name" autocomplete="name" required><span class="err" id="e-name"></span></div>
    <div class="field"><label for="f-mobile">Phone number <span aria-hidden="true">*</span></label><input id="f-mobile" name="Mobile" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="10 digit mobile" required><span class="err" id="e-mobile"></span></div>
    <div class="field"><label for="f-app">Appliance <span aria-hidden="true">*</span></label><select id="f-app" name="Appliance" required><option value="">Choose an appliance</option>${SERVICES.map((s) => `<option>${esc(s.name)}</option>`).join('')}<option>Other</option></select><span class="err" id="e-app"></span></div>
    <div class="field"><label for="f-svc">Required service <span aria-hidden="true">*</span></label><select id="f-svc" name="Service" required><option value="">Choose a service</option>${WORK_TYPES.map((w) => `<option>${w}</option>`).join('')}<option>Not sure</option></select><span class="err" id="e-svc"></span></div>
    <div class="field full"><label for="f-loc">Location <span aria-hidden="true">*</span></label><div class="loc-wrap"><input id="f-loc" name="Location" autocomplete="street-address" placeholder="Flat, street, locality" required><button type="button" class="loc-btn" id="loc-btn" aria-label="Pick location on map">📍</button></div><span class="hint" id="loc-hint">Type your address or tap 📍 to pick it on a map.</span><span class="err" id="e-loc"></span></div>
    <div class="field"><label for="f-date">Preferred date <span class="opt">(optional)</span></label><input id="f-date" name="Preferred_date" type="date"></div>
    <div class="field"><label for="f-prob">Additional details <span class="opt">(optional)</span></label><textarea id="f-prob" name="Problem" rows="2" placeholder="Brand, model, what's wrong"></textarea></div>
    <div class="form-actions full"><button type="submit" class="btn btn-primary btn-lg" id="btn-book">Send service request</button><button type="button" class="btn btn-wa btn-lg" id="btn-wa">${icon('whatsapp', 'ic', 20)} <span class="hide-sm">Send on</span>WhatsApp</button></div>
    <p class="form-status full" id="form-status" role="status" aria-live="polite"></p>
    <p class="form-note full">Sending this form does not book a visit yet. We'll contact you to confirm availability and a time. <span aria-hidden="true">*</span> Required.</p>
  </form>
  <div class="book-success" id="book-success" hidden tabindex="-1"></div>
</div>`;
const mapDialog = () => `<dialog class="map-dialog" id="map-dialog" aria-label="Pick your location">
  <div class="md-head"><strong>Tap the map to set your location</strong><button type="button" class="md-close" aria-label="Close">${icon('close')}</button></div>
  <div id="map" class="md-map"></div>
  <div class="md-foot"><button type="button" class="btn btn-ghost btn-sm" id="md-gps">${icon('locate', 'ic', 18)} Use my current location</button><span id="md-addr" class="md-addr"></span><button type="button" class="btn btn-primary btn-sm" id="md-use" disabled>Use this location</button></div>
</dialog>`;

// gallery card + lightbox (shared by /gallery and the home preview)
const workLabel = (w) => w;
const galCard = (g, i, eager = false) => `<li class="g-item g-${g.size}" data-cat="${g.cat}" data-work="${esc(g.work)}" style="--i:${i % 8}">
  <button type="button" class="g-card" data-full="${IMG[g.file]?.src || ''}" data-title="${esc(g.title)}" data-desc="${esc(g.desc)}" data-cat="${esc(catName(g.cat))}" data-work="${esc(g.work)}" aria-label="View photo: ${esc(g.title)}">
    ${pic(g.file, `${g.title}: ${g.desc}`, { sizes: g.size === 'feature' || g.size === 'wide' ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw', eager })}
    <span class="g-overlay"><span class="g-label">${esc(catName(g.cat))}</span><span class="g-title">${esc(g.title)}</span><span class="g-desc">${esc(g.desc)}</span><span class="g-tag">${esc(workLabel(g.work))}</span></span>
  </button>
</li>`;
const lightbox = () => `<dialog class="studio-lb" id="studio-lb" aria-labelledby="lb-title">
  <div class="lb-media"><img alt="" src="${IMG[GALLERY[0].file]?.src || ''}"></div>
  <div class="lb-info">
    <div class="lb-top"><span class="g-label" id="lb-cat"></span><button type="button" class="lb-x" aria-label="Close">${icon('close', 'ic', 22)}</button></div>
    <h2 id="lb-title"></h2>
    <p id="lb-desc"></p>
    <p class="lb-work"><span class="g-tag" id="lb-work"></span></p>
    <div class="lb-nav"><button type="button" class="lb-btn" id="lb-prev" aria-label="Previous photo">${icon('arrow', 'ic flip', 20)}</button><span id="lb-count" aria-live="polite"></span><button type="button" class="lb-btn" id="lb-next" aria-label="Next photo">${icon('arrow', 'ic', 20)}</button></div>
  </div>
</dialog>`;

const WHY_ICONS = ['tools', 'shield', 'pin', 'check', 'broom', 'phone'];

// ---------- pages ----------
const pages = [];
const add = (p, html) => pages.push([p, html]);
const meta = (k, x) => ({ title: fill(PAGE_META[k].title, x), description: fill(PAGE_META[k].description, x) });

function home() {
  let n = 0; const num = () => String(++n).padStart(2, '0');
  const elica = BRANDS.find((b) => b.slug === AUTHORISED.brand);
  const body = `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-photo" aria-hidden="true">${pic('hero', '', { eager: true, sizes: '(min-width: 980px) 55vw, 100vw' })}</div>
  <div class="wrap">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="hero-status"><span class="dot" aria-hidden="true"></span>${esc(SITE.name)} · Perambur, Chennai</p>
        <h1 id="hero-h">Reliable Chimney, Water Heater &amp; Hob Service in Chennai</h1>
        <p class="lede">Need a kitchen chimney fitted, a water heater repaired or a hob serviced? Talk to Siva Swamy Services about installation, maintenance and repair.</p>
        <div class="btn-row"><a class="btn btn-accent btn-lg" href="/book">Book a Service</a>${waBtn('Hi, I need help with an appliance.', 'Chat on WhatsApp', 'btn-lg')}</div>
        <a class="hero-rating" href="${tel}">${icon('phone', 'ic', 20)}<span>Or call <b>${esc(SITE.phone)}</b></span></a>
      </div>
      <div class="picker">
        <h2>What do you need help with?</h2>
        <p>Pick an appliance and the request form opens with it already filled in.</p>
        <ul class="picker-grid">
          ${SERVICES.map((s) => `<li><a href="${bookUrl(s.name)}">${icon(s.icon, 'ic', 26)}<span>${esc(s.name)}</span><small>Installation · Maintenance · Repair</small></a></li>`).join('')}
          <li class="is-other"><a href="${bookUrl('Other')}">${icon('tools', 'ic', 26)}<span>Something else</span><small>Tell us what it is</small></a></li>
        </ul>
      </div>
    </div>
    <ul class="hero-facts">${HIGHLIGHTS.map((t) => `<li>${icon('check', 'ic', 18)}${esc(t)}</li>`).join('')}</ul>
  </div>
</section>

<section class="auth-band" aria-labelledby="auth-h"><div class="wrap">
  <div class="auth-in">
    <div class="auth-logo">${brandLogo(elica, 'auth-logo-in')}</div>
    <div class="auth-copy">
      <p class="auth-eyebrow">${icon('shield', 'ic', 16)} Authorised service</p>
      <h2 id="auth-h">${esc(AUTHORISED.heading)}</h2>
      <p>${esc(AUTHORISED.text)}</p>
    </div>
    <div class="auth-cta">${waBtn('Hi, I need Elica service.', 'Elica service enquiry')}<a class="btn btn-ghost" href="${bookUrl('Kitchen Chimneys')}">Book a Service</a></div>
  </div>
</div></section>

<section class="sec"><div class="wrap">
  ${secHead({ n: num(), label: 'Our services', title: 'Chimney, water heater and hob services in Chennai.', lede: 'Installation, maintenance and repair for three home appliances, from our base in Perambur. Choose what you need to start a request.', action: arrowLink('/services', 'All service details') })}
  <div class="svc-cards three">${SERVICES.map((s, i) => svcCard(s, i)).join('')}</div>
</div></section>

<section class="sec sec-white"><div class="wrap">
  ${secHead({ n: num(), label: 'Brands', title: 'Authorised for Elica. Experts in Racold and Butterfly.', lede: 'Tap a service to start a WhatsApp enquiry with the brand already mentioned.' })}
  <div class="brand-grid">${BRANDS.map(brandCard).join('')}</div>
</div></section>

<section class="sec sec-ink"><div class="wrap">
  ${secHead({ n: num(), label: 'Why choose us', title: 'A focused, local team for three appliances.', action: `<a class="btn btn-ghost-light btn-sm" href="/about">About us</a>` })}
  <dl class="stat-row">${STATS.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(fill(s.value))}</dd></div>`).join('')}</dl>
  <ul class="why-grid">${WHY.map((w, i) => `<li><h3>${icon(WHY_ICONS[i % WHY_ICONS.length], 'ic', 22)}${esc(w.title)}</h3><p>${esc(w.text)}</p></li>`).join('')}</ul>
</div></section>

<section class="sec sec-paper"><div class="wrap process">
  <div>
    ${secHead({ n: num(), label: 'How it works', title: 'From your first message to a confirmed visit.', stack: true })}
    <ol class="timeline">${STEPS.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    <div class="btn-row" style="margin-top:var(--s5)"><a class="btn btn-primary" href="/book">Book a Service</a>${callBtn('btn-ghost', 'Call Now')}</div>
  </div>
  <figure class="process-photo">${pic('gallery-chimney-03', 'Angled black glass kitchen chimney with flexible ducting above a gas hob', { sizes: '(min-width: 960px) 45vw, 100vw' })}<figcaption><strong>Share a photo on WhatsApp.</strong>A picture of the appliance and its model label helps us understand the job faster.</figcaption></figure>
</div></section>

${REVIEWS.length ? `<section class="sec"><div class="wrap">${secHead({ n: num(), label: 'Customer feedback', title: 'What customers say.' })}<div class="masonry">${REVIEWS.slice(0, 3).map(quote).join('')}</div></div></section>` : ''}

<section class="sec"><div class="wrap">
  ${secHead({ n: num(), label: 'Service areas', title: 'Based in Perambur, serving North, Central and West Chennai.', lede: `${areaCount} localities, from Perambur and Kolathur to Anna Nagar, Ambattur and Avadi.`, action: arrowLink('/areas', 'All service areas') })}
  <div class="areas-body">${areaSearch(areaMissing())}${areaCols()}</div>
</div></section>

<section class="sec sec-studio"><div class="wrap">
  ${secHead({ n: num(), label: 'Our work', title: 'Our work, up close.', lede: 'Real photos of chimneys, water heaters and hobs from homes in Chennai.', action: arrowLink('/gallery', `See all ${GALLERY.length} photos`) })}
  <ul class="g-grid g-preview">${GALLERY.slice(0, 6).map((g, i) => galCard({ ...g, size: ['feature', 'tall', 'small', 'small', 'wide', 'wide'][i] }, i)).join('')}</ul>
</div></section>

<section class="sec sec-white"><div class="wrap faq-layout">
  <div>${secHead({ n: num(), label: 'FAQ', title: 'Frequently asked questions', lede: 'Quick answers about enquiries, appliances and booking.', stack: true })}<div class="btn-row">${waBtn('Hi, I have a question.', 'Ask on WhatsApp', 'btn-sm')}</div></div>
  ${faqList(HOME_FAQS)}
</div></section>

<section class="sec"><div class="wrap">
  ${secHead({ n: num(), label: 'Care notes', title: 'Appliance care tips.', action: arrowLink('/blog', 'All articles') })}
  <ul class="post-list cols">${BLOG.slice(0, 3).map((b) => postRow(b)).join('')}</ul>
</div></section>
${lightbox()}`;
  add('/', layout({ path: '/', ...meta('home'), body, bodyClass: 'is-home', schema: [faqLD(HOME_FAQS)] }));
}

function about() {
  const crumbs = [['Home', '/'], ['About', '/about']];
  const ownerName = PROPRIETOR.name || `${PROPRIETOR.title}, ${SITE.name}`;
  const body = `
${pageHero({ title: `About ${esc(SITE.name)}`, lede: 'A Perambur, Chennai company that installs, maintains and repairs kitchen chimneys, water heaters and kitchen hobs.', crumbs, aside: factCard() })}
<section class="sec"><div class="wrap story">
  <div class="prose">
    <h2>Who we are</h2>
    <p>${esc(SITE.name)} is based on Paddy Fields Road, Perambur. We focus on three appliances that every Chennai home relies on: the kitchen chimney, the water heater and the kitchen hob. For each one, we handle installation, maintenance and repair.</p>
    <p>We are an authorised Elica service company, and we also service Racold water heaters and Butterfly chimneys.</p>
    <h2>The appliances we work on</h2>
    <ul>
      <li><a href="/services/kitchen-chimney">Kitchen chimneys</a>: wall mounted, island and cylinder models. Installation, cleaning, suction problems and repairs.</li>
      <li><a href="/services/water-heater">Water heaters</a>: storage and instant heaters. Installation, maintenance, heating problems and repairs.</li>
      <li><a href="/services/kitchen-hob">Kitchen hobs</a>: built in gas hobs. Installation, burner servicing, ignition problems and repairs.</li>
    </ul>
    <h2>Why maintenance matters</h2>
    <p>A chimney full of grease clears less smoke. A water heater full of scale takes longer to heat. A blocked hob burner burns unevenly. Regular care keeps these appliances working well and helps you catch problems early, especially anything involving gas or electricity, which should always be handled by a professional.</p>
    <h2>How we communicate</h2>
    <p>Every job starts with a conversation. You tell us about the appliance and what you need. We ask the right questions, explain what we recommend in plain language and confirm the visit with you. You can reach us by phone, WhatsApp, email or the enquiry form.</p>
  </div>
  <figure class="owner">
    <div class="owner-photo">${pic(PROPRIETOR.photo, ownerName, { sizes: '(min-width: 960px) 380px, 90vw' })}</div>
    <figcaption><strong>${esc(ownerName)}</strong>${PROPRIETOR.name ? `<span>${esc(PROPRIETOR.title)}</span>` : ''}</figcaption>
  </figure>
</div></section>
<section class="sec sec-paper"><div class="wrap">
  ${secHead({ label: 'Our approach', title: 'How we work with you' })}
  <ul class="values">${APPROACH.map((v) => `<li><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join('')}</ul>
</div></section>
<section class="sec"><div class="wrap two-col">
  <div>${secHead({ label: 'Contact', title: 'Talk to us about your appliance', stack: true })}<p class="muted" style="margin-bottom:var(--s5)">Call, WhatsApp or email us, or visit us in Perambur.</p><div class="btn-row">${callBtn('btn-primary', 'Call Now')}${waBtn('Hi, I need help with an appliance.')}<a class="btn btn-ghost" href="mailto:${SITE.email}">${icon('mail', 'ic', 20)} Email us</a></div></div>
  ${locationCard('h3')}
</div></section>`;
  add('/about', layout({ path: '/about', ...meta('about'), body, schema: [crumbsLD(crumbs)] }));
}

function services() {
  const crumbs = [['Home', '/'], ['Services', '/services']];
  const body = `
${pageHero({ title: 'Chimney, water heater and hob services in Chennai', lede: 'Installation, maintenance and repair for kitchen chimneys, water heaters and kitchen hobs, from our base in Perambur.', crumbs, extra: `<nav class="jump" aria-label="Jump to a service">${SERVICES.map((s) => `<a class="chip-link" href="#${s.slug}">${icon(s.icon, 'ic', 16)} ${esc(s.name)}</a>`).join('')}</nav>` })}
<section class="sec svc-feature" aria-labelledby="svc-feature-h"><div class="wrap svc-feature-in">
  <figure class="svc-feature-img">${pic('serviceman_image', 'Technician in work gloves removing the filter from a wall mounted kitchen chimney above a gas hob', { sizes: '(min-width: 1000px) 58vw, 100vw', eager: true })}</figure>
  <div class="svc-feature-body">
    <p class="sec-label">How we work</p>
    <h2 id="svc-feature-h">Careful, practical work on the appliances you use every day</h2>
    <p>Whether we are removing a chimney filter or testing a hob burner, every visit follows the same approach: understand the problem, explain it clearly and leave the kitchen as tidy as we found it.</p>
    <ul class="feature-points">
      <li>${icon('check', 'ic', 18)}<span>Installation, maintenance and repair for chimneys, water heaters and hobs</span></li>
      <li>${icon('check', 'ic', 18)}<span>Gas and electrical work handled by our technicians</span></li>
      <li>${icon('check', 'ic', 18)}<span>Requirements discussed before every visit</span></li>
    </ul>
    <div class="btn-row"><a class="btn btn-primary" href="/book">Book a Service</a>${callBtn('btn-ghost', 'Call Now')}</div>
  </div>
</div></section>
${SERVICES.map((s, i) => `
<section class="sec svc-section${i % 2 ? ' sec-white is-flip' : ''}" id="${s.slug}" aria-labelledby="h-${s.slug}"><div class="wrap">
  <div class="svc-sec-grid">
    <figure class="svc-sec-img">${pic(s.image, s.imageAlt, { sizes: '(min-width: 1000px) 45vw, 100vw', eager: i === 0 })}</figure>
    <div class="svc-sec-body">
      <p class="sec-label"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.name)}</p>
      <h2 id="h-${s.slug}">${esc(s.single[0].toUpperCase() + s.single.slice(1))} services</h2>
      <p class="svc-intro">${esc(s.intro)}</p>
      <div class="offer-grid">${s.offerings.map((o) => `<div class="offer"><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></div>`).join('')}</div>
      <h3 class="needs-h">Common problems and needs</h3>
      <ul class="needs">${s.needs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${safetyNote(s)}
      <div class="btn-row"><a class="btn btn-primary" href="${bookUrl(s.name)}">Request ${esc(s.short.toLowerCase())} service</a>${callBtn('btn-ghost', 'Call')}${waBtn(`Hi, I need ${s.single} service.`, 'WhatsApp')}</div>
      ${arrowLink(`/services/${s.slug}`, `${s.name}: details and FAQs`)}
    </div>
  </div>
</div></section>`).join('')}`;
  add('/services', layout({ path: '/services', ...meta('services'), body, schema: [crumbsLD(crumbs)] }));

  for (const s of SERVICES) {
    const p = `/services/${s.slug}`;
    const c = [['Home', '/'], ['Services', '/services'], [s.name, p]];
    const others = SERVICES.filter((o) => o.slug !== s.slug);
    const brands = BRANDS.filter((b) => b.appliances.some((a) => a.toLowerCase().includes(s.single.split(' ').pop().slice(0, 5))));
    const posts = BLOG.filter((b) => b.category === s.slug);
    const body = `
${pageHero({ title: `${esc(s.single[0].toUpperCase() + s.single.slice(1))} service &amp; repair in Chennai`, lede: esc(s.intro), crumbs: c })}
<section class="sec"><div class="wrap svc-layout">
  <div class="svc-main">
    <section aria-labelledby="h-offer"><h2 id="h-offer">What we help with</h2><div class="offer-grid">${s.offerings.map((o) => `<div class="offer"><span class="tag">${esc(o.work)}</span><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></div>`).join('')}</div></section>
    <section aria-labelledby="h-problems"><h2 id="h-problems">Common ${esc(s.single)} problems and needs</h2><ol class="issue-list">${s.needs.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>${safetyNote(s)}</section>
    <section aria-labelledby="h-price"><div class="panel-head"><h2 id="h-price" style="margin:0">${esc(s.name)} pricing</h2>${arrowLink(`/pricing#${s.slug}`, 'Pricing page')}</div>${priceTable(s)}</section>
    <section aria-labelledby="h-faq"><h2 id="h-faq">${esc(s.name)}: frequently asked questions</h2>${faqList(s.faqs)}</section>
    ${posts.length ? `<section aria-labelledby="h-read"><h2 id="h-read">Related care tips</h2><ul class="post-list">${posts.map((b) => postRow(b)).join('')}</ul></section>` : ''}
    <section aria-labelledby="h-other"><h2 id="h-other">Our other services</h2><ul class="other-svc">${others.map((o) => `<li><a href="/services/${o.slug}">${icon(o.icon, 'ic', 18)}${esc(o.name)}</a></li>`).join('')}</ul></section>
  </div>
  <aside class="svc-aside">
    <div class="aside-card">
      <div class="ac-img">${pic(s.image, s.imageAlt, { eager: true, sizes: '(min-width: 1000px) 340px, 100vw' })}</div>
      <div class="ac-body">
        <p class="ac-price">Pricing<b class="is-enquire">${PRICE_TEXT}</b></p>
        ${svcActions(s)}
        <a class="btn btn-primary btn-lg btn-block" href="${bookUrl(s.name)}">Request ${esc(s.short.toLowerCase())} service</a>
        ${callBtn('btn-ghost btn-block', 'Call Now')}
        ${waBtn(`Hi, I need ${s.single} service.`, 'Chat on WhatsApp', 'btn-block')}
        ${brands.length ? `<p class="ac-brands">${brands.map((b) => `<span>${esc(b.name)} · ${esc(b.designation)}</span>`).join('')}</p>` : ''}
      </div>
    </div>
  </aside>
</div></section>`;
    add(p, layout({ path: p, title: fill(SERVICE_PAGES[s.slug].title), description: fill(SERVICE_PAGES[s.slug].description), body, ogImage: IMG[s.image]?.src, ogImageAlt: s.imageAlt, schema: [crumbsLD(c), faqLD(s.faqs), { '@context': 'https://schema.org', '@type': 'Service', '@id': abs(p) + '#service', name: `${s.single[0].toUpperCase() + s.single.slice(1)} installation, maintenance and repair`, serviceType: `${s.name} installation, maintenance and repair`, description: s.intro, provider: { '@id': SITE.domain + '/#business' }, areaServed: { '@type': 'City', name: 'Chennai' }, ...(IMG[s.image] ? { image: abs(IMG[s.image].src) } : {}), url: abs(p) }] }));
  }
}

function pricing() {
  const crumbs = [['Home', '/'], ['Pricing', '/pricing']];
  const body = `
${pageHero({ title: 'Service pricing', lede: 'Pricing depends on your appliance, its brand and model, and the work needed. Contact us with the details and we will discuss the cost with you.', crumbs, extra: `<div class="btn-row">${waBtn('Hi, I would like pricing for: ', 'Ask for pricing on WhatsApp', 'btn-lg')}${callBtn('btn-ghost btn-lg', 'Call Now')}</div>` })}
<div class="price-tabs"><div class="wrap">
  <div class="price-nav" role="tablist" aria-label="Choose an appliance" style="--tabs:${SERVICES.length}">
    ${SERVICES.map((s, i) => `<button type="button" role="tab" id="tab-${s.slug}" aria-controls="panel-${s.slug}" aria-selected="${i === 0}" data-slug="${s.slug}">${icon(s.icon, 'ic', 20)}<span><strong>${esc(s.name)}</strong><small>Installation · Maintenance · Repair</small></span></button>`).join('')}
  </div>
</div></div>
<section class="sec"><div class="wrap">
  <div class="price-panels">
    ${SERVICES.map((s, i) => `<div class="price-panel" role="tabpanel" id="panel-${s.slug}" aria-labelledby="tab-${s.slug}" data-slug="${s.slug}"${i ? ' data-hidden' : ''}>
      <div class="panel-head"><h2 id="${s.slug}">${esc(s.name)}</h2>${arrowLink(`/services/${s.slug}`, 'About this service')}</div>
      ${priceTable(s)}</div>`).join('')}
    <div class="price-cta"><div><strong>Discuss your appliance</strong><p>Tell us the appliance type, brand, model and the service you need.</p></div><div class="btn-row">${waBtn('Hi, I would like pricing for: ', 'WhatsApp')}<a class="btn btn-light" href="/book">Send a request</a></div></div>
  </div>
</div></section>
<section class="sec sec-white"><div class="wrap faq-layout">
  <div>${secHead({ label: 'FAQ', title: 'Pricing questions', stack: true })}</div>
  ${faqList(PRICING_FAQS)}
</div></section>`;
  add('/pricing', layout({ path: '/pricing', ...meta('pricing'), body, schema: [crumbsLD(crumbs), faqLD(PRICING_FAQS)] }));
}

function areas() {
  const crumbs = [['Home', '/'], ['Service Areas', '/areas']];
  const body = `
${pageHero({ title: 'Appliance services in Perambur, Chennai', lede: `Our workshop is on Paddy Fields Road, Perambur. From here we provide chimney, water heater and hob services across ${areaCount} localities in North, Central and West Chennai.`, crumbs, extra: `<div class="btn-row">${callBtn('btn-primary btn-lg', 'Call Now')}${waBtn('Hi, do you serve my area? My locality is: ', 'Check availability', 'btn-lg')}</div>` })}
<section class="sec"><div class="wrap two-col areas-intro">
  <div class="prose">
    <h2>Chimney, water heater and hob services near Perambur</h2>
    <p>If you live in Perambur or a nearby locality, we can usually help with kitchen chimney cleaning and installation, water heater repair and installation, and kitchen hob service. Use the search below to check your area, or send us your locality on WhatsApp and we will confirm.</p>
    <p>Looking for <a href="/services/kitchen-chimney">chimney service</a>, <a href="/services/water-heater">water heater repair</a> or <a href="/services/kitchen-hob">hob service</a> near you? Just send us a quick message with your locality and the appliance.</p>
  </div>
  ${locationCard()}
</div></section>
<section class="sec sec-paper"><div class="wrap">
  ${secHead({ label: 'Localities', title: `The ${areaCount} localities we serve` })}
  <div class="areas-body">${areaSearch(areaMissing('h3'))}${areaCols()}</div>
</div></section>`;
  add('/areas', layout({ path: '/areas', ...meta('areas'), body, schema: [crumbsLD(crumbs)] }));
}

// ---------- reviews ----------
const REVIEW_CATS = [['kitchen-chimney', 'Chimney Services'], ['water-heater', 'Water Heater Services'], ['kitchen-hob', 'Hob Services'], ['kitchen-hood', 'Hood Services']];
const REVIEW_CAT_NAMES = { 'kitchen-chimney': 'Kitchen Chimney', 'water-heater': 'Water Heater', 'kitchen-hob': 'Kitchen Hob', 'kitchen-hood': 'Kitchen Hood' };
const writeReviewUrl = SITE.googlePlaceId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(SITE.googlePlaceId)}` : '';
const starRow = (n) => `<span class="rv-stars" role="img" aria-label="${n} out of 5 stars">${'★'.repeat(n)}<span class="rv-stars-off">${'★'.repeat(5 - n)}</span></span>`;
const rvCard = ({ id, cat, name, initial, rating, date, dateText, text, service, area, badge, badgeCls, source, sample }) => `<li class="rv-item" data-cat="${cat || 'general'}" data-id="${esc(id)}"><article class="rv-card${sample ? ' is-sample' : ''}">
  <div class="rv-top">${rating ? starRow(rating) : '<span></span>'}${badge ? `<span class="rv-badge ${badgeCls}">${esc(badge)}</span>` : ''}</div>
  <blockquote class="rv-text">${esc(text)}</blockquote>
  <footer class="rv-who">
    <span class="rv-avatar" aria-hidden="true">${esc(initial)}</span>
    <div><h3 class="rv-name">${esc(name)}</h3><p class="rv-service">${[service, area].filter(Boolean).map(esc).join(' · ')}</p></div>
    ${dateText ? `<time class="rv-date" datetime="${esc(date || '')}">${esc(dateText)}</time>` : ''}
  </footer>
  ${source ? `<p class="rv-src">${source}</p>` : ''}
</article></li>`;
const sampleCard = (r) => rvCard({ id: r.id, cat: r.category, name: r.name, initial: r.name[0], rating: r.rating, date: r.date, dateText: fmtDate(r.date), text: r.text,
  service: `${REVIEW_CAT_NAMES[r.category] || 'Appliance'} ${r.work.toLowerCase()}`, area: r.area, badge: 'Sample', badgeCls: 'rv-badge-sample', sample: true });
const ownCard = (r, i) => rvCard({ id: `own-${i}`, cat: r.category || '', name: r.name, initial: r.name[0], rating: r.rating, text: r.text, service: r.appliance, area: r.area });

const quoteMark = '<svg class="srv-quote" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M13 8c-4.4 1.6-7 5.2-7 10.2V24h7.4v-7.2H9.6c.1-2.9 1.6-5 4.4-6.2L13 8zm13 0c-4.4 1.6-7 5.2-7 10.2V24h7.4v-7.2h-3.8c.1-2.9 1.6-5 4.4-6.2L26 8z"/></svg>';
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
const sampleGridCard = (r) => `<li class="srv-item"><article class="srv-card">
  <div class="srv-top">
    <span class="srv-avatar" aria-hidden="true">${esc(initials(r.name))}</span>
    <div class="srv-who"><h4 class="srv-name">${esc(r.name)}</h4><p class="srv-topic">${esc(r.topic)}</p></div>
    ${quoteMark}
  </div>
  ${starRow(r.rating)}
  <p class="srv-text">${esc(r.text)}</p>
</article></li>`;
const sampleGrid = () => SAMPLE_REVIEW_GRID.length ? `
  <section class="srv" aria-labelledby="srv-h">
    <div class="srv-head">
      <h3 id="srv-h">Sample Reviews</h3>
      <p class="srv-note" role="note">${icon('shield', 'ic', 18)}<span><strong>For layout demonstration only.</strong> These are fictional examples, not verified customer testimonials and not Google reviews. Real customer reviews are on our Google listing.</span></p>
    </div>
    <ul class="srv-grid">${SAMPLE_REVIEW_GRID.map(sampleGridCard).join('')}</ul>
  </section>` : '';

function reviews() {
  const crumbs = [['Home', '/'], ['Reviews', '/reviews']];
  const samples = PREVIEW ? SAMPLE_REVIEWS : [];
  const cfg = { endpoint: SITE.reviewsEndpoint || '', refreshMinutes: Math.max(10, SITE.reviewsRefreshMinutes || 15), mapsUrl: SITE.googleMapsLink, preview: PREVIEW };
  const body = `
<section class="rv-hero" aria-labelledby="rv-h"><div class="wrap rv-hero-in">
  <div>
    ${breadcrumbs(crumbs)}
    <p class="studio-eyebrow">Customer reviews</p>
    <h1 id="rv-h">What Our Customers Say</h1>
    <p class="lede">${esc(SITE.name)} provides installation, maintenance and repair for kitchen chimneys, water heaters and kitchen hobs from Perambur, Chennai. Read what customers say on Google, or share your own experience after a visit.</p>
    <div class="btn-row">
      <a class="btn btn-primary btn-lg" href="${SITE.googleMapsLink}" ${ext}>${icon('star', 'ic', 20)} Read All Reviews on Google</a>
      ${writeReviewUrl ? `<a class="btn btn-ghost btn-lg" href="${writeReviewUrl}" ${ext}>Write a Google Review</a>` : ''}
    </div>
  </div>
  <aside class="rv-summary" id="rv-summary" aria-live="polite" aria-busy="true">
    <div class="rv-summary-state" data-state="loading"><span class="rv-skel rv-skel-big"></span><span class="rv-skel"></span><span class="rv-skel rv-skel-short"></span></div>
  </aside>
</div></section>

${PREVIEW ? `<div class="preview-bar" role="note"><div class="wrap">${icon('shield', 'ic', 18)}<p><strong>Preview build.</strong> The 8 reviews marked “Sample” are placeholder content for design and testing. They are not real customers and are not included in the production build.</p></div></div>` : ''}

<section class="sec rv-section" aria-labelledby="rv-list-h"><div class="wrap">
  <div class="rv-toolbar">
    <h2 id="rv-list-h">Customer reviews</h2>
    <div class="g-filter rv-filter" role="group" aria-label="Filter reviews">
      <button type="button" class="g-chip" data-filter="all" aria-pressed="true">All Reviews <span id="rvc-all">0</span></button>
      ${REVIEW_CATS.map(([k, l]) => `<button type="button" class="g-chip" data-filter="${k}" aria-pressed="false">${esc(l)} <span id="rvc-${k}">0</span></button>`).join('')}
    </div>
  </div>
  <p class="rv-filter-note">Reviews are sorted by the appliance they mention. Reviews that mention none appear under All Reviews only.</p>
  <div class="rv-status" id="rv-status" role="status" aria-live="polite"></div>
  <ul class="rv-grid" id="rv-grid" data-config='${esc(JSON.stringify(cfg))}'>
    ${samples.map(sampleCard).join('')}
    ${REVIEWS.map(ownCard).join('')}
  </ul>
  <div class="rv-empty" id="rv-empty" hidden>
    <h3>See our reviews on Google</h3>
    <p>Our Google reviews couldn't be shown here right now. You can read every review on our Google listing.</p>
    <div class="btn-row"><a class="btn btn-primary" href="${SITE.googleMapsLink}" ${ext}>${icon('star', 'ic', 18)} Read All Reviews on Google</a>${writeReviewUrl ? `<a class="btn btn-ghost" href="${writeReviewUrl}" ${ext}>Write a Google Review</a>` : ''}</div>
  </div>
  <p class="rv-attrib" id="rv-attrib" hidden>Reviews from <strong>Google</strong>. Reviewer names link to their Google profiles. <span id="rv-updated"></span></p>
  ${sampleGrid()}
</div></section>

<section class="sec sec-white"><div class="wrap rv-cta-grid">
  <div class="rv-share">
    <h2>Had a service from us?</h2>
    <p>A short Google review helps other families in Chennai find reliable help for their chimney, water heater or hob.</p>
    <div class="btn-row">${writeReviewUrl ? `<a class="btn btn-primary" href="${writeReviewUrl}" ${ext}>Write a Google Review</a>` : `<a class="btn btn-primary" href="${SITE.googleMapsLink}" ${ext}>${icon('pin', 'ic', 18)} Open our Google listing</a>`}${waBtn('Hi, I would like to share feedback about my recent service.', 'Send feedback on WhatsApp')}</div>
  </div>
  <div>${secHead({ label: 'How we work', title: 'What happens when you contact us', stack: true })}<ol class="timeline">${STEPS.map((x) => `<li><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></li>`).join('')}</ol></div>
</div></section>

<div class="rv-toast" id="rv-toast" role="status" aria-live="polite" hidden>
  <span class="rv-toast-dot" aria-hidden="true"></span>
  <div class="rv-toast-body"><p class="rv-toast-title">New customer review</p><p class="rv-toast-text" id="rv-toast-text"></p></div>
  <button type="button" class="btn btn-accent btn-sm" id="rv-toast-view">View Review</button>
  <button type="button" class="rv-toast-x" id="rv-toast-x" aria-label="Dismiss notification">${icon('close', 'ic', 18)}</button>
</div>
<dialog class="rv-modal" id="rv-modal" aria-labelledby="rv-modal-name">
  <div class="rv-modal-in">
    <button type="button" class="lb-x rv-modal-x" aria-label="Close">${icon('close', 'ic', 20)}</button>
    <div id="rv-modal-content"></div>
  </div>
</dialog>`;
  add('/reviews', layout({ path: '/reviews', ...meta('reviews'), body, bodyClass: 'is-reviews', schema: [crumbsLD(crumbs)] }));
}

function gallery() {
  const crumbs = [['Home', '/'], ['Gallery', '/gallery']];
  const count = (f) => GALLERY.filter(f).length;
  const filters = [
    ['all', 'All Work', GALLERY.length],
    ...SERVICES.map((s) => [`cat:${s.slug}`, `${s.short === 'Water heater' ? 'Water Heater' : s.short} Services`, count((g) => g.cat === s.slug)]),
    ['work:Installation', 'Installation', count((g) => g.work === 'Installation')],
    ['work:Maintenance & Repair', 'Maintenance & Repair', count((g) => g.work === 'Maintenance & Repair')],
  ];
  const heroPics = [GALLERY[0], GALLERY[1], GALLERY[4]];
  const body = `
<section class="studio-hero" aria-labelledby="studio-h"><div class="wrap studio-in">
  <div class="studio-copy">
    ${breadcrumbs(crumbs)}
    <p class="studio-eyebrow">The Appliance Service Studio</p>
    <h1 id="studio-h">Our Work, <em>Up Close</em></h1>
    <p class="lede">A look at the chimney, water heater and hob installation and servicing work done by Siva Swamy Services.</p>
    <dl class="studio-stats">${SERVICES.map((s) => `<div><dt>${esc(s.name)}</dt><dd>${count((g) => g.cat === s.slug)}</dd></div>`).join('')}</dl>
    <a class="link-arrow" href="#work">Browse ${GALLERY.length} photos${icon('arrow', 'ic', 18)}</a>
  </div>
  <div class="studio-collage" aria-hidden="true">
    ${heroPics.map((g, i) => `<figure class="sc-${i + 1}">${pic(g.file, '', { eager: true, sizes: i ? '240px' : '(min-width: 1000px) 420px, 60vw' })}</figure>`).join('')}
    <span class="sc-frame"></span>
  </div>
</div></section>
<section class="studio" id="work" aria-label="Photo gallery">
  <div class="studio-bar"><div class="wrap">
    <div class="g-filter" role="group" aria-label="Filter photos">
      ${filters.map(([k, label, c], i) => `<button type="button" class="g-chip" data-filter="${esc(k)}" aria-pressed="${i === 0}">${esc(label)} <span>${c}</span></button>`).join('')}
    </div>
    <p class="g-count" id="g-count" aria-live="polite">Showing all ${GALLERY.length} photos</p>
  </div></div>
  <div class="wrap"><ul class="g-grid" id="g-grid">${GALLERY.map((g, i) => galCard(g, i, i < 2)).join('')}</ul>
  <p class="g-note">Photos are from homes we have worked in. Category labels describe the appliance and type of work shown.</p></div>
</section>
<section class="studio-cta" aria-labelledby="gcta-h"><div class="wrap studio-cta-in">
  <div><h2 id="gcta-h">Need Help With Your Home Appliances?</h2><p>Get in touch with Siva Swamy Services to talk about what your chimney, water heater or hob needs.</p></div>
  <div class="btn-row">${callBtn('btn-accent btn-lg', 'Call Now')}${waBtn('Hi, I need help with an appliance.', 'Chat on WhatsApp', 'btn-lg')}</div>
</div></section>
${lightbox()}`;
  add('/gallery', layout({ path: '/gallery', ...meta('gallery'), body, bodyClass: 'is-gallery', schema: [crumbsLD(crumbs), { '@context': 'https://schema.org', '@type': 'ImageGallery', name: `${SITE.name} gallery`, url: abs('/gallery'), image: GALLERY.map((g) => ({ '@type': 'ImageObject', contentUrl: abs(IMG[g.file]?.src || ''), name: g.title, description: g.desc })) }] }));
}

function blog() {
  const crumbs = [['Home', '/'], ['Blog', '/blog']];
  add('/blog', layout({ path: '/blog', ...meta('blog'), schema: [crumbsLD(crumbs)], body: `
${pageHero({ title: 'Appliance care and maintenance tips', lede: 'Practical, safe advice for kitchen chimneys, water heaters and kitchen hobs.', crumbs })}
<section class="sec"><div class="wrap"><ul class="post-list large">${BLOG.map((b) => postRow(b, 'h2')).join('')}</ul></div></section>` }));

  for (const b of BLOG) {
    const p = `/blog/${b.slug}`;
    const c = [['Home', '/'], ['Blog', '/blog'], [b.title, p]];
    const block = ([t, v]) => {
      if (t === 'ul') return `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
      if (t === 'related') { const s = svcBySlug(v); return s ? `<aside class="related-svc">${icon(s.icon, 'ic', 24)}<div><strong>Need help with your ${esc(s.single)}?</strong><p>See our <a href="/services/${s.slug}">${esc(s.single)} services in Chennai</a>, or <a href="${bookUrl(s.name)}">send a service request</a>.</p></div></aside>` : ''; }
      return `<${t}>${esc(v)}</${t}>`;
    };
    const html = b.body.map(block).join('\n');
    const related = BLOG.filter((x) => x.slug !== b.slug && (x.category === b.category || !b.category)).slice(0, 3);
    const svc = svcBySlug(b.category);
    const body = `
<article>
  <header class="wrap narrow post-head">${breadcrumbs(c)}<h1>${esc(b.title)}</h1><p class="post-meta">${svc ? `<a class="tag" href="/services/${svc.slug}">${esc(svc.name)}</a> ` : ''}By the ${esc(SITE.name)} team · <time datetime="${b.date}">${fmtDate(b.date)}</time></p></header>
  <div class="wrap narrow">
    <div class="post-cover">${pic(b.image, b.imageAlt, { eager: true, sizes: '(min-width: 800px) 780px, 100vw' })}</div>
    <div class="prose">${html}</div>
    <aside class="post-cta"><div><strong>Need a technician?</strong><p>Call, WhatsApp or send a request, and we'll contact you to confirm.</p></div><div class="btn-row"><a class="btn btn-light" href="${svc ? bookUrl(svc.name) : '/book'}">Book a Service</a>${callBtn('btn-ghost-light', 'Call')}</div></aside>
  </div>
</article>
${related.length ? `<section class="sec"><div class="wrap narrow">${secHead({ label: 'Keep reading', title: 'Related articles', stack: true })}<ul class="post-list">${related.map((r) => postRow(r)).join('')}</ul></div></section>` : ''}`;
    add(p, layout({ path: p, title: `${b.title} | ${SITE.name}`, description: b.excerpt, body, ogImage: IMG[b.image]?.src, ogImageAlt: b.imageAlt, ogType: 'article', ogExtra: `<meta property="article:published_time" content="${b.date}">`, schema: [crumbsLD(c), { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: b.title, description: b.excerpt, datePublished: b.date, dateModified: b.date, image: abs(IMG[b.image]?.src || '/img/og-image.jpg'), author: { '@type': 'Organization', name: SITE.name }, publisher: { '@id': SITE.domain + '/#business' }, mainEntityOfPage: abs(p) }] }));
  }
}

function contact() {
  const crumbs = [['Home', '/'], ['Contact', '/contact']];
  const body = `
${pageHero({ title: 'Contact Siva Swamy Services', lede: 'Call, WhatsApp, email or send a service request. We are on Paddy Fields Road, Perambur, Chennai.', crumbs })}
<section class="sec"><div class="wrap contact">
  <div class="contact-side">
    <ul class="contact-cards">
      <li><span class="ci">${icon('phone')}</span><div><h2>Phone</h2><a href="${tel}">${esc(SITE.phone)}</a><a class="sub" href="${tel}">Tap to call</a></div></li>
      <li><span class="ci">${icon('whatsapp')}</span><div><h2>WhatsApp</h2><a href="${wa()}" ${ext}>${esc(SITE.phone)}</a><a class="sub" href="${wa('Hi, I need help with an appliance.')}" ${ext}>Start a chat</a></div></li>
      <li><span class="ci">${icon('mail')}</span><div><h2>Email</h2><a href="mailto:${SITE.email}">${esc(SITE.email)}</a></div></li>
      <li><span class="ci">${icon('pin')}</span><div><h2>Address</h2><address>${esc(ADDRESS_LINE)}</address><a class="sub" href="${SITE.googleMapsLink}" ${ext}>Get Directions</a></div></li>
      ${SITE.hours ? `<li><span class="ci">${icon('clock')}</span><div><h2>Hours</h2><p>${esc(SITE.hours)}</p></div></li>` : ''}
    </ul>
  </div>
  ${enquiryForm('h2', 'Send a service enquiry')}
</div></section>
<section class="sec sec-paper"><div class="wrap">${locationCard()}</div></section>
${mapDialog()}`;
  add('/contact', layout({ path: '/contact', ...meta('contact'), body, schema: [crumbsLD(crumbs)] }));
}

function book() {
  const body = `
<section class="book"><div class="wrap book-in">
  ${enquiryForm('h1', 'Book a service')}
  <aside class="book-rail" aria-label="What happens after you send a request">
    <div class="rail-photo">${pic('hero', '', { sizes: '380px' })}<span class="rail-badge">${icon('shield', 'ic', 14)} Elica authorised service</span></div>
    <h2>What happens next</h2>
    <ol class="timeline timeline-light">${STEPS.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    <ul class="rail-contact"><li>${icon('phone', 'ic', 18)}<a href="${tel}">${esc(SITE.phone)}</a></li><li>${icon('mail', 'ic', 18)}<a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li><li>${icon('pin', 'ic', 18)}<a href="${SITE.googleMapsLink}" ${ext}>Get Directions</a></li></ul>
  </aside>
</div></section>
${mapDialog()}`;
  add('/book', layout({ path: '/book', ...meta('book'), body, bodyClass: 'is-book' }));
  fs.writeFileSync(path.join(DIST, 'assets', 'geo.json'), JSON.stringify(SITE.mapCenter));
}

function notFound() {
  add('/404', layout({ path: '/404', title: `Page not found | ${SITE.name}`, description: 'This page does not exist.', noindex: true, body: `
${pageHero({ title: "This page doesn't exist", lede: 'The link may be old or mistyped. Try one of these instead.', crumbs: [['Home', '/'], ['Not found', '/404']], extra: `<div class="btn-row"><a class="btn btn-primary btn-lg" href="/">Go to the home page</a><a class="btn btn-ghost btn-lg" href="/services">See our services</a>${callBtn('btn-ghost btn-lg', 'Call Now')}</div>` })}` }));
}

// ---------- favicon ----------
let HAS_PNG_ICONS = false;
let FAVICON_LINKS = '';
async function favicons() {
  // The full logo is not legible at 16–64 px, so the favicon is a simple teal house mark.
  // Replace with a proper icon file by adding photos/favicon.png (square, 512 px) if you have one.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#064E50"/><path d="M12 24 24 13l12 11M16 21v13h16V21" fill="none" stroke="#B8F3E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  fs.writeFileSync(path.join(DIST, 'favicon.svg'), svg);
  const custom = path.join(PHOTOS, 'favicon.png');
  const badge = path.join(DIST, 'img', 'logo-badge-512.png');
  const iconSrc = fs.existsSync(custom) ? custom : fs.existsSync(badge) ? badge : Buffer.from(svg);
  if (sharp) {
    for (const [f, sz] of [['favicon.png', 32], ['favicon-64.png', 64], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) await sharp(iconSrc, { density: 400 }).resize(sz, sz).png().toFile(path.join(DIST, f));
    HAS_PNG_ICONS = true;
  }
  FAVICON_LINKS = HAS_PNG_ICONS ? '<link rel="icon" href="/favicon.png" sizes="32x32" type="image/png"><link rel="icon" href="/favicon-64.png" sizes="64x64" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">' : '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
  fs.writeFileSync(path.join(DIST, 'site.webmanifest'), JSON.stringify({ name: SITE.name, short_name: SITE.shortName, start_url: '/', display: 'standalone', background_color: '#F4FAF9', theme_color: SITE.themeColor, icons: HAS_PNG_ICONS ? [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] : [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2));
}

// ---------- run ----------
await processImages();
await processLogo();
await favicons();
home(); about(); services(); pricing(); areas(); reviews(); gallery(); blog(); contact(); book(); notFound();


for (const [p, html] of pages) {
  const file = p === '/' ? 'index.html' : p.slice(1) + '.html';
  const out = path.join(DIST, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

const today = new Date().toISOString().slice(0, 10);
const prio = (p) => (p === '/' ? '1.0' : p.split('/').length === 2 ? '0.8' : '0.6');
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(([p]) => p !== '/404').map(([p]) => `  <url><loc>${abs(p)}</loc><lastmod>${today}</lastmod><priority>${prio(p)}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);

// Old URL /testimonials → /reviews (301 on Netlify / Cloudflare Pages / Apache; fallback page elsewhere)
fs.writeFileSync(path.join(DIST, '_redirects'), '/testimonials /reviews 301\n/testimonials.html /reviews 301\n');
fs.writeFileSync(path.join(DIST, 'testimonials.html'), `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><title>Reviews have moved | ${esc(SITE.name)}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${abs('/reviews')}"><meta http-equiv="refresh" content="0; url=/reviews"></head><body><p>This page has moved to <a href="/reviews">Reviews</a>.</p></body></html>`);

// Host config files (Cloudflare Pages / Netlify read _headers; Apache/cPanel reads .htaccess)
fs.writeFileSync(path.join(DIST, '_headers'), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(self), camera=(), microphone=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=31536000, immutable
`);
fs.writeFileSync(path.join(DIST, '.htaccess'), `# Apache / cPanel hosting
Options -MultiViews
DirectorySlash Off
ErrorDocument 404 /404.html
RewriteEngine On
# force HTTPS and non-www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteCond %{HTTP_HOST} ^(?:www\\.)?(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
# old Feedback/Testimonials page moved to /reviews
RewriteRule ^testimonials(\\.html)?/?$ /reviews [R=301,L]
# clean URLs: /about -> about.html
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+?)/?$ $1.html [L]
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  <FilesMatch "\\.(css|js|webp|jpg|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
`);

// search engine verification files
const VERIFY = path.join(ROOT, 'verify');
if (fs.existsSync(VERIFY)) for (const f of fs.readdirSync(VERIFY)) if (!f.startsWith('README')) fs.copyFileSync(path.join(VERIFY, f), path.join(DIST, f));

console.log(`Built ${pages.length} pages into dist/  (images: ${Object.keys(IMG).length}, WebP resizing: ${sharp ? 'on' : 'off — run npm install to enable'})`);
