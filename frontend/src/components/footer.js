import { renderIcon, renderToolRentMark } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';
import auth from '../auth/state.js';

export function renderFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  const isEn = i18n.getLang() === 'EN';
  const isAuth = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();
  const isProvider = auth.isProvider();
  const isClient = auth.isClient();

  container.innerHTML = `
    <footer class="border-t-4 border-[#FF7A00] bg-[#1A1A1A] text-slate-300 py-12 mt-auto transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Top Dispatch Ribbon -->
        <div class="mb-10 p-5 rounded-2xl bg-black/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#FF7A00] text-white font-black flex items-center justify-center shadow-md">
              ${renderIcon('Truck', 'w-5 h-5')}
            </div>
            <div>
              <div class="text-white font-black text-sm uppercase tracking-wider">Centro de Operaciones & Despacho a Frentes de Obra</div>
              <div class="text-xs text-slate-400">Atención técnica 24/7 para emergencias mecánicas y relevos de maquinaria pesada.</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <a href="tel:+576017459000" class="btn-primary !py-2 !px-4 text-xs font-black uppercase tracking-wide flex items-center gap-2">
              ${renderIcon('PhoneCall', 'w-4 h-4')} +57 (601) 745-9000
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <!-- Brand & Description -->
          <div class="space-y-4 md:col-span-1">
            <div class="flex items-center gap-2.5">
              ${renderToolRentMark('w-8 h-8')}
              <span class="font-display font-black text-2xl text-white tracking-tight">OPUS <span class="text-[#FF7A00]">RENTALS</span></span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              ${isEn 
                ? 'Enterprise machinery rental & fleet logistics platform for infrastructure projects across Colombia.' 
                : 'Plataforma B2B de alquiler y gestión telemática de maquinaria pesada para frentes de obra e infraestructura en Colombia.'}
            </p>
            <div class="flex items-center gap-2 pt-1 text-xs text-slate-300 font-semibold">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${isEn ? 'Immediate on-site fleet dispatch' : 'Despacho inmediato a nivel nacional'}</span>
            </div>
          </div>

          <!-- Navegación de Plataforma -->
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest text-[#FF7A00] mb-4 font-display">
              ${isEn ? 'Platform' : 'Plataforma B2B'}
            </h4>
            <ul class="space-y-2.5 text-xs">
              <li><a href="#/catalog" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Fleet Catalog' : 'Catálogo de Maquinaria'}</a></li>
              ${isAuth && (isClient || isAdmin) ? `
                <li><a href="#/client" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'My Contracts' : 'Mis Contratos de Alquiler'}</a></li>
              ` : ''}
              ${isAuth && (isProvider || isAdmin) ? `
                <li><a href="#/provider" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Provider Fleet Portal' : 'Portal de Proveedores'}</a></li>
              ` : ''}
              ${isAuth && isAdmin ? `
                <li><a href="#/admin" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Admin Console' : 'Consola de Supervisión'}</a></li>
              ` : ''}
            </ul>
          </div>

          <!-- Categorías Principales -->
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest text-[#FF7A00] mb-4 font-display">
              ${isEn ? 'Machinery Categories' : 'Líneas de Maquinaria'}
            </h4>
            <ul class="space-y-2.5 text-xs">
              <li><a href="#/catalog" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Excavation & Earthmoving' : 'Excavación y Movimiento de Tierras'}</a></li>
              <li><a href="#/catalog" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Road Compaction & Paving' : 'Compactación y Asfaltado'}</a></li>
              <li><a href="#/catalog" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Lifting & Boom Lifts' : 'Elevación y Grúas Articuladas'}</a></li>
              <li><a href="#/catalog" class="text-slate-300 hover:text-[#FF7A00] transition-colors">${isEn ? 'Heavy Industrial Power' : 'Generación Eléctrica Diésel'}</a></li>
            </ul>
          </div>

          <!-- Atención y Contacto -->
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest text-[#FF7A00] mb-4 font-display">
              ${isEn ? 'Support & Operations' : 'Sede Principal & Contacto'}
            </h4>
            <ul class="space-y-2.5 text-xs text-slate-400">
              <li class="flex items-center gap-2">
                ${renderIcon('Phone', 'w-3.5 h-3.5 text-[#FF7A00] flex-shrink-0')}
                <span class="text-slate-200 font-semibold">+57 (601) 745-9000</span>
              </li>
              <li class="flex items-center gap-2">
                ${renderIcon('Mail', 'w-3.5 h-3.5 text-[#FF7A00] flex-shrink-0')}
                <span class="text-slate-200">despachos@opusrentals.com</span>
              </li>
              <li class="flex items-center gap-2">
                ${renderIcon('MapPin', 'w-3.5 h-3.5 text-[#FF7A00] flex-shrink-0')}
                <span class="text-slate-200">${isEn ? 'Bogotá D.C. — Nationwide Coverage' : 'Parque Industrial Celta, Bogotá D.C.'}</span>
              </li>
              <li class="text-[11px] text-slate-500 pt-1">
                ${isEn ? 'Mon - Sat: 6:00 AM – 7:00 PM COT' : 'Lunes a Sábado: 6:00 AM – 7:00 PM COT'}
              </li>
            </ul>
          </div>

        </div>

        <!-- Línea inferior institucional -->
        <div class="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Opus Rentals Colombia S.A.S. NIT 901.884.219-5. Todos los derechos reservados.</p>
          <div class="flex items-center gap-6 text-[11px]">
            <span class="flex items-center gap-1.5 text-slate-300 font-bold">
              ${renderIcon('ShieldCheck', 'w-4 h-4 text-[#FFB800]')} Póliza SURA Todo Riesgo Maquinaria
            </span>
            <span class="flex items-center gap-1.5 text-slate-300 font-bold">
              ${renderIcon('FileCheck', 'w-4 h-4 text-emerald-400')} Facturación Electrónica DIAN
            </span>
          </div>
        </div>
      </div>
    </footer>
  `;
}
