import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openRentalModal } from './rental-modal.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openProviderContactModal } from '../components/provider-modal.js';
import { resolveToolImageUrl, resolveToolGalleryImages, constructionHeroImage } from '../utils/tool-images.js';
import { openDateRangeModal, toIsoDate, calculateRentalDays, parseIsoDate } from '../components/custom-date-picker.js';

export async function renderProductPageView(toolId) {
  const container = document.getElementById('app-content');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div class="h-5 w-48 bg-slate-200 rounded"></div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-5 h-96 bg-slate-200 rounded-xl"></div>
        <div class="lg:col-span-4 h-96 bg-slate-200 rounded-xl"></div>
        <div class="lg:col-span-3 h-96 bg-slate-200 rounded-xl"></div>
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
      <div class="min-h-[70vh] bg-[#F4F5F7] flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md space-y-4">
          <div class="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-700">
            ${renderIcon('AlertCircle', 'w-6 h-6')}
          </div>
          <h2 class="text-xl font-bold text-slate-900 font-display">Maquinaria No Encontrada</h2>
          <p class="text-xs text-slate-500">El equipo que intentas consultar no existe o ha sido retirado del inventario.</p>
          <a href="#/catalog" class="btn-primary inline-flex items-center gap-2 text-xs font-bold !py-2.5 !px-5">
            ${renderIcon('ArrowLeft', 'w-4 h-4')}
            <span>Volver al Catálogo</span>
          </a>
        </div>
      </div>
    `;
    return;
  }

  const primaryResolved = resolveToolImageUrl(tool);
  const images = resolveToolGalleryImages(tool);

  // Initial Date Range setup (default tomorrow to +6 days = 7 days)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultEnd = new Date(tomorrow);
  defaultEnd.setDate(defaultEnd.getDate() + 6);

  let activeImageIndex = 0;
  let isContainMode = false;
  let startDate = toIsoDate(tomorrow);
  let endDate = toIsoDate(defaultEnd);
  let rentalDays = calculateRentalDays(startDate, endDate);

  function render() {
    const dailyPrice = tool.dailyPrice || 580000;
    const isAvailable = tool.status === 'AVAILABLE';
    const subtotal = dailyPrice * rentalDays;
    const vat = Math.round(subtotal * 0.19);
    const total = subtotal + vat;

    const specsList = tool.specs && tool.specs.length > 0 ? tool.specs : [
      { specName: 'Marca', specValue: tool.brand || 'Caterpillar' },
      { specName: 'Modelo', specValue: tool.model || '320D2 GC' },
      { specName: 'Potencia del Motor', specValue: '148 HP' },
      { specName: 'Peso Operativo', specValue: '21.5 Toneladas' },
      { specName: 'Capacidad de Balde', specValue: '1.0 m³ Reforzado' },
      { specName: 'Horómetro Actual', specValue: '1.450 Horas' },
      { specName: 'Telemetría', specValue: 'Product Link 4G Activa' },
      { specName: 'Ubicación Hub', specValue: 'Bogotá D.C. · Patio Sabana' }
    ];

    container.innerHTML = `
      <div class="bg-[#F4F5F7] min-h-screen pb-16 text-[#1A1A1A] font-sans">
        
        <div class="bg-white border-b border-slate-200 py-3">
          <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center gap-2">
            <a href="#/home" class="hover:text-amber-700">Inicio</a>
            <span>/</span>
            <a href="#/catalog" class="hover:text-amber-700">Catálogo</a>
            <span>/</span>
            <span class="text-slate-400">${tool.categoryName || 'Construcción'}</span>
            <span>/</span>
            <span class="text-slate-900 font-bold truncate max-w-xs">${tool.name}</span>
          </div>
        </div>

        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- LEFT COLUMN: EXPANDED HIGH-IMPACT GALLERY (6 COLS / 50% WIDTH) -->
              <div class="lg:col-span-6 space-y-3.5">
                
                <!-- Main Featured Machine Image Box -->
                <div class="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-md group flex items-center justify-center">
                  <img 
                    id="main-detail-img" 
                    src="${images[activeImageIndex]?.imageUrl || images[0].imageUrl}" 
                    class="w-full h-full ${isContainMode ? 'object-contain p-4' : 'object-cover'} transition-all duration-300 group-hover:scale-102 select-none" 
                    alt="${tool.name}"
                    referrerpolicy="no-referrer"
                    onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';"
                  />
                  
                  <!-- Quality & Inspection Badge -->
                  <div class="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-mono border border-white/10 flex items-center gap-2 shadow-lg">
                    ${renderIcon('ShieldCheck', 'w-4 h-4 text-[#FF7A00]')}
                    <span class="font-bold">Inspeccionado & Certificado</span>
                  </div>

                  <!-- Aspect Ratio Toggle (Llenar / Ajustar) -->
                  <button id="btn-toggle-fit" type="button" class="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono flex items-center gap-1.5 shadow-lg transition-all cursor-pointer select-none" title="Cambiar tamaño de imagen">
                    ${renderIcon(isContainMode ? 'Maximize2' : 'Minimize2', 'w-3.5 h-3.5 text-[#FF7A00]')}
                    <span class="font-bold">${isContainMode ? 'Llenar Marco' : 'Ajustar Completa'}</span>
                  </button>
                </div>

                <!-- Thumbnails row below main image for maximum horizontal width -->
                <div class="flex items-center gap-3 overflow-x-auto pb-2 pt-1" id="detail-thumbs">
                  ${images.map((img, idx) => `
                    <button class="thumb-btn w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 bg-slate-900 ${
                      idx === activeImageIndex ? 'border-[#FF7A00] ring-3 ring-[#FF7A00]/40 scale-102 shadow-md' : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                    }" data-index="${idx}">
                      <img src="${img.imageUrl}" class="w-full h-full object-cover" alt="Vista ${idx + 1}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';" />
                    </button>
                  `).join('')}
                </div>

              </div>

              <!-- CENTER COLUMN: SPECS & MACHINE DETAILS (3 COLS) -->
              <div class="lg:col-span-3 space-y-4">
                
                <div class="space-y-1">
                  <div class="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                    ${tool.categoryName || 'Línea Amarilla de Construcción'} · SKU #${tool.id}
                  </div>
                  <h1 class="text-2xl font-black text-slate-900 font-display leading-tight">
                    ${tool.name}
                  </h1>
                  <div class="text-sm font-bold text-slate-600 font-mono">
                    Marca: ${tool.brand || 'Caterpillar'} · Modelo: ${tool.model || '2026'}
                  </div>
                </div>

                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] uppercase font-mono text-slate-400 font-bold block">Tarifa Oficial por Día</span>
                    <span class="text-2xl font-black text-slate-900 font-mono">${formatCurrency(dailyPrice)}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-emerald-600 font-bold uppercase font-mono block">Seguro Incluido</span>
                    <span class="text-xs font-mono text-slate-500">Póliza SURA Todo Riesgo</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <h3 class="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
                    Alcance Operativo en Obra
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed font-normal">
                    ${tool.description || 'Equipo especializado para frentes de obra civil, minería y cimentaciones pesadas. Incluye telemetría satelital activa y póliza SURA.'}
                  </p>
                </div>

                <div class="space-y-2 pt-2">
                  <h3 class="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
                    Ficha Técnica de Fabricante
                  </h3>
                  <div class="divide-y divide-slate-100 text-xs">
                    ${specsList.map(s => `
                      <div class="py-2 flex justify-between gap-4">
                        <span class="text-slate-500 font-medium">${s.specName}</span>
                        <span class="font-bold text-slate-900 font-mono text-right">${s.specValue}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

              </div>

              <!-- RIGHT COLUMN: BUY BOX (CUSTOM CALENDAR DATE RANGE PICKER) -->
              <div class="lg:col-span-3">
                
                <div class="bg-white rounded-xl border-2 border-slate-200 p-5 space-y-4 shadow-sm">
                  
                  <div class="space-y-1">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-black uppercase font-mono ${
                      isAvailable ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700'
                    }">
                      <span class="w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                      ${isAvailable ? 'Disponible para entrega' : 'Actualmente en Obra'}
                    </span>
                    <p class="text-[11px] text-slate-500 pt-1">
                      Despacho inmediato desde patio central de maquinaria.
                    </p>
                  </div>

                  <!-- ============================================================== -->
                  <!-- CUSTOM DATE RANGE SELECTOR (FECHA INICIO VS FECHA FIN)          -->
                  <!-- ============================================================== -->
                  <div class="space-y-2.5 pt-3 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                      <label class="text-[11px] font-black uppercase font-mono text-slate-800 tracking-wider flex items-center gap-1.5">
                        ${renderIcon('Calendar', 'w-3.5 h-3.5 text-[#FF7A00]')} Periodo de Alquiler
                      </label>
                      <span class="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Máx. 1 mes (30 días)
                      </span>
                    </div>

                    <!-- Dual Cards: Fecha Inicio y Fecha Fin -->
                    <div class="grid grid-cols-2 gap-2">
                      <div class="btn-change-date-card p-2.5 rounded-xl border-2 border-slate-200 hover:border-[#FF7A00] bg-slate-50 transition-all cursor-pointer group shadow-2xs">
                        <span class="block text-[9px] font-mono font-black uppercase text-slate-400 group-hover:text-[#FF7A00]">Fecha Inicio</span>
                        <span class="font-black text-xs text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                          ${formatDate(startDate)}
                        </span>
                      </div>

                      <div class="btn-change-date-card p-2.5 rounded-xl border-2 border-slate-200 hover:border-[#FF7A00] bg-slate-50 transition-all cursor-pointer group shadow-2xs">
                        <span class="block text-[9px] font-mono font-black uppercase text-slate-400 group-hover:text-[#FF7A00]">Fecha Fin</span>
                        <span class="font-black text-xs text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                          ${formatDate(endDate)}
                        </span>
                      </div>
                    </div>

                    <!-- Selector Trigger Button -->
                    <button 
                      type="button" 
                      id="btn-open-detail-calendar" 
                      class="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 hover:border-[#FF7A00] bg-white text-xs font-bold text-slate-800 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                    >
                      <div class="flex items-center gap-2 text-slate-700 font-mono text-[11px]">
                        <span class="w-6 h-6 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold">
                          ${renderIcon('Calendar', 'w-3.5 h-3.5')}
                        </span>
                        <span class="group-hover:text-[#FF7A00] font-bold">Seleccionar en Calendario</span>
                      </div>
                      <span class="px-2 py-0.5 rounded-lg bg-orange-100 text-[#FF7A00] text-[11px] font-black font-mono">
                        ${rentalDays} día${rentalDays > 1 ? 's' : ''}
                      </span>
                    </button>

                    <!-- Real-Time Validation Status -->
                    <div class="flex items-center gap-1.5 text-[11px] font-bold ${rentalDays <= 30 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'} p-2 rounded-xl">
                      <span>${rentalDays <= 30 ? '✓' : '⚠️'}</span>
                      <span>${rentalDays <= 30 ? `Periodo válido: ${rentalDays} de 30 días máximos` : 'Excede el límite máximo de 1 mes (30 días)'}</span>
                    </div>

                    <!-- Presets Rápidos -->
                    <div class="flex items-center justify-between text-[10px] font-mono pt-0.5">
                      <span class="text-slate-400 font-bold">Atajos rápidos:</span>
                      <div class="flex items-center gap-1">
                        <button type="button" class="btn-detail-preset px-2 py-0.5 rounded-md ${rentalDays === 3 ? 'bg-orange-100 text-[#FF7A00] font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} cursor-pointer" data-days="3">3d</button>
                        <button type="button" class="btn-detail-preset px-2 py-0.5 rounded-md ${rentalDays === 7 ? 'bg-orange-100 text-[#FF7A00] font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} cursor-pointer" data-days="7">7d</button>
                        <button type="button" class="btn-detail-preset px-2 py-0.5 rounded-md ${rentalDays === 15 ? 'bg-orange-100 text-[#FF7A00] font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} cursor-pointer" data-days="15">15d</button>
                        <button type="button" class="btn-detail-preset px-2 py-0.5 rounded-md ${rentalDays === 30 ? 'bg-orange-100 text-[#FF7A00] font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} cursor-pointer" data-days="30">1 mes</button>
                      </div>
                    </div>
                  </div>

                  <!-- Costs Breakdown -->
                  <div class="space-y-1 text-xs pt-2 border-t border-slate-100">
                    <div class="flex justify-between text-slate-500">
                      <span>Tarifa (${rentalDays} día${rentalDays > 1 ? 's' : ''}):</span>
                      <span class="font-mono text-slate-900 font-bold">${formatCurrency(subtotal)}</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>IVA 19%:</span>
                      <span class="font-mono text-slate-900 font-bold">${formatCurrency(vat)}</span>
                    </div>
                    <div class="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Liquidado:</span>
                      <span class="font-mono text-amber-700">${formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div class="space-y-2 pt-2">
                    <button 
                      id="btn-rent-now" 
                      class="btn-primary w-full !py-3 text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      ${renderIcon('CreditCard', 'w-4 h-4')}
                      <span>Alquilar Ahora</span>
                    </button>

                    <button 
                      id="btn-contact-provider-wa" 
                      class="btn-secondary w-full !py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      ${renderIcon('Phone', 'w-3.5 h-3.5 text-white')}
                      <span>Contactar Proveedor</span>
                    </button>
                  </div>

                  <div class="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-600 font-black">✓</span>
                      <span>Póliza SURA Todo Riesgo incluida</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-600 font-black">✓</span>
                      <span>Factura electrónica oficial DIAN</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-600 font-black">✓</span>
                      <span>Inspección técnica pre-entrega</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    `;

    container.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeImageIndex = parseInt(btn.dataset.index, 10);
        render();
      });
    });

    container.querySelector('#btn-toggle-fit')?.addEventListener('click', () => {
      isContainMode = !isContainMode;
      render();
    });

    // Custom calendar opening
    const openCalendarHandler = async () => {
      let bookedRanges = [];
      try {
        const res = await api.get(`/rentals/tool/${tool.id}/booked-dates`);
        bookedRanges = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.warn('Could not fetch tool booked dates', e);
      }

      openDateRangeModal({
        startDate,
        endDate,
        bookedDateRanges: bookedRanges,
        onConfirm: (res) => {
          startDate = res.startDate;
          endDate = res.endDate;
          rentalDays = res.days;
          render();
        }
      });
    };

    container.querySelector('#btn-open-detail-calendar')?.addEventListener('click', openCalendarHandler);
    container.querySelectorAll('.btn-change-date-card').forEach(btn => {
      btn.addEventListener('click', openCalendarHandler);
    });

    // Quick presets
    container.querySelectorAll('.btn-detail-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days, 10);
        const s = parseIsoDate(startDate);
        const endObj = new Date(s);
        endObj.setDate(endObj.getDate() + (days - 1));
        endDate = toIsoDate(endObj);
        rentalDays = days;
        render();
      });
    });

    container.querySelector('#btn-rent-now')?.addEventListener('click', () => {
      if (!auth.isAuthenticated()) {
        showToast('Debes iniciar sesión para realizar la reserva', 'warning');
        openAuthModal('login');
        return;
      }
      openRentalModal(tool, { startDate, endDate, days: rentalDays });
    });

    container.querySelector('#btn-contact-provider-wa')?.addEventListener('click', () => {
      openProviderContactModal(tool);
    });
  }

  render();
}

export default renderProductPageView;
