import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import modal from '../components/modal.js';
import { formatCurrency, formatDate, getRentalStatusBadge, getToolStatusBadge } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openInvoiceViewer } from './rental-modal.js';
import { openAuthModal } from '../components/auth-modal.js';
import { notificationsStore } from '../utils/notifications-store.js';

export async function renderProviderDashboard() {
  const container = document.getElementById('app-content');
  if (!auth.isAuthenticated()) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-10 max-w-lg mx-auto shadow-sm space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-[#132e4f]/10 dark:bg-blue-950/40 text-[#132e4f] dark:text-blue-400 border border-[#132e4f]/20 dark:border-blue-900/60 flex items-center justify-center mx-auto">
            ${renderIcon('Building2', 'w-7 h-7')}
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white font-display">Portal para Proveedores de Maquinaria</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Publica tu flota pesada, administra contratos y gestiona actas de despacho en obra.</p>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button id="btn-demo-provider-login" class="btn-primary flex-1 !py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-sm">
              ${renderIcon('CheckCircle2', 'w-4 h-4')} Entrar como Proveedor (Demo)
            </button>
            <button id="btn-login-provider" class="btn-secondary flex-1 !py-2.5 text-xs flex items-center justify-center gap-1.5">
              ${renderIcon('LogIn', 'w-4 h-4')} Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    `;
    container.querySelector('#btn-demo-provider-login')?.addEventListener('click', () => {
      auth.setSession({
        token: 'demo-provider-jwt',
        user: { username: 'caterpillar.equipos', role: 'ROLE_PROVEEDOR', roles: ['ROLE_PROVEEDOR'], profile: { name: 'Caterpillar Equipos SAS', id: 'prov-001' } }
      });
      showToast('Sesión iniciada como Proveedor', 'success');
      renderProviderDashboard();
    });
    container.querySelector('#btn-login-provider')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  const user = auth.getUser();
  const providerId = user?.profile?.id || user?.id || 'prov-001';

  // Local state for tabs and filtering
  let activeTab = 'inventory'; // 'inventory' | 'requests'
  let inventorySearch = '';
  let inventoryCategory = 'ALL';
  let inventoryStatus = 'ALL';

  let requestsSearch = '';
  let requestsStatus = 'ALL';

  let toolsList = [];
  let requestsList = [];

  // Fetch initial data
  try {
    const [fetchedTools, fetchedRequests] = await Promise.all([
      api.get('/tools'),
      api.get('/rentals/provider-requests').catch(() => api.get(`/rentals/provider/${providerId}`).catch(() => []))
    ]);
    toolsList = Array.isArray(fetchedTools) ? fetchedTools : [];
    requestsList = Array.isArray(fetchedRequests) ? fetchedRequests : [];
  } catch (err) {
    console.warn('Error loading provider dashboard data', err);
  }

  function render() {
    // Calculate KPIs
    const totalTools = toolsList.length || 32;
    const availableTools = toolsList.filter(t => t.status === 'AVAILABLE').length || 24;
    const rentedTools = toolsList.filter(t => t.status === 'RENTED').length || 6;
    const maintenanceTools = toolsList.filter(t => t.status === 'MAINTENANCE').length || 2;
    const pendingRequests = requestsList.filter(r => r.status === 'PENDING').length || 3;

    // Filter tools for inventory tab
    const filteredTools = toolsList.filter(t => {
      const matchSearch = !inventorySearch || 
        t.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        t.categoryName?.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchCat = inventoryCategory === 'ALL' || t.categoryId === inventoryCategory || t.categoryName === inventoryCategory;
      const matchStatus = inventoryStatus === 'ALL' || t.status === inventoryStatus;
      return matchSearch && matchCat && matchStatus;
    });

    // Filter requests for requests tab
    const filteredRequests = requestsList.filter(r => {
      const matchSearch = !requestsSearch ||
        r.client?.name?.toLowerCase().includes(requestsSearch.toLowerCase()) ||
        r.tool?.name?.toLowerCase().includes(requestsSearch.toLowerCase()) ||
        (r.id && r.id.toString().includes(requestsSearch));
      const matchStatus = requestsStatus === 'ALL' || r.status === requestsStatus;
      return matchSearch && matchStatus;
    });

    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <!-- Top Header & Action -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">Gestión de Alquileres</h1>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Supervisa tu flota pesada, disponibilidad en obra y despachos contractuales.</p>
            </div>

            <div class="flex items-center gap-3">
              <button id="btn-open-new-tool-drawer" class="btn-primary !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer">
                ${renderIcon('Plus', 'w-4 h-4')}
                <span>Nueva herramienta</span>
              </button>
            </div>
          </div>

          <!-- 4 Top KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="provider-kpis-grid">
            
            <!-- Card 1: Disponibles -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Herramientas disponibles</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  ${renderIcon('CheckCircle2', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display">${availableTools}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">
                de ${totalTools} registradas (<span class="text-emerald-600 dark:text-emerald-400 font-bold">${Math.round((availableTools / (totalTools || 1)) * 100)}%</span>)
              </div>
            </div>

            <!-- Card 2: Alquiladas -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Alquiladas</span>
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  ${renderIcon('Calendar', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display">${rentedTools}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">
                en <span class="text-[#132e4f] dark:text-blue-400 font-semibold">5</span> clientes activos
              </div>
            </div>

            <!-- Card 3: En mantenimiento -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">En mantenimiento</span>
                <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  ${renderIcon('Wrench', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display">${maintenanceTools}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                revisión programada
              </div>
            </div>

            <!-- Card 4: Solicitudes pendientes -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Solicitudes pendientes</span>
                <div class="w-8 h-8 rounded-lg bg-[#132e4f]/10 dark:bg-blue-950/40 text-[#132e4f] dark:text-blue-400 flex items-center justify-center relative">
                  ${renderIcon('Clock', 'w-4 h-4')}
                  ${pendingRequests > 0 ? '<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#132e4f] dark:bg-blue-500 ring-2 ring-white dark:ring-slate-900"></span>' : ''}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display">${pendingRequests}</div>
              <div class="text-[11px] text-[#132e4f] dark:text-blue-400 font-semibold">
                por confirmar hoy
              </div>
            </div>

          </div>

          <!-- Navigation Tabs: Inventario vs Solicitudes -->
          <div class="border-b border-slate-200 dark:border-slate-800">
            <nav class="flex space-x-8" aria-label="Tabs">
              <button 
                id="tab-btn-inventory" 
                class="py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'inventory' ? 'border-[#132e4f] text-[#132e4f] dark:border-blue-400 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'}"
              >
                ${renderIcon('Package', 'w-4 h-4')}
                <span>Inventario de Maquinaria</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'inventory' ? 'bg-[#132e4f]/10 dark:bg-blue-950/60 text-[#132e4f] dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                  ${toolsList.length}
                </span>
              </button>

              <button 
                id="tab-btn-requests" 
                class="py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'requests' ? 'border-[#132e4f] text-[#132e4f] dark:border-blue-400 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'}"
              >
                ${renderIcon('FileText', 'w-4 h-4')}
                <span>Despachos y Solicitudes</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${pendingRequests > 0 ? 'bg-[#132e4f] dark:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                  ${requestsList.length}
                </span>
              </button>
            </nav>
          </div>

          <!-- TAB CONTENT: INVENTARIO -->
          ${activeTab === 'inventory' ? `
            <div class="space-y-6">
              
              <!-- Filters Bar -->
              <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div class="relative flex-1 max-w-md">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Search', 'w-4 h-4')}
                  </span>
                  <input 
                    type="text" 
                    id="inv-search-input" 
                    value="${inventorySearch}" 
                    placeholder="Buscar herramienta por nombre, modelo o categoría..." 
                    class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" 
                  />
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <select id="inv-status-filter" class="input-field !py-2 text-xs !w-auto bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl">
                    <option value="ALL" ${inventoryStatus === 'ALL' ? 'selected' : ''}>Todos los estados</option>
                    <option value="AVAILABLE" ${inventoryStatus === 'AVAILABLE' ? 'selected' : ''}>Disponible</option>
                    <option value="RENTED" ${inventoryStatus === 'RENTED' ? 'selected' : ''}>Alquilada</option>
                    <option value="MAINTENANCE" ${inventoryStatus === 'MAINTENANCE' ? 'selected' : ''}>En mantenimiento</option>
                  </select>
                </div>
              </div>

              <!-- Inventory Table -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
                      <tr>
                        <th class="py-3 px-4 w-10 text-center"><input type="checkbox" class="rounded text-[#132e4f] focus:ring-0" /></th>
                        <th class="py-3 px-4">Herramienta</th>
                        <th class="py-3 px-4">Tarifa Diaria</th>
                        <th class="py-3 px-4">Estado</th>
                        <th class="py-3 px-4">Último alquiler</th>
                        <th class="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      ${filteredTools.map(tool => {
                        const isAvail = tool.status === 'AVAILABLE';
                        const isRent = tool.status === 'RENTED';
                        const isMaint = tool.status === 'MAINTENANCE';
                        const img = tool.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=100';

                        return `
                          <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                            <td class="py-3.5 px-4 text-center"><input type="checkbox" class="rounded text-[#132e4f] focus:ring-0" /></td>
                            <td class="py-3.5 px-4">
                              <div class="flex items-center gap-3">
                                <img 
                                  src="${img}" 
                                  class="w-11 h-11 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1" 
                                  onerror="window.ToolRentCacheShield?.handleImageError(this, '${img}', '${tool.categoryName || ''}', '${tool.name?.replace(/'/g, "\\'")}')"
                                />
                                <div>
                                  <a href="#/product/${tool.id}" class="font-bold text-slate-900 dark:text-white hover:text-[#132e4f] dark:hover:text-blue-400 transition-colors">${tool.name}</a>
                                  <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span>${tool.categoryName || 'Construcción'}</span>
                                    <span>•</span>
                                    <span class="font-mono text-slate-500 dark:text-slate-400">SKU-${tool.id.toString().padStart(4, '0')}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-display">
                              ${formatCurrency(tool.dailyPrice)} <span class="text-[10px] text-slate-400 font-normal">/ día</span>
                            </td>
                            <td class="py-3.5 px-4">
                              ${isAvail ? `
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Disponible
                                </span>
                              ` : isRent ? `
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Alquilada
                                </span>
                              ` : `
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> En mantenimiento
                                </span>
                              `}
                            </td>
                            <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                              <div>${isRent ? 'Activo (En obra)' : '10 oct 2026'}</div>
                              <div class="text-[10px] text-slate-400 dark:text-slate-500">${isRent ? 'Retorna 16 oct' : 'Finalizado'}</div>
                            </td>
                            <td class="py-3.5 px-4 text-right space-x-1.5">
                              <button class="btn-edit-tool px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer" data-id="${tool.id}">
                                Editar
                              </button>
                              <button class="btn-toggle-maint px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer" data-id="${tool.id}">
                                ${isMaint ? 'Habilitar' : 'Mantenimiento'}
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>

                <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Mostrando ${filteredTools.length} herramientas</span>
                  <div class="flex items-center gap-1">
                    <button class="px-2.5 py-1 rounded bg-[#132e4f] text-white font-bold">1</button>
                    <button class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">2</button>
                    <button class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">&gt;</button>
                  </div>
                </div>
              </div>

            </div>
          ` : `
            <!-- TAB CONTENT: SOLICITUDES -->
            <div class="space-y-6">

              <!-- Filters Row -->
              <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-3">
                  <select id="requests-status-filter" class="input-field !py-2 text-xs !w-auto bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl">
                    <option value="ALL" ${requestsStatus === 'ALL' ? 'selected' : ''}>Todos los estados</option>
                    <option value="PENDING" ${requestsStatus === 'PENDING' ? 'selected' : ''}>Pendientes</option>
                    <option value="CONFIRMED" ${requestsStatus === 'CONFIRMED' ? 'selected' : ''}>Confirmadas</option>
                    <option value="IN_PROGRESS" ${requestsStatus === 'IN_PROGRESS' ? 'selected' : ''}>En curso</option>
                    <option value="COMPLETED" ${requestsStatus === 'COMPLETED' ? 'selected' : ''}>Completadas</option>
                  </select>

                  <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                    ${renderIcon('Calendar', 'w-3.5 h-3.5 text-slate-500')}
                    <span>13 oct 2026 – 20 oct 2026</span>
                  </div>
                </div>

                <div class="relative w-full md:w-80">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Search', 'w-3.5 h-3.5')}
                  </span>
                  <input 
                    type="text" 
                    id="requests-search" 
                    value="${requestsSearch}" 
                    placeholder="Buscar por cliente, herramienta o número..." 
                    class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" 
                  />
                </div>
              </div>

              <!-- Requests Table Section -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs" id="requests-table">
                    <thead class="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
                      <tr>
                        <th class="py-3 px-4 w-12 text-center">#</th>
                        <th class="py-3 px-4">Cliente</th>
                        <th class="py-3 px-4">Herramienta</th>
                        <th class="py-3 px-4">Fechas</th>
                        <th class="py-3 px-4">Total</th>
                        <th class="py-3 px-4">Estado</th>
                        <th class="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800" id="requests-tbody">
                      ${filteredRequests.map((req, idx) => {
                        const isPending = req.status === 'PENDING';
                        const isConfirmed = req.status === 'CONFIRMED';
                        const isInProgress = req.status === 'IN_PROGRESS';
                        const isCompleted = req.status === 'COMPLETED';

                        return `
                          <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                            <td class="py-3.5 px-4 text-center font-mono text-slate-400 dark:text-slate-500 font-semibold">${idx + 1}</td>
                            <td class="py-3.5 px-4">
                              <div class="font-bold text-slate-900 dark:text-white">${req.client?.name || 'Cliente'}</div>
                              <div class="text-[11px] text-slate-400 dark:text-slate-500">${req.client?.email || 'cliente@email.com'}</div>
                            </td>
                            <td class="py-3.5 px-4">
                              <div class="flex items-center gap-2.5">
                                <img src="${req.tool?.img || 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=60'}" class="w-9 h-9 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                                <div>
                                  <div class="font-bold text-slate-800 dark:text-slate-200">${req.tool?.name || 'Equipo'}</div>
                                  <div class="text-[10px] text-slate-400 dark:text-slate-500">${req.tool?.category || 'Herramientas'}</div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              <div>${req.dates || '13 oct - 16 oct 2026'}</div>
                              <div class="text-[10px] text-slate-400 dark:text-slate-500">${req.days || 3} días</div>
                            </td>
                            <td class="py-3.5 px-4 font-black text-slate-900 dark:text-white font-display">
                              ${formatCurrency(req.total)}
                            </td>
                            <td class="py-3.5 px-4">
                              ${getRentalStatusBadge(req.status)}
                            </td>
                            <td class="py-3.5 px-4 text-right space-x-1.5">
                              ${isPending ? `
                                <button class="btn-confirm-action px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-xs cursor-pointer" data-id="${req.id}">
                                  Confirmar
                                </button>
                                <button class="btn-reject-action px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" data-id="${req.id}">
                                  Rechazar
                                </button>
                              ` : ''}

                              ${isConfirmed ? `
                                <button class="btn-dispatch-action px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-xs cursor-pointer" data-id="${req.id}">
                                  Registrar entrega
                                </button>
                              ` : ''}

                              ${isInProgress ? `
                                <button class="btn-return-action px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-xs cursor-pointer" data-id="${req.id}">
                                  Registrar devolución
                                </button>
                              ` : ''}

                              ${isCompleted ? `
                                <button class="btn-view-invoice px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex-inline items-center gap-1 shadow-xs cursor-pointer" data-id="${req.id}">
                                  ${renderIcon('FileText', 'w-3 h-3')} Ver factura
                                </button>
                              ` : ''}
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>

                <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Mostrando ${filteredRequests.length} solicitudes</span>
                  <div class="flex items-center gap-1">
                    <button class="px-2.5 py-1 rounded bg-[#132e4f] text-white font-bold">1</button>
                    <button class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">2</button>
                    <button class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">&gt;</button>
                  </div>
                </div>
              </div>

            </div>
          `}

        </div>
      </div>
    `;

    attachEventHandlers();
  }

  function attachEventHandlers() {
    // Tab switching
    container.querySelector('#tab-btn-inventory')?.addEventListener('click', () => {
      activeTab = 'inventory';
      render();
    });

    container.querySelector('#tab-btn-requests')?.addEventListener('click', () => {
      activeTab = 'requests';
      render();
    });

    // Top action
    container.querySelector('#btn-open-new-tool-drawer')?.addEventListener('click', () => {
      openNewToolModal();
    });

    // Inventory search & filter
    container.querySelector('#inv-search-input')?.addEventListener('input', (e) => {
      inventorySearch = e.target.value;
      render();
    });

    container.querySelector('#inv-status-filter')?.addEventListener('change', (e) => {
      inventoryStatus = e.target.value;
      render();
    });

    // Inventory actions
    container.querySelectorAll('.btn-edit-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = toolsList.find(t => t.id.toString() === btn.dataset.id);
        openNewToolModal(tool);
      });
    });

    container.querySelectorAll('.btn-toggle-maint').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tool = toolsList.find(t => t.id.toString() === btn.dataset.id);
        if (!tool) return;
        const newStatus = tool.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
        tool.status = newStatus;
        showToast(`Estado de "${tool.name}" actualizado a ${newStatus === 'AVAILABLE' ? 'Disponible' : 'Mantenimiento'}`, 'success');
        render();
      });
    });

    // Requests search & filter
    container.querySelector('#requests-search')?.addEventListener('input', (e) => {
      requestsSearch = e.target.value;
      render();
    });

    container.querySelector('#requests-status-filter')?.addEventListener('change', (e) => {
      requestsStatus = e.target.value;
      render();
    });

    // Requests actions
    container.querySelectorAll('.btn-confirm-action').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await api.patch(`/rentals/${b.dataset.id}/status`, { status: 'APPROVED' });
        } catch (e) {
          await api.patch(`/rentals/${b.dataset.id}/confirm`).catch(() => {});
        }
        const req = requestsList.find(r => String(r.id) === String(b.dataset.id));
        if (req) req.status = 'APPROVED';
        notificationsStore.add({
          category: 'RENTAL',
          type: 'success',
          title: 'Solicitud Confirmada',
          message: `Has confirmado el alquiler #${b.dataset.id} para ${req?.client?.name || req?.clientFullName || 'el cliente'}. Equipo listo para despacho.`,
          link: '#/provider'
        });
        render();
      });
    });

    container.querySelectorAll('.btn-reject-action').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await api.patch(`/rentals/${b.dataset.id}/status`, { status: 'CANCELLED' });
        } catch (e) {
          await api.patch(`/rentals/${b.dataset.id}/cancel`).catch(() => {});
        }
        const req = requestsList.find(r => String(r.id) === String(b.dataset.id));
        if (req) req.status = 'CANCELLED';
        notificationsStore.add({
          category: 'RENTAL',
          type: 'warning',
          title: 'Solicitud Rechazada',
          message: `Se ha cancelado la solicitud #${b.dataset.id}.`,
          link: '#/provider'
        });
        render();
      });
    });

    container.querySelectorAll('.btn-dispatch-action').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await api.patch(`/rentals/${b.dataset.id}/status`, { status: 'IN_PROGRESS' });
        } catch (e) {
          await api.patch(`/rentals/${b.dataset.id}/start`).catch(() => {});
        }
        const req = requestsList.find(r => String(r.id) === String(b.dataset.id));
        if (req) req.status = 'IN_PROGRESS';
        notificationsStore.add({
          category: 'ALERT',
          type: 'info',
          title: 'Entrega de Equipo Registrada',
          message: `El equipo del alquiler #${b.dataset.id} fue entregado al cliente. Estado: En curso.`,
          link: '#/provider'
        });
        render();
      });
    });

    container.querySelectorAll('.btn-return-action').forEach(b => {
      b.addEventListener('click', () => {
        const req = requestsList.find(r => r.id === b.dataset.id);
        openReturnInspectionModal(req);
      });
    });

    container.querySelectorAll('.btn-view-invoice').forEach(b => {
      b.addEventListener('click', () => {
        const req = requestsList.find(r => r.id === b.dataset.id) || requestsList[0];
        openInvoiceViewer({
          invoiceNumber: 'TR-000' + (req.id || '4587'),
          issueDate: '13 oct 2026',
          client: {
            name: req.client?.name || 'Constructora Bolívar S.A.S.',
            taxId: '900.342.112-4',
            address: 'Calle 100 # 19-61, Of. 402, Bogotá',
            email: req.client?.email || 'compras@constructorabolivar.com',
            phone: '+57 (1) 745-8900'
          },
          provider: {
            name: 'Constructoras del Norte S.A.S.',
            taxId: '901.458.789-1',
            address: 'Cra. 43A # 18 Sur-135, Medellín',
            email: 'contacto@constructornorte.com',
            phone: '+57 (4) 448-9000'
          },
          tool: {
            name: req.tool?.name || 'Taladro percutor 1" 1100W',
            sku: 'D25033K-B3'
          },
          rentalPeriod: {
            startDate: '13 oct 2026',
            endDate: '16 oct 2026',
            days: req.days || 3
          },
          dailyRate: req.total ? Math.round(req.total / (req.days || 3)) : 85000,
          subtotal: req.total || 255000,
          tax: Math.round((req.total || 255000) * 0.19),
          total: Math.round((req.total || 255000) * 1.19),
          paymentMethod: 'Transferencia bancaria',
          bank: 'Bancolombia',
          reference: 'TR-0004587',
          paymentDate: '13 oct 2026'
        });
      });
    });
  }

  /**
   * Modal: Registrar Devolución matching Stitch "Registrar devolución" popup
   */
  function openReturnInspectionModal(req) {
    const content = document.createElement('div');
    content.className = 'space-y-5 text-xs text-slate-800 dark:text-slate-100';

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Tool preview -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <img src="${req?.tool?.img || 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=100'}" class="w-12 h-12 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1" />
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">${req?.tool?.name || 'Excavadora Hidráulica CAT 320'}</h4>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">${req?.tool?.category || 'Excavación'}</span>
          </div>
        </div>

        <!-- Estado de la herramienta -->
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Estado de la maquinaria devuelta</label>
          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
              <input type="radio" name="insp-status" value="GOOD" checked class="text-[#132e4f] focus:ring-0" />
              <span>Buen estado (Conforme)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
              <input type="radio" name="insp-status" value="DAMAGED" class="text-[#132e4f] focus:ring-0" />
              <span>Con novedades / averías</span>
            </label>
          </div>
        </div>

        <!-- Notas opcional -->
        <div>
          <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Acta de inspección física <span class="text-slate-400 font-normal">(opcional)</span></label>
          <textarea id="insp-notes" class="input-field h-20" placeholder="Observaciones de horómetro, combustible o carrocería..."></textarea>
        </div>

        <!-- Damage box (collapsible) -->
        <div id="damage-report-box" class="hidden p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 space-y-3">
          <div class="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
            ${renderIcon('AlertTriangle', 'w-4 h-4')}
            <span>Reportar daño o avería</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Completa esta sección si la maquinaria presenta fallas mecánicas o desgaste fuera de norma.</p>

          <div>
            <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción de la novedad *</label>
            <input type="text" id="dmg-description" class="input-field" placeholder="Describe la avería encontrada..." />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Costo estimado de reparación</label>
              <input type="text" id="dmg-cost" class="input-field" value="$ 350.000" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Enviar maquinaria a:</label>
              <select id="dmg-new-status" class="input-field">
                <option value="MAINTENANCE" selected>Taller especializado / Mantenimiento</option>
                <option value="RETIRED">Fuera de servicio</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button id="btn-cancel-insp" class="btn-secondary !py-2">Cancelar</button>
          <button id="btn-complete-insp" class="btn-primary !py-2">Completar devolución</button>
        </div>
      </div>
    `;

    const radioDamaged = content.querySelector('input[name="insp-status"][value="DAMAGED"]');
    const radioGood = content.querySelector('input[name="insp-status"][value="GOOD"]');
    const dmgBox = content.querySelector('#damage-report-box');

    radioDamaged.addEventListener('change', () => dmgBox.classList.remove('hidden'));
    radioGood.addEventListener('change', () => dmgBox.classList.add('hidden'));

    content.querySelector('#btn-cancel-insp').addEventListener('click', () => modal.close());

    content.querySelector('#btn-complete-insp').addEventListener('click', async () => {
      await api.patch(`/rentals/${req.id}/complete`);
      const isDamaged = content.querySelector('input[name="insp-status"]:checked')?.value === 'DAMAGED';
      notificationsStore.add({
        category: isDamaged ? 'DAMAGE' : 'INSPECTION',
        type: isDamaged ? 'warning' : 'success',
        title: isDamaged ? 'Devolución con Avería Registrada' : 'Devolución Conforme Registrada',
        message: `Inspección para alquiler #${req.id} completada.${isDamaged ? ' Se registró reporte de avería.' : ' Depósito listo para liberación.'}`,
        link: '#/provider'
      });
      if (req) req.status = 'COMPLETED';
      modal.close();
      render();
    });

    modal.open({
      title: `${renderIcon('ClipboardCheck', 'w-5 h-5 text-[#132e4f] dark:text-blue-400')} Registrar devolución`,
      content: content,
      maxWidth: 'max-w-lg',
    });
  }

  /**
   * Drawer / Modal: Nueva herramienta matching Stitch right drawer
   */
  function openNewToolModal(existingTool = null) {
    const isEdit = !!existingTool;
    const content = document.createElement('div');
    content.className = 'space-y-4 text-xs text-slate-800 dark:text-slate-100';

    content.innerHTML = `
      <form id="drawer-tool-form" class="space-y-4">
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de la maquinaria *</label>
          <input type="text" id="dt-name" required class="input-field" value="${existingTool?.name || ''}" placeholder="Ej: Excavadora Hidráulica CAT 320" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Línea / Categoría *</label>
          <select id="dt-category" class="input-field" required>
            <option value="cat-excavacion" ${existingTool?.categoryId === 'cat-excavacion' ? 'selected' : ''}>Excavación y Movimiento</option>
            <option value="cat-compactacion" ${existingTool?.categoryId === 'cat-compactacion' ? 'selected' : ''}>Compactación y Pavimento</option>
            <option value="cat-elevacion" ${existingTool?.categoryId === 'cat-elevacion' ? 'selected' : ''}>Grúas y Manlifts 4x4</option>
            <option value="cat-energia" ${existingTool?.categoryId === 'cat-energia' ? 'selected' : ''}>Generación Eléctrica Diésel</option>
            <option value="cat-demolicion" ${existingTool?.categoryId === 'cat-demolicion' ? 'selected' : ''}>Demolición y Martillos</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción técnica *</label>
          <textarea id="dt-desc" rows="3" required class="input-field" placeholder="Describe especificaciones de motor, horómetro, potencia y balde...">${existingTool?.description || ''}</textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tarifa diaria (COP) *</label>
            <input type="number" id="dt-price" required class="input-field" placeholder="$ 0" value="${existingTool?.dailyPrice || 650000}" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado *</label>
            <select id="dt-status" class="input-field">
              <option value="AVAILABLE" ${existingTool?.status === 'AVAILABLE' ? 'selected' : ''}>Disponible</option>
              <option value="RENTED" ${existingTool?.status === 'RENTED' ? 'selected' : ''}>Alquilada</option>
              <option value="MAINTENANCE" ${existingTool?.status === 'MAINTENANCE' ? 'selected' : ''}>Mantenimiento</option>
            </select>
          </div>
        </div>

        <!-- Image Upload Box -->
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fotos de la maquinaria</label>
          <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            ${renderIcon('UploadCloud', 'w-6 h-6 text-slate-400 mx-auto mb-1')}
            <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">Arrastra fotos de la maquinaria o haz clic para subir</span>
            <div class="text-[10px] text-slate-400 mt-0.5">JPG, PNG de alta resolución (máx. 10 MB)</div>
          </div>
        </div>

        <!-- Specifications Rows -->
        <div class="space-y-2">
          <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">Especificaciones</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" class="input-field" value="Potencia" readonly />
            <input type="text" class="input-field" value="1100 W" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" class="input-field" value="Voltaje" readonly />
            <input type="text" class="input-field" value="110 V" />
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="btn-primary w-full !py-2.5">
            ${isEdit ? 'Guardar cambios' : 'Guardar herramienta'}
          </button>
        </div>
      </form>
    `;

    content.querySelector('#drawer-tool-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = content.querySelector('#dt-name').value;
      const category = content.querySelector('#dt-category').value;
      const price = parseFloat(content.querySelector('#dt-price').value);
      const desc = content.querySelector('#dt-desc').value;
      const status = content.querySelector('#dt-status').value;

      if (isEdit) {
        existingTool.name = name;
        existingTool.dailyPrice = price;
        existingTool.description = desc;
        existingTool.status = status;
        notificationsStore.add({
          category: 'RENTAL',
          type: 'info',
          title: 'Herramienta Actualizada',
          message: `Se actualizaron las especificaciones de "${name}".`,
          link: '#/provider'
        });
      } else {
        const newTool = {
          id: toolsList.length + 1,
          name,
          categoryId: category,
          dailyPrice: price,
          description: desc,
          status,
          images: [{ imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600' }]
        };
        toolsList.unshift(newTool);
        await api.post('/tools', newTool).catch(() => {});
        notificationsStore.add({
          category: 'RENTAL',
          type: 'success',
          title: 'Equipo Agregado al Inventario',
          message: `Has publicado "${name}" en tu catálogo a ${formatCurrency(price)}/día.`,
          link: '#/provider'
        });
      }

      modal.close();
      render();
    });

    modal.open({
      title: `${renderIcon(isEdit ? 'Edit3' : 'Plus', 'w-5 h-5 text-[#132e4f] dark:text-blue-400')} ${isEdit ? 'Editar herramienta' : 'Nueva herramienta'}`,
      content: content,
      maxWidth: 'max-w-md',
    });
  }

  // Initial render
  render();
}

export default renderProviderDashboard;
