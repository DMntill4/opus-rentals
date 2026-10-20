import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate, getRentalStatusBadge, getToolStatusBadge } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openInvoiceViewer } from './rental-modal.js';
import modal from '../components/modal.js';
import notificationsStore from '../utils/notifications-store.js';

export async function renderAdminDashboard() {
  const container = document.getElementById('app-content');
  if (!container) return;

  // 1. Auth Guard for Admin
  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-10 max-w-lg mx-auto shadow-xl space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-[#FF7A00] border-2 border-[#FF7A00]/30 flex items-center justify-center mx-auto shadow-md">
            ${renderIcon('ShieldAlert', 'w-8 h-8')}
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">Área Restringida a Administradores</h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Esta sección requiere credenciales con rol de Administrador conectadas a la base de datos de Opus Rentals.</p>
          <div class="flex flex-col sm:flex-row gap-3 pt-3">
            <button id="btn-demo-admin-login" class="btn-primary flex-1 !py-3 text-xs flex items-center justify-center gap-2 shadow-md">
              ${renderIcon('ShieldCheck', 'w-4 h-4')} Conectar como Admin Oficial
            </button>
            <button id="btn-login-admin" class="btn-dark flex-1 !py-3 text-xs flex items-center justify-center gap-2">
              ${renderIcon('LogIn', 'w-4 h-4')} Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#btn-demo-admin-login')?.addEventListener('click', async () => {
      try {
        await auth.login('admin@opusrentals.com', 'password123');
        showToast('Sesión iniciada con éxito en la base de datos como Administrador', 'success');
        renderAdminDashboard();
      } catch (err) {
        showToast(err.message || 'Error al autenticar admin en base de datos', 'error');
      }
    });

    container.querySelector('#btn-login-admin')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  // Admin Section State: 'overview' | 'reports' | 'clients' | 'providers' | 'tools' | 'rentals' | 'users'
  let activeSection = 'overview';
  let userSearchQuery = '';
  let userRoleFilter = 'ALL';
  let providerSearchQuery = '';
  let clientSearchQuery = '';
  let rentalSearchQuery = '';
  let toolSearchQuery = '';
  let qualityProviderFilter = 'ALL';
  let dbDiagnosticResult = null;
  let isTestingDb = false;

  // Render loading skeleton
  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-8">
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 animate-pulse"></div>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          <div class="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          <div class="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          <div class="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
        <div class="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
      </div>
    </div>
  `;

  // Fetch all datasets from Spring Boot & MySQL in parallel
  let dashboardStats = null;
  let rawUsers = [];
  let rawRentals = [];
  let rawTools = [];
  let rawClients = [];
  let fleetStatus = null;
  let frequentClients = [];
  let topToolsReport = [];
  let providerQualityReport = [];

  async function loadAllData() {
    try {
      const [statsRes, usersRes, rentalsRes, toolsRes, clientsRes, fleetStatusRes, frequentClientsRes, topToolsRes, qualityRes] = await Promise.allSettled([
        api.get('/admin/reports/dashboard'),
        api.get('/admin/users'),
        api.get('/rentals'),
        api.get('/tools'),
        api.get('/clients'),
        api.get('/admin/reports/fleet-status'),
        api.get('/admin/reports/frequent-clients'),
        api.get('/admin/reports/top-tools'),
        api.get('/admin/reports/provider-quality')
      ]);

      dashboardStats = statsRes.status === 'fulfilled' ? statsRes.value : null;
      rawUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      rawRentals = rentalsRes.status === 'fulfilled' && Array.isArray(rentalsRes.value) ? rentalsRes.value : [];
      rawTools = toolsRes.status === 'fulfilled' && Array.isArray(toolsRes.value) ? toolsRes.value : [];
      rawClients = clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value) ? clientsRes.value : [];
      fleetStatus = fleetStatusRes.status === 'fulfilled' ? fleetStatusRes.value : null;
      frequentClients = frequentClientsRes.status === 'fulfilled' && Array.isArray(frequentClientsRes.value) ? frequentClientsRes.value : [];
      topToolsReport = topToolsRes.status === 'fulfilled' && Array.isArray(topToolsRes.value) ? topToolsRes.value : [];
      providerQualityReport = qualityRes.status === 'fulfilled' && Array.isArray(qualityRes.value) ? qualityRes.value : [];
    } catch (err) {
      console.warn('Error loading admin dashboard datasets', err);
    }
  }

  await loadAllData();

  function processUsers() {
    return rawUsers.map(u => {
      let displayName = u.email;
      let displayRole = 'Cliente';

      if (u.role === 'ROLE_ADMIN') {
        displayName = 'Administrador General Opus';
        displayRole = 'Administrador';
      } else if (u.role === 'ROLE_PROVIDER') {
        displayName = u.companyName || u.email;
        displayRole = 'Proveedor';
      } else if (u.role === 'ROLE_CLIENT') {
        const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        displayName = full || u.email;
        displayRole = 'Cliente';
      }

      return {
        id: u.userId,
        name: displayName,
        email: u.email,
        role: displayRole,
        rawRole: u.role,
        date: formatDate(u.createdAt),
        active: u.isActive !== false,
        phone: u.phone || (u.contacts && u.contacts[0]?.contactValue) || 'N/A'
      };
    });
  }

  function processProviders() {
    const providerUsers = rawUsers.filter(u => u.role === 'ROLE_PROVIDER');
    return providerUsers.map(p => {
      const fleet = rawTools.filter(t => t.providerId === p.providerId);
      const phoneContact = p.contacts?.find(c => c.contactType === 'PHONE')?.contactValue || 'Línea Directa';
      const emailContact = p.contacts?.find(c => c.contactType === 'EMAIL')?.contactValue || p.email;
      const coverage = p.coverageZones?.map(z => z.city).filter(Boolean).join(', ') || p.providerAddress || 'Colombia';

      return {
        id: p.providerId || p.userId,
        userId: p.userId,
        name: p.companyName || p.email,
        taxId: p.taxId || 'NIT En Trámite',
        phone: phoneContact,
        email: emailContact,
        city: coverage,
        fleetCount: fleet.length,
        rating: p.rating || 5.0,
        active: p.isActive !== false,
        verified: p.isActive !== false
      };
    });
  }

  function processRentals() {
    return rawRentals.map(r => ({
      id: r.id,
      client: r.clientFullName || `Cliente #${r.clientId}`,
      provider: r.providerCompanyName || `Proveedor #${r.providerId}`,
      tool: r.toolName || `Equipo #${r.toolId}`,
      toolBrand: r.toolBrand || '',
      total: r.totalAmount || r.subtotal || 0,
      status: r.status,
      date: formatDate(r.createdAt || r.startDate),
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.totalDays || 1,
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber || `INV-2026-OP${r.id}`
    }));
  }

  function render() {
    const usersList = processUsers();
    const providersList = processProviders();
    const rentalsList = processRentals();

    // Filter users
    const filteredUsers = usersList.filter(u => {
      const matchSearch = !userSearchQuery || 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchRole = userRoleFilter === 'ALL' || u.rawRole === userRoleFilter;
      return matchSearch && matchRole;
    });

    // Filter providers
    const filteredProviders = providersList.filter(p => {
      return !providerSearchQuery ||
        p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
        p.taxId.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(providerSearchQuery.toLowerCase());
    });

    // Filter rentals
    const filteredRentals = rentalsList.filter(r => {
      return !rentalSearchQuery ||
        String(r.id).includes(rentalSearchQuery) ||
        r.client.toLowerCase().includes(rentalSearchQuery.toLowerCase()) ||
        r.tool.toLowerCase().includes(rentalSearchQuery.toLowerCase()) ||
        r.provider.toLowerCase().includes(rentalSearchQuery.toLowerCase());
    });

    // Filter tools
    const filteredTools = rawTools.filter(t => {
      return !toolSearchQuery ||
        t.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
        (t.brand && t.brand.toLowerCase().includes(toolSearchQuery.toLowerCase())) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(toolSearchQuery.toLowerCase()));
    });

    // Filter clients
    const filteredClients = rawClients.filter(c => {
      const full = `${c.firstName || ''} ${c.lastName || ''} ${c.email || ''} ${c.documentNumber || ''} ${c.phone || ''}`.toLowerCase();
      return !clientSearchQuery || full.includes(clientSearchQuery.toLowerCase());
    });

    const filteredQualityList = providerQualityReport.filter(pq => {
      if (qualityProviderFilter === 'ALL') return true;
      return String(pq.providerId) === String(qualityProviderFilter);
    });

    const gmvTotal = dashboardStats?.totalRevenue ?? rentalsList.reduce((acc, r) => acc + (r.total || 0), 0);
    const totalProvidersCount = dashboardStats?.totalProviders ?? providersList.length;
    const totalToolsCount = dashboardStats?.totalTools ?? rawTools.length;
    const activeRentalsCount = dashboardStats?.activeRentals ?? rentalsList.filter(r => r.status === 'IN_PROGRESS' || r.status === 'APPROVED').length;

    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <!-- Top Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#FF7A00] text-xs font-mono font-black uppercase tracking-wider mb-2 shadow-xs">
                ${renderIcon('ShieldCheck', 'w-3.5 h-3.5')} Base de Datos MySQL Conectada (HikariCP / JPA)
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">Supervisión & Control B2B</h1>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Monitorea en tiempo real proveedores, flota nacional, contratos activos y usuarios registrados en la base de datos.
              </p>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <button id="btn-admin-refresh" class="btn-dark !py-2.5 !px-3.5 text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer">
                ${renderIcon('RefreshCw', 'w-3.5 h-3.5')} Refrescar Datos
              </button>
              <button id="btn-admin-diag" class="btn-primary !py-2.5 !px-3.5 text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer">
                ${renderIcon('Activity', 'w-3.5 h-3.5')} Comprobar Conexión BD
              </button>
              <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer" class="btn-dark !py-2.5 !px-3.5 text-xs font-black flex items-center gap-2 shadow-sm">
                ${renderIcon('ExternalLink', 'w-3.5 h-3.5')} Swagger API Docs
              </a>
            </div>
          </div>

          <!-- DB Diagnostic Banner (if run) -->
          ${dbDiagnosticResult ? `
            <div class="p-4 rounded-2xl border-2 ${dbDiagnosticResult.success ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200' : 'bg-rose-50 border-rose-300 text-rose-900'} text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full ${dbDiagnosticResult.success ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}"></span>
                <span class="font-bold">${dbDiagnosticResult.message}</span>
              </div>
              <div class="flex items-center gap-4 text-[11px]">
                <span>Latencia: <strong>${dbDiagnosticResult.latency} ms</strong></span>
                <span>Usuarios en BD: <strong>${rawUsers.length}</strong></span>
                <span>Máquinas: <strong>${rawTools.length}</strong></span>
                <span>Contratos: <strong>${rawRentals.length}</strong></span>
              </div>
            </div>
          ` : ''}

          <!-- 4 Top KPI Cards (Loaded Live from MySQL) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- GMV -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Volumen Alquileres (GMV)</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${renderIcon('DollarSign', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display text-[#FF7A00]">${formatCurrency(gmvTotal)}</div>
              <div class="text-[11px] text-emerald-600 font-bold mt-1">Facturación total consolidada en BD</div>
            </div>

            <!-- Proveedores -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Proveedores Aliados</span>
                <div class="w-8 h-8 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold">
                  ${renderIcon('Building2', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">${totalProvidersCount}</div>
              <div class="text-[11px] text-slate-500 font-mono">Empresas registradas en MySQL</div>
            </div>

            <!-- Maquinaria Total -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Flota Registrada</span>
                <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  ${renderIcon('Truck', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">${totalToolsCount}</div>
              <div class="text-[11px] text-slate-500 font-mono">Maquinaria pesada en catálogo</div>
            </div>

            <!-- Contratos Activos -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Contratos Activos</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${renderIcon('CheckCircle2', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">${activeRentalsCount}</div>
              <div class="text-[11px] text-slate-500 font-mono">Equipos en obra / aprobados</div>
            </div>
          </div>

          <!-- Section Navigation Bar -->
          <div class="border-b-2 border-slate-200 dark:border-slate-800">
            <nav class="flex flex-wrap gap-2 sm:gap-4" aria-label="Tabs">
              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'overview' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="overview">
                ${renderIcon('BarChart3', 'w-4 h-4')}
                <span>Supervisión</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'reports' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="reports">
                ${renderIcon('Activity', 'w-4 h-4')}
                <span>Reportes & Analítica</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'clients' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="clients">
                ${renderIcon('Users', 'w-4 h-4')}
                <span>Clientes</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'clients' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${rawClients.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'providers' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="providers">
                ${renderIcon('Building2', 'w-4 h-4')}
                <span>Proveedores</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'providers' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${providersList.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'tools' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="tools">
                ${renderIcon('Truck', 'w-4 h-4')}
                <span>Flota</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'tools' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${rawTools.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'rentals' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="rentals">
                ${renderIcon('FileText', 'w-4 h-4')}
                <span>Contratos</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'rentals' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${rentalsList.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'users' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="users">
                ${renderIcon('ShieldCheck', 'w-4 h-4')}
                <span>Usuarios</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'users' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${usersList.length}</span>
              </button>
            </nav>
          </div>

          <!-- ========================================================================= -->
          <!-- 1. OVERVIEW SECTION                                                       -->
          <!-- ========================================================================= -->
          ${activeSection === 'overview' ? `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Top Rented Machinery -->
              <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <h3 class="font-black text-slate-900 dark:text-white text-sm font-display">Maquinaria Más Arrendada en la Base de Datos</h3>
                  <span class="text-xs text-slate-400 font-mono">Métricas Live</span>
                </div>
                <div class="space-y-3 pt-2">
                  ${(dashboardStats?.topRentedTools && dashboardStats.topRentedTools.length > 0) ? dashboardStats.topRentedTools.slice(0, 4).map(t => `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div>
                        <div class="font-bold text-xs text-slate-900 dark:text-white">${t.toolName}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${t.totalRentals} contratos · ${t.categoryName || 'Construcción'}</div>
                      </div>
                      <span class="font-mono font-black text-xs text-[#FF7A00]">${formatCurrency(t.generatedRevenue)}</span>
                    </div>
                  `).join('') : `
                    ${rentalsList.slice(0, 3).map(r => `
                      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div>
                          <div class="font-bold text-xs text-slate-900 dark:text-white">${r.tool}</div>
                          <div class="text-[10px] text-slate-400 font-mono">Contrato #${r.id} · ${r.client}</div>
                        </div>
                        <span class="font-mono font-black text-xs text-[#FF7A00]">${formatCurrency(r.total)}</span>
                      </div>
                    `).join('')}
                  `}
                </div>
              </div>

              <!-- Admin Quick Commands & System State -->
              <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <h3 class="font-black text-slate-900 dark:text-white text-sm font-display">Comandos de Administración & Auditoría</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Consola Activa</span>
                </div>
                <div class="space-y-3 pt-2 text-xs">
                  <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      ${renderIcon('Download', 'w-4 h-4 text-[#FF7A00]')}
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">Exportar Auditoría del Sistema</div>
                        <div class="text-[11px] text-slate-500">Descarga archivo JSON con contratos, usuarios y flota para reportes DIAN.</div>
                      </div>
                    </div>
                    <button id="btn-export-audit" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer">
                      Exportar JSON
                    </button>
                  </div>

                  <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      ${renderIcon('Server', 'w-4 h-4 text-emerald-500')}
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">Pool de Conexiones HikariCP</div>
                        <div class="text-[11px] text-slate-500">MySQL 8.0 en puerto 3306 con transacciones ACID y JPA Hibernate.</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-[11px]">SALUDABLE</span>
                  </div>

                  <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      ${renderIcon('ShieldCheck', 'w-4 h-4 text-blue-500')}
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">Seguridad JWT Stateless</div>
                        <div class="text-[11px] text-slate-500">Protección con BCrypt y roles RBAC (ROLE_ADMIN, ROLE_PROVIDER, ROLE_CLIENT).</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-mono font-black text-[11px]">ACTIVO</span>
                  </div>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 2. GESTIÓN DE PROVEEDORES (LIVE MYSQL DATA)                                -->
          <!-- ========================================================================= -->
          ${activeSection === 'providers' ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Directorio Oficial de Proveedores de Maquinaria</h3>
                  <p class="text-xs text-slate-500">Datos obtenidos en vivo desde la tabla <code class="font-mono text-[#FF7A00]">providers</code> de MySQL.</p>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                  <button id="btn-admin-add-provider" class="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider flex-shrink-0">
                    ${renderIcon('PlusCircle', 'w-4 h-4')} Vincular Proveedor
                  </button>
                  <div class="w-full sm:w-64">
                    <input 
                      type="text" 
                      id="search-provider-input" 
                      placeholder="Buscar empresa, NIT o ciudad..." 
                      value="${providerSearchQuery}" 
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" 
                    />
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 dark:border-slate-700 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Empresa Proveedora</th>
                      <th class="py-3 px-4">NIT / RUT</th>
                      <th class="py-3 px-4">Contacto Directo</th>
                      <th class="py-3 px-4">Zonas de Cobertura</th>
                      <th class="py-3 px-4">Flota</th>
                      <th class="py-3 px-4">Estado Verificación</th>
                      <th class="py-3 px-4 text-right">Comando</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    ${filteredProviders.map(p => `
                      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="font-black text-slate-900 dark:text-white text-xs">${p.name}</div>
                          <div class="text-[10px] text-slate-400 font-mono">ID Proveedor: #${p.id} · UserID: #${p.userId}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          ${p.taxId}
                        </td>
                        <td class="py-3.5 px-4">
                          <div class="font-bold text-slate-800 dark:text-slate-200">${p.phone}</div>
                          <div class="text-[10px] text-slate-400 font-mono">${p.email}</div>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          ${p.city}
                        </td>
                        <td class="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                          ${p.fleetCount} unid.
                        </td>
                        <td class="py-3.5 px-4">
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${p.active ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}">
                            <span class="w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                            ${p.active ? 'Verificado & Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          <button class="btn-toggle-verify px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${p.active ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-xs'}" data-userid="${p.userId}" data-name="${p.name}" data-active="${p.active}">
                            ${p.active ? 'Suspender' : 'Aprobar & Activar'}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                    ${filteredProviders.length === 0 ? `
                      <tr>
                        <td colspan="7" class="py-8 text-center text-slate-400">No se encontraron proveedores que coincidan con la búsqueda.</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 3. TODA LA FLOTA GLOBAL (LIVE MYSQL DATA)                                  -->
          <!-- ========================================================================= -->
          ${activeSection === 'tools' ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Inventario Consolidado de Toda la Plataforma</h3>
                  <span class="text-xs text-slate-500 font-mono">${rawTools.length} máquinas activas en la base de datos</span>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                  <button id="btn-admin-add-tool" class="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider flex-shrink-0">
                    ${renderIcon('PlusCircle', 'w-4 h-4')} Incorporar Máquina
                  </button>
                  <div class="w-full sm:w-64">
                    <input 
                      type="text" 
                      id="search-tool-input" 
                      placeholder="Buscar equipo o marca..." 
                      value="${toolSearchQuery}" 
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" 
                    />
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 dark:border-slate-700 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Equipo</th>
                      <th class="py-3 px-4">Línea / Categoría</th>
                      <th class="py-3 px-4">Marca y Modelo</th>
                      <th class="py-3 px-4">Tarifa Diaria</th>
                      <th class="py-3 px-4">Estado</th>
                      <th class="py-3 px-4 text-right">Gestión de Flota</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    ${filteredTools.map(t => `
                      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="font-bold text-slate-900 dark:text-white">${t.name}</div>
                          <div class="text-[10px] text-slate-400 font-mono">ID #${t.id} · Prov: #${t.providerId}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">${t.categoryName || 'Construcción'}</td>
                        <td class="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">${t.brand || ''} ${t.model || ''}</td>
                        <td class="py-3.5 px-4 font-black font-mono text-slate-900 dark:text-white">${formatCurrency(t.dailyPrice)}</td>
                        <td class="py-3.5 px-4">${getToolStatusBadge(t.status)}</td>
                        <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button class="btn-admin-manage-tool px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#FF7A00] font-black text-xs text-slate-700 dark:text-slate-200 cursor-pointer inline-flex items-center gap-1" data-id="${t.id}">
                            ${renderIcon('Sliders', 'w-3 h-3 text-[#FF7A00]')} Gestionar
                          </button>
                          <a href="#/product/${t.id}" class="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 font-bold text-xs inline-flex items-center gap-1">
                            ${renderIcon('ExternalLink', 'w-3 h-3')}
                          </a>
                        </td>
                      </tr>
                    `).join('')}
                    ${filteredTools.length === 0 ? `
                      <tr>
                        <td colspan="6" class="py-8 text-center text-slate-400">No se encontraron máquinas con ese filtro.</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 4. CONTRATOS GLOBALES (LIVE MYSQL DATA)                                    -->
          <!-- ========================================================================= -->
          ${activeSection === 'rentals' ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Contratos de Alquiler y Facturación DIAN</h3>
                  <span class="text-xs text-slate-500 font-mono">${rentalsList.length} contratos auditados en MySQL</span>
                </div>
                <div class="w-full sm:w-72">
                  <input 
                    type="text" 
                    id="search-rental-input" 
                    placeholder="Buscar contrato, cliente o equipo..." 
                    value="${rentalSearchQuery}" 
                    class="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" 
                  />
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 dark:border-slate-700 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Contrato #</th>
                      <th class="py-3 px-4">Cliente / Constructora</th>
                      <th class="py-3 px-4">Proveedor</th>
                      <th class="py-3 px-4">Equipo</th>
                      <th class="py-3 px-4">Monto Total</th>
                      <th class="py-3 px-4">Estado</th>
                      <th class="py-3 px-4 text-right">Factura Oficial</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    ${filteredRentals.map(r => `
                      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">#${r.id}</td>
                        <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">${r.client}</td>
                        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">${r.provider}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">${r.tool}</td>
                        <td class="py-3.5 px-4 font-black font-mono text-slate-900 dark:text-white">${formatCurrency(r.total)}</td>
                        <td class="py-3.5 px-4">${getRentalStatusBadge(r.status)}</td>
                        <td class="py-3.5 px-4 text-right">
                          <button class="btn-admin-invoice px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer" data-id="${r.id}">
                            ${renderIcon('FileText', 'w-3 h-3 text-[#FF7A00]')} Ver PDF
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                    ${filteredRentals.length === 0 ? `
                      <tr>
                        <td colspan="7" class="py-8 text-center text-slate-400">No se encontraron contratos con ese filtro.</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 5. USUARIOS DEL SISTEMA (LIVE MYSQL DATA & ACTIONS)                         -->
          <!-- ========================================================================= -->
          ${activeSection === 'users' ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Control de Usuarios y Permisos</h3>
                  <span class="text-xs text-slate-500 font-mono">${usersList.length} cuentas registradas en base de datos</span>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <select id="user-role-select" class="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
                    <option value="ALL" ${userRoleFilter === 'ALL' ? 'selected' : ''}>Todos los roles</option>
                    <option value="ROLE_ADMIN" ${userRoleFilter === 'ROLE_ADMIN' ? 'selected' : ''}>Administradores</option>
                    <option value="ROLE_PROVIDER" ${userRoleFilter === 'ROLE_PROVIDER' ? 'selected' : ''}>Proveedores</option>
                    <option value="ROLE_CLIENT" ${userRoleFilter === 'ROLE_CLIENT' ? 'selected' : ''}>Clientes</option>
                  </select>
                  <input 
                    type="text" 
                    id="search-user-input" 
                    placeholder="Buscar nombre o correo..." 
                    value="${userSearchQuery}" 
                    class="w-full sm:w-60 text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" 
                  />
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 dark:border-slate-700 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Usuario</th>
                      <th class="py-3 px-4">Correo</th>
                      <th class="py-3 px-4">Rol en Sistema</th>
                      <th class="py-3 px-4">Fecha Creación</th>
                      <th class="py-3 px-4">Estado</th>
                      <th class="py-3 px-4 text-right">Comando</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    ${filteredUsers.map(u => `
                      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div>${u.name}</div>
                          <div class="text-[10px] text-slate-400 font-mono">ID #${u.id}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">${u.email}</td>
                        <td class="py-3.5 px-4">
                          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${u.role === 'Administrador' ? 'bg-orange-100 text-[#FF7A00]' : (u.role === 'Proveedor' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800')}">
                            ${u.role}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 font-mono text-slate-500">${u.date}</td>
                        <td class="py-3.5 px-4">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                            ${u.active ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          ${(u.rawRole === 'ROLE_ADMIN' || u.email === auth.getUser()?.email || String(u.id) === String(auth.getUser()?.id || auth.getUser()?.userId)) ? `
                            <span class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed">
                              Sesión Actual (Protegido)
                            </span>
                          ` : `
                            <button class="btn-toggle-user px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer ${u.active ? 'text-rose-600 hover:border-rose-400' : 'text-emerald-600 hover:border-emerald-400'}" data-id="${u.id}" data-name="${u.name}" data-active="${u.active}">
                              ${u.active ? 'Suspender' : 'Reactivar'}
                            </button>
                          `}
                        </td>
                      </tr>
                    `).join('')}
                    ${filteredUsers.length === 0 ? `
                      <tr>
                        <td colspan="6" class="py-8 text-center text-slate-400">No se encontraron usuarios que coincidan con la búsqueda.</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 6. REPORTES & ANALÍTICA DE FLOTA (LIVE SPRING BOOT API)                    -->
          <!-- ========================================================================= -->
          ${activeSection === 'reports' ? `
            <div class="space-y-6">
              
              <!-- Fleet Availability KPIs -->
              <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Disponibilidad y Estado de la Flota (4FN)</h3>
                    <p class="text-xs text-slate-500">Métricas analíticas consolidadas desde <code class="font-mono text-[#FF7A00]">/api/v1/admin/reports/fleet-status</code>.</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-100 text-[#FF7A00]">
                      Tasa de Ocupación: ${fleetStatus?.utilizationRatePercentage ?? 0}%
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div class="text-[11px] font-bold text-slate-400 uppercase font-mono">Total Maquinaria</div>
                    <div class="text-2xl font-black text-slate-900 dark:text-white mt-1 font-display">${fleetStatus?.totalTools ?? rawTools.length}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">Parque total registrado</div>
                  </div>
                  <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono">Disponibles</div>
                    <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">${fleetStatus?.availableCount ?? 0}</div>
                    <div class="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Listas para despacho</div>
                  </div>
                  <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <div class="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase font-mono">En Obra / Alquiladas</div>
                    <div class="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-display">${fleetStatus?.rentedCount ?? 0}</div>
                    <div class="text-[10px] text-blue-600 dark:text-blue-500 mt-0.5">Operación en curso</div>
                  </div>
                  <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div class="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase font-mono">Mantenimiento</div>
                    <div class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-display">${fleetStatus?.maintenanceCount ?? 0}</div>
                    <div class="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">Revisión técnica</div>
                  </div>
                  <div class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                    <div class="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase font-mono">Retiradas / Bajas</div>
                    <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-display">${fleetStatus?.retiredCount ?? 0}</div>
                    <div class="text-[10px] text-rose-600 dark:text-rose-500 mt-0.5">Fuera de catálogo</div>
                  </div>
                </div>

                <div class="space-y-1.5 pt-1">
                  <div class="flex justify-between text-xs font-bold font-mono">
                    <span class="text-slate-600 dark:text-slate-400">Nivel de Utilización Operativa de la Flota</span>
                    <span class="text-[#FF7A00] font-black">${fleetStatus?.utilizationRatePercentage ?? 0}%</span>
                  </div>
                  <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-500 via-[#FF7A00] to-blue-600 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.max(5, fleetStatus?.utilizationRatePercentage || 0))}%"></div>
                  </div>
                </div>

                <div class="pt-2">
                  <h4 class="text-xs font-black uppercase tracking-wider text-slate-500 font-mono mb-2">Desglose por Categoría de Maquinaria</h4>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700 font-mono font-bold">
                        <tr>
                          <th class="py-2.5 px-3">Línea / Categoría</th>
                          <th class="py-2.5 px-3">Total Equipos</th>
                          <th class="py-2.5 px-3 text-emerald-600">Disponibles</th>
                          <th class="py-2.5 px-3 text-blue-600">Alquiladas</th>
                          <th class="py-2.5 px-3 text-amber-600">Mantenimiento</th>
                          <th class="py-2.5 px-3 text-rose-600">Retiradas</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        ${(fleetStatus?.categoryBreakdown || []).map(cat => `
                          <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${cat.categoryName}</td>
                            <td class="py-2.5 px-3 font-mono font-bold">${cat.totalTools}</td>
                            <td class="py-2.5 px-3 font-mono text-emerald-600 font-bold">${cat.availableTools}</td>
                            <td class="py-2.5 px-3 font-mono text-blue-600 font-bold">${cat.rentedTools}</td>
                            <td class="py-2.5 px-3 font-mono text-amber-600 font-bold">${cat.maintenanceTools}</td>
                            <td class="py-2.5 px-3 font-mono text-rose-600 font-bold">${cat.retiredTools}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Two columns: Frequent Clients & Top Rented Tools -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Frequent Clients Ranking -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 class="text-sm font-black text-slate-900 dark:text-white font-display">Ranking de Clientes Frecuentes</h3>
                      <p class="text-[11px] text-slate-500">Ordenados por número de contratos y volumen en BD.</p>
                    </div>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-[#FF7A00]">Top Clientes</span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-mono font-bold">
                        <tr>
                          <th class="py-2 px-3">Cliente</th>
                          <th class="py-2 px-3">Documento</th>
                          <th class="py-2 px-3 text-center">Alquileres</th>
                          <th class="py-2 px-3 text-right">Facturado</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-xs">
                        ${(frequentClients || []).slice(0, 10).map((fc, idx) => `
                          <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td class="py-2.5 px-3">
                              <div class="font-bold text-slate-900 dark:text-white">${idx + 1}. ${fc.fullName}</div>
                              <div class="text-[10px] text-slate-400 font-mono">${fc.email}</div>
                            </td>
                            <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">${fc.documentNumber || 'N/A'}</td>
                            <td class="py-2.5 px-3 font-mono font-bold text-center">
                              <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px]">
                                ${fc.totalRentals}
                              </span>
                            </td>
                            <td class="py-2.5 px-3 font-mono font-black text-right text-[#FF7A00]">
                              ${formatCurrency(fc.totalSpent)}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Top Rented Tools -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 class="text-sm font-black text-slate-900 dark:text-white font-display">Herramientas Más Alquiladas</h3>
                      <p class="text-[11px] text-slate-500">Maquinaria con mayor rotación e ingresos generados.</p>
                    </div>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Top Demanda</span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-mono font-bold">
                        <tr>
                          <th class="py-2 px-3">Equipo</th>
                          <th class="py-2 px-3">Proveedor</th>
                          <th class="py-2 px-3 text-center">Contratos</th>
                          <th class="py-2 px-3 text-right">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-xs">
                        ${(topToolsReport || []).slice(0, 10).map((tt, idx) => `
                          <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td class="py-2.5 px-3">
                              <div class="font-bold text-slate-900 dark:text-white">${idx + 1}. ${tt.toolName}</div>
                              <div class="text-[10px] text-slate-400 font-mono">${tt.categoryName || 'Construcción'}</div>
                            </td>
                            <td class="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">${tt.providerCompanyName}</td>
                            <td class="py-2.5 px-3 font-mono font-bold text-center">
                              <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px]">
                                ${tt.totalRentals}
                              </span>
                            </td>
                            <td class="py-2.5 px-3 font-mono font-black text-right text-emerald-600 dark:text-emerald-400">
                              ${formatCurrency(tt.generatedRevenue)}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Provider Quality, Return Rates, Damages and Refunds Audit -->
              <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Auditoría de Calidad, Siniestralidad y Devoluciones por Proveedor</h3>
                    <p class="text-xs text-slate-500">Supervisión de tasas de retorno (%), reportes de avería en obra, garantías y reembolsos autorizados.</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <select id="select-filter-quality-provider" class="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
                      <option value="ALL">Todos los proveedores</option>
                      ${providerQualityReport.map(pq => `
                        <option value="${pq.providerId}" ${String(qualityProviderFilter) === String(pq.providerId) ? 'selected' : ''}>${pq.providerName}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-mono font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th class="py-2.5 px-3">Empresa Proveedora</th>
                        <th class="py-2.5 px-3 text-center">Alquileres</th>
                        <th class="py-2.5 px-3 text-center">Devoluciones</th>
                        <th class="py-2.5 px-3">Tasa Retorno</th>
                        <th class="py-2.5 px-3 text-center">Garantías</th>
                        <th class="py-2.5 px-3 text-center">Averías Obra</th>
                        <th class="py-2.5 px-3 text-center">Reembolsos</th>
                        <th class="py-2.5 px-3 text-right">Total Reembolsado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-xs">
                      ${filteredQualityList.map(pq => {
                        const returnRate = pq.returnRatePercentage ?? 0;
                        const warranties = pq.warrantyClaimsCount ?? pq.warrantyClaims ?? 0;
                        const damages = pq.damageReportsCount ?? pq.damageReports ?? 0;
                        const refunds = pq.refundRequestsCount ?? pq.refundRequests ?? 0;
                        const refundAmount = pq.totalRefundAmount ?? 0;

                        return `
                          <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td class="py-3 px-3">
                              <div class="font-bold text-slate-900 dark:text-white">${pq.providerName}</div>
                              <div class="text-[10px] text-slate-400 font-mono">ID #${pq.providerId} · ${pq.city || 'Colombia'}</div>
                            </td>
                            <td class="py-3 px-3 text-center font-mono font-bold">${pq.totalRentals}</td>
                            <td class="py-3 px-3 text-center font-mono font-bold text-emerald-600">${pq.returnedRentals}</td>
                            <td class="py-3 px-3">
                              <div class="flex items-center gap-2">
                                <span class="font-mono font-bold text-[11px] ${returnRate >= 85 ? 'text-emerald-600' : (returnRate >= 70 ? 'text-amber-600' : 'text-rose-600')}">
                                  ${returnRate}%
                                </span>
                                <div class="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <div class="h-full ${returnRate >= 85 ? 'bg-emerald-500' : (returnRate >= 70 ? 'bg-amber-500' : 'bg-rose-500')}" style="width: ${Math.min(100, returnRate)}%"></div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 px-3 text-center">
                              <span class="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${warranties > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                                ${warranties}
                              </span>
                            </td>
                            <td class="py-3 px-3 text-center">
                              <span class="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${damages > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                                ${damages}
                              </span>
                            </td>
                            <td class="py-3 px-3 text-center">
                              <span class="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${refunds > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
                                ${refunds}
                              </span>
                            </td>
                            <td class="py-3 px-3 text-right font-mono font-black ${refundAmount > 0 ? 'text-rose-600' : 'text-slate-500'}">
                              ${formatCurrency(refundAmount)}
                            </td>
                          </tr>
                        `;
                      }).join('')}
                      ${filteredQualityList.length === 0 ? `
                        <tr>
                          <td colspan="8" class="py-6 text-center text-slate-400">No hay datos de siniestralidad o calidad disponibles para este filtro.</td>
                        </tr>
                      ` : ''}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 7. GESTIÓN DE CLIENTES (LIVE MYSQL DATA)                                   -->
          <!-- ========================================================================= -->
          ${activeSection === 'clients' ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white font-display">Directorio Oficial de Clientes & Constructoras</h3>
                  <p class="text-xs text-slate-500">Datos obtenidos en vivo desde la tabla <code class="font-mono text-[#FF7A00]">clients</code> de MySQL.</p>
                </div>
                <div class="w-full sm:w-72">
                  <input 
                    type="text" 
                    id="search-client-input" 
                    placeholder="Buscar nombre, cédula o teléfono..." 
                    value="${clientSearchQuery}" 
                    class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" 
                  />
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 dark:border-slate-700 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Cliente / Contratista</th>
                      <th class="py-3 px-4">Documento</th>
                      <th class="py-3 px-4">Teléfono & Correo</th>
                      <th class="py-3 px-4">Dirección</th>
                      <th class="py-3 px-4">Estado</th>
                      <th class="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    ${filteredClients.map(c => `
                      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="font-black text-slate-900 dark:text-white text-xs">${c.firstName} ${c.lastName}</div>
                          <div class="text-[10px] text-slate-400 font-mono">ID Cliente: #${c.id} · UserID: #${c.userId}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          ${c.documentType} ${c.documentNumber}
                        </td>
                        <td class="py-3.5 px-4">
                          <div class="font-bold text-slate-800 dark:text-slate-200">${c.phone}</div>
                          <div class="text-[10px] text-slate-400 font-mono">${c.email}</div>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          ${c.address || 'No registrada'}
                        </td>
                        <td class="py-3.5 px-4">
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${c.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}">
                            <span class="w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                            ${c.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button class="btn-admin-edit-client px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#FF7A00] font-bold text-xs text-slate-700 dark:text-slate-200 cursor-pointer inline-flex items-center gap-1" data-id="${c.id}">
                            ${renderIcon('Sliders', 'w-3 h-3 text-[#FF7A00]')} Editar
                          </button>
                          ${c.isActive ? `
                            <button class="btn-admin-toggle-client-status px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-bold text-xs cursor-pointer inline-flex items-center gap-1" data-id="${c.id}" data-user-id="${c.userId}" data-action="deactivate" data-name="${c.firstName} ${c.lastName}">
                              ${renderIcon('Trash2', 'w-3 h-3')} Desactivar
                            </button>
                          ` : `
                            <button class="btn-admin-toggle-client-status px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs cursor-pointer inline-flex items-center gap-1" data-id="${c.id}" data-user-id="${c.userId}" data-action="reactivate" data-name="${c.firstName} ${c.lastName}">
                              ${renderIcon('CheckCircle', 'w-3 h-3 text-emerald-600')} Reactivar
                            </button>
                          `}
                        </td>
                      </tr>
                    `).join('')}
                    ${filteredClients.length === 0 ? `
                      <tr>
                        <td colspan="6" class="py-8 text-center text-slate-400">No se encontraron clientes registrados con ese criterio.</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    attachAdminEvents();
  }

  function attachAdminEvents() {
    // Navigation section buttons
    container.querySelectorAll('.admin-sec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = btn.dataset.sec;
        render();
      });
    });

    // Refresh data button
    container.querySelector('#btn-admin-refresh')?.addEventListener('click', async () => {
      showToast('Actualizando datos desde la base de datos...', 'info');
      await loadAllData();
      render();
      showToast('Datos actualizados correctamente desde MySQL', 'success');
    });

    // Live DB diagnostic test button
    container.querySelector('#btn-admin-diag')?.addEventListener('click', async () => {
      const t0 = performance.now();
      try {
        await api.get('/admin/reports/dashboard');
        const latency = Math.round(performance.now() - t0);
        dbDiagnosticResult = {
          success: true,
          message: 'Conexión con MySQL activa y verificada al 100%',
          latency: latency
        };
        showToast(`BD Conectada (Ping: ${latency}ms)`, 'success');
      } catch (err) {
        dbDiagnosticResult = {
          success: false,
          message: `Error de conexión: ${err.message}`,
          latency: 0
        };
        showToast('Error de conexión con la base de datos', 'error');
      }
      render();
    });

    // Search inputs
    container.querySelector('#search-provider-input')?.addEventListener('input', (e) => {
      providerSearchQuery = e.target.value;
      render();
    });

    container.querySelector('#search-user-input')?.addEventListener('input', (e) => {
      userSearchQuery = e.target.value;
      render();
    });

    container.querySelector('#user-role-select')?.addEventListener('change', (e) => {
      userRoleFilter = e.target.value;
      render();
    });

    container.querySelector('#search-rental-input')?.addEventListener('input', (e) => {
      rentalSearchQuery = e.target.value;
      render();
    });

    container.querySelector('#search-tool-input')?.addEventListener('input', (e) => {
      toolSearchQuery = e.target.value;
      render();
    });

    container.querySelector('#select-filter-quality-provider')?.addEventListener('change', (e) => {
      qualityProviderFilter = e.target.value;
      render();
    });

    // Client search and actions
    container.querySelector('#search-client-input')?.addEventListener('input', (e) => {
      clientSearchQuery = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-admin-edit-client').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const c = rawClients.find(item => String(item.id) === String(id));
        if (c) openAdminEditClientModal(c);
      });
    });

    container.querySelectorAll('.btn-admin-toggle-client-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const userId = btn.dataset.userId;
        const action = btn.dataset.action;
        const name = btn.dataset.name;

        if (action === 'reactivate') {
          try {
            btn.disabled = true;
            btn.textContent = 'Reactivando...';
            if (userId) {
              await api.patch(`/admin/users/${userId}/status`, { isActive: true });
            }
            const foundClient = rawClients.find(c => String(c.id) === String(id));
            if (foundClient) foundClient.isActive = true;
            const foundUser = rawUsers.find(u => String(u.userId) === String(userId));
            if (foundUser) {
              foundUser.isActive = true;
              foundUser.active = true;
            }
            showToast(`Cliente "${name}" reactivado exitosamente`, 'success');
            render();
          } catch (err) {
            showToast(`Error al reactivar cliente: ${err.message}`, 'error');
            render();
          }
        } else {
          const confirmed = await modal.confirmDialog({
            title: `¿Desactivar Cliente?`,
            message: `Esta acción suspenderá el acceso del cliente "${name}". Sus contratos y facturas históricas se mantendrán intactos.`,
            confirmText: 'Sí, desactivar',
            isDestructive: true
          });

          if (!confirmed) return;

          try {
            btn.disabled = true;
            btn.textContent = 'Desactivando...';
            if (userId) {
              await api.patch(`/admin/users/${userId}/status`, { isActive: false });
            } else {
              await api.delete(`/clients/${id}`);
            }
            const foundClient = rawClients.find(c => String(c.id) === String(id));
            if (foundClient) foundClient.isActive = false;
            const foundUser = rawUsers.find(u => String(u.userId) === String(userId));
            if (foundUser) {
              foundUser.isActive = false;
              foundUser.active = false;
            }
            showToast(`Cliente "${name}" desactivado en el sistema`, 'info');
            render();
          } catch (err) {
            showToast(`Error al desactivar cliente: ${err.message}`, 'error');
            render();
          }
        }
      });
    });

    // Toggle user status (PERSIST IN MYSQL via PATCH /api/v1/admin/users/{id}/status)
    container.querySelectorAll('.btn-toggle-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.id;
        const currentActive = btn.dataset.active === 'true';
        const newActive = !currentActive;
        const name = btn.dataset.name;

        const currentAdminId = auth.getUser()?.id || auth.getUser()?.userId;
        const currentAdminEmail = auth.getUser()?.email;
        const targetUser = rawUsers.find(u => String(u.userId) === String(userId));
        if (targetUser && (targetUser.role === 'ROLE_ADMIN' || targetUser.email === currentAdminEmail || String(userId) === String(currentAdminId))) {
          showToast('No está permitido suspender o desactivar tu propia cuenta de Administrador.', 'warning');
          return;
        }

        try {
          btn.disabled = true;
          btn.textContent = 'Actualizando...';
          await api.patch(`/admin/users/${userId}/status`, { isActive: newActive });
          
          // Update in-memory dataset
          const found = rawUsers.find(u => String(u.userId) === String(userId));
          if (found) {
            found.isActive = newActive;
          }

          showToast(`Usuario "${name}" ${newActive ? 'activado' : 'suspendido'} exitosamente en MySQL`, 'success');
          render();
        } catch (err) {
          showToast(`Error al actualizar estado en BD: ${err.message}`, 'error');
          render();
        }
      });
    });

    // Toggle provider status
    container.querySelectorAll('.btn-toggle-verify').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userid;
        const currentActive = btn.dataset.active === 'true';
        const newActive = !currentActive;
        const name = btn.dataset.name;

        try {
          btn.disabled = true;
          btn.textContent = 'Actualizando...';
          await api.patch(`/admin/users/${userId}/status`, { isActive: newActive });
          
          const found = rawUsers.find(u => String(u.userId) === String(userId));
          if (found) {
            found.isActive = newActive;
          }

          showToast(`Proveedor "${name}" ${newActive ? 'verificado y activado' : 'suspendido'} en MySQL`, 'success');

          // Send formal notice to provider
          notificationsStore.add({
            category: 'SYSTEM',
            type: newActive ? 'success' : 'warning',
            title: 'Notificación de Administración Central',
            message: `Tu cuenta de proveedor ha sido ${newActive ? 'reactivada y verificada' : 'suspendida temporalmente por auditoría técnica de administración'}.`,
            targetRole: 'ROLE_PROVIDER'
          });

          render();
        } catch (err) {
          showToast(`Error al actualizar proveedor en BD: ${err.message}`, 'error');
          render();
        }
      });
    });

    // 1. Admin Add Provider Modal
    container.querySelector('#btn-admin-add-provider')?.addEventListener('click', () => {
      openAdminAddProviderModal();
    });

    // 2. Admin Add Tool Modal
    container.querySelector('#btn-admin-add-tool')?.addEventListener('click', () => {
      openAdminAddToolModal();
    });

    // 3. Admin Manage Tool Modal
    container.querySelectorAll('.btn-admin-manage-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        const toolId = btn.dataset.id;
        const tool = rawTools.find(t => String(t.id) === String(toolId));
        if (tool) {
          openAdminManageToolModal(tool);
        }
      });
    });

    // Export audit JSON
    container.querySelector('#btn-export-audit')?.addEventListener('click', () => {
      const auditPayload = {
        generatedAt: new Date().toISOString(),
        environment: 'Production / Docker MySQL 8.0',
        platform: 'Opus Rentals B2B',
        summary: {
          totalUsers: rawUsers.length,
          totalTools: rawTools.length,
          totalRentals: rawRentals.length,
          gmv: dashboardStats?.totalRevenue || 0
        },
        rentals: rawRentals,
        users: rawUsers.map(u => ({ id: u.userId, email: u.email, role: u.role, isActive: u.isActive }))
      };

      const blob = new Blob([JSON.stringify(auditPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opus-rentals-auditoria-dian-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Auditoría del sistema descargada correctamente', 'success');
    });

    // Invoice viewer for rentals
    container.querySelectorAll('.btn-admin-invoice').forEach(btn => {
      btn.addEventListener('click', () => {
        const rentalId = btn.dataset.id;
        const r = rawRentals.find(item => String(item.id) === String(rentalId)) || rawRentals[0];
        if (!r) return;

        openInvoiceViewer({
          invoiceNumber: r.invoiceNumber || `INV-2026-OP${r.id}`,
          issueDate: formatDate(r.createdAt || r.startDate),
          client: {
            name: r.clientFullName || `Cliente #${r.clientId}`,
            taxId: 'NIT 900.342.112-4',
            address: 'Frente de Obra Central Bogotá',
            email: 'compras@constructora.com',
            phone: r.clientPhone || '+57 310 234 5678'
          },
          provider: {
            name: r.providerCompanyName || `Proveedor #${r.providerId}`,
            taxId: 'NIT 901.884.219-5',
            address: 'Patio Principal de Despachos',
            email: 'despachos@caterpillar.com',
            phone: '+57 (1) 745-8900'
          },
          tool: {
            name: r.toolName || 'Maquinaria Pesada',
            sku: `OP-FLEET-${r.toolId || r.id}`
          },
          rentalPeriod: {
            startDate: r.startDate,
            endDate: r.endDate,
            days: r.totalDays || 1
          },
          dailyRate: r.dailyRate || Math.round(r.subtotal / (r.totalDays || 1)),
          subtotal: r.subtotal || r.totalAmount,
          tax: Math.round((r.totalAmount || r.subtotal) * 0.19),
          total: r.totalAmount || r.subtotal,
          paymentMethod: 'Transferencia PSE Bancolombia',
          bank: 'Bancolombia',
          reference: `REF-${r.id}`,
          paymentDate: formatDate(r.createdAt || r.startDate)
        });
      });
    });
  }

  function openAdminEditClientModal(client) {
    const modalContent = document.createElement('div');
    modalContent.className = 'space-y-4';
    modalContent.innerHTML = `
      <form id="form-admin-edit-client" class="space-y-4">
        <p class="text-xs text-slate-500">
          Modifica los datos del cliente corporativo o persona natural. Los cambios se persisten directamente en MySQL.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombres *</label>
            <input type="text" id="adm-cli-first" required value="${client.firstName || ''}" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Apellidos *</label>
            <input type="text" id="adm-cli-last" required value="${client.lastName || ''}" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Documento</label>
            <select id="adm-cli-doctype" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
              <option value="CC" ${client.documentType === 'CC' ? 'selected' : ''}>Cédula de Ciudadanía (CC)</option>
              <option value="NIT" ${client.documentType === 'NIT' ? 'selected' : ''}>NIT Empresarial</option>
              <option value="CE" ${client.documentType === 'CE' ? 'selected' : ''}>Cédula de Extranjería (CE)</option>
              <option value="PASSPORT" ${client.documentType === 'PASSPORT' ? 'selected' : ''}>Pasaporte</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Número de Documento *</label>
            <input type="text" id="adm-cli-docnum" required value="${client.documentNumber || ''}" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono Móvil *</label>
            <input type="text" id="adm-cli-phone" required value="${client.phone || ''}" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección de Entrega</label>
            <input type="text" id="adm-cli-addr" value="${client.address || ''}" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="adm-cli-cancel" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" id="adm-cli-submit" class="px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-md cursor-pointer flex items-center gap-1.5">
            ${renderIcon('CheckCircle2', 'w-4 h-4')} Guardar Cambios
          </button>
        </div>
      </form>
    `;

    modal.open({
      title: `Editar Perfil de Cliente: ${client.firstName} ${client.lastName}`,
      content: modalContent,
      maxWidth: 'max-w-lg'
    });

    modalContent.querySelector('#adm-cli-cancel').addEventListener('click', () => modal.close());

    modalContent.querySelector('#form-admin-edit-client').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalContent.querySelector('#adm-cli-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';

      try {
        const payload = {
          firstName: modalContent.querySelector('#adm-cli-first').value.trim(),
          lastName: modalContent.querySelector('#adm-cli-last').value.trim(),
          documentType: modalContent.querySelector('#adm-cli-doctype').value,
          documentNumber: modalContent.querySelector('#adm-cli-docnum').value.trim(),
          phone: modalContent.querySelector('#adm-cli-phone').value.trim(),
          address: modalContent.querySelector('#adm-cli-addr').value.trim()
        };

        await api.put(`/clients/${client.id}`, payload);
        showToast('Cliente actualizado exitosamente en base de datos', 'success');
        modal.close();
        await loadAllData();
        render();
      } catch (err) {
        showToast(`Error al actualizar cliente: ${err.message}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';
      }
    });
  }

  function openAdminAddProviderModal() {
    const modalContent = document.createElement('div');
    modalContent.className = 'space-y-4';
    modalContent.innerHTML = `
      <form id="form-admin-add-provider" class="space-y-4">
        <p class="text-xs text-slate-500">
          Registra formalmente una empresa proveedora de maquinaria pesada. Se creará su usuario autenticado y su perfil en MySQL.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Razón Social / Empresa *</label>
            <input type="text" id="adm-prov-name" required placeholder="Ej: Komatsu Colombia S.A.S." class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NIT / RUT *</label>
            <input type="text" id="adm-prov-taxid" required placeholder="Ej: 901.455.789-2" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Correo Corporativo *</label>
            <input type="email" id="adm-prov-email" required placeholder="operaciones@komatsu.com" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contraseña de Acceso *</label>
            <input type="password" id="adm-prov-pass" required value="password123" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono Despachos *</label>
            <input type="text" id="adm-prov-phone" required placeholder="Ej: +57 311 456 7890" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ciudad Sede *</label>
            <input type="text" id="adm-prov-city" required placeholder="Ej: Bogotá D.C." class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección de Patios *</label>
          <input type="text" id="adm-prov-address" required placeholder="Ej: Zona Industrial Acopi Calle 15 # 40-20" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="adm-prov-cancel" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" id="adm-prov-submit" class="px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-md cursor-pointer flex items-center gap-1.5">
            ${renderIcon('Building2', 'w-4 h-4')} Registrar Proveedor
          </button>
        </div>
      </form>
    `;

    modal.open({
      title: 'Vincular Nueva Empresa Proveedora',
      content: modalContent,
      maxWidth: 'max-w-lg'
    });

    modalContent.querySelector('#adm-prov-cancel').addEventListener('click', () => modal.close());

    modalContent.querySelector('#form-admin-add-provider').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalContent.querySelector('#adm-prov-submit');
      const companyName = modalContent.querySelector('#adm-prov-name').value.trim();
      const taxId = modalContent.querySelector('#adm-prov-taxid').value.trim();
      const email = modalContent.querySelector('#adm-prov-email').value.trim();
      const password = modalContent.querySelector('#adm-prov-pass').value;
      const phone = modalContent.querySelector('#adm-prov-phone').value.trim();
      const city = modalContent.querySelector('#adm-prov-city').value.trim();
      const address = modalContent.querySelector('#adm-prov-address').value.trim();

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando en MySQL...';

        await api.post('/auth/register/provider', {
          companyName,
          taxId,
          email,
          password,
          phone,
          city,
          address
        });

        // Notifications
        notificationsStore.add({
          category: 'SYSTEM',
          type: 'success',
          title: 'Nuevo Proveedor Vinculado',
          message: `El proveedor "${companyName}" ha sido registrado en MySQL con NIT ${taxId}.`,
          targetRole: 'ROLE_ADMIN'
        });

        notificationsStore.add({
          category: 'SYSTEM',
          type: 'info',
          title: 'Bienvenido a la Red Opus Rentals',
          message: `Tu cuenta corporativa para "${companyName}" ha sido vinculada por administración central.`,
          targetRole: 'ROLE_PROVIDER'
        });

        showToast(`Proveedor "${companyName}" registrado exitosamente en MySQL`, 'success');
        modal.close();
        await loadAllData();
        render();
      } catch (err) {
        showToast(err.message || 'Error al registrar el proveedor', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${renderIcon('Building2', 'w-4 h-4')} Registrar Proveedor`;
      }
    });
  }

  function openAdminAddToolModal() {
    const providersList = processProviders();
    const modalContent = document.createElement('div');
    modalContent.className = 'space-y-4';

    modalContent.innerHTML = `
      <form id="form-admin-add-tool" class="space-y-4">
        <p class="text-xs text-slate-500">
          Incorpora una nueva máquina o equipo pesado al inventario nacional y asígnala al proveedor correspondiente.
        </p>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Empresa Proveedora Asignada *</label>
          <select id="adm-tool-provider" required class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
            ${providersList.map(p => `
              <option value="${p.id}">${p.name} (NIT: ${p.taxId}) - ${p.city}</option>
            `).join('')}
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Equipo *</label>
            <input type="text" id="adm-tool-name" required placeholder="Ej: Excavadora Oruga CAT 320 GC" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría / Línea *</label>
            <select id="adm-tool-category" required class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
              <option value="1">Excavación y Movimiento de Tierra</option>
              <option value="2">Compactación y Pavimentación</option>
              <option value="3">Carga y Transporte</option>
              <option value="4">Elevación y Grúas</option>
              <option value="5">Generación y Energía</option>
              <option value="6">Concreto y Mezclado</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Marca *</label>
            <input type="text" id="adm-tool-brand" required placeholder="Ej: Caterpillar" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Modelo *</label>
            <input type="text" id="adm-tool-model" required placeholder="Ej: 320 Next Gen" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tarifa Diaria (COP) *</label>
            <input type="number" id="adm-tool-price" required min="10000" step="10000" placeholder="850000" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Depósito de Garantía (COP) *</label>
            <input type="number" id="adm-tool-deposit" required min="0" step="50000" placeholder="2000000" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL de la Imagen Principal *</label>
          <input type="url" id="adm-tool-image" required placeholder="https://images.unsplash.com/photo-..." class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" value="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80" />
          <span class="text-[10px] text-slate-400 mt-0.5 block">Enlace público directo a la fotografía en alta resolución del equipo.</span>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="adm-tool-cancel" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" id="adm-tool-submit" class="px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-md cursor-pointer flex items-center gap-1.5">
            ${renderIcon('Truck', 'w-4 h-4')} Guardar en Flota
          </button>
        </div>
      </form>
    `;

    modal.open({
      title: 'Incorporar Máquina a la Flota Nacional',
      content: modalContent,
      maxWidth: 'max-w-lg'
    });

    modalContent.querySelector('#adm-tool-cancel').addEventListener('click', () => modal.close());

    modalContent.querySelector('#form-admin-add-tool').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalContent.querySelector('#adm-tool-submit');
      const providerId = Number(modalContent.querySelector('#adm-tool-provider').value);
      const categoryId = Number(modalContent.querySelector('#adm-tool-category').value);
      const name = modalContent.querySelector('#adm-tool-name').value.trim();
      const brand = modalContent.querySelector('#adm-tool-brand').value.trim();
      const modelName = modalContent.querySelector('#adm-tool-model').value.trim();
      const dailyPrice = Number(modalContent.querySelector('#adm-tool-price').value);
      const depositAmount = Number(modalContent.querySelector('#adm-tool-deposit').value);
      const imageUrl = modalContent.querySelector('#adm-tool-image').value.trim();

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando en BD...';

        await api.post('/tools', {
          providerId,
          categoryId,
          name,
          brand,
          model: modelName,
          dailyPrice,
          depositAmount,
          images: [{ imageUrl, isCover: true }],
          specifications: [
            { specKey: 'Operatividad', specValue: 'Certificada' },
            { specKey: 'Ubicación', specValue: 'Patio Central' }
          ]
        });

        // Notify target provider
        const targetProv = providersList.find(p => p.id === providerId);
        notificationsStore.add({
          category: 'INVENTORY',
          type: 'info',
          title: 'Nueva Maquinaria Incorporada',
          message: `La administración ha añadido "${name}" (${brand} ${modelName}) a tu flota de alquileres.`,
          targetRole: 'ROLE_PROVIDER',
          userId: targetProv?.userId
        });

        notificationsStore.add({
          category: 'INVENTORY',
          type: 'success',
          title: 'Equipo Creado en Catálogo',
          message: `Has incorporado la máquina "${name}" asignada a ${targetProv?.name || 'Proveedor'}.`,
          targetRole: 'ROLE_ADMIN'
        });

        showToast(`Equipo "${name}" incorporado exitosamente a la flota`, 'success');
        modal.close();
        await loadAllData();
        render();
      } catch (err) {
        showToast(err.message || 'Error al incorporar la máquina', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${renderIcon('Truck', 'w-4 h-4')} Guardar en Flota`;
      }
    });
  }

  function openAdminManageToolModal(tool) {
    const modalContent = document.createElement('div');
    modalContent.className = 'space-y-5';

    modalContent.innerHTML = `
      <div>
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 class="font-black text-sm text-slate-900 dark:text-white">${tool.name}</h4>
            <div class="text-[11px] text-slate-400 font-mono">ID #${tool.id} · Marca: ${tool.brand || 'N/A'} · Modelo: ${tool.model || 'N/A'}</div>
          </div>
          <div>${getToolStatusBadge(tool.status)}</div>
        </div>

        <div class="mt-4 space-y-4">
          <!-- Action 1: Solicitar Permiso / Notificar al Proveedor -->
          <div class="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/40 space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#FF7A00]"></span>
              <h5 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                1. Solicitar Permiso / Notificación Formal al Proveedor
              </h5>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300">
              Envía un requerimiento formal al proveedor para acordar el retiro temporal, mantenimiento técnico o baja del equipo.
            </p>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Motivo o Justificación del Requerimiento *</label>
              <textarea id="adm-req-reason" rows="2" placeholder="Ej: Reporte técnico de desgaste en orugas; se requiere inspección preventiva antes del próximo contrato." class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"></textarea>
            </div>
            <button type="button" id="btn-adm-send-request" class="w-full py-2.5 rounded-xl text-xs font-black bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider">
              ${renderIcon('Send', 'w-3.5 h-3.5')} Enviar Solicitud de Permiso al Proveedor
            </button>
          </div>

          <!-- Action 2: Cambio directo de Estado -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <h5 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              2. Modificar Estado Operativo Inmediato
            </h5>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nuevo Estado Operativo</label>
              <select id="adm-tool-status-select" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
                <option value="AVAILABLE" ${tool.status === 'AVAILABLE' ? 'selected' : ''}>Disponible (En Catálogo)</option>
                <option value="MAINTENANCE" ${tool.status === 'MAINTENANCE' ? 'selected' : ''}>En Mantenimiento Preventivo / Taller</option>
                <option value="RETIRED" ${tool.status === 'RETIRED' ? 'selected' : ''}>Retirada / Fuera de Servicio</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="adm-notify-prov-chk" checked class="rounded text-[#FF7A00] focus:ring-[#FF7A00]" />
              <label for="adm-notify-prov-chk" class="text-xs text-slate-600 dark:text-slate-300">Notificar al proveedor sobre este cambio de estado</label>
            </div>
            <button type="button" id="btn-adm-apply-status" class="w-full py-2.5 rounded-xl text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-xs cursor-pointer flex items-center justify-center gap-1.5">
              ${renderIcon('CheckCircle2', 'w-3.5 h-3.5')} Aplicar Nuevo Estado en BD
            </button>
          </div>

          <!-- Action 3: Baja definitiva -->
          <div class="pt-2 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Eliminación permanente del catálogo nacional</span>
            <button type="button" id="btn-adm-delete-tool" class="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 cursor-pointer flex items-center gap-1">
              ${renderIcon('Trash2', 'w-3 h-3')} Dar de Baja
            </button>
          </div>
        </div>
      </div>
    `;

    modal.open({
      title: 'Supervisión & Control de Maquinaria',
      content: modalContent,
      maxWidth: 'max-w-lg'
    });

    // Event 1: Send Permission Request to Provider
    modalContent.querySelector('#btn-adm-send-request').addEventListener('click', () => {
      const reason = modalContent.querySelector('#adm-req-reason').value.trim();
      if (!reason) {
        showToast('Por favor describe el motivo del requerimiento para el proveedor', 'error');
        return;
      }

      notificationsStore.add({
        category: 'SECURITY',
        type: 'warning',
        title: `Requerimiento de Administración: ${tool.name}`,
        message: `La administración solicita autorización/gestión técnica sobre el equipo "${tool.name}" (ID #${tool.id}). Motivo: "${reason}". Por favor revisa y actualiza el estado.`,
        targetRole: 'ROLE_PROVIDER',
        userId: tool.providerUserId || tool.providerId
      });

      notificationsStore.add({
        category: 'SYSTEM',
        type: 'info',
        title: `Solicitud Enviada a Proveedor`,
        message: `Se ha emitido notificación de requerimiento para "${tool.name}".`,
        targetRole: 'ROLE_ADMIN'
      });

      showToast('Solicitud formal de permiso enviada al proveedor', 'success');
      modal.close();
    });

    // Event 2: Apply Status Change
    modalContent.querySelector('#btn-adm-apply-status').addEventListener('click', async () => {
      const newStatus = modalContent.querySelector('#adm-tool-status-select').value;
      const notifyProvider = modalContent.querySelector('#adm-notify-prov-chk').checked;

      try {
        await api.put(`/tools/${tool.id}`, { status: newStatus });
        
        if (notifyProvider) {
          const statusLabels = {
            AVAILABLE: 'Disponible para alquiler',
            MAINTENANCE: 'En Mantenimiento',
            RETIRED: 'Retirada / Fuera de servicio'
          };
          notificationsStore.add({
            category: 'INVENTORY',
            type: newStatus === 'AVAILABLE' ? 'success' : 'warning',
            title: `Estado de Equipo Actualizado: ${tool.name}`,
            message: `La administración ha modificado el estado de tu equipo "${tool.name}" a "${statusLabels[newStatus] || newStatus}".`,
            targetRole: 'ROLE_PROVIDER',
            userId: tool.providerUserId || tool.providerId
          });
        }

        showToast(`Estado de "${tool.name}" actualizado a ${newStatus}`, 'success');
        modal.close();
        await loadAllData();
        render();
      } catch (err) {
        showToast(err.message || 'Error al actualizar el estado de la máquina', 'error');
      }
    });

    // Event 3: Delete Tool
    modalContent.querySelector('#btn-adm-delete-tool').addEventListener('click', async () => {
      const confirmed = await modal.confirmDialog({
        title: `¿Dar de baja ${tool.name}?`,
        message: `Esta acción retirará permanentemente el equipo de la plataforma. Si el equipo tiene contratos históricos se marcará como RETIRADA.`,
        confirmText: 'Sí, dar de baja',
        isDestructive: true
      });

      if (!confirmed) return;

      try {
        await api.delete(`/tools/${tool.id}`);
        notificationsStore.add({
          category: 'INVENTORY',
          type: 'warning',
          title: `Equipo Retirado de Catálogo: ${tool.name}`,
          message: `La administración central ha dado de baja del catálogo el equipo "${tool.name}" (ID #${tool.id}).`,
          targetRole: 'ROLE_PROVIDER',
          userId: tool.providerUserId || tool.providerId
        });
        showToast(`Máquina "${tool.name}" eliminada de la plataforma`, 'success');
        modal.close();
        await loadAllData();
        render();
      } catch (err) {
        try {
          await api.put(`/tools/${tool.id}`, { status: 'RETIRED' });
          showToast(`El equipo tiene contratos asociados; se ha marcado como RETIRADA del catálogo`, 'info');
          modal.close();
          await loadAllData();
          render();
        } catch (innerErr) {
          showToast(`Error al dar de baja el equipo: ${err.message}`, 'error');
        }
      }
    });
  }

  render();
}

export default renderAdminDashboard;
