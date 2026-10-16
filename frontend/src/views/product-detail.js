import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openRentalModal } from './rental-modal.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openProviderContactModal } from '../components/provider-modal.js';
import { resolveToolImageUrl, resolveToolGalleryImages, constructionHeroImage } from '../utils/tool-images.js';

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
          <h2 class="text-lg font-black text-slate-900">Equipo no disponible</h2>
          <p class="text-xs text-slate-500">La referencia solicitada no está activa en nuestro catálogo telemático.</p>
          <a href="#/catalog" class="btn-primary !px-4 !py-2 text-xs font-black">Volver al Catálogo</a>
        </div>
      </div>
    `;
    return;
  }

  const primaryResolved = resolveToolImageUrl(tool);
  const images = resolveToolGalleryImages(tool);

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
              
              <!-- LEFT COLUMN: GALLERY -->
              <div class="lg:col-span-5 flex flex-col sm:flex-row gap-3">
                
                <div class="flex sm:flex-col gap-2 order-2 sm:order-1 flex-shrink-0" id="detail-thumbs">
                  ${images.map((img, idx) => `
                    <button class="thumb-btn w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex ? 'border-[#FF7A00] ring-2 ring-[#FF7A00]/40' : 'border-slate-200 hover:border-slate-400'
                    }" data-index="${idx}">
                      <img src="${img.imageUrl}" class="w-full h-full object-cover" alt="Vista ${idx + 1}" />
                    </button>
                  `).join('')}
                </div>

                <div class="flex-1 bg-slate-900 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center min-h-[380px] p-4 order-1 sm:order-2 relative group">
                  <img 
                    id="main-detail-img" 
                    src="${images[activeImageIndex]?.imageUrl || images[0].imageUrl}" 
                    alt="${tool.name}" 
                    class="max-h-[360px] w-full object-contain"
                  />
                  <span class="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#FF7A00] text-white text-[10px] font-mono font-black shadow-xs">
                    ID: ${tool.id}
                  </span>
                </div>

              </div>

              <!-- CENTER COLUMN: SPECS -->
              <div class="lg:col-span-4 space-y-5">
                
                <div class="space-y-1">
                  <span class="text-xs text-amber-700 font-black uppercase tracking-wider font-mono">
                    ${tool.brand || 'Caterpillar'} · ${tool.categoryName || 'Maquinaria Pesada'}
                  </span>
                  <h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    ${tool.name}
                  </h1>
                  <div class="flex items-center gap-2 pt-1 text-xs text-slate-500">
                    <span class="text-amber-500 font-bold flex items-center gap-1 font-mono">
                      ★ <span>${tool.provider?.rating || 4.9}</span>
                    </span>
                    <span>·</span>
                    <span>142 alquileres verificados en obra</span>
                  </div>
                </div>

                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div class="text-[11px] text-slate-500 font-bold font-mono uppercase">Tarifa oficial de alquiler</div>
                  <div class="text-2xl font-black text-slate-900 font-mono">
                    ${formatCurrency(dailyPrice)} <span class="text-xs font-normal text-slate-500">/ día</span>
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">IVA 19% deducible en factura fiscal oficial</div>
                </div>

                <div class="space-y-1.5">
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

              <!-- RIGHT COLUMN: BUY BOX -->
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

                  <div class="space-y-1.5 pt-2 border-t border-slate-100">
                    <label class="text-[11px] font-black uppercase font-mono text-slate-700">Duración del alquiler</label>
                    <select id="detail-days-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FFB800]">
                      <option value="1" ${rentalDays === 1 ? 'selected' : ''}>1 día</option>
                      <option value="3" ${rentalDays === 3 ? 'selected' : ''}>3 días</option>
                      <option value="7" ${rentalDays === 7 ? 'selected' : ''}>1 semana (7 días)</option>
                      <option value="15" ${rentalDays === 15 ? 'selected' : ''}>15 días</option>
                      <option value="30" ${rentalDays === 30 ? 'selected' : ''}>1 mes (30 días)</option>
                    </select>
                  </div>

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
                      class="btn-primary w-full !py-3 text-xs font-black shadow-md flex items-center justify-center gap-2"
                    >
                      ${renderIcon('CreditCard', 'w-4 h-4')}
                      <span>Alquilar Ahora</span>
                    </button>

                    <button 
                      id="btn-contact-provider-wa" 
                      class="btn-secondary w-full !py-2.5 text-xs font-extrabold flex items-center justify-center gap-2"
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

    container.querySelector('#detail-days-select')?.addEventListener('change', (e) => {
      rentalDays = parseInt(e.target.value, 10) || 1;
      render();
    });

    container.querySelector('#btn-rent-now')?.addEventListener('click', () => {
      if (!auth.isAuthenticated()) {
        showToast('Debes iniciar sesión para realizar la reserva', 'warning');
        openAuthModal('login');
        return;
      }
      openRentalModal(tool);
    });

    container.querySelector('#btn-contact-provider-wa')?.addEventListener('click', () => {
      openProviderContactModal(tool);
    });
  }

  render();
}

export default renderProductPageView;
