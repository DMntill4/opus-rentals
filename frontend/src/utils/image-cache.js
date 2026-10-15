/**
 * Opus Rentals Image Cache & Offline Fallback Helper
 * Provides sleek Opus branded SVG placeholders in cobalt / slate when offline
 */

const CACHE_NAME = 'opus-media-cache-v1';
const objectUrlMap = new Map();

/**
 * Generates an ultra-crisp, Opus Rentals branded blueprint SVG for machinery
 */
export function getBlueprintFallbackSvg(toolName = 'Maquinaria Pesada', category = 'Infraestructura') {
  const safeName = (toolName || 'Maquinaria Opus').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCat = (category || 'Construcción').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.8" stroke-opacity="0.3"/>
      </pattern>
      <linearGradient id="opusBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1120" />
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.25" />
      </linearGradient>
    </defs>
    
    <rect width="100%" height="100%" fill="#0b1120" />
    <rect width="100%" height="100%" fill="url(#opusBg)" />
    <rect width="100%" height="100%" fill="url(#grid)" />

    <!-- Technical Crosshairs & Corner Accents -->
    <path d="M 30 50 L 30 30 L 50 30" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 770 50 L 770 30 L 750 30" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 30 550 L 30 570 L 50 570" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 770 550 L 770 570 L 750 570" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Central Tech Target Circle -->
    <circle cx="400" cy="270" r="130" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="6,6" />
    <circle cx="400" cy="270" r="100" fill="#131d31" stroke="#2563eb" stroke-width="2" />

    <!-- Geometric Hexagon Crest (Opus Rentals) -->
    <g transform="translate(400, 270) scale(1.6)">
      <polygon points="0,-36 31.18,-18 31.18,18 0,36 -31.18,18 -31.18,-18" fill="none" stroke="#2563eb" stroke-width="3" stroke-linejoin="round"/>
      <line x1="0" y1="-36" x2="0" y2="36" stroke="#2563eb" stroke-width="2"/>
      <line x1="-31.18" y1="-18" x2="31.18" y2="18" stroke="#2563eb" stroke-width="2"/>
      <line x1="-31.18" y1="18" x2="31.18" y2="-18" stroke="#2563eb" stroke-width="2"/>
      <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
    </g>

    <!-- Telematics Tag -->
    <rect x="290" y="415" width="220" height="28" rx="14" fill="#0f172a" stroke="#2563eb" stroke-width="1.2" />
    <text x="400" y="433" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">TELEMETRÍA GPS ACTIVA</text>

    <!-- Equipment Typography -->
    <text x="400" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#f8fafc" text-anchor="middle">${safeName}</text>
    <text x="400" y="510" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">${safeCat} • Flota Certificada Opus Rentals</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function isCacheStorageSupported() {
  return typeof window !== 'undefined' && 'caches' in window;
}

export async function getCachedImageObjectUrl(url) {
  if (!url || !isCacheStorageSupported()) return null;
  if (objectUrlMap.has(url)) return objectUrlMap.get(url);

  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      objectUrlMap.set(url, blobUrl);
      return blobUrl;
    }
  } catch (err) {
    console.warn('[Opus Cache Shield] Error:', err);
  }
  return null;
}

export async function cacheImage(url) {
  if (!url || !isCacheStorageSupported()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) return true;

    const response = await fetch(url, { mode: 'cors', cache: 'default' });
    if (response && response.status === 200) {
      await cache.put(url, response.clone());
      return true;
    }
  } catch (err) {}
  return false;
}

export async function preloadCatalogImages(urls = []) {
  if (!urls || urls.length === 0 || !isCacheStorageSupported()) return;
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  const chunkSize = 3;
  for (let i = 0; i < uniqueUrls.length; i += chunkSize) {
    const chunk = uniqueUrls.slice(i, i + chunkSize);
    await Promise.all(chunk.map(u => cacheImage(u)));
  }
}

export async function handleImageError(imgEl, originalUrl, category = '', toolName = '') {
  if (!imgEl) return;
  imgEl.src = getBlueprintFallbackSvg(toolName || imgEl.alt, category);
}

export function initImageCacheShield(initialUrls = []) {
  if (typeof window === 'undefined') return;

  window.ToolRentCacheShield = {
    handleImageError,
    getBlueprintFallbackSvg,
    getCachedImageObjectUrl,
    preloadCatalogImages,
    CACHE_NAME
  };

  if (initialUrls.length > 0) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadCatalogImages(initialUrls));
    } else {
      setTimeout(() => preloadCatalogImages(initialUrls), 300);
    }
  }
}
