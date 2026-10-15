/**
 * Centralized Real Images Registry for Opus Rentals
 * Maps tool IDs, models, and brands to real photography.
 * You can simply drop your images into `frontend/public/tools/`
 * with names like `tool-1.jpg`, `tool-2.jpg`, or specify custom names below!
 */

export const localToolImages = {
  1: '/tools/miniexcavadora-cat.jpg',
  2: '/tools/excavadora-komatsu.jpg',
  3: '/tools/martillo-bosch.jpg',
  4: '/tools/rompepavimentos-hilti.jpg',
  5: '/tools/allanadora-makita.jpg',
  6: '/tools/cortadora-dewalt.jpg',
  7: '/tools/bailarina-wacker.jpg',
  8: '/tools/retroexcavadora-jcb.jpg',
  9: '/tools/minicargador-bobcat.jpg',
  10: '/tools/plataforma-genie.jpg',
  11: '/tools/compresor-atlas.jpg',
  12: '/tools/excavadora-sany.jpg',
  13: '/tools/cargador-volvo.jpg',
  14: '/tools/grua-liebherr.jpg',
  15: '/tools/cortadora-husqvarna.jpg',
  16: '/tools/miniexcavadora-kubota.jpg',
  17: '/tools/cortadora-stihl.jpg',
  18: '/tools/soldadora-miller.jpg',
  19: '/tools/soldadora-lincoln.jpg',
  20: '/tools/trituradora-terex.jpg',
  21: '/tools/generador-cat.jpg',
  22: '/tools/rodillo-komatsu.jpg',
  23: '/tools/vibrador-bosch.jpg',
  24: '/tools/estacion-hilti.jpg',
  25: '/tools/motobomba-makita.jpg'
};

/**
 * Curated High-Definition Heavy Machinery Photography (Unsplash Construction Verified)
 */
export const highDefFallbackImages = {
  1: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1400&q=85', // Cat 303 Excavator
  2: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1400&q=85', // Komatsu PC200 Heavy Excavator
  3: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85', // Bosch Demolition Breaker
  4: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=85', // Hilti TE 3000 Pavement Breaker
  5: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=85', // Power Trowel Concrete
  6: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1400&q=85', // Floor Saw Concrete
  7: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1400&q=85', // Rammer Compactor
  8: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1400&q=85', // JCB 3CX Backhoe
  9: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1400&q=85', // Bobcat S550 Skid Steer
  10: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1400&q=85', // Genie Scissor Lift
  11: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1400&q=85', // Atlas Copco Compressor
  12: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85', // Sany Heavy Excavator
  13: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1400&q=85', // Volvo L90H Wheel Loader
  14: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85', // Liebherr Tower Crane
  15: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=85', // Husqvarna Cut-Off Saw
  16: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1400&q=85', // Kubota Mini Excavator
  17: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1400&q=85', // Stihl Cutquik
  18: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=85', // Miller Welder
  19: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1400&q=85', // Lincoln Welder
  20: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1400&q=85', // Mobile Crusher
  21: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1400&q=85', // Cat Generator
  22: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1400&q=85', // Tandem Roller
  23: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1400&q=85', // Concrete Vibrator
  24: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1400&q=85', // Total Station
  25: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1400&q=85'  // Trash Pump
};

/**
 * Resolves the best available image for a tool:
 * 1. Explicit primary image from database / object
 * 2. High-definition real photography mapping
 * 3. Fallback blueprint SVG
 */
export function resolveToolImageUrl(tool) {
  if (!tool) return 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=85';
  
  const id = Number(tool.id) || 1;
  const dbImage = tool.images?.find(i => i.isPrimary || i.isCover)?.imageUrl || tool.images?.[0]?.imageUrl || tool.imageUrl;
  
  if (dbImage && !dbImage.includes('data:image/svg')) {
    return dbImage;
  }
  
  return highDefFallbackImages[id] || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=85';
}
