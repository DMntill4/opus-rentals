import auth from '../auth/state.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from './auth-modal.js';
import { toggleNotificationsMenu, closeNotificationsMenu } from './notifications-menu.js';
import { notificationsStore } from '../utils/notifications-store.js';
import { i18n } from '../utils/i18n.js';

export function renderNavbar(activeRoute = 'catalog') {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const user = auth.getUser();
  const isAuth = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();
  const isProvider = auth.isProvider();
  const isClient = auth.isClient();
  const unreadCount = notificationsStore.getUnreadCount();
  const currentLang = i18n.getLang();

  // Primary e-commerce category links
  const topCategories = [
    { id: 1, name: 'Excavación y Movimiento', icon: 'Shovel' },
    { id: 2, name: 'Concreto y Mezclado', icon: 'PaintRoller' },
    { id: 3, name: 'Demolición y Martillos', icon: 'Hammer' },
    { id: 7, name: 'Elevación y Alturas', icon: 'ArrowUpCircle' },
    { id: 8, name: 'Compactación', icon: 'Layers' },
    { id: 5, name: 'Generación Eléctrica', icon: 'Zap' },
    { id: 6, name: 'Compresión de Aire', icon: 'Wind' },
    { id: 10, name: 'Soldadura', icon: 'Flame' }
  ];

  container.innerHTML = `
    <!-- Top E-commerce Header (Mercado Libre / Amazon Style) -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs select-none">
      
      <!-- Main Bar: Logo + Big Search Bar + User Nav -->
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-4 lg:gap-8">
          
          <!-- 1. Brand Logo -->
          <a href="#/home" class="flex items-center gap-2.5 flex-shrink-0 group" title="Opus Rentals - Inicio">
            <img src="/iconWebPageNoBg.png" alt="Opus Rentals" class="w-10 h-10 object-contain" />
            <div class="flex flex-col">
              <span class="text-xl sm:text-2xl font-black font-display tracking-tight text-[#132e4f] dark:text-white leading-none">
                Opus Rentals
              </span>
              <span class="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                Maquinaria y Equipos
              </span>
            </div>
          </a>

          <!-- 2. Prominent E-commerce Search Bar (Amazon / Mercado Libre style) -->
          <div class="flex-1 max-w-2xl mx-auto hidden sm:block">
            <form id="navbar-search-form" class="flex items-center rounded-xl border-2 border-[#132e4f] dark:border-blue-500 overflow-hidden bg-white dark:bg-slate-800 shadow-xs focus-within:ring-2 focus-within:ring-[#132e4f]/20">
              <input 
                type="text" 
                id="navbar-search-input"
                placeholder="Buscar excavadora, rodillo, Bobcat, generador diésel..." 
                class="flex-1 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-transparent focus:outline-none"
              />
              <button 
                type="submit" 
                class="px-5 py-2.5 bg-[#132e4f] dark:bg-blue-600 hover:bg-[#0a1c33] dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Buscar"
              >
                ${renderIcon('Search', 'w-4 h-4')}
              </button>
            </form>
          </div>

          <!-- 3. User Actions & Orders -->
          <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            <!-- Language Selector -->
            <button 
              id="btn-toggle-lang" 
              class="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 cursor-pointer"
              title="Cambiar idioma"
            >
              <span class="${currentLang === 'ES' ? 'text-[#132e4f] dark:text-blue-400 font-black' : 'text-slate-400'}">ES</span>
              <span class="text-slate-300">/</span>
              <span class="${currentLang === 'EN' ? 'text-[#132e4f] dark:text-blue-400 font-black' : 'text-slate-400'}">EN</span>
            </button>

            <!-- Mis Alquileres / Pedidos (Direct link if logged in, or opens modal) -->
            ${isAuth && (isClient || isAdmin) ? `
              <a href="#/client" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#132e4f] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all" title="Mis Alquileres">
                ${renderIcon('FileText', 'w-4 h-4 text-slate-500')}
                <span class="hidden md:inline">Mis Alquileres</span>
              </a>
            ` : ''}

            <!-- Proveedores Hub -->
            ${isAuth && (isProvider || isAdmin) ? `
              <a href="#/provider" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#132e4f] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all">
                ${renderIcon('Truck', 'w-4 h-4 text-slate-500')}
                <span class="hidden md:inline">Mi Flota</span>
              </a>
            ` : ''}

            <!-- Notifications Bell -->
            ${isAuth ? `
              <div class="relative" id="notifications-wrapper">
                <button 
                  id="btn-navbar-notifications" 
                  class="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#132e4f] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Notificaciones"
                >
                  ${renderIcon('Bell', 'w-4 h-4')}
                  <span 
                    id="navbar-unread-badge" 
                    class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 ${unreadCount > 0 ? '' : 'hidden'}"
                  >
                    ${unreadCount}
                  </span>
                </button>
                <div id="notifications-menu-container" class="hidden"></div>
              </div>
            ` : ''}

            <!-- User Authentication Block -->
            ${isAuth ? `
              <div class="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-[#132e4f] dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black font-mono">
                    ${user?.username ? user.username.substring(0, 2).toUpperCase() : 'OP'}
                  </div>
                  <div class="hidden xl:block text-left text-xs">
                    <div class="font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">${user?.username}</div>
                    <div class="text-[10px] text-slate-500 font-mono">${isAdmin ? 'Admin' : (isProvider ? 'Proveedor' : 'Cliente')}</div>
                  </div>
                </div>

                <button id="btn-logout" class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer" title="Cerrar Sesión">
                  ${renderIcon('LogOut', 'w-4 h-4')}
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-2">
                <button id="btn-nav-login" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#132e4f] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  Ingresar
                </button>
                <button id="btn-nav-register" class="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs cursor-pointer">
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

      <!-- Clean Horizontal Sub-navbar: Categories Strip (Amazon / Mercado Libre style) -->
      <div class="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 text-xs">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-4">
          
          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <!-- All Categories link -->
            <a href="#/catalog" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold text-[#132e4f] dark:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/70 transition-colors">
              ${renderIcon('Menu', 'w-3.5 h-3.5')}
              <span>Toda la Flota</span>
            </a>

            <!-- Quick Category Links with Direct Icons -->
            ${topCategories.map(cat => `
              <a href="#/catalog?category=${cat.id}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#132e4f] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 font-medium whitespace-nowrap transition-colors">
                ${renderIcon(cat.icon, 'w-3.5 h-3.5 text-slate-400')}
                <span>${cat.name}</span>
              </a>
            `).join('')}
          </div>

          <!-- Official Direct Service Contact -->
          <div class="hidden xl:flex items-center gap-2 text-slate-500 font-mono text-[11px] flex-shrink-0">
            <span>Atención a Obra:</span>
            <span class="font-bold text-[#132e4f] dark:text-blue-400">+57 (1) 745-8900</span>
          </div>

        </div>
      </div>

      <!-- Mobile Search Form (only on very small screens) -->
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

  // Mobile drawer toggle
  const mobileBtn = container.querySelector('#mobile-menu-btn');
  const mobileMenu = container.querySelector('#mobile-menu');
  mobileBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Auth buttons
  container.querySelector('#btn-nav-login')?.addEventListener('click', () => openAuthModal('login'));
  container.querySelector('#btn-nav-register')?.addEventListener('click', () => openAuthModal('register'));
  container.querySelector('#btn-logout')?.addEventListener('click', () => auth.logout());

  // Notifications toggle
  container.querySelector('#btn-navbar-notifications')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotificationsMenu();
  });

  // Language toggle
  container.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
    const next = currentLang === 'ES' ? 'EN' : 'ES';
    i18n.setLang(next);
    window.location.reload();
  });
}

export default renderNavbar;
