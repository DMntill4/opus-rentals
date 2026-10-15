import { renderIcon } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';

/**
 * Modern Provider Contact & Fleet Modal
 * Displays direct communication channels (WhatsApp, Phone, Email, Location Hub)
 * and direct links to view all machinery from this provider.
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
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in';

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in">
      
      <!-- Top Header Accent -->
      <div class="bg-gradient-to-r from-[#0c1e33] via-[#132e4f] to-[#1c3f68] p-6 text-white relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="flex items-start justify-between relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 font-black font-mono text-lg shadow-inner">
              ${provider.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Proveedor Verificado Opus
              </span>
              <h3 class="text-base sm:text-lg font-black text-white font-display mt-0.5 truncate max-w-xs">
                ${provider.name}
              </h3>
            </div>
          </div>

          <button id="close-provider-modal-btn" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10">
            ${renderIcon('X', 'w-5 h-5')}
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6">

        <!-- Quick Info Metrics -->
        <div class="grid grid-cols-2 gap-3 text-center">
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div class="text-[10px] text-slate-400 font-mono uppercase font-bold">${isEn ? 'Rating & Trust' : 'Calificación'}</div>
            <div class="text-base font-black text-amber-500 flex items-center justify-center gap-1 mt-0.5 font-mono">
              ★ <span>${provider.rating}</span>
              <span class="text-[10px] text-slate-400 font-normal">(${provider.reviewsCount})</span>
            </div>
          </div>
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div class="text-[10px] text-slate-400 font-mono uppercase font-bold">${isEn ? 'Response Time' : 'Tiempo de Respuesta'}</div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
              ${provider.responseTime}
            </div>
          </div>
        </div>

        <!-- Contact Channels List -->
        <div class="space-y-3">
          <div class="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
            ${isEn ? 'Direct Channels' : 'Canales de Atención Inmediata'}
          </div>

          <!-- WhatsApp Direct -->
          <a 
            href="https://wa.me/${provider.whatsapp}?text=${encodeURIComponent('Hola, me comunico a través de Opus Rentals interesado en la disponibilidad y alquiler de maquinaria.')}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all hover:scale-[1.01] group cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                ${renderIcon('Phone', 'w-5 h-5')}
              </div>
              <div>
                <div class="text-xs font-black">Chat WhatsApp Operaciones</div>
                <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">+${provider.whatsapp}</div>
              </div>
            </div>
            <span class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              ${isEn ? 'Chat Now' : 'Chatear'} ${renderIcon('ArrowRight', 'w-4 h-4')}
            </span>
          </a>

          <!-- Telephonic Contact -->
          <a 
            href="tel:${provider.phone.replace(/[^0-9+]/g, '')}" 
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#132e4f] text-white flex items-center justify-center">
                ${renderIcon('Phone', 'w-4 h-4')}
              </div>
              <div>
                <div class="text-xs font-bold">${isEn ? 'Direct Line / Dispatch' : 'Línea de Despacho'}</div>
                <div class="text-[11px] text-slate-500 font-mono">${provider.phone}</div>
              </div>
            </div>
            <span class="text-xs text-slate-500 font-mono">${isEn ? 'Call' : 'Llamar'}</span>
          </a>

          <!-- Email Support -->
          <a 
            href="mailto:${provider.email}?subject=${encodeURIComponent('Cotización / Alquiler Opus Rentals')}" 
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                ${renderIcon('Mail', 'w-4 h-4')}
              </div>
              <div>
                <div class="text-xs font-bold">${isEn ? 'Official Email' : 'Correo Corporativo'}</div>
                <div class="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">${provider.email}</div>
              </div>
            </div>
            <span class="text-xs text-slate-500 font-mono">${isEn ? 'Email' : 'Escribir'}</span>
          </a>

          <!-- Location Hub -->
          <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#132e4f] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              ${renderIcon('MapPin', 'w-4 h-4')}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">${isEn ? 'Machinery Hub / Yard' : 'Patio Principal de Despacho'}</div>
              <div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${provider.address} · ${provider.city}</div>
            </div>
          </div>
        </div>

        <!-- Action: View Fleet from this provider -->
        <div class="pt-2">
          <a 
            id="view-provider-fleet-btn"
            href="#/catalog?provider=${encodeURIComponent(provider.name)}" 
            class="w-full py-3.5 rounded-2xl bg-[#132e4f] hover:bg-[#1a3c66] text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
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
