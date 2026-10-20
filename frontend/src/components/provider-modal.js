import { renderIcon } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';
import { showToast } from './toast.js';
import notificationsStore from '../utils/notifications-store.js';
import auth from '../auth/state.js';
import { formatCurrency } from '../utils/formatters.js';

/**
 * Executive B2B Machinery Dispatch & Provider Operations Center
 * High-end Industrial Palette: Deep Slate #0F172A + Vibrant Opus Orange #FF7A00 + Dispatch Emerald
 */
export function openProviderContactModal(data) {
  const existing = document.getElementById('provider-contact-modal');
  if (existing) existing.remove();

  const isEn = i18n.getLang() === 'EN';

  // Normalize incoming data (can be tool, provider, or composite)
  const isTool = !!(data?.dailyPrice || data?.brand || data?.category || data?.toolName);
  const toolName = data?.name || data?.toolName || (isTool ? 'Maquinaria Pesada Seleccionada' : null);
  const toolBrand = data?.brand || 'Caterpillar / Industrial';
  const toolModel = data?.model || 'Serie Pesada';
  const toolPrice = data?.dailyPrice ? formatCurrency(data.dailyPrice) : null;
  const toolCover = data?.images?.[0]?.imageUrl || data?.imageUrl || null;

  const provider = {
    id: data?.providerId || data?.provider?.id || data?.id || 1,
    name: data?.provider?.name || data?.providerCompanyName || data?.companyName || data?.name || 'Caterpillar Equipos SAS',
    city: data?.provider?.city || data?.city || 'Bogotá D.C. & Sabana Centro',
    address: data?.address || data?.provider?.address || 'Patio Central de Despacho Km 3.5 Vía Funza - Siberia',
    phone: data?.phone || data?.provider?.phone || '+57 (1) 745-8900',
    whatsapp: (data?.whatsapp || data?.provider?.whatsapp || '573104567890').replace(/\D/g, ''),
    email: data?.email || data?.provider?.email || 'despacho@operaciones-caterpillar.com',
    rating: data?.provider?.rating || data?.rating || 4.9,
    reviewsCount: data?.provider?.reviewsCount || data?.reviewsCount || 142,
    responseTime: data?.responseTime || '< 15 minutos en frente de obra'
  };

  const modal = document.createElement('div');
  modal.id = 'provider-contact-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto';

  modal.innerHTML = `
    <div class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in my-6">
      
      <!-- Top Executive Header: Carbon & Orange Gradient with Live Status -->
      <div class="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0B1120] border-b-4 border-[#FF7A00] p-6 text-white relative overflow-hidden">
        <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-[#FF7A00]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute left-1/3 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-start justify-between relative z-10 gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-[#FF7A00] text-white flex items-center justify-center font-black font-display text-2xl shadow-xl ring-4 ring-white/10 flex-shrink-0">
              ${provider.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/40 shadow-xs">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Proveedor Verificado Opus 4FN</span>
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-mono">
                  ${renderIcon('Clock', 'w-3 h-3 text-amber-400')}
                  <span>${provider.responseTime}</span>
                </span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-white font-display tracking-tight leading-snug">
                ${provider.name}
              </h2>
              <div class="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5 font-mono">
                <span>★ <strong>${provider.rating}</strong> (${provider.reviewsCount} contratos)</span>
                <span>·</span>
                <span class="truncate max-w-xs sm:max-w-md">${provider.city}</span>
              </div>
            </div>
          </div>

          <button id="close-provider-modal-btn" class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 flex-shrink-0" aria-label="Cerrar">
            ${renderIcon('X', 'w-5 h-5')}
          </button>
        </div>
      </div>

      <!-- Modal Body (Two-Column Executive Layout) -->
      <div class="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">

        <!-- Optional Context: Inquired Equipment Banner -->
        ${toolName ? `
          <div class="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300/80 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div class="flex items-center gap-3">
              ${toolCover ? `
                <img src="${toolCover}" alt="${toolName}" class="w-12 h-12 rounded-xl object-cover border border-amber-300 flex-shrink-0" />
              ` : `
                <div class="w-12 h-12 rounded-xl bg-[#1A1A1A] text-[#FF7A00] flex items-center justify-center flex-shrink-0 font-bold font-mono">
                  ${renderIcon('Truck', 'w-6 h-6')}
                </div>
              `}
              <div>
                <span class="text-[10px] font-mono uppercase font-black tracking-wider text-amber-800 dark:text-amber-400">Equipo en Consulta</span>
                <h3 class="text-sm font-black text-slate-900 dark:text-white leading-tight">${toolName}</h3>
                <span class="text-[11px] text-slate-600 dark:text-slate-400 font-mono">${toolBrand} · ${toolModel}</span>
              </div>
            </div>
            ${toolPrice ? `
              <div class="text-right flex-shrink-0 sm:pl-4 sm:border-l border-amber-200 dark:border-amber-800">
                <span class="text-[10px] font-mono text-slate-500 uppercase">Tarifa Diaria Base</span>
                <div class="text-sm font-black text-slate-900 dark:text-white font-mono text-[#FF7A00]">${toolPrice}<span class="text-[10px] font-normal text-slate-500">/día</span></div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Grid: Direct Channels (Left) & Express RFQ Form (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          <!-- Column 1: Immediate Direct Channels -->
          <div class="space-y-3.5">
            <div class="text-xs font-mono uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
              ${renderIcon('Headphones', 'w-4 h-4 text-[#FF7A00]')}
              <span>Canales Inmediatos de Operaciones</span>
            </div>

            <!-- WhatsApp Direct Dispatch (Primary CTA) -->
            <a 
              href="https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(`Hola ${provider.name}, los contacto desde Opus Rentals interesado en la disponibilidad y alquiler de la maquinaria: ${toolName || 'equipo pesado'}. Solicito información de despacho a obra.`)}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all hover:scale-[1.01] group cursor-pointer shadow-sm text-emerald-900 dark:text-emerald-200"
            >
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                  ${renderIcon('Phone', 'w-5 h-5')}
                </div>
                <div>
                  <div class="text-xs font-black uppercase tracking-tight">Chat Directo con Despacho</div>
                  <div class="text-xs text-emerald-800 dark:text-emerald-300 font-mono font-bold mt-0.5">+${provider.whatsapp}</div>
                  <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Atención técnica en tiempo real</div>
                </div>
              </div>
              <span class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform shadow-xs">
                Abrir Chat ${renderIcon('ArrowRight', 'w-3.5 h-3.5')}
              </span>
            </a>

            <!-- Hotline / PBX Direct Line -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#1A1A1A] text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                  ${renderIcon('PhoneCall', 'w-4 h-4')}
                </div>
                <div>
                  <div class="text-xs font-black text-slate-900 dark:text-white">Línea Telefónica de Despacho</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold">${provider.phone}</div>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <a 
                  href="tel:${provider.phone.replace(/[^0-9+]/g, '')}" 
                  class="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-xs"
                >
                  Llamar
                </a>
                <button 
                  type="button"
                  id="btn-copy-phone" 
                  data-phone="${provider.phone}"
                  class="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Copiar número"
                >
                  ${renderIcon('Copy', 'w-3.5 h-3.5')}
                </button>
              </div>
            </div>

            <!-- Corporate Email Dispatch -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                  ${renderIcon('Mail', 'w-4 h-4')}
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-black text-slate-900 dark:text-white">Correo Oficial de Operaciones</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">${provider.email}</div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <a 
                  href="mailto:${provider.email}?subject=${encodeURIComponent(`Cotización Maquinaria Opus: ${toolName || 'Consulta de Alquiler'}`)}" 
                  class="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white text-[11px] font-bold transition-all"
                >
                  Escribir
                </a>
                <button 
                  type="button"
                  id="btn-copy-email" 
                  data-email="${provider.email}"
                  class="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Copiar correo"
                >
                  ${renderIcon('Copy', 'w-3.5 h-3.5')}
                </button>
              </div>
            </div>

            <!-- Operations Yard Location -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                ${renderIcon('MapPin', 'w-4 h-4 text-[#FF7A00]')}
              </div>
              <div>
                <div class="text-xs font-black text-slate-900 dark:text-white">Patio Central de Inspección & Entrega</div>
                <div class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">${provider.address} · ${provider.city}</div>
              </div>
            </div>

          </div>

          <!-- Column 2: Express RFQ & Technical Inquiry Form -->
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 space-y-3.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                ${renderIcon('Send', 'w-4 h-4 text-[#FF7A00]')}
                <span>Radicar Solicitud de Cotización</span>
              </span>
              <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">Respuesta Rápida</span>
            </div>

            <!-- Job Site Location Field -->
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Municipio / Frente de Obra Destino *</label>
              <input 
                type="text" 
                id="rfq-location" 
                placeholder="Ej: Bogotá (Autopista Norte Cl 170), Chía, Funza..." 
                class="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" 
                required 
              />
            </div>

            <!-- Duration Select & Logistics Checkbox -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Duración Estimada</label>
                <select id="rfq-duration" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none">
                  <option value="3-7 dias">3 a 7 días (Turno Inicial)</option>
                  <option value="15 dias" selected>15 días (Medio mes)</option>
                  <option value="30 dias">30 días (Mes completo)</option>
                  <option value="Obra prolongada">+1 mes con operador</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Servicios Requeridos</label>
                <div class="space-y-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 pt-0.5">
                  <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" id="rfq-camabaja" class="accent-[#FF7A00]" checked />
                    <span>Transporte Cama Baja</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" id="rfq-operator" class="accent-[#FF7A00]" />
                    <span>Operador Certificado</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Special Requirements Textarea -->
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Requerimientos Técnicos o Preguntas</label>
              <textarea 
                id="provider-quick-msg" 
                rows="3" 
                placeholder="Indica condiciones del terreno, fecha tentativa de ingreso a obra o si requieres póliza contractual adicional..." 
                class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button 
              type="button"
              id="btn-send-provider-msg" 
              class="w-full py-2.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E56E00] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
            >
              ${renderIcon('Send', 'w-4 h-4')}
              <span>Enviar Requerimiento a Proveedor</span>
            </button>
          </div>

        </div>

        <!-- Compliance & Operational Guarantees Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
            ${renderIcon('ShieldCheck', 'w-4 h-4 text-emerald-600 flex-shrink-0')}
            <span>Póliza SURA Todo Riesgo Maquinaria</span>
          </div>
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
            ${renderIcon('FileCheck', 'w-4 h-4 text-blue-600 flex-shrink-0')}
            <span>Factura Electrónica Oficial DIAN</span>
          </div>
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
            ${renderIcon('Truck', 'w-4 h-4 text-[#FF7A00] flex-shrink-0')}
            <span>Flota con Cama Baja Coordinada</span>
          </div>
        </div>

        <!-- Provider Fleet Exploration Link -->
        <div class="pt-1">
          <button 
            type="button"
            id="view-provider-fleet-btn"
            class="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>Explorar todo el inventario de ${provider.name}</span>
            ${renderIcon('ArrowRight', 'w-4 h-4 text-[#FF7A00]')}
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  const closeBtn = modal.querySelector('#close-provider-modal-btn');
  closeBtn?.addEventListener('click', () => modal.remove());

  // Copy buttons
  modal.querySelector('#btn-copy-phone')?.addEventListener('click', (e) => {
    const phone = e.currentTarget.dataset.phone;
    navigator.clipboard?.writeText(phone);
    showToast(`Teléfono ${phone} copiado al portapapeles`, 'info');
  });

  modal.querySelector('#btn-copy-email')?.addEventListener('click', (e) => {
    const email = e.currentTarget.dataset.email;
    navigator.clipboard?.writeText(email);
    showToast(`Correo ${email} copiado al portapapeles`, 'info');
  });

  // Submit RFQ / Inquiry
  modal.querySelector('#btn-send-provider-msg')?.addEventListener('click', () => {
    const location = modal.querySelector('#rfq-location')?.value?.trim();
    const duration = modal.querySelector('#rfq-duration')?.value;
    const withCamaBaja = modal.querySelector('#rfq-camabaja')?.checked;
    const withOperator = modal.querySelector('#rfq-operator')?.checked;
    const notes = modal.querySelector('#provider-quick-msg')?.value?.trim();

    if (!location) {
      showToast('Por favor ingresa el frente de obra o municipio de destino', 'warning');
      modal.querySelector('#rfq-location')?.focus();
      return;
    }

    const currentUser = auth.getUser();
    const logisticsList = [];
    if (withCamaBaja) logisticsList.push('Cama Baja');
    if (withOperator) logisticsList.push('Operador Certificado');

    const messageText = `Solicitud para ${toolName || 'maquinaria'} en ${location} (${duration}). Servicios: ${logisticsList.join(', ') || 'Solo equipo'}.${notes ? ` Nota: ${notes}` : ''}`;

    notificationsStore.add({
      category: 'RENTAL',
      type: 'info',
      title: `Cotización Solicitada: ${provider.name}`,
      message: `${currentUser?.displayName || 'Constructora Cliente'} ha solicitado cotización técnica: "${messageText}"`,
      link: '#/client',
      targetRole: 'ROLE_PROVIDER',
      providerName: provider.name,
      providerId: provider.id
    });

    showToast(`Solicitud de cotización remitida con éxito a ${provider.name}`, 'success');
    setTimeout(() => modal.remove(), 1200);
  });

  // Explore fleet button
  const fleetBtn = modal.querySelector('#view-provider-fleet-btn');
  fleetBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    modal.remove();

    const targetHash = `#/catalog?provider=${encodeURIComponent(provider.name)}`;
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.replaceState(null, '', '/' + targetHash);
    } else {
      window.location.hash = targetHash;
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

export default openProviderContactModal;
