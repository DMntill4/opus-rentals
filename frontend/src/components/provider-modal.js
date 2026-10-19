import { renderIcon } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';
import { showToast } from './toast.js';
import notificationsStore from '../utils/notifications-store.js';
import auth from '../auth/state.js';

/**
 * Modern Provider Contact & Direct Communication Hub - Opus Rentals Signature Theme
 * Deep Graphite #1A1A1A + Vibrant Opus Orange #FF7A00 + Emerald Dispatch
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
    whatsapp: (providerData.whatsapp || '573104567890').replace(/\D/g, ''),
    email: providerData.email || 'contacto@operaciones-opus.com',
    rating: providerData.provider?.rating || providerData.rating || 4.9,
    reviewsCount: providerData.provider?.reviewsCount || providerData.reviewsCount || 142,
    responseTime: providerData.responseTime || '< 15 minutos en horario de obra'
  };

  const modal = document.createElement('div');
  modal.id = 'provider-contact-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto';

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in my-8">
      
      <!-- Top Header Accent (Opus Rentals Signature Carbon & Orange) -->
      <div class="bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#0F172A] border-b-2 border-[#FF7A00] p-6 text-white relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-[#FF7A00]/25 rounded-full blur-2xl pointer-events-none"></div>
        
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
      <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

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
            href="https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(`Hola ${provider.name}, me comunico a través de la plataforma Opus Rentals interesado en la disponibilidad y alquiler de su maquinaria.`)}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all hover:scale-[1.01] group cursor-pointer shadow-xs"
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

          <!-- Telephonic Contact with Copy Option -->
          <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1A1A1A] text-[#FF7A00] flex items-center justify-center">
                ${renderIcon('PhoneCall', 'w-4 h-4')}
              </div>
              <div>
                <div class="text-xs font-black">${isEn ? 'Direct Line / Dispatch' : 'Línea de Despacho Telefónico'}</div>
                <div class="text-[11px] text-slate-500 font-mono font-semibold">${provider.phone}</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <a 
                href="tel:${provider.phone.replace(/[^0-9+]/g, '')}" 
                class="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[11px] font-bold text-slate-800 dark:text-white transition-colors"
              >
                ${isEn ? 'Call' : 'Llamar'}
              </a>
              <button 
                id="btn-copy-phone" 
                data-phone="${provider.phone}"
                class="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Copiar teléfono"
              >
                ${isEn ? 'Copy' : 'Copiar'}
              </button>
            </div>
          </div>

          <!-- Email Support with Copy Option -->
          <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                ${renderIcon('Mail', 'w-4 h-4')}
              </div>
              <div>
                <div class="text-xs font-black">${isEn ? 'Official Email' : 'Correo Corporativo de Operaciones'}</div>
                <div class="text-[11px] text-slate-500 font-mono truncate max-w-[190px] sm:max-w-[240px]">${provider.email}</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <a 
                href="mailto:${provider.email}?subject=${encodeURIComponent('Cotización / Alquiler Maquinaria Opus')}" 
                class="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[11px] font-bold text-slate-800 dark:text-white transition-colors"
              >
                ${isEn ? 'Write' : 'Escribir'}
              </a>
              <button 
                id="btn-copy-email" 
                data-email="${provider.email}"
                class="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Copiar correo"
              >
                ${isEn ? 'Copy' : 'Copiar'}
              </button>
            </div>
          </div>

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

        <!-- Quick Inquiry Message Box -->
        <div class="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-2.5">
          <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            ${renderIcon('Send', 'w-3.5 h-3.5 text-[#FF7A00]')}
            <span>Mensaje Rápido a Proveedor</span>
          </label>
          <textarea 
            id="provider-quick-msg" 
            rows="2" 
            placeholder="Escribe aquí tu consulta de disponibilidad o cotización directa..." 
            class="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7A00]"
          ></textarea>
          <button 
            id="btn-send-provider-msg" 
            class="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#FF7A00] dark:hover:bg-[#FF7A00] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            ${renderIcon('Send', 'w-3.5 h-3.5')} Enviar Notificación al Proveedor
          </button>
        </div>

        <!-- Action: View Fleet from this provider with Clean Navigation (NO corrupting /admin URL) -->
        <div class="pt-1">
          <button 
            type="button"
            id="view-provider-fleet-btn"
            class="w-full py-3.5 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#E56E00] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span>${isEn ? 'View all machinery from this provider' : 'Explorar toda la flota de este proveedor'}</span>
            ${renderIcon('ArrowRight', 'w-4 h-4')}
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

  // Quick message sender to provider
  modal.querySelector('#btn-send-provider-msg')?.addEventListener('click', () => {
    const textarea = modal.querySelector('#provider-quick-msg');
    const msg = textarea?.value?.trim();
    if (!msg) {
      showToast('Por favor escribe un mensaje antes de enviar', 'warning');
      return;
    }

    const currentUser = auth.getUser();
    notificationsStore.add({
      category: 'RENTAL',
      type: 'info',
      title: `Consulta Directa: ${provider.name}`,
      message: `${currentUser?.displayName || 'Un cliente'} ha enviado una consulta a ${provider.name}: "${msg}"`,
      link: '#/catalog',
      targetRole: 'ROLE_PROVIDER',
      providerName: provider.name,
      providerId: provider.id
    });

    showToast(`Tu mensaje ha sido remitido a ${provider.name}`, 'success');
    if (textarea) textarea.value = '';
    setTimeout(() => modal.remove(), 1200);
  });

  // Clean navigation that resets pathname and avoids /admin#/catalog corruption
  const fleetBtn = modal.querySelector('#view-provider-fleet-btn');
  fleetBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    modal.remove();

    // Reset pathname cleanly to '/' + hash to avoid URL corruption like /admin#/catalog
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
