import { renderIcon } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';

/**
 * Modern Provider Contact & Fleet Modal - Opus Rentals Signature Theme
 * Deep Graphite #1A1A1A + Vibrant Opus Orange #FF7A00
 */
export function openProviderContactModal(providerData) {
  const existing = document.getElementById('provider-contact-modal');
  if (existing) existing.remove();

  const isEn = i18n.getLang() === 'EN';

  // Normalize provider data whether passed as tool.provider, tool, or provider entity
  const provider = {
    id: providerData.providerId || providerData.provider?.id || providerData.id || '',
    name: providerData.provider?.name || providerData.providerCompanyName || providerData.companyName || providerData.name || 'Proveedor Industrial Opus',
    city: providerData.provider?.city || providerData.city || 'Bogotá D.C., Colombia',
    address: providerData.address || 'Parque Industrial Cazucá - Frente de Operaciones Sur',
    phone: providerData.phone || '+57 (1) 745-8900',
    whatsapp: providerData.whatsapp || '573104567890',
    email: providerData.email || 'contacto@operaciones-opus.com',
    rating: providerData.provider?.rating || providerData.rating || 4.9,
    reviewsCount: providerData.provider?.reviewsCount || providerData.reviewsCount || 142,
    responseTime: providerData.responseTime || '< 15 minutos en horario de obra'
  };

  const modal = document.createElement('div');
  modal.id = 'provider-contact-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in';

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in">
      
      <!-- Top Header Accent (Opus Rentals Signature Carbon & Orange) -->
      <div class="bg-gradient-to-r from-[#1A1A1A] via-[#262626] to-[#1A1A1A] border-b-2 border-[#FF7A00] p-6 text-white relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-[#FF7A00]/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="flex items-start justify-between relative z-10">
          <div class="flex items-center gap-3.5">
            <div class="w-13 h-13 rounded-2xl bg-[#FF7A00] text-white flex items-center justify-center font-black font-display text-xl shadow-lg ring-2 ring-white/20">
              ${provider.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/40 shadow-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Proveedor Verificado Opus</span>
              </span>
              <h3 class="text-base sm:text-lg font-black text-white font-display mt-1 truncate max-w-xs">
                ${provider.name}
              </h3>
            </div>
          </div>

          <button id="close-provider-modal-btn" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10" aria-label="Cerrar">
            ${renderIcon('X', 'w-5 h-5')}
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6">

        <!-- Quick Info Metrics -->
        <div class="grid grid-cols-2 gap-3 text-center">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase font-black tracking-wider">${isEn ? 'Rating & Trust' : 'Calificación & Confianza'}</div>
            <div class="text-base font-black text-[#FF7A00] flex items-center justify-center gap-1 mt-1 font-mono">
              ★ <span>${provider.rating}</span>
              <span class="text-[11px] text-slate-400 font-normal">(${provider.reviewsCount} reseñas)</span>
            </div>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase font-black tracking-wider">${isEn ? 'Response Time' : 'Tiempo de Respuesta'}</div>
            <div class="text-xs font-black text-slate-800 dark:text-slate-200 mt-1.5">
              ${provider.responseTime}
            </div>
          </div>
        </div>

        <!-- Contact Channels List -->
        <div class="space-y-3">
          <div class="text-[11px] font-mono uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
            ${renderIcon('Headphones', 'w-3.5 h-3.5 text-[#FF7A00]')}
            <span>${isEn ? 'Direct Channels' : 'Canales de Atención Inmediata'}</span>
          </div>

          <!-- WhatsApp Direct -->
          <a 
            href="https://wa.me/${provider.whatsapp}?text=${encodeURIComponent('Hola, me comunico a través de Opus Rentals interesado en la disponibilidad y alquiler de maquinaria.')}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all hover:scale-[1.01] group cursor-pointer shadow-xs"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                ${renderIcon('Phone', 'w-5 h-5')}
              </div>
              <div>
                <div class="text-xs font-black">Chat WhatsApp Operaciones</div>
                <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">+${provider.whatsapp}</div>
              </div>
            </div>
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              ${isEn ? 'Chat Now' : 'Chatear'} ${renderIcon('ArrowRight', 'w-4 h-4')}
            </span>
          </a>

          <!-- Telephonic Contact -->
          <a 
            href="tel:${provider.phone.replace(/[^0-9+]/g, '')}" 
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1A1A1A] text-[#FF7A00] flex items-center justify-center group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                ${renderIcon('PhoneCall', 'w-4 h-4')}
              </div>
              <div>
                <div class="text-xs font-black">${isEn ? 'Direct Line / Dispatch' : 'Línea de Despacho Telefónico'}</div>
                <div class="text-[11px] text-slate-500 font-mono font-semibold">${provider.phone}</div>
              </div>
            </div>
            <span class="text-xs font-bold text-slate-500 font-mono group-hover:text-[#FF7A00] transition-colors">${isEn ? 'Call' : 'Llamar'}</span>
          </a>

          <!-- Email Support -->
          <a 
            href="mailto:${provider.email}?subject=${encodeURIComponent('Cotización / Alquiler Opus Rentals')}" 
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                ${renderIcon('Mail', 'w-4 h-4')}
              </div>
              <div>
                <div class="text-xs font-black">${isEn ? 'Official Email' : 'Correo Corporativo de Operaciones'}</div>
                <div class="text-[11px] text-slate-500 font-mono truncate max-w-[210px]">${provider.email}</div>
              </div>
            </div>
            <span class="text-xs font-bold text-slate-500 font-mono group-hover:text-[#FF7A00] transition-colors">${isEn ? 'Email' : 'Escribir'}</span>
          </a>

          <!-- Location Hub -->
          <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
              ${renderIcon('MapPin', 'w-4 h-4')}
            </div>
            <div>
              <div class="text-xs font-black text-slate-800 dark:text-slate-200">${isEn ? 'Machinery Hub / Yard' : 'Patio Principal de Despacho'}</div>
              <div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${provider.address} · ${provider.city}</div>
            </div>
          </div>
        </div>

        <!-- Action: View Fleet from this provider -->
        <div class="pt-2">
          <a 
            id="view-provider-fleet-btn"
            href="#/catalog?provider=${encodeURIComponent(provider.name)}" 
            class="w-full py-3.5 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E56E00] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span>${isEn ? 'View all machinery from this provider' : 'Explorar toda la flota de este proveedor'}</span>
            ${renderIcon('ArrowRight', 'w-4 h-4')}
          </a>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  const closeBtn = modal.querySelector('#close-provider-modal-btn');
  closeBtn?.addEventListener('click', () => modal.remove());

  const fleetBtn = modal.querySelector('#view-provider-fleet-btn');
  fleetBtn?.addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

export default openProviderContactModal;
