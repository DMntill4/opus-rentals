import bannerOpusImg from '../assets/bannerOpus.png';
import { renderNavbar } from '../components/navbar.js';
import { renderIcon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import api from '../api/client.js';
import auth from '../auth/state.js';
import { openAuthModal } from '../components/auth-modal.js';
import { i18n } from '../utils/i18n.js';

export async function renderHomeView() {
  renderNavbar('home');
  const container = document.getElementById('app-content');
  if (!container) return;

  const isEn = i18n.getLang() === 'EN';

  // Fetch featured fleet items for dynamic carousel showcase
  let featuredTools = [];
  try {
    const tools = await api.get('/tools');
    featuredTools = (tools || []).slice(0, 4);
  } catch (e) {
    console.warn('Could not load featured tools for home', e);
  }

  container.innerHTML = `
    <div class="space-y-16 sm:space-y-24 pb-20 animate-fade-in">

      <!-- 1. Hero Presentation Section with bannerOpus Brand Showcase -->
      <section class="relative overflow-hidden pt-6 sm:pt-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a1829] via-[#132e4f] to-[#1e4676] text-white border border-slate-700/60 shadow-2xl">
            <!-- Architectural drafting lines overlay -->
            <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 32px 32px;"></div>
            
            <!-- Atmospheric glow elements -->
            <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <!-- Left Column: Value Proposition -->
              <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="font-mono text-[11px] uppercase tracking-wider">${isEn ? 'Next-Gen B2B Equipment Rental' : 'Plataforma B2B de Maquinaria Industrial'}</span>
                </div>

                <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] text-white">
                  <span>${isEn ? 'Heavy machinery for massive projects.' : 'Alquila la potencia que tu obra exige.'}</span><br />
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-amber-200">${isEn ? 'Zero idle assets. Pure efficiency.' : 'Sin comprarla. Al instante.'}</span>
                </h1>

                <p class="text-sm sm:text-base text-slate-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  ${isEn 
                    ? 'Opus Rentals connects verified industrial suppliers with construction contractors. Certified telematics, official legal billing, anti-collision booking, and immediate jobsite delivery.'
                    : 'Conectamos contratistas y constructoras con proveedores verificados de maquinaria pesada. Telemetría GPS en tiempo real, facturación electrónica legal y entrega garantizada en frente de obra.'}
                </p>

                <!-- Action CTA Buttons -->
                <div class="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a href="#/catalog" class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer group">
                    <span>${isEn ? 'Explore Fleet Catalog' : 'Explorar Flota Disponible'}</span>
                    ${renderIcon('ArrowRight', 'w-4 h-4 group-hover:translate-x-1 transition-transform')}
                  </a>

                  ${!auth.isAuthenticated() ? `
                    <button id="home-btn-register" class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer">
                      ${renderIcon('Building2', 'w-4 h-4')}
                      <span>${isEn ? 'Register Contractor' : 'Registrar Empresa'}</span>
                    </button>
                  ` : `
                    <a href="#/client" class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer">
                      ${renderIcon('User', 'w-4 h-4')}
                      <span>${isEn ? 'Go to My Dashboard' : 'Ir a Mi Panel'}</span>
                    </a>
                  `}
                </div>

                <!-- Trust Micro-Badges -->
                <div class="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 font-medium">
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span>Póliza SURA Todo Riesgo</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span>Telemetría Satelital Activa</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span>Mantenimiento Preventivo al Día</span>
                  </div>
                </div>

              </div>

              <!-- Right Column: Banner Showcase with Animated Float Card -->
              <div class="lg:col-span-5 relative flex justify-center">
                <div class="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/30 dark:border-slate-700 hover-lift card-glow">
                  
                  <div class="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner group">
                    <img 
                      src="${bannerOpusImg}" 
                      alt="Opus Rentals Architecture" 
                      class="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div class="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl text-white flex items-center justify-between text-xs border border-white/10">
                      <span class="font-mono text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> FLOTA ACTIVA B2B
                      </span>
                      <span class="text-[10px] text-slate-300">Colombia 2026</span>
                    </div>
                  </div>

                  <!-- Quick Stats Bar Inside Card -->
                  <div class="grid grid-cols-3 gap-2 pt-4 text-center">
                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                      <div class="text-base sm:text-lg font-black text-[#132e4f] dark:text-blue-400 font-mono">100%</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Disponibilidad</div>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                      <div class="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">16</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Categorías</div>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                      <div class="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">24/7</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Soporte Obra</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- 2. Feature Pillars: Why Opus Rentals -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-[#132e4f] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60">
            ${isEn ? 'Enterprise Machinery Platform' : 'Arquitectura Diseñada para Obra'}
          </span>
          <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
            ${isEn ? 'Efficiency, control, and zero friction.' : 'Tecnología pesada al servicio de tu proyecto'}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ${isEn ? 'Everything you need to schedule, dispatch, and track equipment.' : 'Diseñado para eliminar intermediarios, evitar sobrecostos y garantizar que tu obra nunca se detenga.'}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          <!-- Pillar 1 -->
          <div class="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover-lift card-glow space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-[#132e4f]/10 dark:bg-blue-500/10 text-[#132e4f] dark:text-blue-400 flex items-center justify-center">
              ${renderIcon('CalendarCheck', 'w-7 h-7')}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Motor Anti-Colisión en Fechas</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Nuestro algoritmo valida en tiempo real la disponibilidad física del equipo. Cero sobre-reservas: si un equipo está asignado a un frente de obra, el sistema bloquea automáticamente ese intervalo.
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover-lift card-glow space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              ${renderIcon('FileCheck', 'w-7 h-7')}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Facturación Oficial con IVA 19%</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Liquidación automática con comprobante fiscal, desglose de impuestos y pólizas de reposición. Descarga tus facturas en PDF o imprímelas con un solo clic.
            </p>
          </div>

          <!-- Pillar 3 -->
          <div class="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover-lift card-glow space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              ${renderIcon('ShieldCheck', 'w-7 h-7')}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Acta Digital de Devolución & Daños</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Inspección técnica transparente al recibir y devolver la máquina. Desacoplamiento normalizado en 4FN para reportar averías específicas sin conflictos contractuales.
            </p>
          </div>

        </div>
      </section>

      <!-- 3. Featured Machinery Grid Showcase -->
      ${featuredTools.length > 0 ? `
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                ${isEn ? 'High Demand Machinery' : 'Flota Destacada'}
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                ${isEn ? 'Ready for Immediate Dispatch' : 'Equipos Listos para Despacho Inmediato'}
              </h2>
            </div>
            <a href="#/catalog" class="btn-primary !py-2.5 !px-5 text-xs inline-flex items-center gap-1.5 shadow-sm">
              <span>${isEn ? 'View All 25+ Machines' : 'Ver Todo el Catálogo'}</span>
              ${renderIcon('ChevronRight', 'w-4 h-4')}
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${featuredTools.map(t => {
              const primaryImg = t.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80';
              return `
                <div class="tr-card overflow-hidden flex flex-col justify-between hover-lift group cursor-pointer" onclick="window.location.hash='#/product/${t.id}'">
                  <div>
                    <div class="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img 
                        src="${primaryImg}" 
                        alt="${t.name}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${t.categoryName || ''}', '${t.name.replace(/'/g, "\\'")}')"
                      />
                      <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-[#132e4f] dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        ${t.brand}
                      </span>
                    </div>

                    <div class="p-4 space-y-1.5">
                      <div class="text-[10px] text-slate-400 font-mono uppercase">${t.categoryName || 'Construcción'}</div>
                      <h4 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#132e4f] dark:group-hover:text-blue-400 transition-colors">${t.name}</h4>
                      <p class="text-[11px] text-slate-500 line-clamp-2">${t.description || 'Equipo industrial certificado con seguro todo riesgo SURA incluido.'}</p>
                    </div>
                  </div>

                  <div class="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div class="text-[10px] text-slate-400">Tarifa día</div>
                      <div class="text-xs font-bold text-[#132e4f] dark:text-blue-400 font-mono">${formatCurrency(t.dailyPrice)}</div>
                    </div>
                    <span class="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Alquilar ${renderIcon('ArrowRight', 'w-3.5 h-3.5')}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 4. Operational Call to Action Banner -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0a1c33] to-[#132e4f] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
          <div class="relative z-10 space-y-2 text-center md:text-left">
            <h3 class="text-2xl sm:text-3xl font-extrabold font-display">¿Tienes maquinaria disponible para alquilar?</h3>
            <p class="text-xs sm:text-sm text-slate-300 max-w-md">Únete a nuestra red nacional de proveedores. Publica tu flota, recibe solicitudes de contratistas y gestiona tus pagos de forma transparente.</p>
          </div>
          <div class="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button id="cta-provider-btn" class="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#132e4f] font-extrabold text-xs shadow-md transition-all cursor-pointer text-center">
              Registrarme como Proveedor
            </button>
            <a href="#/catalog" class="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all text-center">
              Ver Catálogo Completo
            </a>
          </div>
        </div>
      </section>

    </div>
  `;

  // Attach event listeners
  container.querySelector('#home-btn-register')?.addEventListener('click', () => {
    openAuthModal('register');
  });

  container.querySelector('#cta-provider-btn')?.addEventListener('click', () => {
    openAuthModal('register');
  });
}

export default renderHomeView;
