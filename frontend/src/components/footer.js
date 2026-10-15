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
    <footer class="border-t border-slate-200 bg-white text-slate-600 py-10 mt-auto transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <!-- Brand & Description -->
          <div class="space-y-3 md:col-span-1">
            <div class="flex items-center gap-2.5">
              ${renderToolRentMark('w-8 h-8')}
              <span class="font-display font-extrabold text-xl text-[#132e4f] tracking-tight">Opus Rentals</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              ${isEn 
                ? 'Enterprise machinery rental & fleet logistics platform for infrastructure projects across Colombia.' 
                : 'Plataforma B2B de alquiler y gestión telemática de maquinaria pesada para frentes de obra e infraestructura en Colombia.'}
            </p>
            <div class="flex items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
              <span>${isEn ? 'Immediate on-site fleet dispatch' : 'Disponibilidad inmediata en obra'}</span>
            </div>
          </div>

          <!-- Navegación de Plataforma -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-display">
              ${isEn ? 'Platform' : 'Plataforma'}
            </h4>
            <ul class="space-y-2.5 text-xs">
              <li><a href="#/catalog" class="text-slate-600 hover:text-[#132e4f] transition-colors">${isEn ? 'Fleet Catalog' : 'Catálogo de Maquinaria'}</a></li>
              ${isAuth && (isClient || isAdmin) ? `
                <li><a href="#/client" class="text-slate-600 hover:text-[#132e4f] transition-colors">${isEn ? 'My Contracts' : 'Mis Contratos'}</a></li>
              ` : ''}
              ${isAuth && (isProvider || isAdmin) ? `
                <li><a href="#/provider" class="text-slate-600 hover:text-[#132e4f] transition-colors">${isEn ? 'Provider Fleet Portal' : 'Portal Proveedores'}</a></li>
              ` : ''}
              ${isAuth && isAdmin ? `
                <li><a href="#/admin" class="text-slate-600 hover:text-[#132e4f] transition-colors">${isEn ? 'Admin Console' : 'Consola de Supervisión'}</a></li>
              ` : ''}
            </ul>
          </div>

          <!-- Categorías Principales -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-display">
              ${isEn ? 'Machinery Categories' : 'Líneas de Maquinaria'}
            </h4>
            <ul class="space-y-2.5 text-xs">
              <li><a href="#/catalog" class="text-slate-600 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-blue-400 transition-colors">${isEn ? 'Excavation & Earthmoving' : 'Excavación y Movimiento de Tierras'}</a></li>
              <li><a href="#/catalog" class="text-slate-600 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-blue-400 transition-colors">${isEn ? 'Road Compaction & Paving' : 'Compactación y Asfaltado'}</a></li>
              <li><a href="#/catalog" class="text-slate-600 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-blue-400 transition-colors">${isEn ? 'Lifting & Boom Lifts' : 'Elevación y Plataformas Articuladas'}</a></li>
              <li><a href="#/catalog" class="text-slate-600 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-blue-400 transition-colors">${isEn ? 'Heavy Industrial Power' : 'Generación Eléctrica Diésel'}</a></li>
            </ul>
          </div>

          <!-- Atención y Contacto -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-display">
              ${isEn ? 'Support & Operations' : 'Atención y Despacho'}
            </h4>
            <ul class="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li class="flex items-center gap-2">
                ${renderIcon('Phone', 'w-3.5 h-3.5 text-[#132e4f] dark:text-blue-400 flex-shrink-0')}
                <span>+57 (601) 745-9000</span>
              </li>
              <li class="flex items-center gap-2">
                ${renderIcon('Mail', 'w-3.5 h-3.5 text-[#132e4f] dark:text-blue-400 flex-shrink-0')}
                <span>operaciones@opusrentals.co</span>
              </li>
              <li class="flex items-center gap-2">
                ${renderIcon('MapPin', 'w-3.5 h-3.5 text-[#132e4f] dark:text-blue-400 flex-shrink-0')}
                <span>${isEn ? 'Bogotá D.C. — Nationwide Coverage' : 'Bogotá D.C. — Cobertura a nivel nacional'}</span>
              </li>
              <li class="text-[11px] text-slate-400 pt-1">
                ${isEn ? 'Mon - Sat: 6:00 AM – 7:00 PM COT' : 'Lunes a Sábado: 6:00 AM – 7:00 PM COT'}
              </li>
            </ul>
          </div>

        </div>

        <!-- Línea inferior institucional -->
        <div class="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>© 2026 Opus Rentals Colombia S.A.S. ${isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}</p>
          <div class="flex items-center gap-4 text-[11px]">
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              ${renderIcon('ShieldCheck', 'w-4 h-4 text-emerald-500')} ${isEn ? 'Telematics Insured & Certified Leases' : 'Contratos Certificados DIAN & Seguro Todo Riesgo'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  `;
}
