import auth from '../auth/state.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from './auth-modal.js';
import { toggleNotificationsMenu, closeNotificationsMenu } from './notifications-menu.js';
import { notificationsStore } from '../utils/notifications-store.js';

export function renderNavbar(activeRoute = 'catalog') {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const user = auth.getUser();
  const isAuth = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();
  const isProvider = auth.isProvider();
  const isClient = auth.isClient();
  const unreadCount = notificationsStore.getUnreadCount();

  const topCategories = [
    { id: 1, name: 'Excavadoras', icon: 'Shovel' },
    { id: 2, name: 'Concreto', icon: 'PaintRoller' },
    { id: 3, name: 'Demolición', icon: 'Hammer' },
    { id: 7, name: 'Plataformas', icon: 'ArrowUpCircle' },
    { id: 8, name: 'Compactación', icon: 'Layers' },
    { id: 5, name: 'Generadores Diésel', icon: 'Zap' },
    { id: 6, name: 'Compresores', icon: 'Wind' }
  ];

  container.innerHTML = `
    <!-- Top Construction Marketplace Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs select-none">
      
      <!-- Main Bar: Logo + Big Search Bar + User Nav -->
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-4 lg:gap-8">
          
          <!-- Brand Logo -->
          <a href="#/home" class="flex items-center gap-2.5 flex-shrink-0 group" title="Opus Rentals - Inicio">
            <img src="/iconWebPageNoBg.png" alt="Opus Rentals" class="w-10 h-10 object-contain" />
            <div class="flex flex-col">
              <span class="text-xl sm:text-2xl font-black font-display tracking-tight text-[#1A1A1A] leading-none">
                Opus Rentals
              </span>
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                Maquinaria Pesada & Construcción
              </span>
            </div>
          </a>

          <!-- Prominent Search Bar (Industrial Style) -->
          <div class="flex-1 max-w-2xl mx-auto hidden sm:block">
            <form id="navbar-search-form" class="flex items-center rounded-xl border-2 border-[#1A1A1A] overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#FFB800]/40">
              <input 
                type="text" 
                id="navbar-search-input"
                placeholder="Buscar excavadora CAT, rodillo, Bobcat, generador diésel..." 
                class="flex-1 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
              />
              <button 
                type="submit" 
                class="px-5 py-2.5 bg-[#FFB800] hover:bg-[#E5A600] text-slate-950 font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Buscar"
              >
                ${renderIcon('Search', 'w-4 h-4 text-slate-950')}
              </button>
            </form>
          </div>

          <!-- User Actions & Orders -->
          <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            ${isAuth && (isClient || isAdmin) ? `
              <a href="#/client" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-xs font-bold transition-all">
                ${renderIcon('FileText', 'w-4 h-4 text-amber-600')}
                <span class="hidden md:inline">Mis Alquileres</span>
              </a>
            ` : ''}

            ${isAuth && (isProvider || isAdmin) ? `
              <a href="#/provider" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-xs font-bold transition-all">
                ${renderIcon('Truck', 'w-4 h-4 text-amber-600')}
                <span class="hidden md:inline">Mi Flota</span>
              </a>
            ` : ''}

            ${isAuth ? `
              <div class="relative" id="notifications-wrapper">
                <button 
                  id="btn-navbar-notifications" 
                  class="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 cursor-pointer"
                  title="Notificaciones"
                >
                  ${renderIcon('Bell', 'w-4 h-4')}
                  <span 
                    id="navbar-unread-badge" 
                    class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF6B00] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white ${unreadCount > 0 ? '' : 'hidden'}"
                  >
                    ${unreadCount}
                  </span>
                </button>
                <div id="notifications-menu-container" class="hidden"></div>
              </div>

              <!-- Authenticated User Dropdown Indicator -->
              <div class="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                <div class="w-8 h-8 rounded-full bg-[#FFB800] text-slate-950 flex items-center justify-center text-xs font-black font-mono shadow-xs">
                  ${user?.username ? user.username.substring(0, 2).toUpperCase() : 'OP'}
                </div>
                <div class="hidden xl:block text-left text-xs">
                  <div class="font-bold text-slate-900 leading-tight truncate max-w-[120px]">${user?.username}</div>
                  <div class="text-[10px] text-slate-500 font-mono">${isAdmin ? 'Admin' : (isProvider ? 'Proveedor' : 'Cliente')}</div>
                </div>

                <button id="btn-logout" class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Cerrar Sesión">
                  ${renderIcon('LogOut', 'w-4 h-4')}
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-2">
                <button id="btn-nav-login" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 cursor-pointer">
                  Ingresar
                </button>
                <button id="btn-nav-register" class="btn-primary !px-4 !py-2 text-xs font-black shadow-xs">
                  Crear Cuenta
                </button>
              </div>
            `}

            <!-- Mobile Hamburger Toggle -->
            <button id="mobile-menu-btn" class="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer" aria-label="Abrir menú">
              ${renderIcon('Menu', 'w-5 h-5')}
            </button>

          </div>

        </div>
      </div>

      <!-- Categories Strip with Construction Industrial Yellow Accent -->
      <div class="bg-slate-50 border-t border-slate-200 text-xs">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-4">
          
          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <a href="#/catalog" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-slate-950 bg-[#FFB800] hover:bg-[#E5A600] transition-colors shadow-2xs">
              ${renderIcon('Menu', 'w-3.5 h-3.5 text-slate-950')}
              <span>Toda la Flota</span>
            </a>

            ${topCategories.map(cat => `
              <a href="#/catalog?category=${cat.id}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 font-semibold whitespace-nowrap transition-colors">
                ${renderIcon(cat.icon, 'w-3.5 h-3.5 text-slate-500')}
                <span>${cat.name}</span>
              </a>
            `).join('')}
          </div>

          <div class="hidden xl:flex items-center gap-2 text-slate-600 font-mono text-[11px] flex-shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Atención a Obra:</span>
            <span class="font-bold text-slate-900">+57 (1) 745-8900</span>
          </div>

        </div>
      </div>

      <!-- Mobile Search Form -->
      <div class="sm:hidden px-4 py-2 border-t border-slate-200 bg-white">
        <form id="navbar-search-form-mobile" class="flex items-center rounded-xl border border-slate-300 overflow-hidden bg-slate-50">
          <input 
            type="text" 
            id="navbar-search-input-mobile"
            placeholder="Buscar maquinaria..." 
            class="flex-1 px-3 py-2 text-xs bg-transparent focus:outline-none"
          />
          <button type="submit" class="p-2 text-slate-500">
            ${renderIcon('Search', 'w-4 h-4')}
          </button>
        </form>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-menu" class="hidden sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
        <a href="#/home" class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Inicio</a>
        <a href="#/catalog" class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Catálogo Completo</a>
        ${isAuth && (isClient || isAdmin) ? `
          <a href="#/client" class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Mis Alquileres</a>
        ` : ''}
        ${isAuth && (isProvider || isAdmin) ? `
          <a href="#/provider" class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Mi Flota Proveedor</a>
        ` : ''}
        ${isAuth && isAdmin ? `
          <a href="#/admin" class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Panel Administrador</a>
        ` : ''}
      </div>

    </header>
  `;

  // Search event listeners
  function handleSearch(query) {
    const q = (query || '').trim();
    if (q) {
      window.location.hash = `#/catalog?q=${encodeURIComponent(q)}`;
    } else {
      window.location.hash = '#/catalog';
    }
  }

  container.querySelector('#navbar-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = container.querySelector('#navbar-search-input');
    handleSearch(input?.value);
  });

  container.querySelector('#navbar-search-form-mobile')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = container.querySelector('#navbar-search-input-mobile');
    handleSearch(input?.value);
  });

  // Mobile menu toggle
  const mobileBtn = container.querySelector('#mobile-menu-btn');
  const mobileMenu = container.querySelector('#mobile-menu');
  mobileBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Auth buttons
  container.querySelector('#btn-nav-login')?.addEventListener('click', () => openAuthModal('login'));
  container.querySelector('#btn-nav-register')?.addEventListener('click', () => openAuthModal('register'));
  container.querySelector('#btn-logout')?.addEventListener('click', () => auth.logout());

  // Notifications
  container.querySelector('#btn-navbar-notifications')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotificationsMenu();
  });
}

export default renderNavbar;
