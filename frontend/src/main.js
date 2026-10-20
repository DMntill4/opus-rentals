import './style.css';
import 'preline/preline';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderCatalogView } from './views/catalog.js';
import { renderClientDashboard } from './views/client-dashboard.js';
import { renderProviderDashboard } from './views/provider-dashboard.js';
import { renderAdminDashboard } from './views/admin-dashboard.js';
import { renderProductPageView } from './views/product-detail.js';
import showToast from './components/toast.js';
import { renderAllSystemStatesShowcase } from './components/system-states.js';
import { initImageCacheShield } from './utils/image-cache.js';
import { curatedCatalogImageUrls } from './api/mock-store.js';
import auth from './auth/state.js';

export function render404View() {
  renderNavbar('catalog');
  const container = document.getElementById('app-content');
  if (!container) return;

  container.innerHTML = `
    <section class="min-h-[80vh] bg-[#f8fafc] flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 text-center relative overflow-hidden">
        <!-- Subtle drafting blueprint grid background -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: linear-gradient(to right, #132e4f 1px, transparent 1px), linear-gradient(to bottom, #132e4f 1px, transparent 1px); background-size: 20px 20px;"></div>
        
        <div class="relative z-10 flex flex-col items-center">
          <div class="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-3 mb-6 shadow-xs">
            <img src="/assets/brand/logo.png" alt="Opus Rentals" class="w-full h-full object-contain" onerror="this.src='/assets/brand/opus-logo-orange.svg'" />
          </div>
          
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#132e4f] mb-3">
            Código 404 &bull; Recurso no encontrado
          </span>
          
          <h1 class="text-3xl sm:text-4xl font-extrabold font-display text-[#132e4f] tracking-tight mb-3">
            Página Fuera de Servicio
          </h1>
          
          <p class="text-slate-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            La maquinaria o sección solicitada no se encuentra disponible en nuestro sistema de despacho telemático.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
            <a href="#/catalog" class="w-full sm:w-auto flex-1 px-6 py-3 bg-[#132e4f] hover:bg-[#0a1c33] text-white text-xs font-bold rounded-xl shadow-xs transition-all text-center">
              Volver al Catálogo &rarr;
            </a>
            <button id="btn-404-history-back" type="button" class="w-full sm:w-auto flex-1 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer text-center">
              &larr; Página Anterior
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  container.querySelector('#btn-404-history-back')?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '#/catalog';
    }
  });
}

import { renderHomeView } from './views/home.js';
import { openAuthModal } from './components/auth-modal.js';

// Router mapping
const routes = {
  '#/home': renderHomeView,
  '#/': renderHomeView,
  '': renderHomeView,
  '#/catalog': renderCatalogView,
  '#/client': renderClientDashboard,
  '#/provider': renderProviderDashboard,
  '#/admin': renderAdminDashboard,
  '#/register': () => {
    renderNavbar('home');
    renderHomeView();
    openAuthModal('register');
  },
  '#/registro': () => {
    renderNavbar('home');
    renderHomeView();
    openAuthModal('register');
  },
  '#/login': () => {
    renderNavbar('home');
    renderHomeView();
    openAuthModal('login');
  },
  '#/404': render404View,
  '#/system-states': renderAllSystemStatesShowcase,
  '#/states': renderAllSystemStatesShowcase,
};

function router() {
  // Prevent path corruption when navigating from /admin, etc.
  if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '') {
    const cleanHash = window.location.hash || (window.location.pathname.startsWith('/admin') ? '#/admin' : '#/home');
    window.history.replaceState(null, '', '/' + cleanHash);
  }

  const hash = window.location.hash || '#/home';
  const cleanRoute = hash.split('?')[0];
  
  // Handle dynamic product detail route: #/product/:id
  if (cleanRoute.startsWith('#/product/')) {
    const parts = cleanRoute.split('/');
    const rawId = parts[2];
    const toolId = rawId && !isNaN(Number(rawId)) ? Number(rawId) : rawId;
    renderNavbar('catalog');
    renderProductPageView(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => window.HSStaticMethods?.autoInit(), 50);
    return;
  }

  // 404 Handler for unknown routes
  if (hash && hash !== '#/' && hash !== '#' && !(cleanRoute in routes) && !cleanRoute.startsWith('#/product/')) {
    render404View();
    return;
  }

  const routeKey = cleanRoute in routes ? cleanRoute : '#/home';
  
  // Role & Permission Route Guards
  // Providers have a dedicated workspace and do not browse the consumer rental catalog
  if (auth.isAuthenticated() && auth.isProvider() && !auth.isAdmin()) {
    if (routeKey === '#/home' || routeKey === '#/' || routeKey === '' || routeKey === '#/catalog' || routeKey.startsWith('#/product/')) {
      window.location.hash = '#/provider';
      return;
    }
  }

  if (routeKey === '#/admin') {
    if (!auth.isAuthenticated()) {
      showToast('Debes iniciar sesión para acceder al panel de administración', 'warning');
      window.location.hash = '#/catalog';
      openAuthModal('login');
      return;
    }
    if (!auth.isAdmin()) {
      showToast('Acceso denegado: Se requieren permisos de Administrador', 'error');
      window.location.hash = '#/catalog';
      return;
    }
  }

  if (routeKey === '#/provider') {
    if (!auth.isAuthenticated()) {
      showToast('Debes iniciar sesión para acceder al portal de proveedores', 'warning');
      window.location.hash = '#/catalog';
      openAuthModal('login');
      return;
    }
    if (!auth.isProvider() && !auth.isAdmin()) {
      showToast('Acceso denegado: Esta sección es exclusiva para proveedores de maquinaria', 'error');
      window.location.hash = '#/catalog';
      return;
    }
  }

  if (routeKey === '#/client') {
    if (!auth.isAuthenticated()) {
      showToast('Debes iniciar sesión para consultar tus contratos', 'warning');
      window.location.hash = '#/catalog';
      openAuthModal('login');
      return;
    }
  }

  const activeRouteName = routeKey.replace('#/', '');
  renderNavbar(activeRouteName);

  const viewHandler = routes[routeKey] || renderCatalogView;
  viewHandler();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => window.HSStaticMethods?.autoInit(), 50);
}

import { themeManager } from './utils/theme.js';
import { i18n } from './utils/i18n.js';

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  themeManager.init();
  initImageCacheShield(curatedCatalogImageUrls);
  renderFooter();
  router();

  window.addEventListener('hashchange', router);

  // Reactive updates on theme / language change
  window.addEventListener('theme:change', () => {
    renderFooter();
    router();
  });

  window.addEventListener('lang:change', () => {
    renderFooter();
    router();
  });

  // Reactive updates on authentication events
  window.addEventListener('auth:change', () => {
    router();
  });

  window.addEventListener('auth:expired', () => {
    showToast('Tu sesión ha finalizado. Por favor ingresa de nuevo.', 'warning');
    window.location.hash = '#/catalog';
  });
});
