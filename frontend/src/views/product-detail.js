import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openRentalModal } from './rental-modal.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openProviderContactModal } from '../components/provider-modal.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';
import { i18n } from '../utils/i18n.js';

export async function renderProductPageView(toolId) {
  const container = document.getElementById('app-content');
  if (!container) return;

  const isEn = i18n.getLang() === 'EN';

  // Loading skeleton state
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div class="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div class="grid grid-cols-2 gap-6">
            <div class="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div class="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
        <div class="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    </div>
  `;

  let tool = null;
  try {
    const tools = await api.get('/tools');
    tool = (tools || []).find(t => String(t.id) === String(toolId)) || null;
  } catch (err) {
    console.error('Error fetching tool details', err);
  }

  if (!tool) {
    container.innerHTML = `
      <section class="min-h-[80vh] bg-[#f8fafc] flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 text-center relative overflow-hidden">
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: linear-gradient(to right, #132e4f 1px, transparent 1px), linear-gradient(to bottom, #132e4f 1px, transparent 1px); background-size: 20px 20px;"></div>
          
          <div class="relative z-10 flex flex-col items-center">
            <div class="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-3 mb-6 shadow-xs">
              <img src="/iconWebPageNoBg.png" alt="Opus Rentals" class="w-full h-full object-contain" />
            </div>
            
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#132e4f] mb-3">
              ${isEn ? 'Status 404 • Fleet Item Not Found' : 'Código 404 • Equipo no encontrado'}
            </span>
            
            <h1 class="text-3xl sm:text-4xl font-extrabold font-display text-[#132e4f] tracking-tight mb-3">
              ${isEn ? 'Equipment Not Available' : 'Equipo No Encontrado'}
            </h1>
            
            <p class="text-slate-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              ${isEn 
                ? 'The requested machinery ID is not registered in our active telematics registry or has been decommissioned.' 
                : 'La referencia solicitada no está registrada en nuestro inventario telemático activo o ha sido dada de baja.'}
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
              <a href="#/catalog" class="w-full sm:w-auto flex-1 px-6 py-3 bg-[#132e4f] hover:bg-[#0a1c33] text-white text-xs font-bold rounded-xl shadow-xs transition-all text-center">
                ${isEn ? 'Back to Fleet' : 'Volver al Catálogo'} &rarr;
              </a>
              <button id="btn-product-404-back" type="button" class="w-full sm:w-auto flex-1 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer text-center">
                &larr; ${isEn ? 'Previous Page' : 'Página Anterior'}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#btn-product-404-back')?.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '#/catalog';
      }
    });

    return;
  }

  // Active image gallery index
  let activeImageIndex = 0;
  const primaryResolved = resolveToolImageUrl(tool);
  const images = tool.images && tool.images.length > 0 ? tool.images : [
    { imageUrl: primaryResolved },
    { imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=85' },
  ];

  // Dates state
  let daysCount = 3;
  let startDate = '2026-10-13';
  let endDate = '2026-10-16';

  function render() {
    const dailyPrice = tool.dailyPrice || 1250000;
    const totalAmount = dailyPrice * daysCount;
    const currentImg = images[activeImageIndex]?.imageUrl || images[0].imageUrl;
    const isAvailable = tool.status === 'AVAILABLE';

    const specsList = tool.specs && tool.specs.length > 0 ? tool.specs : [
      { specName: 'Marca', specValue: tool.brand || 'Caterpillar' },
      { specName: 'Modelo', specValue: tool.model || '320D2 GC' },
      { specName: 'Potencia del Motor', specValue: '148 HP' },
      { specName: 'Peso Operativo', specValue: '21.5 Toneladas' },
      { specName: 'Capacidad de Balde', specValue: '1.0 m³' },
      { specName: 'Horómetro Actual', specValue: '1.450 Horas' },
      { specName: 'Telemetría', specValue: 'Product Link 4G Activa' },
      { specName: 'Ubicación Hub', specValue: 'Bogotá · Parque Cazucá' },
    ];

    const highlights = tool.highlights && tool.highlights.length > 0 ? tool.highlights : [
      'Monitoreo satelital GPS 24/7', 'Póliza Sura Todo Riesgo incluida', 'Operador certificado opcional', 'Mantenimiento preventivo al día'
    ];

    container.innerHTML = `
      <div class="min-h-screen bg-[#f8fafc] text-slate-800 transition-colors duration-200 pb-16 animate-pop-in">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          <!-- Breadcrumb navigation -->
          <nav class="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <a href="#/catalog" class="hover:text-[#132e4f] dark:hover:text-blue-400 transition-colors">${isEn ? 'Home' : 'Flota'}</a>
            <span>/</span>
            <span class="hover:text-[#132e4f] dark:hover:text-blue-400 cursor-pointer">${tool.categoryName || 'Maquinaria Pesada'}</span>
            <span>/</span>
            <span class="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">${tool.name}</span>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left 8 Columns: Gallery & Detailed Specs -->
            <div class="lg:col-span-8 space-y-8">
              
              <!-- Gallery Stage -->
              <div class="flex flex-col sm:flex-row gap-4">
                
                <!-- Thumbnails column -->
                <div class="flex sm:flex-col gap-3 flex-shrink-0 order-2 sm:order-1" id="gallery-thumbs">
                  ${images.map((img, idx) => `
                    <button class="thumb-btn w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex 
                        ? 'border-[#132e4f] ring-2 ring-[#132e4f]/30 dark:border-blue-500 dark:ring-blue-500/30' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }" data-index="${idx}">
                      <img 
                        src="${img.imageUrl}" 
                        class="w-full h-full object-cover" 
                        alt="Thumbnail ${idx + 1}" 
                        loading="lazy"
                        onerror="window.ToolRentCacheShield?.handleImageError(this, '${img.imageUrl}', '${tool.categoryName || ''}', '${tool.name.replace(/'/g, "\\'")}')"
                      />
                    </button>
                  `).join('')}
                </div>

                <!-- Main Image Canvas -->
                <div class="relative flex-1 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex items-center justify-center min-h-[440px] group order-1 sm:order-2">
                  <img 
                    id="main-product-image" 
                    src="${currentImg}" 
                    class="max-h-[420px] w-full object-contain p-4 transition-all duration-300" 
                    alt="${tool.name}" 
                    onerror="window.ToolRentCacheShield?.handleImageError(this, '${currentImg}', '${tool.categoryName || ''}', '${tool.name.replace(/'/g, "\\'")}')"
                  />

                  <!-- Telematics badge -->
                  <div class="absolute top-4 left-4 z-10">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-[10px] font-mono font-bold text-blue-300 border border-blue-400/30 shadow-md">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Telemetría GPS Satelital
                    </span>
                  </div>
                  
                  <!-- Left/Right navigation arrows -->
                  <button id="btn-prev-photo" class="absolute left-4 w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-md flex items-center justify-center text-white hover:bg-slate-800 transition-all cursor-pointer">
                    ${renderIcon('ChevronLeft', 'w-5 h-5')}
                  </button>
                  <button id="btn-next-photo" class="absolute right-4 w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-md flex items-center justify-center text-white hover:bg-slate-800 transition-all cursor-pointer">
                    ${renderIcon('ChevronRight', 'w-5 h-5')}
                  </button>

                  <!-- Counter Indicator -->
                  <div class="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-3 py-1 rounded-xl border border-slate-700">
                    ${activeImageIndex + 1} / ${images.length}
                  </div>
                </div>

              </div>

              <!-- Specs & Description Two-Column Box -->
              <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <!-- Left: Especificaciones Table -->
                  <div>
                    <div class="flex items-center gap-2 mb-4">
                      ${renderIcon('Wrench', 'w-4 h-4 text-[#132e4f] dark:text-blue-400')}
                      <h3 class="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                        ${isEn ? 'Technical Specifications' : 'Ficha Técnica Oficial'}
                      </h3>
                    </div>
                    
                    <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      ${specsList.map(s => `
                        <div class="py-2.5 flex justify-between gap-4">
                          <span class="text-slate-500 dark:text-slate-400 font-medium">${s.specName}</span>
                          <span class="font-bold text-slate-800 dark:text-slate-200 font-mono text-right">${s.specValue}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Right: Descripción & Proveedor -->
                  <div class="space-y-6">
                    <div>
                      <div class="flex items-center gap-2 mb-3">
                        ${renderIcon('FileText', 'w-4 h-4 text-[#132e4f] dark:text-blue-400')}
                        <h3 class="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                          ${isEn ? 'Operational Scope' : 'Alcance en Obra'}
                        </h3>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        ${tool.description || 'Equipo pesado certificado para movimiento de tierras y proyectos de infraestructura civil. Monitoreado en tiempo real con horómetro auditado.'}
                      </p>
                    </div>

                    <!-- Highlight Features Pills -->
                    <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      ${highlights.map(h => `
                        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span class="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                          <span class="text-[11px] font-medium">${h}</span>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Proveedor Card -->
                    <div>
                      <h4 class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                        ${isEn ? 'Authorized Fleet Provider' : 'Proveedor de Maquinaria Certificado'}
                      </h4>
                      <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl bg-[#132e4f] text-white flex items-center justify-center font-black font-mono text-sm border border-blue-400/20">
                            ${(tool.provider?.name || 'CP').substring(0, 2).toUpperCase()}
                          </div>
                          <div class="flex-1 min-w-0">
                            <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">${tool.provider?.name || 'Caterpillar Equipos SAS'}</h5>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400">Patio de Maquinaria · ${tool.provider?.city || 'Bogotá D.C.'}</p>
                          </div>
                          <div class="text-right text-xs">
                            <div class="font-bold text-amber-500 flex items-center gap-1 justify-end font-mono">
                              ★ <span>${tool.provider?.rating || 4.9}</span>
                            </div>
                            <span class="text-[10px] text-slate-400 font-mono">(${tool.provider?.reviewsCount || 142} despachos)</span>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button id="btn-contact-provider" class="w-full bg-[#132e4f] hover:bg-[#1a3c66] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 px-3 transition-all hover:scale-[1.01] cursor-pointer shadow-xs">
                            ${renderIcon('Phone', 'w-3.5 h-3.5 text-amber-400')}
                            <span>${isEn ? 'Contact Provider' : 'Contactar Proveedor'}</span>
                          </button>

                          <a href="#/catalog?provider=${encodeURIComponent(tool.providerId || tool.provider?.id || tool.provider?.name || tool.providerCompanyName || '')}" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-between px-3 transition-all hover:scale-[1.01] hover:shadow-xs shadow-2xs">
                            <span>${isEn ? 'View Fleet' : 'Ver Toda su Flota'}</span>
                            ${renderIcon('ChevronRight', 'w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform')}
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            <!-- Right 4 Columns: Sticky Booking Card -->
            <div class="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              
              <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xl space-y-5 transition-colors duration-200">
                
                <!-- Title & Status Badge -->
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-[10px] font-mono uppercase font-bold text-[#132e4f] dark:text-blue-400">
                      ${tool.categoryName || 'Excavación y Tierras'}
                    </div>
                    <h2 class="text-lg font-black text-slate-900 dark:text-white font-display leading-tight">${tool.name}</h2>
                    <p class="text-xs text-slate-400 font-mono mt-1">ID: ${tool.id || 'TOOL-001'}</p>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono ${
                    isAvailable 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  }">
                    <span class="w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
                    ${isAvailable ? (isEn ? 'Available' : 'Disponible') : (isEn ? 'Rented' : 'En Obra')}
                  </span>
                </div>

                <!-- Price Row -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
                  <div class="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    ${isEn ? 'Agreed Daily Rate (COP)' : 'Tarifa Diaria Contratada (COP)'}
                  </div>
                  <div class="flex items-baseline gap-1.5 pt-1">
                    <span class="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">${formatCurrency(dailyPrice)}</span>
                    <span class="text-xs text-slate-500 font-medium">/ día</span>
                  </div>
                </div>

                <!-- Date Range Selector -->
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase">
                    ${isEn ? 'Rental Period in Job Site' : 'Período de Entrega en Frente de Obra'}
                  </label>
                  <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:border-[#132e4f] dark:hover:border-blue-500 transition-colors" id="btn-open-dates-picker">
                    <div class="flex items-center gap-2">
                      ${renderIcon('Calendar', 'w-4 h-4 text-[#132e4f] dark:text-blue-400')}
                      <span class="font-bold font-mono">14 oct 2026</span>
                    </div>
                    <span class="text-slate-400">&rarr;</span>
                    <div class="flex items-center gap-2">
                      <span class="font-bold font-mono">17 oct 2026</span>
                      ${renderIcon('ChevronDown', 'w-3.5 h-3.5 text-slate-400')}
                    </div>
                  </div>
                </div>

                <!-- Cost Calculation Box -->
                <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">${daysCount} ${isEn ? 'days' : 'días'} × ${formatCurrency(dailyPrice)}</span>
                  <span class="font-black text-slate-900 dark:text-white text-base font-mono">${formatCurrency(totalAmount)}</span>
                </div>

                <!-- Booking Button -->
                <button id="btn-add-to-rental" class="btn-primary w-full !py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer">
                  ${renderIcon('CalendarCheck', 'w-4 h-4')} ${isEn ? 'Quote & Book Machine' : 'Cotizar y Despachar a Obra'}
                </button>

                <!-- Guarantee checklist -->
                <div class="space-y-1.5 pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span>
                    <span>Póliza de Responsabilidad Civil RUNT</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span>
                    <span>Acta de entrega técnica digital</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-500 font-bold">✓</span>
                    <span>Soporte mecánico en obra 24/7</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    `;

    // Photo thumbnails switcher
    container.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeImageIndex = parseInt(btn.dataset.index, 10);
        render();
      });
    });

    // Arrow navigation
    container.querySelector('#btn-prev-photo')?.addEventListener('click', () => {
      activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
      render();
    });
    container.querySelector('#btn-next-photo')?.addEventListener('click', () => {
      activeImageIndex = (activeImageIndex + 1) % images.length;
      render();
    });

    // Dates picker / booking button
    container.querySelector('#btn-add-to-rental')?.addEventListener('click', () => {
      if (!auth.isAuthenticated()) {
        showToast('Debes iniciar sesión para realizar una cotización o alquiler', 'warning');
        openAuthModal('login');
        return;
      }
      showToast('Maquinaria agregada al contrato con éxito', 'success', 3000, 'Cotización Iniciada');
      setTimeout(() => {
        openRentalModal(tool);
      }, 500);
    });

    container.querySelector('#btn-open-dates-picker')?.addEventListener('click', () => {
      openRentalModal(tool);
    });

    container.querySelector('#btn-contact-provider')?.addEventListener('click', () => {
      openProviderContactModal(tool);
    });
  }

  render();
}

export default renderProductPageView;
