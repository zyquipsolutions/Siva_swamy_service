// Cloudflare Worker for Siva Swamy Services
//  - www → non-www 301
//  - /testimonials → /reviews 301 (page was renamed)
//  - GET /api/reviews → genuine Google reviews via the Places API (New), server-side
//  - everything else → static files from dist/
//
// Configure (see GOOGLE-REVIEWS-SETUP.md):
//   npx wrangler secret put GOOGLE_PLACES_API_KEY      ← secret, never in code or git
//   wrangler.jsonc → vars.GOOGLE_PLACE_ID               ← your Place ID (not secret)
//   wrangler.jsonc → vars.REVIEWS_CACHE_SECONDS         ← short edge cache to protect your quota

const PLACES_URL = 'https://places.googleapis.com/v1/places/';
const FIELDS = 'rating,userRatingCount,googleMapsUri,reviews';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    if (/^\/testimonials(\.html)?\/?$/.test(url.pathname)) return Response.redirect(new URL('/reviews', url).toString(), 301);
    if (url.pathname === '/api/reviews') return reviews(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra },
});

async function reviews(request, env, ctx) {
  if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
  if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) return json({ ok: false, error: 'not_configured' }, 503);

  const ttl = Math.max(60, Number(env.REVIEWS_CACHE_SECONDS || 600));
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/reviews?__c=1', request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return new Response(hit.body, { headers: { ...Object.fromEntries(hit.headers), 'x-cache': 'HIT', 'cache-control': 'no-store' } });

  let data;
  try {
    const r = await fetch(PLACES_URL + encodeURIComponent(env.GOOGLE_PLACE_ID) + '?languageCode=en', {
      headers: { 'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY, 'X-Goog-FieldMask': FIELDS },
    });
    if (!r.ok) return json({ ok: false, error: 'upstream', status: r.status }, 502);
    data = await r.json();
  } catch {
    return json({ ok: false, error: 'network' }, 502);
  }

  const body = normalise(data);
  const res = json(body);
  const cached = new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${ttl}` } });
  ctx.waitUntil(cache.put(cacheKey, cached));
  return res;
}

// Only the fields the page needs. Rating/count are passed through only when Google returns them.
function normalise(p) {
  const list = Array.isArray(p.reviews) ? p.reviews : [];
  return {
    ok: true,
    source: 'google',
    fetchedAt: new Date().toISOString(),
    rating: typeof p.rating === 'number' ? p.rating : null,
    userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    mapsUri: p.googleMapsUri || null,
    reviews: list.map((v) => ({
      id: v.name || null,                                   // stable Google review resource name
      author: v.authorAttribution?.displayName || 'Google user',
      authorUri: v.authorAttribution?.uri || null,
      photoUri: v.authorAttribution?.photoUri || null,
      rating: typeof v.rating === 'number' ? v.rating : null,
      text: v.text?.text || v.originalText?.text || '',
      relativeTime: v.relativePublishTimeDescription || '',
      publishTime: v.publishTime || null,
      reviewUri: v.googleMapsUri || null,
    })).filter((v) => v.id),
  };
}
