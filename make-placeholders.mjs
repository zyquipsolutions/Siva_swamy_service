// Generates teal "Replace me" placeholder photos into photos/ — only for files that don't exist yet.
// Usage: node make-placeholders.mjs        (needs: npm install)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICON_PATHS } from './icons.mjs';
import { SERVICES, GALLERY, BLOG } from './data.mjs';

const sharp = (await import('sharp')).default;
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'photos');
fs.mkdirSync(DIR, { recursive: true });

const list = [
  ['hero', 1440, 1080, 'chimney', 'Hero photo'],
  ['owner', 960, 1200, 'person', 'Owner portrait (owner.jpeg)'],
  ...SERVICES.map((s) => [s.image, 960, 720, s.icon, s.name]),
  ...GALLERY.map((g) => [g.file, 960, 960, SERVICES.find((s) => s.slug === g.cat)?.icon || 'tools', g.title]),
  ...BLOG.map((b) => [b.image, 960, 720, 'tools', b.title]),
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function svg(w, h, ic, label, file) {
  const s = Math.min(w, h) * 0.2;
  const g = Math.max(24, Math.round(Math.min(w, h) / 12));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><pattern id="grid" width="${g}" height="${g}" patternUnits="userSpaceOnUse"><path d="M ${g} 0 L 0 0 0 ${g}" fill="none" stroke="#7CD6D1" stroke-opacity=".14" stroke-width="1"/></pattern>
  <radialGradient id="glow" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#0E7C86"/><stop offset="1" stop-color="#062F3A"/></radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect x="${w * 0.06}" y="${h * 0.06}" width="${w * 0.88}" height="${h * 0.88}" fill="none" stroke="#F4B860" stroke-opacity=".35" stroke-dasharray="6 8"/>
  <g transform="translate(${w / 2 - s / 2} ${h * 0.4 - s / 2}) scale(${s / 24})" fill="none" stroke="#D8F3F1" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[ic]}</g>
  <text x="50%" y="${h * 0.4 + s * 0.9}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(18, w / 34)}" font-weight="700" fill="#F0FAFA">${esc(label)}</text>
  <text x="50%" y="${h * 0.4 + s * 0.9 + Math.max(18, w / 34) * 1.5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(13, w / 60)}" fill="#F4B860">Replace me: photos/${file}</text>
</svg>`;
}

let made = 0;
const exists = (n) => ['.jpg', '.jpeg', '.png', '.webp'].some((e) => fs.existsSync(path.join(DIR, n + e)));
const seen = new Set();

for (const [name, w, h, ic, label] of list) {
  if (exists(name) || seen.has(name)) continue;
  seen.add(name);
  await sharp(Buffer.from(svg(w, h, ic, label, name + '.jpg'))).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(DIR, name + '.jpg'));
  made++;
}

// Brand logos are NOT generated: add the official files as photos/badge-<slug>.png.
// Until then the brand cards show the brand name as plain text.

console.log(`Placeholders created: ${made} (existing photos were left untouched)`);
