import auth from '../auth/state.js';
import { renderIcon, renderToolRentMark } from '../utils/icons.js';
import { openAuthModal } from './auth-modal.js';
import { toggleNotificationsMenu, closeNotificationsMenu } from './notifications-menu.js';
import { notificationsStore } from '../utils/notifications-store.js';
import { themeManager } from '../utils/theme.js';
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
  const isDark = themeManager.isDark;
  const currentLang = i18n.getLang();

  container.innerHTML = `
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 py-3 gap-3 lg:gap-6">
          
          <!-- 1. Logo & Brand Mark Opus Rentals -->
          <a href="#/home" class="flex items-center gap-2.5 group select-none flex-shrink-0" title="Opus Rentals - Inicio">
            <img src="/iconWebPageNoBg.png" alt="Opus Rentals" class="w-10 h-10 object-contain transition-transform duration-200 group-hover:scale-105" />
            <span class="text-xl sm:text-2xl font-black font-display tracking-tight text-[#132e4f] leading-none">
              Opus Rentals
            </span>
          </a>

          <!-- 2. Functional Navigation Titles (Filtered strictly by user role) -->
          <nav class="hidden md:flex items-center gap-1 lg:gap-2">
            <!-- Home Link -->
            <a href="#/home" class="relative px-3.5 py-2 text-sm font-semibold transition-all ${
              activeRoute === 'home' || activeRoute === ''
                ? 'text-[#132e4f] font-bold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#132e4f] after:rounded-full'
                : 'text-slate-600 hover:text-[#132e4f] hover:bg-slate-100 rounded-xl'
            }">
              Inicio
            </a>

            <!-- Catalog is public for everyone -->
            <a href="#/catalog" class="relative px-3.5 py-2 text-sm font-semibold transition-all ${
              activeRoute === 'catalog'
                ? 'text-[#132e4f] font-bold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#132e4f] after:rounded-full'
                : 'text-slate-600 hover:text-[#132e4f] hover:bg-slate-100 rounded-xl'
            }">
              ${i18n.t('navCatalog')}
            </a>

            <!-- Client tab: Only for authenticated Clients and Admins -->
            ${isAuth && (isClient || isAdmin) ? `
              <a href="#/client" class="relative px-3.5 py-2 text-sm font-semibold transition-all ${
                activeRoute === 'client'
                  ? 'text-[#132e4f] font-bold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#132e4f] after:rounded-full'
                  : 'text-slate-600 hover:text-[#132e4f] hover:bg-slate-100 rounded-xl'
              }">
                ${i18n.t('navClient')}
              </a>
            ` : ''}

            <!-- Provider tab: Only for authenticated Providers and Admins -->
            ${isAuth && (isProvider || isAdmin) ? `
              <a href="#/provider" class="relative px-3.5 py-2 text-sm font-semibold transition-all ${
                activeRoute === 'provider'
                  ? 'text-[#132e4f] font-bold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#132e4f] after:rounded-full'
                  : 'text-slate-600 hover:text-[#132e4f] hover:bg-slate-100 rounded-xl'
              }">
                ${i18n.t('navProvider')}
              </a>
            ` : ''}

            <!-- Admin tab: Strictly ONLY for Admin users -->
            ${isAuth && isAdmin ? `
              <a href="#/admin" class="relative px-3.5 py-2 text-sm font-semibold transition-all ${
                activeRoute === 'admin'
                  ? 'text-[#132e4f] font-bold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#132e4f] after:rounded-full'
                  : 'text-slate-600 hover:text-[#132e4f] hover:bg-slate-100 rounded-xl'
              }">
                ${i18n.t('navAdmin')}
              </a>
            ` : ''}
          </nav>

          <!-- 3. Actions / Utility Bar -->
          <div class="flex items-center gap-2 sm:gap-3">

            <!-- Language Switcher Pill (ES / EN) -->
            <button 
              id="btn-toggle-lang" 
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 hover:border-[#132e4f] dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:text-[#132e4f] dark:hover:text-blue-400 cursor-pointer shadow-2xs"
              title="Cambiar idioma / Switch language"
            >
              <span class="${currentLang === 'ES' ? 'text-[#132e4f] dark:text-blue-400 font-black' : 'text-slate-400 font-normal'}">ES</span>
              <span class="text-slate-300 dark:text-slate-600">/</span>
              <span class="${currentLang === 'EN' ? 'text-[#132e4f] dark:text-blue-400 font-black' : 'text-slate-400 font-normal'}">EN</span>
            </button>

            <!-- Rounded Pill Search Bar -->
            <div class="hidden lg:flex items-center relative w-44 xl:w-56">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                ${renderIcon('Search', 'w-4 h-4')}
              </span>
              <input 
                type="text" 
                id="navbar-global-search" 
                placeholder="${i18n.t('navSearchPlaceholder')}" 
                class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/70 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#132e4f] dark:focus:border-blue-500 rounded-full text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#132e4f]/15 transition-all shadow-xs" 
              />
            </div>

            <!-- Notifications Bell (Only for logged-in users) -->
            ${isAuth ? `
              <div class="relative" id="notifications-wrapper">
                <button 
                  id="btn-navbar-notifications" 
                  class="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-2xs" 
                  title="Notificaciones"
                  aria-label="Abrir panel de notificaciones"
                >
                  ${renderIcon('Bell', 'w-4 h-4')}
                  <span 
                    id="navbar-unread-badge" 
                    class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#132e4f] dark:bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs ${unreadCount > 0 ? '' : 'hidden'}"
                  >
                    ${unreadCount}
                  </span>
                </button>

                <!-- Notifications Popover Container -->
                <div id="notifications-menu-container" class="hidden"></div>
              </div>
            ` : ''}

            ${isAuth ? `
              <!-- Authenticated User Menu -->
              <div class="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-[#132e4f] dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-display shadow-xs ring-2 ring-blue-500/20">
                    ${user?.username ? user.username.substring(0, 2).toUpperCase() : 'OP'}
                  </div>
                  <div class="hidden xl:block text-left text-xs">
                    <div class="font-bold text-slate-900 dark:text-slate-100 leading-tight">${user?.username}</div>
                    <div class="text-[10px] text-[#132e4f] dark:text-blue-400 font-semibold">
                      ${isAdmin ? 'Director General' : (isProvider ? 'Proveedor Autorizado' : 'Constructor Activo')}
                    </div>
                  </div>
                </div>

                <button id="btn-logout" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer" title="${i18n.t('navLogout')}">
                  ${renderIcon('LogOut', 'w-4 h-4')}
                </button>
              </div>
            ` : `
              <!-- Guest Iniciar Sesión & Registrarse Buttons -->
              <div class="flex items-center gap-1.5 sm:gap-2">
                <button id="btn-nav-login" class="inline-flex items-center justify-center px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#132e4f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  ${i18n.t('navLogin')}
                </button>
                <button id="btn-nav-register" class="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer">
                  ${currentLang === 'EN' ? 'Register' : 'Registrarse'}
                </button>
              </div>
            `}

            <!-- Mobile Hamburger Toggle -->
            <button id="mobile-menu-btn" class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#132e4f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="Abrir menú de navegación">
              ${renderIcon('Menu', 'w-5 h-5')}
            </button>

          </div>

        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg animate-in fade-in duration-150">
        <!-- Mobile Search Input -->
        <div class="relative py-1 mb-2">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            ${renderIcon('Search', 'w-4 h-4')}
          </span>
          <input 
            type="text" 
            id="mobile-global-search" 
            placeholder="${i18n.t('navSearchPlaceholder')}" 
            class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#132e4f]" 
          />
        </div>

        <a href="#/home" class="block px-3 py-2 rounded-lg text-sm font-semibold ${activeRoute === 'home' || activeRoute === '' ? 'text-[#132e4f] font-bold bg-slate-100' : 'text-slate-700 hover:bg-slate-50'}">
          Inicio
        </a>
        <a href="#/catalog" class="block px-3 py-2 rounded-lg text-sm font-semibold ${activeRoute === 'catalog' ? 'text-[#132e4f] font-bold bg-slate-100' : 'text-slate-700 hover:bg-slate-50'}">
          ${i18n.t('navCatalog')}
        </a>
        ${isAuth && (isClient || isAdmin) ? `
          <a href="#/client" class="block px-3 py-2 rounded-lg text-sm font-semibold ${activeRoute === 'client' ? 'text-[#132e4f] font-bold bg-slate-100' : 'text-slate-700 hover:bg-slate-50'}">
            ${i18n.t('navClient')}
          </a>
        ` : ''}
        ${isAuth && (isProvider || isAdmin) ? `
          <a href="#/provider" class="block px-3 py-2 rounded-lg text-sm font-semibold ${activeRoute === 'provider' ? 'text-[#132e4f] font-bold bg-slate-100' : 'text-slate-700 hover:bg-slate-50'}">
            ${i18n.t('navProvider')}
          </a>
        ` : ''}
        ${isAuth && isAdmin ? `
          <a href="#/admin" class="block px-3 py-2 rounded-lg text-sm font-semibold ${activeRoute === 'admin' ? 'text-[#132e4f] font-bold bg-slate-100' : 'text-slate-700 hover:bg-slate-50'}">
            ${i18n.t('navAdmin')}
          </a>
        ` : ''}

        <!-- Mobile Notifications Link -->
        <button id="mobile-btn-notifs" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
          <span class="flex items-center gap-2">
            ${renderIcon('Bell', 'w-4 h-4 text-slate-500')}
            <span>Notificaciones</span>
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#132e4f] dark:bg-blue-600 text-white ${unreadCount > 0 ? '' : 'hidden'}">
            ${unreadCount}
          </span>
        </button>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
          ${isAuth ? `
            <div class="flex items-center justify-between px-3 py-2">
              <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">${user?.username} (${isAdmin ? 'Admin' : (isProvider ? 'Proveedor' : 'Cliente')})</span>
              <button id="mobile-btn-logout" class="text-xs text-rose-600 font-bold">Cerrar Sesión</button>
            </div>
          ` : `
            <div class="grid grid-cols-2 gap-2">
              <button id="mobile-btn-login" class="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                ${i18n.t('navLogin')}
              </button>
              <button id="mobile-btn-register" class="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs">
                ${currentLang === 'EN' ? 'Register' : 'Registrarse'}
              </button>
            </div>
          `}
        </div>
      </div>
    </header>
  `;

  // Handlers
  container.querySelector('#btn-toggle-theme')?.addEventListener('click', () => {
    themeManager.toggleTheme();
  });

  container.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
    i18n.toggleLang();
  });

  container.querySelector('#btn-logout')?.addEventListener('click', () => { 
    auth.logout(); 
    window.location.hash = '#/catalog'; 
  });
  container.querySelector('#mobile-btn-logout')?.addEventListener('click', () => { 
    auth.logout(); 
    window.location.hash = '#/catalog'; 
  });
  container.querySelector('#btn-nav-login')?.addEventListener('click', () => openAuthModal('login'));
  container.querySelector('#btn-nav-register')?.addEventListener('click', () => openAuthModal('register'));
  container.querySelector('#mobile-btn-login')?.addEventListener('click', () => openAuthModal('login'));
  container.querySelector('#mobile-btn-register')?.addEventListener('click', () => openAuthModal('register'));

  // Notification Menu Toggles
  container.querySelector('#btn-navbar-notifications')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotificationsMenu();
  });

  container.querySelector('#mobile-btn-notifs')?.addEventListener('click', (e) => {
    e.stopPropagation();
    container.querySelector('#mobile-menu')?.classList.add('hidden');
    toggleNotificationsMenu();
  });

  const mobToggle = container.querySelector('#mobile-menu-btn');
  const mobMenu = container.querySelector('#mobile-menu');
  if (mobToggle && mobMenu) {
    mobToggle.addEventListener('click', () => mobMenu.classList.toggle('hidden'));
  }

  // Reactive badge updates on notifications:change
  window.addEventListener('notifications:change', (e) => {
    const count = e.detail?.unreadCount ?? notificationsStore.getUnreadCount();
    const badge = container.querySelector('#navbar-unread-badge');
    if (badge) {
      badge.textContent = count.toString();
      if (count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  });

  // Global search enter
  const handleSearchSubmit = (inputEl) => {
    if (!inputEl) return;
    inputEl.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const query = inputEl.value.trim();
        window.location.hash = `#/catalog${query ? `?q=${encodeURIComponent(query)}` : ''}`;
      }
    });
  };

  handleSearchSubmit(container.querySelector('#navbar-global-search'));
  handleSearchSubmit(container.querySelector('#mobile-global-search'));
}
