import auth from '../auth/state.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from './auth-modal.js';
import { toggleNotificationsMenu, closeNotificationsMenu } from './notifications-menu.js';
import { notificationsStore } from '../utils/notifications-store.js';

let lastRenderedAuthKey = null;
let currentUpdatePillFn = null;

export function renderNavbar(activeRoute = 'catalog') {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const user = auth.getUser();
  const isAuth = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();
  const isProvider = auth.isProvider();
  const isClient = auth.isClient();
  const unreadCount = notificationsStore.getUnreadCount();

  const currentAuthKey = `${isAuth ? user?.id : 'guest'}-${isAdmin ? 'admin' : (isProvider ? 'provider' : (isClient ? 'client' : 'user'))}`;

  const navCategoriesContainer = container.querySelector('#navbar-categories-container');
  if (navCategoriesContainer && lastRenderedAuthKey === currentAuthKey && currentUpdatePillFn) {
    const badge = container.querySelector('#navbar-unread-badge');
    if (badge) {
      badge.textContent = unreadCount;
      if (unreadCount > 0) badge.classList.remove('hidden');
      else badge.classList.add('hidden');
    }
    currentUpdatePillFn(true);
    return;
  }

  lastRenderedAuthKey = currentAuthKey;

  const topCategories = [
    { id: 1, name: 'Excavadoras', dbName: 'Excavacion y Movimiento de Tierra', icon: 'Shovel' },
    { id: 2, name: 'Concreto', dbName: 'Concreto y Mezclado', icon: 'PaintRoller' },
    { id: 3, name: 'Demolición', dbName: 'Demolicion y Martillos', icon: 'Hammer' },
    { id: 7, name: 'Plataformas', dbName: 'Elevacion y Trabajo en Alturas', icon: 'ArrowUpCircle' },
    { id: 8, name: 'Compactación', dbName: 'Compactacion de Suelos', icon: 'Layers' },
    { id: 5, name: 'Generadores Diésel', dbName: 'Generacion Electrica y Energia', icon: 'Zap' },
    { id: 6, name: 'Compresores', dbName: 'Compresion de Aire y Neumatica', icon: 'Wind' }
  ];

  container.innerHTML = `
    <!-- Top Construction Marketplace Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs select-none">
      
      <!-- Main Bar: Logo + Big Search Bar + User Nav -->
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-4 lg:gap-8">
          
          <!-- Brand Logo -->
          <a href="#/home" class="flex items-center gap-3 flex-shrink-0 group" title="Opus Rentals - Inicio">
            <img src="/assets/brand/logo.png" alt="Opus Rentals" class="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" onerror="this.onerror=null; this.src='/assets/brand/opus-logo-orange.svg'" />
            <div class="flex flex-col">
              <span class="text-xl sm:text-2xl font-black font-display tracking-tight text-[#1A1A1A] leading-none">
                OPUS <span class="text-[#FF7A00]">RENTALS</span>
              </span>
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                Maquinaria Pesada & Construcción
              </span>
            </div>
          </a>

          <!-- Prominent Search Bar (Ultra-sleek Industrial Style) -->
          <div class="flex-1 max-w-2xl mx-auto hidden sm:block px-4">
            <form id="navbar-search-form" class="relative flex items-center bg-white rounded-2xl border-2 border-slate-300 hover:border-slate-400 focus-within:border-[#FF7A00] focus-within:ring-4 focus-within:ring-[#FF7A00]/20 shadow-xs transition-all p-1">
              <div class="pl-3 pr-2 text-slate-400 flex items-center pointer-events-none">
                ${renderIcon('Search', 'w-4 h-4 text-slate-400')}
              </div>
              <input 
                type="text" 
                id="navbar-search-input"
                placeholder="Buscar excavadora CAT, rodillo, Bobcat, generador diésel..." 
                class="flex-1 py-1.5 px-1 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
              />
              <button 
                type="submit" 
                class="px-4 py-2 bg-[#FF7A00] hover:bg-[#E56E00] text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                aria-label="Buscar"
              >
                <span>Buscar</span>
              </button>
            </form>
          </div>

          <!-- User Actions & Orders -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            ${isAuth && isAdmin ? `
              <a href="#/admin" class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-800 hover:text-[#FF7A00] hover:bg-orange-50 text-xs font-black transition-all border border-slate-200">
                ${renderIcon('ShieldCheck', 'w-4 h-4 text-[#FF7A00]')}
                <span class="hidden md:inline">Panel Admin</span>
              </a>
            ` : ''}

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
                <div class="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center text-xs font-black font-mono shadow-xs">
                  ${((user?.displayName || user?.username || 'OP').replace(/^undefined$/i, 'OP')).substring(0, 2).toUpperCase()}
                </div>
                <div class="hidden xl:block text-left text-xs">
                  <div class="font-bold text-slate-900 leading-tight truncate max-w-[120px]">${(user?.displayName || user?.fullName || user?.username || 'Usuario').replace(/^undefined$/i, 'Usuario')}</div>
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

      <!-- Categories Strip with Animated Sliding Orange Indicator -->
      <div class="bg-slate-50 border-t border-slate-200 text-xs">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-4">
          
          <div id="navbar-categories-container" class="relative flex items-center gap-1 sm:gap-2 flex-shrink-0 p-1 bg-slate-200/60 rounded-xl">
            <!-- Animated Gliding Orange Indicator Pill -->
            <div 
              id="navbar-active-pill" 
              class="absolute rounded-lg bg-[#FF7A00] pill-active-glow pointer-events-none z-0 transition-all duration-350 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style="left: 4px; top: 4px; height: 32px; width: 110px; opacity: 1;"
            ></div>

            <!-- Toda la Flota Item -->
            <a 
              href="#/catalog" 
              class="nav-cat-item relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 select-none cursor-pointer text-white font-black"
              data-cat-id="cat-all"
              data-cat-name="toda la flota"
            >
              ${renderIcon('Menu', 'w-3.5 h-3.5 text-white transition-colors')}
              <span>Toda la Flota</span>
            </a>

            <!-- Category Items -->
            ${topCategories.map(cat => `
              <a 
                href="#/catalog?category=${cat.id}" 
                class="nav-cat-item relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 select-none cursor-pointer text-slate-700 hover:text-slate-950"
                data-cat-id="${cat.id}"
                data-cat-name="${cat.name.toLowerCase()}"
                data-cat-db="${(cat.dbName || '').toLowerCase()}"
              >
                ${renderIcon(cat.icon, 'w-3.5 h-3.5 text-slate-500 transition-colors')}
                <span>${cat.name}</span>
              </a>
            `).join('')}
          </div>

          <div class="hidden xl:flex items-center gap-2 text-slate-600 font-mono text-[11px] flex-shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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

  // Dynamic pill sliding animation logic
  function updateCategoryPill(animate = true) {
    const navContainer = container.querySelector('#navbar-categories-container');
    const pill = container.querySelector('#navbar-active-pill');
    if (!navContainer || !pill) return;

    const hash = window.location.hash || '';
    const isCatalog = hash.startsWith('#/catalog');
    const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    const catParam = searchParams.get('category');
    const qParam = (searchParams.get('q') || '').toLowerCase().trim();

    let targetCatId = 'cat-all';

    if (isCatalog) {
      if (catParam && catParam !== 'cat-all') {
        targetCatId = catParam;
      } else if (qParam) {
        const matched = topCategories.find(c => 
          c.name.toLowerCase().includes(qParam) || 
          qParam.includes(c.name.toLowerCase()) ||
          (c.name.toLowerCase() === 'demolición' && (qParam.includes('demol') || qParam.includes('martillo'))) ||
          (c.name.toLowerCase() === 'excavadoras' && (qParam.includes('excav') || qParam.includes('retro'))) ||
          (c.name.toLowerCase() === 'concreto' && (qParam.includes('concre') || qParam.includes('mezcla'))) ||
          (c.name.toLowerCase() === 'generadores diésel' && (qParam.includes('generad') || qParam.includes('planta')))
        );
        if (matched) {
          targetCatId = String(matched.id);
        }
      }
    }

    // Find active element
    let activeBtn = navContainer.querySelector(`.nav-cat-item[data-cat-id="${targetCatId}"]`);
    if (!activeBtn && targetCatId !== 'cat-all') {
      const tid = targetCatId.toLowerCase();
      activeBtn = Array.from(navContainer.querySelectorAll('.nav-cat-item')).find(b => {
        const bName = (b.dataset.catName || '').toLowerCase();
        const bDb = (b.dataset.catDb || '').toLowerCase();
        return bName.includes(tid) || tid.includes(bName) || bDb.includes(tid) || tid.includes(bDb);
      });
    }
    if (!activeBtn) {
      activeBtn = navContainer.querySelector('.nav-cat-item[data-cat-id="cat-all"]');
    }

    if (activeBtn) {
      navContainer.querySelectorAll('.nav-cat-item').forEach(btn => {
        const isCurrent = btn === activeBtn;
        if (isCurrent) {
          btn.classList.remove('text-slate-700', 'hover:text-slate-950');
          btn.classList.add('text-white', 'font-black');
          btn.querySelectorAll('svg').forEach(s => {
            s.classList.remove('text-slate-500');
            s.classList.add('text-white');
            s.classList.remove('anim-icon-pop');
            void s.offsetWidth; // force reflow for animation restart
            s.classList.add('anim-icon-pop');
          });
        } else {
          btn.classList.remove('text-white', 'font-black');
          btn.classList.add('text-slate-700', 'hover:text-slate-950');
          btn.querySelectorAll('svg').forEach(s => {
            s.classList.remove('text-white', 'anim-icon-pop');
            s.classList.add('text-slate-500');
          });
        }
      });

      if (!animate) {
        pill.style.transition = 'none';
      } else {
        pill.style.transition = 'all 350ms cubic-bezier(0.25, 1, 0.5, 1)';
      }

      pill.style.opacity = '1';
      pill.style.left = `${activeBtn.offsetLeft}px`;
      pill.style.top = `${activeBtn.offsetTop}px`;
      pill.style.width = `${activeBtn.offsetWidth}px`;
      pill.style.height = `${activeBtn.offsetHeight}px`;

      if (!animate) {
        requestAnimationFrame(() => {
          pill.style.transition = 'all 350ms cubic-bezier(0.25, 1, 0.5, 1)';
        });
      }
    }
  }

  currentUpdatePillFn = updateCategoryPill;

  // Initial layout calculation
  requestAnimationFrame(() => {
    updateCategoryPill(false);
  });
  setTimeout(() => updateCategoryPill(false), 50);

  // Immediate click animation for instant user feedback
  container.querySelectorAll('.nav-cat-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const navContainer = container.querySelector('#navbar-categories-container');
      const pill = container.querySelector('#navbar-active-pill');
      if (pill && navContainer) {
        navContainer.querySelectorAll('.nav-cat-item').forEach(b => {
          if (b === btn) {
            b.classList.remove('text-slate-700', 'hover:text-slate-950');
            b.classList.add('text-white', 'font-black');
            b.querySelectorAll('svg').forEach(s => { 
              s.classList.remove('text-slate-500'); 
              s.classList.add('text-white'); 
              s.classList.remove('anim-icon-pop');
              void s.offsetWidth;
              s.classList.add('anim-icon-pop');
            });
          } else {
            b.classList.remove('text-white', 'font-black');
            b.classList.add('text-slate-700', 'hover:text-slate-950');
            b.querySelectorAll('svg').forEach(s => { 
              s.classList.remove('text-white', 'anim-icon-pop'); 
              s.classList.add('text-slate-500'); 
            });
          }
        });
        pill.style.transition = 'all 350ms cubic-bezier(0.25, 1, 0.5, 1)';
        pill.style.opacity = '1';
        pill.style.left = `${btn.offsetLeft}px`;
        pill.style.top = `${btn.offsetTop}px`;
        pill.style.width = `${btn.offsetWidth}px`;
        pill.style.height = `${btn.offsetHeight}px`;
      }
    });
  });

  // Global listeners for hash change and window resize
  window.addEventListener('hashchange', () => {
    updateCategoryPill(true);
  });
  window.addEventListener('resize', () => {
    updateCategoryPill(false);
  });

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
