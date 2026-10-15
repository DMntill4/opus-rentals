import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openRentalModal } from './rental-modal.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openProviderContactModal } from '../components/provider-modal.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';

export async function renderProductPageView(toolId) {
  const container = document.getElementById('app-content');
  if (!container) return;

  // Loading skeleton
  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
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
      <div class="min-h-[70vh] bg-[#f5f5f5] flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md space-y-4">
          <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            ${renderIcon('AlertCircle', 'w-6 h-6')}
          </div>
          <h2 class="text-lg font-bold text-slate-900">Equipo no disponible</h2>
          <p class="text-xs text-slate-500">La referencia solicitada no está activa en nuestro catálogo telemático.</p>
          <a href="#/catalog" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Volver al Catálogo</a>
        </div>
      </div>
    `;
    return;
  }

  // Active images
  const primaryResolved = resolveToolImageUrl(tool);
  const images = tool.images && tool.images.length > 0 ? tool.images : [
    { imageUrl: primaryResolved },
    { imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=85' }
  ];

  let activeImageIndex = 0;
  let rentalDays = 3;

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
      { specName: 'Capacidad de Balde', specValue: '1.0 m³' },
      { specName: 'Horómetro Actual', specValue: '1.450 Horas' },
      { specName: 'Telemetría', specValue: 'Product Link 4G Activa' },
      { specName: 'Ubicación Hub', specValue: 'Bogotá · Parque Industrial' }
    ];

    container.innerHTML = `
      <div class="bg-[#f5f5f5] dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100 font-sans">
        
        <!-- Breadcrumb Navigation -->
        <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
          <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center gap-2">
            <a href="#/home" class="hover:text-blue-600">Inicio</a>
            <span>/</span>
            <a href="#/catalog" class="hover:text-blue-600">Catálogo</a>
            <span>/</span>
            <span class="text-slate-400">${tool.categoryName || 'Construcción'}</span>
            <span>/</span>
            <span class="text-slate-900 dark:text-white font-bold truncate max-w-xs">${tool.name}</span>
          </div>
        </div>

        <!-- Main Product Card Stage: Amazon / Mercado Libre 3-Column Layout -->
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- ========================================================================= -->
              <!-- 1. LEFT COLUMN: IMAGES GALLERY (Mercado Libre Style) -->
              <!-- ========================================================================= -->
              <div class="lg:col-span-5 flex flex-col sm:flex-row gap-3">
                
                <!-- Thumbnails column -->
                <div class="flex sm:flex-col gap-2 order-2 sm:order-1 flex-shrink-0" id="detail-thumbs">
                  ${images.map((img, idx) => `
                    <button class="thumb-btn w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex ? 'border-blue-600' : 'border-slate-200 hover:border-slate-400'
                    }" data-index="${idx}">
                      <img src="${img.imageUrl}" class="w-full h-full object-cover" alt="Vista ${idx + 1}" />
                    </button>
                  `).join('')}
                </div>

                <!-- Main Viewport -->
                <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center min-h-[380px] p-4 order-1 sm:order-2 relative group">
                  <img 
                    id="main-detail-img" 
                    src="${images[activeImageIndex]?.imageUrl || images[0].imageUrl}" 
                    alt="${tool.name}" 
                    class="max-h-[360px] w-full object-contain"
                  />
                  <span class="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                    ID: ${tool.id}
                  </span>
                </div>

              </div>

              <!-- ========================================================================= -->
              <!-- 2. CENTER COLUMN: TITLE, SPECS & DESCRIPTION (Amazon Style) -->
              <!-- ========================================================================= -->
              <div class="lg:col-span-4 space-y-5">
                
                <div class="space-y-1">
                  <span class="text-xs text-blue-600 font-bold uppercase tracking-wider font-mono">
                    ${tool.brand || 'Caterpillar'} · ${tool.categoryName || 'Maquinaria Pesada'}
                  </span>
                  <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    ${tool.name}
                  </h1>
                  <div class="flex items-center gap-2 pt-1 text-xs text-slate-500">
                    <span class="text-amber-500 font-bold flex items-center gap-1 font-mono">
                      ★ <span>${tool.provider?.rating || 4.9}</span>
                    </span>
                    <span>·</span>
                    <span>142 alquileres verificados</span>
                  </div>
                </div>

                <!-- Price Highlight -->
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div class="text-[11px] text-slate-500 font-medium">Tarifa de alquiler</div>
                  <div class="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    ${formatCurrency(dailyPrice)} <span class="text-xs font-normal text-slate-500">/ día</span>
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">IVA 19% deducible en factura oficial</div>
                </div>

                <!-- Description -->
                <div class="space-y-2">
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                    Descripción del Equipo
                  </h3>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    ${tool.description || 'Equipo especializado para frentes de obra civil, minería y cimentaciones pesadas. Incluye telemetría satelital activa y póliza SURA.'}
                  </p>
                </div>

                <!-- Technical Specs Table -->
                <div class="space-y-2 pt-2">
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                    Ficha Técnica
                  </h3>
                  <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    ${specsList.map(s => `
                      <div class="py-2 flex justify-between gap-4">
                        <span class="text-slate-500">${s.specName}</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200 font-mono text-right">${s.specValue}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

              </div>

              <!-- ========================================================================= -->
              <!-- 3. RIGHT COLUMN: BUY BOX / COTIZACIÓN (Mercado Libre / Amazon Buy Box) -->
              <!-- ========================================================================= -->
              <div class="lg:col-span-3">
                
                <div class="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
                  
                  <!-- Status & Delivery -->
                  <div class="space-y-1">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                      isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }">
                      <span class="w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                      ${isAvailable ? 'Disponible para entrega' : 'Actualmente en Obra'}
                    </span>
                    <p class="text-[11px] text-slate-500 pt-1">
                      Despacho inmediato desde patio de maquinaria central.
                    </p>
                  </div>

                  <!-- Date Selector simulation -->
                  <div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Duración del alquiler</label>
                    <div class="flex items-center gap-2">
                      <select id="detail-days-select" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-white">
                        <option value="1" ${rentalDays === 1 ? 'selected' : ''}>1 día</option>
                        <option value="3" ${rentalDays === 3 ? 'selected' : ''}>3 días</option>
                        <option value="7" ${rentalDays === 7 ? 'selected' : ''}>1 semana (7 días)</option>
                        <option value="15" ${rentalDays === 15 ? 'selected' : ''}>15 días</option>
                        <option value="30" ${rentalDays === 30 ? 'selected' : ''}>1 mes (30 días)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Price Calculation Summary -->
                  <div class="space-y-1 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex justify-between text-slate-500">
                      <span>Tarifa (${rentalDays} día${rentalDays > 1 ? 's' : ''}):</span>
                      <span class="font-mono text-slate-800 dark:text-slate-200">${formatCurrency(subtotal)}</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>IVA 19%:</span>
                      <span class="font-mono text-slate-800 dark:text-slate-200">${formatCurrency(vat)}</span>
                    </div>
                    <div class="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span>Total Liquidado:</span>
                      <span class="font-mono text-blue-600">${formatCurrency(total)}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="space-y-2 pt-2">
                    <button 
                      id="btn-rent-now" 
                      class="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      ${renderIcon('CreditCard', 'w-4 h-4')}
                      <span>Alquilar Ahora</span>
                    </button>

                    <button 
                      id="btn-contact-provider-wa" 
                      class="w-full py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      ${renderIcon('Phone', 'w-3.5 h-3.5 text-emerald-600')}
                      <span>Contactar Proveedor</span>
                    </button>
                  </div>

                  <!-- Trust Guarantees -->
                  <div class="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500">
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500 font-bold">✓</span>
                      <span>Póliza SURA Todo Riesgo incluida</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500 font-bold">✓</span>
                      <span>Factura electrónica oficial DIAN</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500 font-bold">✓</span>
                      <span>Inspección técnica en frente de obra</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    `;

    // Thumbnails click
    container.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeImageIndex = parseInt(btn.dataset.index, 10);
        render();
      });
    });

    // Days select change
    container.querySelector('#detail-days-select')?.addEventListener('change', (e) => {
      rentalDays = parseInt(e.target.value, 10) || 1;
      render();
    });

    // Rent button
    container.querySelector('#btn-rent-now')?.addEventListener('click', () => {
      if (!auth.isAuthenticated()) {
        showToast('Debes iniciar sesión para realizar la reserva', 'warning');
        openAuthModal('login');
        return;
      }
      openRentalModal(tool);
    });

    // Contact button
    container.querySelector('#btn-contact-provider-wa')?.addEventListener('click', () => {
      openProviderContactModal(tool);
    });
  }

  render();
}

export default renderProductPageView;
