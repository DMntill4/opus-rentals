import { renderNavbar } from '../components/navbar.js';
import { renderIcon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import api from '../api/client.js';
import auth from '../auth/state.js';
import { openAuthModal } from '../components/auth-modal.js';
import { resolveToolImageUrl, constructionHeroImage, constructionHeroImage2, constructionCategories } from '../utils/tool-images.js';

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

  container.innerHTML = `
    <div class="bg-[#F4F5F7] min-h-screen text-[#1A1A1A] font-sans pb-16 animate-fade-in">

      <!-- ========================================================================= -->
      <!-- 1. FULL-WIDTH HERO: REAL WORK-SITE BACKGROUND + FLOATING QUOTE BAR       -->
      <!-- ========================================================================= -->
      <section class="relative w-full overflow-hidden bg-slate-950 text-white min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex items-center justify-center">
        
        <!-- High Quality Image (Preserves 100% natural colors, sharpness and details) -->
        <img 
          src="${constructionHeroImage}" 
          alt="Maquinaria Pesada en Obra Civil" 
          class="absolute inset-0 w-full h-full object-cover object-bottom select-none"
          loading="eager"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1920&q=85';"
        />

        <!-- Real Full-Coverage Dark Overlay (Uniform, cinematic & highly readable) -->
        <div class="absolute inset-0 bg-slate-950/65"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"></div>

        <div class="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center text-center space-y-4">
          
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800] text-[#1A1A1A] text-xs font-black uppercase font-mono tracking-wider shadow-lg">
            <span class="w-2 h-2 rounded-full bg-[#1A1A1A] animate-pulse"></span>
            Flota Pesada Certificada con Telemetría en Vivo
          </div>

          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight max-w-4xl leading-[1.12] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
            Alquiler de Maquinaria Pesada para Grandes Proyectos
          </h1>

          <p class="text-sm sm:text-base text-slate-100 font-medium max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Disponibilidad en tiempo real en Bogotá y Sabana, tarifas transparentes por día, semana y mes con facturación electrónica DIAN.
          </p>

          <!-- Floating Quote Box (Exact replica of your reference image) -->
          <div class="w-full max-w-4xl bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 text-[#1A1A1A] mt-2 text-left">
            <form id="hero-quote-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              
              <!-- Ubicación de Obra -->
              <div class="lg:col-span-4 space-y-1">
                <label class="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  ${renderIcon('MapPin', 'w-3 h-3 text-[#FF6B00]')} Ubicación de Obra
                </label>
                <div class="relative">
                  <select id="quote-location" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FFB800] appearance-none cursor-pointer">
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
                <label class="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  ${renderIcon('Calendar', 'w-3 h-3 text-[#FF6B00]')} Fecha Inicio
                </label>
                <input 
                  type="date" 
                  id="quote-start-date" 
                  value="2026-10-16"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div class="lg:col-span-3 space-y-1">
                <label class="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  ${renderIcon('Clock', 'w-3 h-3 text-[#FF6B00]')} Modalidad
                </label>
                <div class="relative">
                  <select id="quote-mode" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FFB800] appearance-none cursor-pointer">
                    <option value="despacho">Despacho a Frente de Obra</option>
                    <option value="patio">Retiro Directo en Patio</option>
                  </select>
                  <div class="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                    ${renderIcon('ChevronDown', 'w-3.5 h-3.5')}
                  </div>
                </div>
              </div>

              <!-- Botón Cotizar Ahora (Amarillo Industrial con Texto Oscuro) -->
              <div class="lg:col-span-2">
                <button 
                  type="submit" 
                  class="btn-primary w-full !py-2.5 text-xs font-black shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Cotizar Ahora</span>
                  ${renderIcon('ArrowRight', 'w-4 h-4')}
                </button>
              </div>

            </form>

            <!-- Atajos rápidos debajo del cotizador -->
            <div class="pt-3 border-t border-slate-100 mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
              <span class="font-bold font-mono text-slate-800">Maquinaria rápida:</span>
              <a href="#/catalog?q=excavadora" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-slate-900 font-semibold transition-colors">Excavadoras</a>
              <a href="#/catalog?q=rodillo" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-slate-900 font-semibold transition-colors">Rodillos</a>
              <a href="#/catalog?q=bobcat" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-slate-900 font-semibold transition-colors">Minicargador</a>
              <a href="#/catalog?q=generador" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-slate-900 font-semibold transition-colors">Plantas Diésel</a>
              <a href="#/catalog?q=martillo" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-slate-900 font-semibold transition-colors">Demoledores</a>
            </div>

          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 2. CINTA AMARILLA OPERATIVA (Alerta de Despachos en Obra)                 -->
      <!-- ========================================================================= -->
      <div class="bg-[#FFB800] text-[#1A1A1A] font-extrabold text-xs py-2.5 px-4 shadow-sm select-none border-y border-amber-400">
        <div class="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] animate-ping"></span>
            <span>Nuestra flota pesada está activa para despachos de emergencia y entregas el mismo día en Bogotá y Cundinamarca.</span>
          </div>
          <a href="#/catalog" class="font-black uppercase font-mono tracking-wider underline hover:text-slate-800 text-[11px] whitespace-nowrap">
            Ver Flota Disponible &rarr;
          </a>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 3. PROPUESTA DE VALOR: TEN MENOS ACTIVOS OCIOSOS                          -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div class="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            La Eficiencia Operativa en Obra
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 font-display">
            Ten Menos Activos Ociosos, Construye Más – El Poder del Alquiler
          </h2>
          <p class="text-xs sm:text-sm text-slate-600">
            Elimina el costo de capital inmovilizado y optimiza el flujo de caja en tus proyectos de infraestructura.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              ${renderIcon('Wrench', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-black text-slate-900">Asesoría Técnica Especializada</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              Ingenieros mecánicos y especialistas en obra para recomendar la capacidad exacta de balde, tonelaje, caudal y consumos de combustible para tu frente de obra.
            </p>
            <div class="pt-2 text-[11px] font-bold text-amber-700 font-mono">
              ✓ Asignación técnica a la medida
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              ${renderIcon('ShieldCheck', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-black text-slate-900">Equipos 100% Inspeccionados</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              Seguridad operativa garantizada: verificamos presión hidráulica, horómetro y telemetría bajo protocolos de inspección ISO pre-entrega y póliza SURA.
            </p>
            <div class="pt-2 text-[11px] font-bold text-emerald-700 font-mono">
              ✓ Cero paradas no programadas
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              ${renderIcon('FileCheck', 'w-6 h-6')}
            </div>
            <h3 class="text-base font-black text-slate-900">Cero Costos de Mantenimiento</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              Despreocúpate de pólizas inactivas, talleres de mantenimiento, depreciación ni bodegaje. Costo 100% deducible de impuestos como gasto operativo (OPEX).
            </p>
            <div class="pt-2 text-[11px] font-bold text-orange-700 font-mono">
              ✓ 100% Deducible en renta DIAN
            </div>
          </div>

        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 4. GUÍA Y CATÁLOGO TÉCNICO 2026 (Banner Delgado, Compacto y Elegante)      -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          
          <div class="lg:col-span-7 p-6 sm:p-8 space-y-3">
            <span class="text-[10px] font-mono uppercase font-black text-amber-700 tracking-wider">
              Documentación Técnica Oficial
            </span>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 font-display leading-tight">
              Catálogo de Maquinaria Pesada & Guía de Selección 2026
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal max-w-xl">
              Optimiza tiempos de ciclo y ahorra hasta un 35% en combustible. Tablas de rendimiento, capacidades de balde, horas de vida útil, potencia diésel y requisitos de transporte.
            </p>
            <div class="pt-1 flex flex-wrap items-center gap-2.5">
              <a 
                href="#/catalog" 
                class="btn-primary !py-2 !px-4 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
              >
                ${renderIcon('Download', 'w-3.5 h-3.5')}
                <span>Descargar Catálogo (PDF)</span>
              </a>
              <a 
                href="#/catalog" 
                class="btn-dark !py-2 !px-4 text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                <span>Explorar Online</span>
                ${renderIcon('ArrowRight', 'w-3.5 h-3.5')}
              </a>
            </div>
          </div>

          <div class="lg:col-span-5 h-48 sm:h-56 lg:h-64 bg-slate-900 relative overflow-hidden">
            <img 
              src="${constructionHeroImage2}" 
              alt="Excavadora Pesada CAT 320D2" 
              class="w-full h-full object-cover object-center"
              loading="lazy"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=85';"
            />
            <div class="absolute bottom-2.5 left-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-white flex items-center justify-between text-[11px] border border-white/10 font-mono">
              <span class="font-bold text-[#FFB800]">Excavadora CAT 320D2</span>
              <span class="text-slate-300 text-[9px]">Patio Central Bogotá</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 5. CATEGORÍAS CON FOTOGRAFÍA REAL DE OBRA (100% Visibles y Nítidas)       -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Líneas de Maquinaria y Equipos
            </h2>
            <p class="text-xs text-slate-500">Selecciona el rubro de trabajo para tu frente de obra</p>
          </div>
          <a href="#/catalog" class="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
            <span>Ver toda la flota</span>
            ${renderIcon('ChevronRight', 'w-4 h-4')}
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${constructionCategories.map(cat => `
            <a 
              href="#/catalog?category=${cat.id}" 
              class="group relative h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between p-5 text-white hover:shadow-lg transition-all cursor-pointer bg-slate-900"
            >
              <!-- Real Photography Background with object-cover -->
              <img 
                src="${cat.imageUrl}" 
                alt="${cat.name}" 
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                loading="lazy"
                onerror="if (this.src !== '${cat.remoteFallback}') { this.src = '${cat.remoteFallback}'; } else { this.onerror=null; this.src='https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800'; }"
              />

              <!-- Film overlay for clear text contrast -->
              <div class="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/40 transition-colors"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>

              <!-- Top Bar -->
              <div class="relative z-10 flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl bg-[#FFB800] text-slate-950 flex items-center justify-center font-bold shadow-sm">
                  ${renderIcon(cat.icon, 'w-4 h-4')}
                </span>
                <span class="px-2.5 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-mono font-bold text-amber-300 border border-white/20">
                  ${cat.count}
                </span>
              </div>

              <!-- Bottom Content -->
              <div class="relative z-10 space-y-0.5">
                <div class="text-[10px] font-mono uppercase font-black text-[#FFB800] tracking-wider">${cat.tag}</div>
                <h3 class="text-base font-bold text-white group-hover:text-amber-200 transition-colors">${cat.name}</h3>
              </div>
            </a>
          `).join('')}
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 6. MAQUINARIA DESTACADA PARA ALQUILER INMEDIATO                          -->
      <!-- ========================================================================= -->
      <section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Maquinaria Lista para Despacho
            </h2>
            <p class="text-xs text-slate-500">Unidades certificadas con póliza SURA y telemetría activa</p>
          </div>
          <a href="#/catalog" class="text-xs font-bold text-amber-700 hover:underline">
            Ver todas (${allTools.length}) &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          ${featuredTools.map(t => {
            const primaryImg = resolveToolImageUrl(t);
            const isAvailable = t.status === 'AVAILABLE';

            return `
              <div 
                class="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                onclick="window.location.hash='#/product/${t.id}'"
              >
                <div>
                  <div class="relative h-48 bg-slate-900 overflow-hidden border-b border-slate-100">
                    <img 
                      src="${primaryImg}" 
                      alt="${t.name}" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';"
                    />
                    
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono ${
                      isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                    }">
                      ${isAvailable ? 'Disponible Hoy' : 'En Obra'}
                    </span>

                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FFB800] text-slate-950">
                      ${t.brand || 'CAT'}
                    </span>
                  </div>

                  <div class="p-4 space-y-1.5">
                    <div class="text-[10px] uppercase font-black text-slate-400 font-mono tracking-wider">${t.categoryName || 'Construcción'}</div>
                    <h3 class="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                      ${t.name}
                    </h3>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      ${t.description || 'Maquinaria industrial con póliza todo riesgo y mantenimiento al día.'}
                    </p>
                  </div>
                </div>

                <div class="p-4 pt-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div class="text-[9px] text-slate-400 uppercase font-mono font-bold">Tarifa por día</div>
                    <div class="text-base font-black text-slate-900 font-mono">
                      ${formatCurrency(t.dailyPrice)}
                    </div>
                  </div>

                  <button class="btn-primary !px-3.5 !py-2 text-xs font-black">
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
