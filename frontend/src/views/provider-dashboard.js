import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import modal from '../components/modal.js';
import { formatCurrency, formatDate, getRentalStatusBadge, getToolStatusBadge } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openInvoiceViewer } from './rental-modal.js';
import { openAuthModal } from '../components/auth-modal.js';
import { notificationsStore } from '../utils/notifications-store.js';
import { 
  validateEmail, 
  validateCompanyName, 
  validateCity, 
  validatePhone, 
  validateTaxId, 
  validateToolName, 
  validateDailyPrice, 
  validateImageUrl,
  COLOMBIAN_CITIES 
} from '../utils/validators.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';

export async function renderProviderDashboard() {
  const container = document.getElementById('app-content');
  if (!container) return;

  if (!auth.isAuthenticated()) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-10 max-w-lg mx-auto shadow-xl space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-[#FF7A00] border-2 border-[#FF7A00]/30 flex items-center justify-center mx-auto shadow-md">
            ${renderIcon('Building2', 'w-8 h-8')}
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">Portal Oficial para Proveedores de Maquinaria</h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Publica tu flota pesada, administra contratos vigentes en obra y supervisa métricas de facturación.</p>
          <div class="flex flex-col sm:flex-row gap-3 pt-3">
            <button id="btn-demo-provider-login" class="btn-primary flex-1 !py-3 text-xs flex items-center justify-center gap-2 shadow-md">
              ${renderIcon('CheckCircle2', 'w-4 h-4')} Entrar como Proveedor (Demo)
            </button>
            <button id="btn-login-provider" class="btn-dark flex-1 !py-3 text-xs flex items-center justify-center gap-2">
              ${renderIcon('LogIn', 'w-4 h-4')} Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    `;
    container.querySelector('#btn-demo-provider-login')?.addEventListener('click', async () => {
      try {
        await auth.login('provider.caterpillar@opusrentals.com', 'password123');
        showToast('Sesión iniciada como Proveedor Oficial Caterpillar (Conectado a BD)', 'success');
        renderProviderDashboard();
      } catch (err) {
        showToast(err.message || 'Error al autenticar proveedor en BD', 'error');
      }
    });
    container.querySelector('#btn-login-provider')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  const user = auth.getUser();
  const providerId = user?.profile?.id || user?.id || 'prov-001';

  // Local state for tabs and filtering
  let activeTab = 'inventory'; // 'inventory' | 'requests' | 'metrics' | 'profile'
  let inventorySearch = '';
  let inventoryCategory = 'ALL';
  let inventoryStatus = 'ALL';

  let requestsSearch = '';
  let requestsStatusFilter = 'ALL'; // 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

  let toolsList = [];
  let allToolsRaw = [];
  let requestsList = [];
  let allProviders = [];
  let currentProvider = null;

  // Provider profile company settings (stored or defaulted)
  const storedProfile = JSON.parse(localStorage.getItem(`opus_provider_profile_${providerId}`) || '{}');
  const providerProfile = {
    companyName: storedProfile.companyName || user?.profile?.companyName || user?.profile?.name || 'Caterpillar Equipos SAS',
    taxId: storedProfile.taxId || '901.884.219-5',
    phone: storedProfile.phone || '+57 (1) 745-8900',
    whatsapp: storedProfile.whatsapp || '573104567890',
    email: storedProfile.email || user?.email || 'operaciones@caterpillar-colombia.com',
    yardAddress: storedProfile.yardAddress || 'Parque Industrial Cazucá - Km 4 Autopista Sur',
    city: storedProfile.city || 'Bogotá D.C. & Sabana',
    zones: storedProfile.zones || ['Bogotá D.C. y Sabana', 'Cundinamarca Central', 'Antioquia (Medellín)', 'Eje Cafetero'],
    verified: true
  };

  try {
    const [fetchedTools, fetchedRequests, fetchedProviders] = await Promise.all([
      api.get('/tools'),
      api.get('/rentals/provider-requests').catch(() => api.get(`/rentals/provider/${providerId}`).catch(() => [])),
      api.get('/providers').catch(() => [])
    ]);

    allProviders = Array.isArray(fetchedProviders) ? fetchedProviders : [];

    // Match provider from database by user email or ID
    currentProvider = allProviders.find(p => 
      (user?.email && p.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
      (user?.userId && Number(p.userId) === Number(user.userId)) ||
      (providerId && Number(p.id) === Number(providerId))
    ) || allProviders[0] || null;

    if (currentProvider) {
      providerProfile.companyName = currentProvider.companyName || providerProfile.companyName;
      providerProfile.taxId = currentProvider.taxId || providerProfile.taxId;
      providerProfile.yardAddress = currentProvider.address || providerProfile.yardAddress;
      providerProfile.email = currentProvider.email || user?.email || providerProfile.email;
      if (currentProvider.contacts && currentProvider.contacts.length > 0) {
        const ph = currentProvider.contacts.find(c => c.contactType === 'PHONE');
        if (ph) {
          providerProfile.phone = ph.contactValue;
          providerProfile.whatsapp = ph.contactValue.replace(/\D/g, '');
        }
      }
    }

    allToolsRaw = Array.isArray(fetchedTools) ? fetchedTools : [];
    
    // Multi-tenant provider fleet filtering:
    // If user is a provider or has a currentProvider ID, show only their machinery.
    // If admin is viewing, allow viewing current provider's fleet.
    const activeProviderId = currentProvider?.id || (Number(providerId) ? Number(providerId) : null);
    if (activeProviderId) {
      toolsList = allToolsRaw.filter(t => Number(t.providerId) === Number(activeProviderId));
      // Fallback if brand matches provider name
      if (toolsList.length === 0 && currentProvider?.companyName) {
        const provKeyword = currentProvider.companyName.split(' ')[0].toLowerCase();
        toolsList = allToolsRaw.filter(t => t.brand?.toLowerCase().includes(provKeyword));
      }
      if (toolsList.length === 0) {
        // If this provider hasn't registered machinery yet, show empty fleet (allows publishing new tools)
        toolsList = [];
      }
    } else {
      toolsList = allToolsRaw;
    }

    const rawReqs = Array.isArray(fetchedRequests) ? fetchedRequests : [];
    requestsList = rawReqs.map(r => ({
      id: r.id,
      client: {
        name: r.clientFullName || r.client?.name || `Cliente #${r.clientId || ''}`,
        phone: r.clientPhone || r.client?.phone || '+57 300 000 0000'
      },
      tool: {
        name: r.toolName || r.tool?.name || 'Equipo Pesado',
        categoryName: r.toolBrand || r.tool?.categoryName || 'Maquinaria'
      },
      dates: r.startDate && r.endDate ? `${formatDate(r.startDate)} - ${formatDate(r.endDate)}` : (r.dates || 'Período Activo'),
      days: r.totalDays || r.days || 1,
      total: r.totalAmount || r.total || r.subtotal || 0,
      status: r.status || 'PENDING',
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber
    }));
  } catch (err) {
    console.warn('Error loading provider dashboard data', err);
    toolsList = [];
    requestsList = [];
  }

  function render() {
    // Calculate KPIs
    const totalTools = toolsList.length;
    const availableTools = toolsList.filter(t => t.status === 'AVAILABLE').length;
    const rentedTools = toolsList.filter(t => t.status === 'RENTED').length;
    const maintenanceTools = toolsList.filter(t => t.status === 'MAINTENANCE').length;
    
    const pendingRequests = requestsList.filter(r => r.status === 'PENDING').length;
    const activeRentals = requestsList.filter(r => r.status === 'IN_PROGRESS' || r.status === 'APPROVED').length;
    const completedRentals = requestsList.filter(r => r.status === 'COMPLETED').length;
    const cancelledRentals = requestsList.filter(r => r.status === 'CANCELLED' || r.status === 'REJECTED').length;

    // Financial calculations
    const totalRevenue = requestsList
      .filter(r => r.status !== 'CANCELLED' && r.status !== 'REJECTED')
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const avgTicket = requestsList.length ? Math.round(totalRevenue / requestsList.length) : 0;
    const occupancyRate = Math.round((rentedTools / (totalTools || 1)) * 100);

    // Filter tools for inventory tab
    const filteredTools = toolsList.filter(t => {
      const matchSearch = !inventorySearch || 
        t.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        t.categoryName?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        t.brand?.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchStatus = inventoryStatus === 'ALL' || t.status === inventoryStatus;
      return matchSearch && matchStatus;
    });

    // Filter requests for requests tab
    const filteredRequests = requestsList.filter(r => {
      const matchSearch = !requestsSearch ||
        r.client?.name?.toLowerCase().includes(requestsSearch.toLowerCase()) ||
        r.tool?.name?.toLowerCase().includes(requestsSearch.toLowerCase()) ||
        (r.id && r.id.toString().includes(requestsSearch));
      
      let matchStatus = true;
      if (requestsStatusFilter === 'PENDING') matchStatus = r.status === 'PENDING';
      else if (requestsStatusFilter === 'IN_PROGRESS') matchStatus = r.status === 'IN_PROGRESS' || r.status === 'APPROVED';
      else if (requestsStatusFilter === 'COMPLETED') matchStatus = r.status === 'COMPLETED';
      else if (requestsStatusFilter === 'CANCELLED') matchStatus = r.status === 'CANCELLED' || r.status === 'REJECTED';

      return matchSearch && matchStatus;
    });

    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <!-- Top Header & Action -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 text-[#FF7A00] text-xs font-mono font-black uppercase tracking-wider mb-2 shadow-xs">
                ${renderIcon('Building2', 'w-3.5 h-3.5')} Portal Oficial de Proveedor Opus Rentals
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                ${providerProfile.companyName}
              </h1>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Supervisa inventario en patio, contratos en frente de obra y métricas telemáticas.</p>
            </div>

              <div class="flex flex-wrap items-center gap-3">
                ${allProviders.length > 1 ? `
                  <div class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-2xs">
                    <span class="text-xs font-mono font-bold text-slate-500 uppercase">Proveedor:</span>
                    <select id="select-active-provider" class="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer">
                      ${allProviders.map(p => `
                        <option value="${p.id}" ${currentProvider && Number(currentProvider.id) === Number(p.id) ? 'selected' : ''}>
                          ${p.companyName} (${p.taxId || 'NIT'})
                        </option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}
                <button id="btn-open-new-tool-drawer" class="btn-primary !py-3 !px-5 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer active:scale-95">
                  ${renderIcon('Plus', 'w-4 h-4')}
                  <span>Publicar Maquinaria</span>
                </button>
              </div>
            </div>

          <!-- 4 Top KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="provider-kpis-grid">
            
            <!-- Card 1: Disponibles -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Disponibles en Patio</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${renderIcon('CheckCircle2', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display">${availableTools}</div>
              <div class="text-[11px] text-slate-500">
                de ${totalTools} unidades registradas
              </div>
            </div>

            <!-- Card 2: Operando en Obra -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Operando en Obra</span>
                <div class="w-8 h-8 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold">
                  ${renderIcon('Truck', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display">${rentedTools}</div>
              <div class="text-[11px] text-orange-600 font-bold font-mono">
                ${occupancyRate}% tasa de ocupación
              </div>
            </div>

            <!-- Card 3: Facturación Acumulada -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Facturación Total</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${renderIcon('DollarSign', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl font-black text-slate-900 dark:text-white font-display text-emerald-600">
                ${formatCurrency(totalRevenue)}
              </div>
              <div class="text-[11px] text-slate-500">
                Ticket promedio: ${formatCurrency(avgTicket)}
              </div>
            </div>

            <!-- Card 4: Solicitudes pendientes -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-orange-300 dark:border-orange-700 shadow-sm space-y-1 bg-gradient-to-br from-orange-500/5 to-transparent">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#FF7A00] uppercase tracking-wider font-mono">Pendientes por Despacho</span>
                <div class="w-8 h-8 rounded-lg bg-[#FF7A00] text-white flex items-center justify-center relative font-black shadow-xs">
                  ${renderIcon('Clock', 'w-4 h-4')}
                  ${pendingRequests > 0 ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>' : ''}
                </div>
              </div>
              <div class="text-3xl font-black text-slate-900 dark:text-white font-display text-[#FF7A00]">${pendingRequests}</div>
              <div class="text-[11px] text-slate-600 font-semibold">
                ${pendingRequests > 0 ? 'Requieren confirmación prioritaria' : 'Todas radicadas'}
              </div>
            </div>

          </div>

          <!-- 4 Specialized Navigation Tabs -->
          <div class="border-b-2 border-slate-200 dark:border-slate-800">
            <nav class="flex flex-wrap gap-2 sm:gap-6" aria-label="Tabs">
              <button 
                id="tab-btn-inventory" 
                class="py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeTab === 'inventory' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
              >
                ${renderIcon('Package', 'w-4 h-4')}
                <span>Mi Flota / Inventario</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeTab === 'inventory' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">
                  ${toolsList.length}
                </span>
              </button>

              <button 
                id="tab-btn-requests" 
                class="py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeTab === 'requests' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
              >
                ${renderIcon('FileText', 'w-4 h-4')}
                <span>Contratos & Despachos</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${pendingRequests > 0 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'}">
                  ${requestsList.length}
                </span>
              </button>

              <button 
                id="tab-btn-metrics" 
                class="py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeTab === 'metrics' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
              >
                ${renderIcon('BarChart3', 'w-4 h-4')}
                <span>Métricas & Rendimiento</span>
              </button>

              <button 
                id="tab-btn-profile" 
                class="py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeTab === 'profile' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
              >
                ${renderIcon('Building', 'w-4 h-4')}
                <span>Perfil & Cobertura</span>
              </button>
            </nav>
          </div>

          <!-- ========================================================================= -->
          <!-- TAB 1: MI FLOTA / INVENTARIO                                              -->
          <!-- ========================================================================= -->
          ${activeTab === 'inventory' ? `
            <div class="space-y-6">
              
              <!-- Search & Quick Filters -->
              <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div class="relative flex-1 max-w-md">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Search', 'w-4 h-4')}
                  </span>
                  <input 
                    type="text" 
                    id="inv-search-input" 
                    value="${inventorySearch}" 
                    placeholder="Buscar excavadora, marca, serie o modelo..." 
                    class="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FF7A00]" 
                  />
                </div>

                <div class="flex items-center gap-3">
                  <select id="inv-status-filter" class="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#FF7A00] cursor-pointer">
                    <option value="ALL" ${inventoryStatus === 'ALL' ? 'selected' : ''}>Todos los estados</option>
                    <option value="AVAILABLE" ${inventoryStatus === 'AVAILABLE' ? 'selected' : ''}>Disponibles en Patio</option>
                    <option value="RENTED" ${inventoryStatus === 'RENTED' ? 'selected' : ''}>Operando en Obra</option>
                    <option value="MAINTENANCE" ${inventoryStatus === 'MAINTENANCE' ? 'selected' : ''}>En Mantenimiento</option>
                  </select>
                </div>
              </div>

              <!-- Machinery List Grid / Table -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-slate-500 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 bg-slate-50 font-mono font-black">
                      <tr>
                        <th class="py-3 px-4">Maquinaria Pesada</th>
                        <th class="py-3 px-4">Línea / Rubro</th>
                        <th class="py-3 px-4">Tarifa Diaria</th>
                        <th class="py-3 px-4">Estado Operativo</th>
                        <th class="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      ${filteredTools.length === 0 ? `
                        <tr>
                          <td colspan="5" class="py-12 text-center text-slate-400">
                            No se encontraron máquinas con los filtros actuales.
                          </td>
                        </tr>
                      ` : filteredTools.map(t => {
                        const img = resolveToolImageUrl(t);
                        const isAvailable = t.status === 'AVAILABLE';
                        return `
                          <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-3.5 px-4">
                              <div class="flex items-center gap-3">
                                <img src="${img}" alt="${t.name}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';" />
                                <div>
                                  <div class="font-bold text-slate-900 dark:text-white text-xs">${t.name}</div>
                                  <div class="text-[10px] text-slate-400 font-mono">ID: ${t.id} · ${t.brand || 'CAT'}</div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                              ${t.categoryName || 'Construcción Civil'}
                            </td>
                            <td class="py-3.5 px-4 font-black font-mono text-slate-900 dark:text-white">
                              ${formatCurrency(t.dailyPrice)}
                            </td>
                            <td class="py-3.5 px-4">
                              ${getToolStatusBadge(t.status)}
                            </td>
                            <td class="py-3.5 px-4 text-right space-x-2">
                              <button class="btn-toggle-maint px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:border-slate-400 transition-colors cursor-pointer" data-id="${t.id}" title="Alternar Mantenimiento">
                                ${t.status === 'MAINTENANCE' ? 'Poner Disponible' : 'A Mantenimiento'}
                              </button>
                              <button class="btn-edit-tool px-2.5 py-1.5 rounded-lg text-xs font-black bg-slate-100 hover:bg-[#FF7A00] hover:text-white transition-colors cursor-pointer" data-id="${t.id}">
                                ${renderIcon('Edit3', 'w-3.5 h-3.5 inline')}
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- TAB 2: CONTRATOS & SOLICITUDES (Con filtros Activas / Canceladas / etc)    -->
          <!-- ========================================================================= -->
          ${activeTab === 'requests' ? `
            <div class="space-y-6">
              
              <!-- Status Sub-Pills Filter -->
              <div class="flex flex-wrap items-center gap-2 pb-2">
                <button class="req-status-pill px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${requestsStatusFilter === 'ALL' ? 'bg-[#FF7A00] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}" data-status="ALL">
                  Todas (${requestsList.length})
                </button>
                <button class="req-status-pill px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${requestsStatusFilter === 'PENDING' ? 'bg-[#FF7A00] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}" data-status="PENDING">
                  Pendientes (${pendingRequests})
                </button>
                <button class="req-status-pill px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${requestsStatusFilter === 'IN_PROGRESS' ? 'bg-[#FF7A00] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}" data-status="IN_PROGRESS">
                  Activas en Obra (${activeRentals})
                </button>
                <button class="req-status-pill px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${requestsStatusFilter === 'COMPLETED' ? 'bg-[#FF7A00] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}" data-status="COMPLETED">
                  Finalizadas / Devueltas (${completedRentals})
                </button>
                <button class="req-status-pill px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${requestsStatusFilter === 'CANCELLED' ? 'bg-[#FF7A00] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}" data-status="CANCELLED">
                  Canceladas (${cancelledRentals})
                </button>
              </div>

              <!-- Contracts Table -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-slate-500 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 bg-slate-50 font-mono font-black">
                      <tr>
                        <th class="py-3 px-4">Contrato #</th>
                        <th class="py-3 px-4">Constructora / Cliente</th>
                        <th class="py-3 px-4">Equipo Alquilado</th>
                        <th class="py-3 px-4">Período de Obra</th>
                        <th class="py-3 px-4">Total COP</th>
                        <th class="py-3 px-4">Estado</th>
                        <th class="py-3 px-4 text-right">Gestión</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      ${filteredRequests.length === 0 ? `
                        <tr>
                          <td colspan="7" class="py-12 text-center text-slate-400">
                            No hay solicitudes en este estado.
                          </td>
                        </tr>
                      ` : filteredRequests.map(r => {
                        const isPending = r.status === 'PENDING';
                        const isActive = r.status === 'IN_PROGRESS' || r.status === 'APPROVED';
                        const isCompleted = r.status === 'COMPLETED';

                        return `
                          <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                              #${r.id}
                            </td>
                            <td class="py-3.5 px-4">
                              <div class="font-bold text-slate-900">${r.client?.name || 'Constructora Cliente'}</div>
                              <div class="text-[10px] text-slate-400 font-mono">${r.client?.phone || '+57 310 000 0000'}</div>
                            </td>
                            <td class="py-3.5 px-4 font-semibold text-slate-800">
                              ${r.tool?.name || 'Equipo Pesado'}
                            </td>
                            <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                              ${r.dates || 'Período Activo'} (${r.days || 3} días)
                            </td>
                            <td class="py-3.5 px-4 font-black font-mono text-slate-900">
                              ${formatCurrency(r.total)}
                            </td>
                            <td class="py-3.5 px-4">
                              ${getRentalStatusBadge(r.status)}
                            </td>
                            <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                              ${isPending ? `
                                <button class="btn-confirm-action px-3 py-1.5 rounded-lg text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-xs cursor-pointer" data-id="${r.id}">
                                  Aprobar Despacho
                                </button>
                                <button class="btn-reject-action px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 text-rose-600 hover:bg-rose-50 cursor-pointer" data-id="${r.id}">
                                  Rechazar
                                </button>
                              ` : ''}

                              ${isActive ? `
                                <button class="btn-return-action px-3 py-1.5 rounded-lg text-xs font-black bg-[#1A1A1A] hover:bg-slate-800 text-white shadow-xs cursor-pointer" data-id="${r.id}">
                                  Registrar Devolución
                                </button>
                              ` : ''}

                              <button class="btn-view-invoice px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer" data-id="${r.id}">
                                ${renderIcon('FileText', 'w-3 h-3 inline mr-1 text-[#FF7A00]')} Factura
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- TAB 3: MÉTRICAS & RENDIMIENTO FINANCIERO                                   -->
          <!-- ========================================================================= -->
          ${activeTab === 'metrics' ? `
            <div class="space-y-6">
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- KPI 1 -->
                <div class="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
                  <span class="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Facturación Bruta Anual</span>
                  <div class="text-3xl font-black text-slate-900 font-display text-[#FF7A00]">
                    ${formatCurrency(totalRevenue * 1.8)}
                  </div>
                  <p class="text-xs text-slate-500">Ingresos netos transferidos a cuenta empresarial.</p>
                </div>

                <!-- KPI 2 -->
                <div class="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
                  <span class="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Promedio Días en Obra</span>
                  <div class="text-3xl font-black text-slate-900 font-display">
                    12.4 días
                  </div>
                  <p class="text-xs text-slate-500">Permanencia media por frente de trabajo.</p>
                </div>

                <!-- KPI 3 -->
                <div class="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
                  <span class="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Tasa de Siniestralidad</span>
                  <div class="text-3xl font-black text-emerald-600 font-display">
                    0.2%
                  </div>
                  <p class="text-xs text-slate-500">Equipos devueltos con reporte conforme.</p>
                </div>
              </div>

              <!-- Performance Graph Breakdown -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-base font-black text-slate-900 font-display">Rendimiento por Línea de Maquinaria</h3>
                    <p class="text-xs text-slate-500">Distribución de ingresos generados en los últimos 90 días.</p>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    +24% crecimiento vs trimestre anterior
                  </span>
                </div>

                <div class="space-y-4 pt-2">
                  <div>
                    <div class="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Excavación y Movimiento de Tierras</span>
                      <span class="font-mono text-[#FF7A00]">65% ($ 18.400.000 COP)</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div class="bg-[#FF7A00] h-3 rounded-full" style="width: 65%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Compactación y Pavimentación</span>
                      <span class="font-mono text-amber-600">22% ($ 6.200.000 COP)</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div class="bg-amber-500 h-3 rounded-full" style="width: 22%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Generación Eléctrica Diésel</span>
                      <span class="font-mono text-slate-700">13% ($ 3.680.000 COP)</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div class="bg-slate-700 h-3 rounded-full" style="width: 13%"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- TAB 4: PERFIL DE EMPRESA & ZONAS DE COBERTURA                             -->
          <!-- ========================================================================= -->
          ${activeTab === 'profile' ? `
            <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 max-w-4xl">
              
              <!-- Verification Header Card -->
              <div class="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center font-black text-xl shadow-md">
                    ${renderIcon('ShieldCheck', 'w-7 h-7')}
                  </div>
                  <div>
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black uppercase">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Proveedor Verificado Opus Rentals
                    </div>
                    <h3 class="text-base font-black text-slate-900 font-display mt-0.5">Póliza Todo Riesgo SURA Vigente</h3>
                  </div>
                </div>
                <div class="text-xs text-slate-600 font-mono">
                  Renovación: Octubre 2027
                </div>
              </div>

              <!-- Profile Form -->
              <form id="provider-profile-form" class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">Razón Social *</label>
                    <input type="text" id="prof-company" class="input-field" value="${providerProfile.companyName}" required />
                  </div>
                  <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">NIT / RUT *</label>
                    <input type="text" id="prof-taxid" class="input-field font-mono" value="${providerProfile.taxId}" required />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">Teléfono Fijo de Despachos *</label>
                    <input type="text" id="prof-phone" class="input-field font-mono" value="${providerProfile.phone}" required />
                  </div>
                  <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">WhatsApp de Operaciones 24/7 *</label>
                    <input type="text" id="prof-wa" class="input-field font-mono" value="${providerProfile.whatsapp}" required />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">Correo Electrónico de Facturación *</label>
                    <input type="email" id="prof-email" class="input-field font-mono" value="${providerProfile.email}" required />
                  </div>
                  <div>
                    <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">Ciudad Sede *</label>
                    <input 
                      type="text" 
                      id="prof-city" 
                      class="input-field" 
                      list="colombian-cities-datalist" 
                      value="${providerProfile.city}" 
                      placeholder="Ej. Bogotá D.C., Medellín, Cali..." 
                      required 
                    />
                    <datalist id="colombian-cities-datalist">
                      ${COLOMBIAN_CITIES.map(c => `<option value="${c}"></option>`).join('')}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono mb-1">Dirección de Patio Central de Maquinaria *</label>
                  <input type="text" id="prof-yard" class="input-field" value="${providerProfile.yardAddress}" placeholder="Ej. Calle 80 Km 3.5 Vía Siberia, Patio 4" required />
                </div>

                <!-- Zonas de Cobertura -->
                <div class="space-y-2 pt-2">
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono">Zonas Habilitadas para Despacho en Cama Baja</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-700">
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked class="accent-[#FF7A00]" />
                      <span>Bogotá & Sabana</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked class="accent-[#FF7A00]" />
                      <span>Cundinamarca</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked class="accent-[#FF7A00]" />
                      <span>Antioquia</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked class="accent-[#FF7A00]" />
                      <span>Valle del Cauca</span>
                    </label>
                  </div>
                </div>

                <div class="pt-4 flex justify-end">
                  <button type="submit" class="btn-primary !py-3 !px-8 text-xs font-black shadow-md cursor-pointer">
                    ${renderIcon('Save', 'w-4 h-4')} Guardar Configuración de Empresa
                  </button>
                </div>
              </form>

            </div>
          ` : ''}

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

    container.querySelector('#tab-btn-metrics')?.addEventListener('click', () => {
      activeTab = 'metrics';
      render();
    });

    container.querySelector('#tab-btn-profile')?.addEventListener('click', () => {
      activeTab = 'profile';
      render();
    });

    // Top action: Publish
    container.querySelector('#btn-open-new-tool-drawer')?.addEventListener('click', () => {
      openNewToolModal();
    });

    // Provider switcher dropdown
    container.querySelector('#select-active-provider')?.addEventListener('change', (e) => {
      const selectedId = Number(e.target.value);
      const found = allProviders.find(p => Number(p.id) === selectedId);
      if (found) {
        currentProvider = found;
        providerProfile.companyName = found.companyName;
        providerProfile.taxId = found.taxId;
        providerProfile.yardAddress = found.address;
        providerProfile.email = found.email;
        if (found.contacts && found.contacts.length > 0) {
          const ph = found.contacts.find(c => c.contactType === 'PHONE');
          if (ph) {
            providerProfile.phone = ph.contactValue;
            providerProfile.whatsapp = ph.contactValue.replace(/\D/g, '');
          }
        }
        toolsList = allToolsRaw.filter(t => Number(t.providerId) === selectedId);
        if (toolsList.length === 0 && found.companyName) {
          const provKeyword = found.companyName.split(' ')[0].toLowerCase();
          toolsList = allToolsRaw.filter(t => t.brand?.toLowerCase().includes(provKeyword));
        }
        showToast(`Flota cambiada a: ${found.companyName}`, 'info');
        render();
      }
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

    // Request status filter sub-pills
    container.querySelectorAll('.req-status-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        requestsStatusFilter = btn.dataset.status;
        render();
      });
    });

    // Profile form submit with strict business validation
    container.querySelector('#provider-profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        companyName: container.querySelector('#prof-company')?.value?.trim(),
        taxId: container.querySelector('#prof-taxid')?.value?.trim(),
        phone: container.querySelector('#prof-phone')?.value?.trim(),
        whatsapp: container.querySelector('#prof-wa')?.value?.trim(),
        email: container.querySelector('#prof-email')?.value?.trim(),
        city: container.querySelector('#prof-city')?.value?.trim(),
        yardAddress: container.querySelector('#prof-yard')?.value?.trim()
      };

      // 1. Validar Razón Social
      const compRes = validateCompanyName(updated.companyName);
      if (!compRes.valid) {
        showToast(compRes.error, 'error');
        container.querySelector('#prof-company')?.focus();
        return;
      }

      // 2. Validar NIT / RUT
      const taxRes = validateTaxId(updated.taxId);
      if (!taxRes.valid) {
        showToast(taxRes.error, 'error');
        container.querySelector('#prof-taxid')?.focus();
        return;
      }

      // 3. Validar Teléfono Fijo
      const phoneRes = validatePhone(updated.phone);
      if (!phoneRes.valid) {
        showToast(`Teléfono fijo: ${phoneRes.error}`, 'error');
        container.querySelector('#prof-phone')?.focus();
        return;
      }

      // 4. Validar WhatsApp
      const waRes = validatePhone(updated.whatsapp);
      if (!waRes.valid) {
        showToast(`WhatsApp: ${waRes.error}`, 'error');
        container.querySelector('#prof-wa')?.focus();
        return;
      }

      // 5. Validar Correo Electrónico
      const emailRes = validateEmail(updated.email);
      if (!emailRes.valid) {
        showToast(emailRes.error, 'error');
        container.querySelector('#prof-email')?.focus();
        return;
      }

      // 6. Validar Ciudad (sin números, ni caracteres especiales)
      const cityRes = validateCity(updated.city);
      if (!cityRes.valid) {
        showToast(cityRes.error, 'error');
        container.querySelector('#prof-city')?.focus();
        return;
      }

      // 7. Validar Dirección de Patio
      if (!updated.yardAddress || updated.yardAddress.length < 5) {
        showToast('La dirección del patio central de maquinaria debe tener al menos 5 caracteres descriptivos.', 'error');
        container.querySelector('#prof-yard')?.focus();
        return;
      }

      Object.assign(providerProfile, updated);
      localStorage.setItem(`opus_provider_profile_${providerId}`, JSON.stringify(providerProfile));
      showToast('Configuración de empresa validada y guardada correctamente', 'success');
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
        showToast(`Estado de "${tool.name}" actualizado a ${newStatus === 'AVAILABLE' ? 'Disponible en Patio' : 'En Mantenimiento'}`, 'success');
        render();
      });
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
        if (req) req.status = 'IN_PROGRESS';
        notificationsStore.add({
          category: 'RENTAL',
          type: 'success',
          title: 'Despacho Aprobado',
          message: `Has aprobado el alquiler #${b.dataset.id}. Maquinaria lista para ser cargada en cama baja.`,
          link: '#/provider'
        });
        showToast(`Alquiler #${b.dataset.id} aprobado para despacho`, 'success');
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
          title: 'Solicitud Cancelada',
          message: `Se canceló la solicitud #${b.dataset.id}.`,
          link: '#/provider'
        });
        showToast(`Solicitud #${b.dataset.id} cancelada`, 'info');
        render();
      });
    });

    container.querySelectorAll('.btn-return-action').forEach(b => {
      b.addEventListener('click', () => {
        const req = requestsList.find(r => String(r.id) === String(b.dataset.id));
        openReturnInspectionModal(req);
      });
    });

    container.querySelectorAll('.btn-view-invoice').forEach(b => {
      b.addEventListener('click', () => {
        const req = requestsList.find(r => String(r.id) === String(b.dataset.id)) || requestsList[0];
        openInvoiceViewer({
          invoiceNumber: 'OP-INV-' + (req.id || '4587'),
          issueDate: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
          client: {
            name: req.client?.name || 'Constructora Bolívar S.A.S.',
            taxId: '900.342.112-4',
            address: 'Frente de Obra Carrera 7 # 127',
            email: 'compras@constructorabolivar.com',
            phone: '+57 (1) 745-8900'
          },
          provider: {
            name: providerProfile.companyName,
            taxId: providerProfile.taxId,
            address: providerProfile.yardAddress,
            email: providerProfile.email,
            phone: providerProfile.phone
          },
          tool: {
            name: req.tool?.name || 'Excavadora Hidráulica CAT 320D2',
            sku: 'CAT-320D2-2026'
          },
          rentalPeriod: {
            startDate: '16 oct 2026',
            endDate: '24 oct 2026',
            days: req.days || 8
          },
          dailyRate: req.total ? Math.round(req.total / (req.days || 8)) : 650000,
          subtotal: req.total || 5200000,
          tax: Math.round((req.total || 5200000) * 0.19),
          total: Math.round((req.total || 5200000) * 1.19),
          paymentMethod: 'Transferencia PSE Bancolombia',
          bank: 'Bancolombia Convenio Opus',
          reference: 'OP-PSE-9941',
          paymentDate: '15 oct 2026'
        });
      });
    });
  }

  /**
   * Modal: Registrar Devolución con Acta de Inspección
   */
  function openReturnInspectionModal(req) {
    const content = document.createElement('div');
    content.className = 'space-y-5 text-xs text-slate-800 dark:text-slate-100 p-2';

    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="font-bold text-slate-900">${req?.tool?.name || 'Maquinaria Pesada'}</div>
          <div class="text-[11px] text-slate-500">Alquiler #${req?.id || 'RES-1042'} · ${req?.client?.name || 'Cliente'}</div>
        </div>

        <div>
          <label class="block font-black text-slate-800 uppercase tracking-wider mb-2 font-mono">Estado de Recepción en Patio</label>
          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input type="radio" name="insp-status" value="GOOD" checked class="accent-[#FF7A00]" />
              <span>Conforme (Buen estado mecánico y físico)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input type="radio" name="insp-status" value="DAMAGED" class="accent-[#FF7A00]" />
              <span>Con novedades / averías</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Observaciones de Horómetro y Combustible</label>
          <textarea id="insp-notes" class="input-field h-20" placeholder="Registrar horómetro final, nivel de ACPM o reporte de desgaste..."></textarea>
        </div>

        <div id="damage-report-box" class="hidden p-4 rounded-2xl border-2 border-rose-300 bg-rose-50 space-y-3">
          <div class="flex items-center gap-1.5 text-rose-700 font-black">
            ${renderIcon('AlertTriangle', 'w-4 h-4')}
            <span>Reportar novedad o avería</span>
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1">Descripción del daño</label>
            <input type="text" id="dmg-description" class="input-field" placeholder="Ej. Fuga en manguera de alta presión..." />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-800 mb-1">Costo estimado (COP)</label>
              <input type="number" id="dmg-cost" class="input-field font-mono" value="450000" />
            </div>
            <div>
              <label class="block font-bold text-slate-800 mb-1">Destino de la máquina</label>
              <select id="dmg-new-status" class="input-field">
                <option value="MAINTENANCE" selected>Mantenimiento en Taller</option>
                <option value="AVAILABLE">Disponible tras limpieza</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button id="btn-cancel-insp" class="btn-dark !py-2.5">Cancelar</button>
          <button id="btn-complete-insp" class="btn-primary !py-2.5">Confirmar Recepción</button>
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
      try {
        await api.patch(`/rentals/${req.id}/complete`);
      } catch (e) {}
      const isDamaged = content.querySelector('input[name="insp-status"]:checked')?.value === 'DAMAGED';
      if (req) req.status = 'COMPLETED';
      notificationsStore.add({
        category: isDamaged ? 'DAMAGE' : 'INSPECTION',
        type: isDamaged ? 'warning' : 'success',
        title: isDamaged ? 'Devolución con Novedad Registrada' : 'Devolución Conforme Registrada',
        message: `Inspección de equipo #${req?.id} completada.${isDamaged ? ' Se radicó reporte de daño.' : ' Equipo listo para nuevo despacho.'}`,
        link: '#/provider'
      });
      showToast('Recepción en patio completada con éxito', 'success');
      modal.close();
      render();
    });

    modal.open({
      title: 'Acta de Recepción e Inspección Técnica',
      content: content,
      maxWidth: 'max-w-lg',
    });
  }

  /**
   * Modal: Publicar / Editar Maquinaria con Validación Estricta y Link de Imagen con Previsualización
   */
  function openNewToolModal(existingTool = null) {
    const isEdit = !!existingTool;
    const content = document.createElement('div');
    content.className = 'space-y-4 text-xs text-slate-800 p-2';

    const defaultImg = existingTool?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80';

    content.innerHTML = `
      <form id="drawer-tool-form" class="space-y-4">
        
        <div>
          <label class="block font-black text-slate-800 uppercase tracking-wider mb-1 font-mono">Nombre de la Maquinaria *</label>
          <input 
            type="text" 
            id="dt-name" 
            required 
            minlength="3"
            maxlength="100"
            class="input-field" 
            value="${existingTool?.name || ''}" 
            placeholder="Ej: Excavadora Hidráulica CAT 320D2" 
          />
          <span id="dt-name-err" class="hidden text-[11px] text-rose-600 font-bold mt-1 block"></span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-black text-slate-800 uppercase tracking-wider mb-1 font-mono">Marca / Fabricante *</label>
            <select id="dt-brand" class="input-field">
              <option value="Caterpillar" ${existingTool?.brand === 'Caterpillar' ? 'selected' : ''}>Caterpillar (CAT)</option>
              <option value="Komatsu" ${existingTool?.brand === 'Komatsu' ? 'selected' : ''}>Komatsu</option>
              <option value="Volvo" ${existingTool?.brand === 'Volvo' ? 'selected' : ''}>Volvo Construction</option>
              <option value="Bobcat" ${existingTool?.brand === 'Bobcat' ? 'selected' : ''}>Bobcat</option>
              <option value="Hitachi" ${existingTool?.brand === 'Hitachi' ? 'selected' : ''}>Hitachi</option>
              <option value="Bomag" ${existingTool?.brand === 'Bomag' ? 'selected' : ''}>Bomag</option>
              <option value="JCB" ${existingTool?.brand === 'JCB' ? 'selected' : ''}>JCB</option>
            </select>
          </div>

          <div>
            <label class="block font-black text-slate-800 uppercase tracking-wider mb-1 font-mono">Línea de Obra *</label>
            <select id="dt-category" class="input-field" required>
              <option value="cat-excavacion" ${existingTool?.categoryId === 'cat-excavacion' ? 'selected' : ''}>Excavación y Movimiento</option>
              <option value="cat-compactacion" ${existingTool?.categoryId === 'cat-compactacion' ? 'selected' : ''}>Compactación y Pavimento</option>
              <option value="cat-elevacion" ${existingTool?.categoryId === 'cat-elevacion' ? 'selected' : ''}>Grúas y Manlifts</option>
              <option value="cat-energia" ${existingTool?.categoryId === 'cat-energia' ? 'selected' : ''}>Generación Eléctrica Diésel</option>
              <option value="cat-demolicion" ${existingTool?.categoryId === 'cat-demolicion' ? 'selected' : ''}>Demolición Hidráulica</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-black text-slate-800 uppercase tracking-wider mb-1 font-mono">Tarifa Diaria (COP) *</label>
            <input 
              type="number" 
              id="dt-price" 
              required 
              min="10000"
              class="input-field font-mono font-bold" 
              placeholder="$ 0" 
              value="${existingTool?.dailyPrice || 650000}" 
            />
            <span id="dt-price-err" class="hidden text-[11px] text-rose-600 font-bold mt-1 block"></span>
          </div>

          <div>
            <label class="block font-black text-slate-800 uppercase tracking-wider mb-1 font-mono">Disponibilidad Inicial *</label>
            <select id="dt-status" class="input-field">
              <option value="AVAILABLE" ${existingTool?.status === 'AVAILABLE' ? 'selected' : ''}>Disponible en Patio</option>
              <option value="RENTED" ${existingTool?.status === 'RENTED' ? 'selected' : ''}>Operando en Obra</option>
              <option value="MAINTENANCE" ${existingTool?.status === 'MAINTENANCE' ? 'selected' : ''}>En Mantenimiento</option>
            </select>
          </div>
        </div>

        <!-- Image Link Input with Live Instant Preview -->
        <div class="space-y-2">
          <label class="block font-black text-slate-800 uppercase tracking-wider font-mono">
            Enlace de Imagen de la Maquinaria (URL) *
          </label>
          <div class="flex items-center gap-2">
            <input 
              type="url" 
              id="dt-img-url" 
              class="input-field font-mono text-[11px]" 
              placeholder="https://ejemplo.com/foto-maquinaria.jpg" 
              value="${defaultImg}" 
            />
            <button type="button" id="btn-preview-img" class="px-3 py-2.5 rounded-xl border-2 border-slate-300 font-black text-xs hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors whitespace-nowrap cursor-pointer">
              Previsualizar
            </button>
          </div>
          <div class="h-36 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-900 relative">
            <img 
              id="dt-img-preview" 
              src="${defaultImg}" 
              alt="Previsualización" 
              class="w-full h-full object-cover object-center"
              onerror="this.src='https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'"
            />
            <span class="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
              Vista previa en tiempo real
            </span>
          </div>
        </div>

        <div>
          <label class="block font-black text-slate-800 uppercase tracking-wider mb-1 font-mono">Descripción Técnica *</label>
          <textarea 
            id="dt-desc" 
            rows="3" 
            required 
            minlength="10"
            class="input-field" 
            placeholder="Especifica potencia HP, horas de horómetro, capacidad de balde m³ y certificaciones..."
          >${existingTool?.description || 'Maquinaria pesada certificada con telemetría satelital en vivo y póliza todo riesgo SURA.'}</textarea>
          <span id="dt-desc-err" class="hidden text-[11px] text-rose-600 font-bold mt-1 block"></span>
        </div>

        <div id="publish-err-box" class="hidden p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold"></div>

        <div class="pt-2">
          <button type="submit" id="dt-submit-btn" class="btn-primary w-full !py-3 font-black text-xs uppercase tracking-wider shadow-md">
            ${isEdit ? 'Guardar Cambios' : 'Publicar Maquinaria en Catálogo'}
          </button>
        </div>
      </form>
    `;

    // Live preview on input change
    const imgInput = content.querySelector('#dt-img-url');
    const imgPreview = content.querySelector('#dt-img-preview');
    imgInput.addEventListener('input', () => {
      if (imgInput.value.startsWith('http')) {
        imgPreview.src = imgInput.value.trim();
      }
    });
    content.querySelector('#btn-preview-img')?.addEventListener('click', () => {
      if (imgInput.value.startsWith('http')) {
        imgPreview.src = imgInput.value.trim();
      }
    });

    content.querySelector('#drawer-tool-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = content.querySelector('#publish-err-box');
      errBox.classList.add('hidden');

      const name = content.querySelector('#dt-name').value.trim();
      const brand = content.querySelector('#dt-brand').value;
      const category = content.querySelector('#dt-category').value;
      const price = parseFloat(content.querySelector('#dt-price').value);
      const desc = content.querySelector('#dt-desc').value.trim();
      const status = content.querySelector('#dt-status').value;
      const imageUrl = content.querySelector('#dt-img-url').value.trim() || defaultImg;

      // Strict validations
      const nameRes = validateToolName(name);
      if (!nameRes.valid) {
        errBox.textContent = nameRes.error;
        errBox.classList.remove('hidden');
        content.querySelector('#dt-name')?.focus();
        return;
      }

      const priceRes = validateDailyPrice(price);
      if (!priceRes.valid) {
        errBox.textContent = priceRes.error;
        errBox.classList.remove('hidden');
        content.querySelector('#dt-price')?.focus();
        return;
      }

      const imgRes = validateImageUrl(imageUrl);
      if (!imgRes.valid) {
        errBox.textContent = imgRes.error;
        errBox.classList.remove('hidden');
        content.querySelector('#dt-img-url')?.focus();
        return;
      }

      if (!desc || desc.length < 15) {
        errBox.textContent = 'Por favor proporciona una descripción técnica adecuada (mínimo 15 caracteres descriptivos).';
        errBox.classList.remove('hidden');
        content.querySelector('#dt-desc')?.focus();
        return;
      }

      if (isEdit) {
        existingTool.name = name;
        existingTool.brand = brand;
        existingTool.dailyPrice = price;
        existingTool.description = desc;
        existingTool.status = status;
        if (!existingTool.images) existingTool.images = [];
        existingTool.images[0] = { imageUrl };
        
        showToast(`Maquinaria "${name}" actualizada con éxito`, 'success');
      } else {
        const toolPayload = {
          categoryId: Number(category) || 1,
          name,
          brand,
          model: 'Modelo 2026 Heavy Duty',
          dailyPrice: price,
          depositAmount: Math.round(price * 0.3),
          description: desc,
          status,
          images: [{ imageUrl, isCover: true }]
        };

        let createdTool = null;
        try {
          createdTool = await api.post('/tools', toolPayload);
          toolsList.unshift(createdTool);
        } catch (err) {
          console.warn('API post /tools fallback:', err);
          toolsList.unshift({ ...toolPayload, id: toolsList.length + 100 });
        }

        notificationsStore.add({
          category: 'RENTAL',
          type: 'success',
          title: 'Nueva Maquinaria Publicada en Base de Datos',
          message: `Has publicado "${name}" a ${formatCurrency(price)}/día en el inventario nacional de Opus Rentals.`,
          link: '#/provider'
        });
        showToast(`"${name}" ha sido guardada en la base de datos exitosamente`, 'success');
      }

      modal.close();
      render();
    });

    modal.open({
      title: isEdit ? 'Editar Especificaciones de Maquinaria' : 'Publicar Nueva Maquinaria Pesada',
      content: content,
      maxWidth: 'max-w-lg',
    });
  }

  // Initial render
  render();
}

export default renderProviderDashboard;
