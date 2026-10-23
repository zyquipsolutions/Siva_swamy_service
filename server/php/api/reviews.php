<?php
// Google reviews endpoint for Apache / cPanel / Hostinger hosting (PHP 7.4+ with cURL).
// Upload this file to:  public_html/api/reviews.php   (so the site can call /api/reviews.php)
// and set SITE.reviewsEndpoint to '/api/reviews.php' in data.mjs, then rebuild.
//
// The API key is read from a config file OUTSIDE public_html so it can never be downloaded:
//   /home/<cpanel-user>/siva-reviews-config.php   (copy server/php/siva-reviews-config.example.php)

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$configPath = dirname($_SERVER['DOCUMENT_ROOT']) . '/siva-reviews-config.php';
if (!is_readable($configPath)) { http_response_code(503); echo json_encode(['ok' => false, 'error' => 'not_configured']); exit; }
$cfg = require $configPath;
$key = $cfg['GOOGLE_PLACES_API_KEY'] ?? '';
$placeId = $cfg['GOOGLE_PLACE_ID'] ?? '';
$ttl = max(60, (int)($cfg['REVIEWS_CACHE_SECONDS'] ?? 600));
if ($key === '' || $placeId === '') { http_response_code(503); echo json_encode(['ok' => false, 'error' => 'not_configured']); exit; }

// short file cache outside public_html to limit API calls
$cacheFile = dirname($_SERVER['DOCUMENT_ROOT']) . '/siva-reviews-cache.json';
if (is_readable($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) { readfile($cacheFile); exit; }

$ch = curl_init('https://places.googleapis.com/v1/places/' . rawurlencode($placeId) . '?languageCode=en');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 10,
  CURLOPT_HTTPHEADER => ['X-Goog-Api-Key: ' . $key, 'X-Goog-FieldMask: rating,userRatingCount,googleMapsUri,reviews'],
]);
$raw = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($raw === false || $status !== 200) { http_response_code(502); echo json_encode(['ok' => false, 'error' => 'upstream', 'status' => $status]); exit; }

$p = json_decode($raw, true) ?: [];
$out = [
  'ok' => true,
  'source' => 'google',
  'fetchedAt' => gmdate('c'),
  'rating' => isset($p['rating']) ? (float)$p['rating'] : null,
  'userRatingCount' => isset($p['userRatingCount']) ? (int)$p['userRatingCount'] : null,
  'mapsUri' => $p['googleMapsUri'] ?? null,
  'reviews' => [],
];
foreach (($p['reviews'] ?? []) as $v) {
  if (empty($v['name'])) continue;
  $out['reviews'][] = [
    'id' => $v['name'],
    'author' => $v['authorAttribution']['displayName'] ?? 'Google user',
    'authorUri' => $v['authorAttribution']['uri'] ?? null,
    'photoUri' => $v['authorAttribution']['photoUri'] ?? null,
    'rating' => isset($v['rating']) ? (int)$v['rating'] : null,
    'text' => $v['text']['text'] ?? ($v['originalText']['text'] ?? ''),
    'relativeTime' => $v['relativePublishTimeDescription'] ?? '',
    'publishTime' => $v['publishTime'] ?? null,
    'reviewUri' => $v['googleMapsUri'] ?? null,
  ];
}
$json = json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
@file_put_contents($cacheFile, $json, LOCK_EX);
echo $json;
