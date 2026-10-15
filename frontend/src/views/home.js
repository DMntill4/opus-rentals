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

  // Construction categories with real photography backgrounds
  const photoCategories = [
    {
      id: 1,
      name: 'Excavadoras y Retroexcavadoras',
      subtitle: 'CAT · Komatsu · JCB',
      count: '12 equipos',
      icon: 'Shovel',
      img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Concreto y Pavimentación',
      subtitle: 'Allanadoras · Vibradores',
      count: '8 equipos',
      icon: 'PaintRoller',
      img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Demolición y Martillos',
      subtitle: 'Hilti · Bosch Demoledores',
      count: '6 equipos',
      icon: 'Hammer',
      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 7,
      name: 'Plataformas y Alturas',
      subtitle: 'Genie · Tijeras Eléctricas',
      count: '5 equipos',
      icon: 'ArrowUpCircle',
      img: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 8,
      name: 'Compactación de Suelos',
      subtitle: 'Rodillos · Bailarinas Wacker',
      count: '7 equipos',
      icon: 'Layers',
      img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      name: 'Generación y Energía',
      subtitle: 'Plantas Diésel Insonorizadas',
      count: '9 plantas',
      icon: 'Zap',
      img: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80'
    }
  ];

  container.innerHTML = `
    <div class="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans pb-16 animate-fade-in">

      <!-- ========================================================================= -->
      <!-- 1. FULL-SCREEN HERO: REAL CONSTRUCTION MACHINERY BACKGROUND + QUOTE BAR -->
      <!-- ========================================================================= -->
      <section class="relative w-full overflow-hidden bg-slate-950 text-white min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex items-center justify-center">
        
        <!-- Real Construction Excavator Background Photo in High Definition -->
        <div 
          class="absolute inset-0 bg-cover bg-center"
          style="background-image: url('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=2200&q=85');"
        ></div>

        <!-- Dark Contrast Vignette (Keeps heavy machinery visible while making text ultra crisp) -->
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/60"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40"></div>

        <div class="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center space-y-6">
          
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Flota de Maquinaria Certificada en Obra
          </div>

          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight max-w-4xl leading-[1.12]">
            Alquiler de Maquinaria Pesada para Grandes Proyectos
          </h1>

          <p class="text-sm sm:text-base text-slate-200 max-w-2xl font-normal leading-relaxed">
            Disponibilidad en tiempo real en Bogotá y Sabana, tarifas transparentes por día, semana y mes con facturación electrónica DIAN.
          </p>

          <!-- Floating Quote Box (Exact replica of your screenshot's Booking Box) -->
          <div class="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 text-slate-800 dark:text-white mt-4 text-left">
            <form id="hero-quote-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              
              <!-- Ubicación de Obra -->
              <div class="lg:col-span-4 space-y-1">
                <label class="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  ${renderIcon('MapPin', 'w-3 h-3 text-blue-600')} Ubicación de Obra
                </label>
                <div class="relative">
                  <select id="quote-location" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600 appearance-none cursor-pointer">
                    <option value="bogota">Bogotá D.C. y Sabana</option>
                    <option value="medellin">Medellín y Valle de Aburrá</option>
                    <option value="cali">Cali y Valle del Cauca</option>
                    <option value="barranquilla">Barranquilla y Costa Norte</option>
                  </select>
                  <div class="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                    ${renderIcon('ChevronDown', 'w-3.5 h-3.5')}
                  </div>
                </div>
              </div>

              <!-- Fechas -->
              <div class="lg:col-span-3 space-y-1">
                <label class="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  ${renderIcon('Calendar', 'w-3 h-3 text-blue-600')} Fecha Inicio
                </label>
                <input 
                  type="date" 
                  id="quote-start-date" 
                  value="2026-10-16"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div class="lg:col-span-3 space-y-1">
                <label class="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  ${renderIcon('Clock', 'w-3 h-3 text-blue-600')} Modalidad
                </label>
                <div class="relative">
                  <select id="quote-mode" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600 appearance-none cursor-pointer">
                    <option value="despacho">Despacho a Frente de Obra</option>
                    <option value="patio">Retiro Directo en Patio</option>
                  </select>
                  <div class="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                    ${renderIcon('ChevronDown', 'w-3.5 h-3.5')}
                  </div>
                </div>
              </div>

              <!-- Botón Cotizar Ahora -->
              <div class="lg:col-span-2">
                <button 
                  type="submit" 
                  class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                >
                  <span>Cotizar Ahora</span>
                  ${renderIcon('ArrowRight', 'w-4 h-4')}
                </button>
              </div>

            </form>

            <!-- Quick Chips Under the Quote Box -->
            <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800 mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">Maquinaria rápida:</span>
              <a href="#/catalog?q=excavadora" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">Excavadoras</a>
              <a href="#/catalog?q=rodillo" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">Rodillos</a>
              <a href="#/catalog?q=bobcat" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">Minicargador</a>
              <a href="#/catalog?q=generador" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">Plantas Diésel</a>
              <a href="#/catalog?q=martillo" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">Demoledores</a>
              <a href="#/catalog?q=grua" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">Grúas</a>
            </div>

          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 2. CINTA AMARILLA DE OPERACIONES Y ALERTA (Exact from your screenshot) -->
      <!-- ========================================================================= -->
      <div class="bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 shadow-xs select-none">
        <div class="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>Nuestra flota pesada está activa para despachos de emergencia y entregas el mismo día en Bogotá y Cundinamarca.</span>
          </div>
          <a href="#/catalog" class="font-extrabold uppercase font-mono tracking-wider underline hover:text-slate-800 text-[11px] whitespace-nowrap">
            Ver Flota Disponible &rarr;
          </a>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 3. TEN MENOS ACTIVOS OCIOSOS, CONSTRUYE MÁS (Sales Focus from screenshot) -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div class="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            La Eficiencia Operativa en Obra
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
            Ten Menos Activos Ociosos, Construye Más – El Poder del Alquiler
          </h2>
          <p class="text-xs sm:text-sm text-slate-500">
            Elimina el costo de capital inmovilizado y optimiza el flujo de caja en tus proyectos de infraestructura.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1 -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              ${renderIcon('Wrench', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Asesoría Técnica Especializada</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ingenieros mecánicos y especialistas en obra para recomendar la capacidad exacta de balde, tonelaje, caudal y consumos de combustible para tu frente de obra.
            </p>
            <div class="pt-2 text-[11px] font-bold text-blue-600 font-mono">
              ✓ Asignación técnica a la medida
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              ${renderIcon('ShieldCheck', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Equipos 100% Inspeccionados</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Seguridad operativa garantizada: verificamos presión hidráulica, horómetro y telemetría bajo protocolos de inspección ISO pre-entrega y póliza SURA.
            </p>
            <div class="pt-2 text-[11px] font-bold text-emerald-600 font-mono">
              ✓ Cero paradas no programadas
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              ${renderIcon('FileCheck', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Cero Costos de Mantenimiento</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Despreocúpate de pólizas inactivas, talleres de mantenimiento, depreciación ni bodegaje. Costo 100% deducible de impuestos como gasto operativo (OPEX).
            </p>
            <div class="pt-2 text-[11px] font-bold text-purple-600 font-mono">
              ✓ 100% Deducible en renta DIAN
            </div>
          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 4. CATÁLOGO & GUÍA 2026: 50/50 CARD WITH REAL YELLOW CAT EXCAVATOR PHOTO -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 items-center">
          
          <!-- Left: Information & PDF CTA -->
          <div class="lg:col-span-7 p-8 sm:p-12 space-y-5">
            <div class="text-[10px] font-mono uppercase font-bold text-blue-600 tracking-wider">
              Documentación Técnica Oficial
            </div>
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display leading-snug">
              Catálogo de Maquinaria Pesada & Guía de Selección 2026
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Elegir la maquinaria adecuada optimiza los tiempos de ciclo y ahorra hasta un 35% en combustible en obra. Conoce tablas de rendimiento, capacidades de balde, horas de vida útil, potencia diésel y requisitos de transporte en nuestro PDF.
            </p>
            <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a 
                href="#/catalog" 
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                ${renderIcon('Download', 'w-4 h-4')}
                <span>Descargar Catálogo en PDF</span>
              </a>
              <a 
                href="#/catalog" 
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#132e4f] hover:bg-[#0a1c33] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Explorar Catálogo Online</span>
                ${renderIcon('ArrowRight', 'w-4 h-4')}
              </a>
            </div>
          </div>

          <!-- Right: Real Yellow CAT Heavy Excavator Photography -->
          <div class="lg:col-span-5 h-80 lg:h-full min-h-[320px] bg-slate-950 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=85" 
              alt="Excavadora Pesada CAT en Obra" 
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-white flex items-center justify-between text-xs border border-white/10 font-mono">
              <span class="font-bold text-amber-400">Excavadora CAT 320D2</span>
              <span class="text-slate-300 text-[10px]">Patio Central Sabana</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 5. CATEGORÍAS CON FOTOGRAFÍA REAL DE FONDO (Real Worksite Photos) -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Líneas de Maquinaria y Equipos
            </h2>
            <p class="text-xs text-slate-500">Selecciona el rubro de trabajo para tu frente de obra</p>
          </div>
          <a href="#/catalog" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Ver toda la flota</span>
            ${renderIcon('ChevronRight', 'w-4 h-4')}
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${photoCategories.map(cat => `
            <a 
              href="#/catalog?category=${cat.id}" 
              class="group relative h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 text-white hover:shadow-lg transition-all cursor-pointer"
            >
              <!-- Real Photography Background -->
              <img 
                src="${cat.img}" 
                alt="${cat.name}" 
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              <!-- Dark Vignette for Crisp Text Readability -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/30"></div>

              <!-- Top Bar in Card -->
              <div class="relative z-10 flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  ${renderIcon(cat.icon, 'w-4 h-4')}
                </span>
                <span class="px-2.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono font-bold text-blue-200 border border-white/10">
                  ${cat.count}
                </span>
              </div>

              <!-- Bottom Content -->
              <div class="relative z-10 space-y-0.5">
                <div class="text-[10px] font-mono uppercase font-bold text-amber-300 tracking-wider">${cat.subtitle}</div>
                <h3 class="text-base font-bold text-white group-hover:text-blue-200 transition-colors">${cat.name}</h3>
              </div>
            </a>
          `).join('')}
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 6. MAQUINARIA DESTACADA PARA ALQUILER INMEDIATO -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Maquinaria Lista para Despacho
            </h2>
            <p class="text-xs text-slate-500">Unidades certificadas con telemetría satelital activa</p>
          </div>
          <a href="#/catalog" class="text-xs font-bold text-blue-600 hover:underline">
            Ver todas (${allTools.length}) &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          ${featuredTools.map(t => {
            const primaryImg = resolveToolImageUrl(t);
            const isAvailable = t.status === 'AVAILABLE';

            return `
              <div 
                class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                onclick="window.location.hash='#/product/${t.id}'"
              >
                <div>
                  <div class="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100">
                    <img 
                      src="${primaryImg}" 
                      alt="${t.name}" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${t.categoryName || ''}', '${t.name.replace(/'/g, "\\'")}')"
                    />
                    
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                    }">
                      ${isAvailable ? 'Disponible' : 'En Obra'}
                    </span>

                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/95 text-slate-700 border border-slate-200">
                      ${t.brand || 'CAT'}
                    </span>
                  </div>

                  <div class="p-4 space-y-1.5">
                    <div class="text-[10px] uppercase font-bold text-slate-400 font-mono">${t.categoryName || 'Construcción'}</div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      ${t.name}
                    </h3>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      ${t.description || 'Maquinaria industrial con póliza todo riesgo y mantenimiento al día.'}
                    </p>
                  </div>
                </div>

                <div class="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between">
                  <div>
                    <div class="text-[9px] text-slate-400 uppercase font-mono">Tarifa por día</div>
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

    </div>
  `;

  // Hero form handler
  container.querySelector('#hero-quote-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.hash = '#/catalog';
  });
}

export default renderHomeView;
