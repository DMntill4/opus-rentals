import { renderNavbar } from '../components/navbar.js';
import { renderIcon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import api from '../api/client.js';
import auth from '../auth/state.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openProviderContactModal } from '../components/provider-modal.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';

export async function renderHomeView() {
  renderNavbar('home');
  const container = document.getElementById('app-content');
  if (!container) return;

  // Load tools
  let allTools = [];
  try {
    allTools = await api.get('/tools') || [];
  } catch (e) {
    console.warn('Could not load tools for home', e);
  }

  const featuredTools = allTools.slice(0, 8);
  const heavyExcavators = allTools.filter(t => t.categoryId === 1 || t.name.toLowerCase().includes('excavadora')).slice(0, 4);

  // Mercado Libre style Category Circles / Tiles
  const popularCategories = [
    { id: 1, name: 'Excavadoras', icon: 'Shovel', count: '12 equipos', img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=400&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Concreto', icon: 'PaintRoller', count: '8 equipos', img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Demolición', icon: 'Hammer', count: '6 equipos', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80' },
    { id: 7, name: 'Plataformas', icon: 'ArrowUpCircle', count: '5 equipos', img: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400&auto=format&fit=crop&q=80' },
    { id: 8, name: 'Compactación', icon: 'Layers', count: '7 equipos', img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&auto=format&fit=crop&q=80' },
    { id: 5, name: 'Generadores', icon: 'Zap', count: '9 plantas', img: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&auto=format&fit=crop&q=80' },
    { id: 6, name: 'Compresores', icon: 'Wind', count: '4 equipos', img: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400&auto=format&fit=crop&q=80' },
    { id: 10, name: 'Soldadura', icon: 'Flame', count: '6 plantas', img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80' }
  ];

  container.innerHTML = `
    <div class="bg-[#f5f5f5] dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100 animate-fade-in font-sans">
      
      <!-- ========================================================================= -->
      <!-- 1. HERO CAROUSEL / BANNER: E-Commerce Style (Mercado Libre Clean Banner) -->
      <!-- ========================================================================= -->
      <section class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        <div class="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px] sm:min-h-[360px] md:min-h-[400px] flex items-center">
          
          <!-- Real Construction Site Panoramica -->
          <div 
            class="absolute inset-0 bg-cover bg-center"
            style="background-image: url('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=2200&q=85');"
          ></div>

          <!-- Crisp clean gradient overlay (Dark Slate for text readability) -->
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent"></div>

          <!-- Banner content -->
          <div class="relative z-10 p-6 sm:p-10 md:p-14 max-w-xl text-white space-y-4">
            
            <span class="inline-block px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white">
              Flota Certificada 2026
            </span>

            <h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
              Alquiler de Maquinaria Pesada Directo de Proveedor
            </h1>

            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Sin sobrecostos ni intermediarios informales. Excavadoras, rodillos y generadores listos para despacho inmediato con póliza SURA.
            </p>

            <div class="pt-2 flex items-center gap-3">
              <a href="#/catalog" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] flex items-center gap-2">
                <span>Ver Catálogo Completo</span>
                ${renderIcon('ArrowRight', 'w-4 h-4')}
              </a>
              <button id="hero-btn-contact" class="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-sm border border-white/30 transition-all cursor-pointer">
                Cotización Formal
              </button>
            </div>

          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 2. TRUST STRIP: 4 E-Commerce Benefit Pills (Mercado Libre standard) -->
      <!-- ========================================================================= -->
      <section class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          
          <div class="flex items-center gap-3 pt-2 md:pt-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              ${renderIcon('Truck', 'w-5 h-5')}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">Despacho Inmediato</div>
              <div class="text-[11px] text-slate-500">A frentes de obra en Colombia</div>
            </div>
          </div>

          <div class="flex items-center gap-3 pl-0 md:pl-4 pt-2 md:pt-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              ${renderIcon('ShieldCheck', 'w-5 h-5')}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">Póliza SURA Todo Riesgo</div>
              <div class="text-[11px] text-slate-500">Amparo contractual garantizado</div>
            </div>
          </div>

          <div class="flex items-center gap-3 pl-0 md:pl-4 pt-2 md:pt-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              ${renderIcon('FileCheck', 'w-5 h-5')}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">Facturación Oficial DIAN</div>
              <div class="text-[11px] text-slate-500">IVA 19% desglosado deducible</div>
            </div>
          </div>

          <div class="flex items-center gap-3 pl-0 md:pl-4 pt-2 md:pt-0">
            <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              ${renderIcon('Wrench', 'w-5 h-5')}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">Mantenimiento al Día</div>
              <div class="text-[11px] text-slate-500">Horómetro auditado y telemetría</div>
            </div>
          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 3. CATEGORÍAS POPULARES: Cuadrícula Limpia estilo Mercado Libre -->
      <!-- ========================================================================= -->
      <section class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Categorías Principales
          </h2>
          <a href="#/catalog" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <span>Ver todas las categorías</span>
            ${renderIcon('ChevronRight', 'w-4 h-4')}
          </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          ${popularCategories.map(cat => `
            <a 
              href="#/catalog?category=${cat.id}" 
              class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center text-center hover:shadow-md hover:border-blue-400 transition-all duration-150 group cursor-pointer"
            >
              <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 transition-colors mb-2.5">
                ${renderIcon(cat.icon, 'w-6 h-6')}
              </div>
              <span class="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                ${cat.name}
              </span>
              <span class="text-[10px] text-slate-400 mt-1 font-mono">
                ${cat.count}
              </span>
            </a>
          `).join('')}
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 4. PRODUCTOS DESTACADOS: Cards Limpias estilo E-Commerce -->
      <!-- ========================================================================= -->
      <section class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Maquinaria con Despacho Inmediato
            </h2>
            <p class="text-xs text-slate-500">Equipos verificados y listos en patio para entrega en obra</p>
          </div>
          <a href="#/catalog" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Ver todas (${allTools.length}) &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${featuredTools.map(t => {
            const primaryImg = resolveToolImageUrl(t);
            const isAvailable = t.status === 'AVAILABLE';
            return `
              <div 
                class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                onclick="window.location.hash='#/product/${t.id}'"
              >
                <div>
                  <!-- Product Image with clean white background frame -->
                  <div class="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                    <img 
                      src="${primaryImg}" 
                      alt="${t.name}" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${t.categoryName || ''}', '${t.name.replace(/'/g, "\\'")}')"
                    />
                    
                    <!-- Availability Pill -->
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                    } shadow-xs">
                      ${isAvailable ? 'Disponible Hoy' : 'En Obra'}
                    </span>

                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ${t.brand || 'CAT'}
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="p-4 space-y-1.5">
                    <div class="text-[10px] uppercase font-bold text-slate-400 font-mono">${t.categoryName || 'Construcción'}</div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      ${t.name}
                    </h3>
                    <p class="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                      ${t.description || 'Maquinaria industrial con póliza todo riesgo y mantenimiento al día.'}
                    </p>
                  </div>
                </div>

                <!-- Footer: Price & Rent Action -->
                <div class="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between">
                  <div>
                    <div class="text-[10px] text-slate-400">Tarifa por día</div>
                    <div class="text-base font-black text-slate-900 dark:text-white font-mono">
                      ${formatCurrency(t.dailyPrice)}
                    </div>
                  </div>

                  <button class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs">
                    Alquilar
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 5. BANNER CONSTRUCTORAS (B2B Registro) -->
      <!-- ========================================================================= -->
      <section class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div class="bg-[#132e4f] text-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div class="space-y-2 text-center md:text-left">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">Constructoras & Proveedores</span>
            <h3 class="text-xl sm:text-2xl font-black">¿Tienes equipos en patio o requieres flota para licitación?</h3>
            <p class="text-xs sm:text-sm text-slate-300 max-w-xl">
              Publica tu inventario con seguros incluidos o cotiza paquetes de maquinaria masiva para infraestructura vial, minería y edificación.
            </p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <button id="btn-home-reg-prov" class="px-5 py-3 rounded-xl bg-white text-[#132e4f] hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all cursor-pointer">
              Registrar Maquinaria
            </button>
            <button id="btn-home-contact" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer">
              Atención Telefónica
            </button>
          </div>
        </div>
      </section>

    </div>
  `;

  // Attach handlers
  container.querySelector('#hero-btn-contact')?.addEventListener('click', () => {
    openProviderContactModal({
      name: 'Despacho Central Opus Rentals',
      phone: '+57 (1) 745-8900',
      whatsapp: '573104567890',
      city: 'Cobertura Nacional',
      address: 'Central de Logística y Maquinaria Pesada'
    });
  });

  container.querySelector('#btn-home-contact')?.addEventListener('click', () => {
    openProviderContactModal({
      name: 'Despacho Central Opus Rentals',
      phone: '+57 (1) 745-8900',
      whatsapp: '573104567890',
      city: 'Cobertura Nacional',
      address: 'Central de Logística y Maquinaria Pesada'
    });
  });

  container.querySelector('#btn-home-reg-prov')?.addEventListener('click', () => {
    openAuthModal('register');
  });
}

export default renderHomeView;
