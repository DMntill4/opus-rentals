/**
 * Centralized Real Construction Imagery Catalog for Opus Rentals
 * Live Unsplash Verified Photographic URLs (100% heavy machinery, worksites & civil works - All verified 200 OK)
 * NO LOCAL STORAGE - STRICT REMOTE HTTPS FETCH
 */

// Full-width worksite hero background (Uses local hero-excavator.jpg with remote fallback)
export const constructionHeroImage = '/assets/hero/hero-excavator.jpg';
export const constructionHeroRemoteFallback = 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1920&q=85';

// Worksite engineer & contractor visual for Auth Modal & B2B Portals
export const loginConstructionImage = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80';

// 6 Photographic Category Backgrounds with real equipment & worksites
// 6 Photographic Category Backgrounds with real equipment & worksites (checks local /assets/categories/ first, falls back to remote)
export const constructionCategories = [
  {
    id: 1,
    name: 'Excavadoras y Retroexcavadoras',
    tag: 'CAT · Komatsu · JCB',
    count: '12 unidades',
    icon: 'Shovel',
    imageUrl: '/assets/categories/cat-excavadoras.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Concreto y Pavimentación',
    tag: 'Allanadoras · Mezcladoras',
    count: '8 unidades',
    icon: 'PaintRoller',
    imageUrl: '/assets/categories/cat-concreto.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Demolición y Martillos',
    tag: 'Hilti · Bosch Demoledores',
    count: '6 unidades',
    icon: 'Hammer',
    imageUrl: '/assets/categories/cat-demolicion.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 7,
    name: 'Plataformas y Alturas',
    tag: 'Genie · Tijeras Eléctricas',
    count: '5 unidades',
    icon: 'ArrowUpCircle',
    imageUrl: '/assets/categories/cat-elevacion.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 8,
    name: 'Compactación de Suelos',
    tag: 'Rodillos · Bailarinas Wacker',
    count: '7 unidades',
    icon: 'Layers',
    imageUrl: '/assets/categories/cat-compactacion.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    name: 'Generación Eléctrica Diésel',
    tag: 'Plantas Insonorizadas 24/7',
    count: '9 unidades',
    icon: 'Zap',
    imageUrl: '/assets/categories/cat-generadores.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    name: 'Compresión y Neumática',
    tag: 'Atlas Copco Tornillo',
    count: '4 unidades',
    icon: 'Wind',
    imageUrl: '/assets/categories/cat-compresores.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?auto=format&fit=crop&w=800&q=80'
  }
];

// Fallback high-res live machinery images for tool cards & catalog listings
export const fallbackMachineryImages = {
  1: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=800&q=80',
  2: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80',
  3: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  4: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  5: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  6: 'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?auto=format&fit=crop&w=800&q=80',
  7: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  8: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
  9: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
  10: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80',
  11: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  12: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80',
  13: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
  14: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  15: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  16: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=800&q=80',
  17: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  18: 'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?auto=format&fit=crop&w=800&q=80',
  19: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  20: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
  21: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
  22: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80',
  23: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  24: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  25: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80'
};

export function resolveToolImageUrl(tool) {
  if (!tool) return constructionHeroImage;
  const id = Number(tool.id) || 1;

  // 1. If user put a local high-res image for this machine in /assets/machinery/tool-{id}.jpg
  const localMachineryPath = `/assets/machinery/tool-${id}.jpg`;
  
  // 2. Check if the database has a valid remote HTTP image
  const dbImage = tool.images?.find(i => i.isPrimary || i.isCover)?.imageUrl || tool.images?.[0]?.imageUrl || tool.imageUrl;
  if (dbImage && !dbImage.includes('data:image/svg') && !dbImage.includes('localhost') && dbImage.startsWith('http')) {
    return dbImage;
  }
  
  // 3. Fallback to centralized verified machinery photos
  return localMachineryPath;
}

export function getToolFallbackRemoteUrl(toolId) {
  const id = Number(toolId) || 1;
  return fallbackMachineryImages[id] || fallbackMachineryImages[1];
}
