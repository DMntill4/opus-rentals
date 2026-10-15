import { renderNavbar } from '../components/navbar.js';
import { renderIcon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import api from '../api/client.js';
import auth from '../auth/state.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openProviderContactModal } from '../components/provider-modal.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';
import { i18n } from '../utils/i18n.js';

export async function renderHomeView() {
  renderNavbar('home');
  const container = document.getElementById('app-content');
  if (!container) return;

  const isEn = i18n.getLang() === 'EN';

  // Load tools and categories
  let featuredTools = [];
  let categories = [];
  try {
    const [toolsData, catsData] = await Promise.all([
      api.get('/tools'),
      api.get('/categories')
    ]);
    featuredTools = (toolsData || []).slice(0, 6);
    categories = (catsData || []).slice(0, 8);
  } catch (e) {
    console.warn('Could not load data for home view', e);
  }

  // Major construction categories with curated imagery for high visual impact
  const constructionCategories = [
    {
      id: 1,
      name: 'Excavación y Movimiento de Tierra',
      tag: 'Obras Viales y Cimentación',
      icon: 'Shovel',
      count: 'CAT · Komatsu · JCB',
      img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Concreto y Mezclado',
      tag: 'Fundición y Pavimento',
      icon: 'PaintRoller',
      count: 'Makita · Bosch',
      img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'Demolición y Martillos',
      tag: 'Desmantelamiento Estructural',
      icon: 'Hammer',
      count: 'Hilti · Bosch',
      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 7,
      name: 'Elevación y Trabajo en Alturas',
      tag: 'Estructuras y Mantenimiento',
      icon: 'ArrowUpCircle',
      count: 'Genie · JLG',
      img: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 8,
      name: 'Compactación de Suelos',
      tag: 'Relleno y Asfalto',
      icon: 'Layers',
      count: 'Wacker Neuson · Dynapac',
      img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      name: 'Generación Eléctrica y Energía',
      tag: 'Energía Continua 24/7',
      icon: 'Zap',
      count: 'Cummins · CAT',
      img: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80'
    }
  ];

  container.innerHTML = `
    <div class="space-y-16 sm:space-y-24 pb-20 animate-fade-in w-full text-slate-900 dark:text-slate-100">

      <!-- ========================================================================= -->
      <!-- 1. FULL-BLEED CINEMATIC HERO: Deep Navy #0a192f, Real Construction Site, Pure White Text -->
      <!-- ========================================================================= -->
      <section class="relative overflow-hidden w-full">
        <div class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4">
          
          <div class="relative rounded-3xl overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center shadow-2xl border border-slate-700/60 bg-[#071322]">
            
            <!-- Real Construction Site Background (Heavy Civil Works / High-Contrast Machinery) -->
            <div 
              class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out transform scale-100 hover:scale-105"
              style="background-image: url('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=2400&q=85');"
            ></div>

            <!-- Deep Navy, Steel Gray & Slate Vignette Gradients (No generic orange tint) -->
            <div class="absolute inset-0 bg-gradient-to-r from-[#071322] via-[#0b1c31]/90 to-[#132e4f]/75"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#071322] via-transparent to-[#071322]/50"></div>

            <!-- Structural Drafting Grid Lines -->
            <div class="absolute inset-0 opacity-15 pointer-events-none" style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 40px 40px;"></div>
            
            <!-- Sleek Cool Cyan & Blue Atmospheric Ambient Glow -->
            <div class="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Main Content Stage -->
            <div class="relative z-10 w-full p-8 sm:p-14 lg:p-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <!-- Left Column: Value Statement in Spanish, Pure Navy/White Corporate Look -->
              <div class="lg:col-span-8 space-y-6 text-center lg:text-left">
                
                <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                  <span class="font-mono text-[11px] uppercase tracking-wider">Infraestructura y Maquinaria Pesada en Colombia</span>
                </div>

                <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] text-white">
                  <span>Equipos de Construcción para Grandes Obras.</span><br />
                  <span class="text-blue-300">Alquila sin intermediarios. Disponibilidad real en frente de obra.</span>
                </h1>

                <p class="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Acceso directo a retroexcavadoras, rodillos, plantas eléctricas y maquinaria menor de proveedores industriales verificados. Gestión telemática, seguro todo riesgo SURA y despacho inmediato en patio.
                </p>

                <!-- Search Bar Directly in the Hero Stage (Skyscanner / Industrial Style) -->
                <div class="pt-2 max-w-2xl">
                  <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-white/30 dark:border-slate-700 shadow-2xl flex flex-col sm:flex-row items-stretch gap-2">
                    <div class="relative flex-1 flex items-center">
                      <span class="pl-3.5 pr-2 text-slate-400">
                        ${renderIcon('Search', 'w-5 h-5')}
                      </span>
                      <input 
                        type="text" 
                        id="hero-input-search"
                        placeholder="Buscar por equipo, marca (CAT, Bobcat, Hilti) o categoría..." 
                        class="w-full py-3 pr-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <button 
                      id="hero-btn-search"
                      class="px-7 py-3.5 rounded-xl bg-[#132e4f] hover:bg-[#0a1c33] active:bg-slate-950 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap hover:scale-[1.02]"
                    >
                      <span>Buscar Maquinaria</span>
                      ${renderIcon('ArrowRight', 'w-4 h-4')}
                    </button>
                  </div>
                </div>

                <!-- Trust Badges: Clean Blue, White and Steel Accents -->
                <div class="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 font-medium">
                  <div class="flex items-center gap-2 bg-[#0b1c31]/60 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10">
                    <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span>Póliza SURA Todo Riesgo</span>
                  </div>
                  <div class="flex items-center gap-2 bg-[#0b1c31]/60 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10">
                    <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span>Telemetría GPS Satelital</span>
                  </div>
                  <div class="flex items-center gap-2 bg-[#0b1c31]/60 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10">
                    <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span>Mantenimiento Certificado</span>
                  </div>
                </div>

              </div>

              <!-- Right Column: Quick Action Card (Skyscanner Style / Deep Blue) -->
              <div class="lg:col-span-4 flex flex-col gap-4">
                
                <div class="bg-[#0b1c31]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/15 shadow-2xl space-y-5 text-white">
                  
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                      ${renderIcon('Building2', 'w-5 h-5')}
                    </div>
                    <div>
                      <div class="text-[10px] font-mono uppercase font-bold text-blue-300">Despacho en Obra</div>
                      <h3 class="text-sm font-black text-white">Atención a Constructoras</h3>
                    </div>
                  </div>

                  <p class="text-xs text-slate-300 leading-relaxed font-normal">
                    ¿Requieres cotización formal para licitaciones o movilización masiva de flota a frentes de obra remotos?
                  </p>

                  <div class="space-y-2.5 pt-1">
                    <button 
                      id="hero-contact-provider-btn"
                      class="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      ${renderIcon('Phone', 'w-4 h-4 text-blue-200')}
                      <span>Contactar Red de Proveedores</span>
                    </button>

                    <a 
                      href="#/catalog" 
                      class="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 flex items-center justify-between transition-all"
                    >
                      <span>Ver toda la flota disponible</span>
                      ${renderIcon('ChevronRight', 'w-4 h-4')}
                    </a>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 2. CATEGORÍAS CLAVE CON FOTOS REALES DE CONSTRUCCIÓN (Heavy Visual Impact) -->
      <!-- ========================================================================= -->
      <section class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Líneas de Maquinaria
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Categorías de Obra Civil & Minería
            </h2>
          </div>
          <a href="#/catalog" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group">
            <span>Explorar catálogo técnico completo</span>
            ${renderIcon('ArrowRight', 'w-3.5 h-3.5 group-hover:translate-x-1 transition-transform')}
          </a>
        </div>

        <!-- Visual Category Grid with Construction Photography Overlay -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${constructionCategories.map(cat => `
            <div 
              class="group relative h-64 rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover-lift transition-all duration-300"
              onclick="window.location.hash='#/catalog?category=${cat.id}'"
            >
              <!-- Real Photography Background -->
              <img 
                src="${cat.img}" 
                alt="${cat.name}" 
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              <!-- High Contrast Dark Overlay (Navy / Slate Blue) -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#0b1c31]/75 to-transparent"></div>

              <!-- Card Content Overlay -->
              <div class="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                <div class="flex items-center justify-between">
                  <span class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    ${renderIcon(cat.icon, 'w-5 h-5')}
                  </span>
                  <span class="text-[11px] font-mono px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-blue-200 font-bold">
                    ${cat.count}
                  </span>
                </div>

                <div class="space-y-1">
                  <div class="text-[11px] font-mono uppercase font-bold text-blue-300 tracking-wider">${cat.tag}</div>
                  <h3 class="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">${cat.name}</h3>
                  <div class="pt-2 flex items-center gap-1 text-xs text-slate-300 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Ver maquinaria en esta línea</span>
                    ${renderIcon('ArrowRight', 'w-3.5 h-3.5')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 3. FLOTA ACTIVA EN PATIO: Equipos Listos con Fotografía Real (Grid Ancho) -->
      <!-- ========================================================================= -->
      ${featuredTools.length > 0 ? `
        <section class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Disponibilidad Inmediata
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                Equipos Listos para Despacho a Frente de Obra
              </h2>
            </div>
            <a href="#/catalog" class="px-5 py-2.5 rounded-xl bg-[#132e4f] hover:bg-[#0a1c33] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]">
              <span>Ver Catálogo Completo (25+ Máquinas)</span>
              ${renderIcon('ChevronRight', 'w-4 h-4')}
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            ${featuredTools.map(t => {
              const primaryImg = resolveToolImageUrl(t);
              return `
                <div class="tr-card overflow-hidden flex flex-col justify-between hover-lift card-glow group cursor-pointer border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 transition-all duration-300" onclick="window.location.hash='#/product/${t.id}'">
                  <div>
                    <div class="relative h-44 bg-slate-900 overflow-hidden">
                      <img 
                        src="${primaryImg}" 
                        alt="${t.name}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${t.categoryName || ''}', '${t.name.replace(/'/g, "\\'")}')"
                      />
                      <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/85 backdrop-blur-sm text-white border border-white/20 font-mono shadow-xs">
                        ${t.brand}
                      </span>
                    </div>

                    <div class="p-4 space-y-1.5">
                      <div class="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">${t.categoryName || 'Construcción'}</div>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${t.name}</h4>
                      <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">${t.description || 'Equipo industrial certificado con seguro todo riesgo SURA incluido.'}</p>
                    </div>
                  </div>

                  <div class="p-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                      <div class="text-[9px] text-slate-400 font-mono uppercase">Tarifa día</div>
                      <div class="text-xs font-black text-[#132e4f] dark:text-blue-400 font-mono">${formatCurrency(t.dailyPrice)}</div>
                    </div>
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Alquilar ${renderIcon('ArrowRight', 'w-3 h-3')}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}

      <!-- ========================================================================= -->
      <!-- 4. PILARES OPERATIVOS: Control de Obra & Garantías B2B -->
      <!-- ========================================================================= -->
      <section class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="p-8 sm:p-12 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
          
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              Garantía Operativa Opus Rentals
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Seguridad Jurídica y Técnica en Frente de Obra
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cero intermediarios informales. Procesos transparentes diseñados para auditorías de ingeniería civil.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#132e4f] dark:text-blue-400 flex items-center justify-center">
                ${renderIcon('CalendarCheck', 'w-6 h-6')}
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Motor Anti-Colisión de Reservas</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                El sistema bloquea matemáticamente fechas cruzadas. Si una excavadora está en obra, queda inhabilitada de inmediato sin sobre-reservas.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#132e4f] dark:text-blue-400 flex items-center justify-center">
                ${renderIcon('FileCheck', 'w-6 h-6')}
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Facturación Oficial con IVA 19%</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Liquidación contable automática para contratistas. Emisión legal de comprobante fiscal, deducciones e historial de transacciones.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#132e4f] dark:text-blue-400 flex items-center justify-center">
                ${renderIcon('ShieldCheck', 'w-6 h-6')}
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Acta Digital de Entrega & Averías</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inspección técnica de horómetro y estado físico al despachar y devolver. Desacople en 4FN para reportar novedades técnicas transparentes.
              </p>
            </div>

          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 5. CALL TO ACTION: Red de Proveedores (Navy #071322 / #132e4f) -->
      <!-- ========================================================================= -->
      <section class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#071322] via-[#0b1c31] to-[#132e4f] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-slate-700/60 relative overflow-hidden">
          
          <div class="relative z-10 space-y-3 text-center md:text-left">
            <span class="text-[11px] font-mono uppercase font-bold text-blue-300 tracking-wider">Red de Proveedores B2B</span>
            <h3 class="text-2xl sm:text-4xl font-extrabold font-display">¿Tienes maquinaria disponible en patio?</h3>
            <p class="text-xs sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Publica tu inventario ante empresas constructoras y contratistas de toda Colombia. Rentabiliza tus activos ociosos con seguros y liquidaciones transparentes.
            </p>
          </div>

          <div class="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button id="cta-provider-btn" class="px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#071322] font-black text-xs shadow-xl transition-all cursor-pointer text-center hover:scale-[1.02]">
              Registrarme como Proveedor
            </button>
            <a href="#/catalog" class="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs border border-white/20 backdrop-blur-sm transition-all text-center">
              Explorar Catálogo
            </a>
          </div>

        </div>
      </section>

    </div>
  `;

  // Attach event listeners
  const searchInput = container.querySelector('#hero-input-search');
  const searchBtn = container.querySelector('#hero-btn-search');

  function doSearch() {
    const q = searchInput?.value?.trim() || '';
    if (q) {
      window.location.hash = `#/catalog?q=${encodeURIComponent(q)}`;
    } else {
      window.location.hash = '#/catalog';
    }
  }

  searchBtn?.addEventListener('click', doSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  container.querySelector('#cta-provider-btn')?.addEventListener('click', () => {
    openAuthModal('register');
  });

  container.querySelector('#hero-contact-provider-btn')?.addEventListener('click', () => {
    openProviderContactModal({
      name: 'Central de Operaciones Opus Rentals',
      phone: '+57 (1) 745-8900',
      whatsapp: '573104567890',
      city: 'Cobertura Nacional (Bogotá, Medellín, Cali, Barranquilla)',
      address: 'Frente de Despacho y Logística de Maquinaria Pesada'
    });
  });
}

export default renderHomeView;
