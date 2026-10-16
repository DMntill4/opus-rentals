import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate, getRentalStatusBadge, getToolStatusBadge } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openInvoiceViewer } from './rental-modal.js';
import modal from '../components/modal.js';

export async function renderAdminDashboard() {
  const container = document.getElementById('app-content');
  if (!container) return;

  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-10 max-w-lg mx-auto shadow-xl space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-[#FF7A00] border-2 border-[#FF7A00]/30 flex items-center justify-center mx-auto shadow-md">
            ${renderIcon('ShieldAlert', 'w-8 h-8')}
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">Área Restringida a Administradores</h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Esta sección requiere credenciales con rol de Administrador de Opus Rentals.</p>
          <div class="flex flex-col sm:flex-row gap-3 pt-3">
            <button id="btn-demo-admin-login" class="btn-primary flex-1 !py-3 text-xs flex items-center justify-center gap-2 shadow-md">
              ${renderIcon('ShieldCheck', 'w-4 h-4')} Entrar como Admin (Demo)
            </button>
            <button id="btn-login-admin" class="btn-dark flex-1 !py-3 text-xs flex items-center justify-center gap-2">
              ${renderIcon('LogIn', 'w-4 h-4')} Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    `;
    container.querySelector('#btn-demo-admin-login')?.addEventListener('click', () => {
      auth.setSession({
        token: 'demo-admin-jwt',
        user: { username: 'admin@opusrentals.com', role: 'ROLE_ADMIN', roles: ['ROLE_ADMIN'], profile: { name: 'Admin General Opus', id: 'admin-001' } }
      });
      showToast('Sesión iniciada como Administrador', 'success');
      renderAdminDashboard();
    });
    container.querySelector('#btn-login-admin')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  // Admin Section State: 'overview' | 'providers' | 'tools' | 'rentals' | 'users'
  let activeSection = 'overview';
  let searchQuery = '';

  // Local state datasets
  let providersList = [
    { id: 'prov-001', name: 'Caterpillar Equipos SAS', taxId: '901.884.219-5', phone: '+57 (1) 745-8900', email: 'operaciones@caterpillar-colombia.com', city: 'Bogotá D.C. (Cazucá)', fleetCount: 14, verified: true },
    { id: 'prov-002', name: 'Equipos & Maquinaria Colombia', taxId: '900.876.543-2', phone: '+57 310 888 7766', email: 'contacto@equiposcolombia.com', city: 'Medellín, Antioquia', fleetCount: 8, verified: true },
    { id: 'prov-003', name: 'Constructoras del Norte SAS', taxId: '901.234.567-8', phone: '+57 317 654 3210', email: 'contacto@constructornorte.com', city: 'Bucaramanga, Santander', fleetCount: 6, verified: true },
    { id: 'prov-004', name: 'Maquinarias Andinas del Valle', taxId: '900.112.233-1', phone: '+57 315 223 3445', email: 'alquiler@andinasvalle.com', city: 'Cali, Valle del Cauca', fleetCount: 5, verified: false },
    { id: 'prov-005', name: 'Grúas y Manlifts de la Costa', taxId: '901.998.877-4', phone: '+57 300 998 8776', email: 'despacho@gruascosta.com', city: 'Barranquilla, Atlántico', fleetCount: 4, verified: false }
  ];

  let allTools = [];
  try {
    const fetched = await api.get('/tools');
    allTools = Array.isArray(fetched) ? fetched : [];
  } catch (e) {
    allTools = [];
  }

  let usersList = [
    { id: 'usr-01', name: 'Ing. Carlos Mendoza', email: 'client.carlos@gmail.com', role: 'Cliente', date: '14 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: 'usr-02', name: 'Caterpillar Equipos SAS', email: 'provider.caterpillar@opusrentals.com', role: 'Proveedor', date: '11 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 'usr-03', name: 'Laura Gómez (Constructora Bolívar)', email: 'laura.gomez@bolivar.com', role: 'Cliente', date: '09 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { id: 'usr-04', name: 'Equipos & Maquinaria Colombia', email: 'diego.torres@equiposcol.com', role: 'Proveedor', date: '07 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { id: 'usr-05', name: 'Admin General Opus', email: 'admin@opusrentals.com', role: 'Administrador', date: '01 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }
  ];

  let rentalsList = [
    { id: '1042', client: 'Constructora Bolívar S.A.S.', provider: 'Caterpillar Equipos SAS', tool: 'Excavadora Hidráulica CAT 320D2', total: 5200000, status: 'IN_PROGRESS', date: '16 oct 2026' },
    { id: '1038', client: 'Consorcio Vial Andino', provider: 'Equipos & Maquinaria Colombia', tool: 'Rodillo Vibrocompactador CAT CS54B', total: 4800000, status: 'IN_PROGRESS', date: '12 oct 2026' },
    { id: '1029', client: 'Concretos Argos Obra Norte', provider: 'Constructoras del Norte SAS', tool: 'Generador Diésel Cummins 250 kVA', total: 3150000, status: 'COMPLETED', date: '01 oct 2026' },
    { id: '1015', client: 'Inversiones Civiles del Sol', provider: 'Caterpillar Equipos SAS', tool: 'Minicargador Bobcat S570', total: 700000, status: 'CANCELLED', date: '28 sep 2026' }
  ];

  function render() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <!-- Top Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#FF7A00] text-xs font-mono font-black uppercase tracking-wider mb-2 shadow-xs">
                ${renderIcon('ShieldCheck', 'w-3.5 h-3.5')} Consola Central de Administración Opus Rentals
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">Supervisión & Control B2B</h1>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Monitorea proveedores, flota nacional, contratos de alquiler y usuarios del sistema.</p>
            </div>
            
            <div class="flex items-center gap-3">
              <a href="http://localhost:8085/swagger-ui.html" target="_blank" rel="noopener noreferrer" class="btn-dark !py-2.5 !px-4 text-xs font-black flex items-center gap-2 shadow-sm">
                ${renderIcon('ExternalLink', 'w-3.5 h-3.5')} Swagger API Docs
              </a>
            </div>
          </div>

          <!-- 4 Top KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- GMV -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Volumen Alquileres (GMV)</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${renderIcon('DollarSign', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display text-[#FF7A00]">$ 24.850.000</div>
              <div class="text-[11px] text-emerald-600 font-bold mt-1">↑ 18% vs. mes anterior</div>
            </div>

            <!-- Proveedores -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Proveedores Aliados</span>
                <div class="w-8 h-8 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold">
                  ${renderIcon('Building2', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">${providersList.length}</div>
              <div class="text-[11px] text-slate-500 font-mono">3 certificados con póliza</div>
            </div>

            <!-- Maquinaria Total -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Flota Registrada</span>
                <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  ${renderIcon('Truck', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">${allTools.length || 32}</div>
              <div class="text-[11px] text-slate-500 font-mono">82% disponible hoy</div>
            </div>

            <!-- Contratos Activos -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase font-mono">Contratos Activos</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ${renderIcon('CheckCircle2', 'w-4 h-4')}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">${rentalsList.filter(r => r.status === 'IN_PROGRESS').length}</div>
              <div class="text-[11px] text-slate-500 font-mono">En frente de obra</div>
            </div>
          </div>

          <!-- Section Navigation Bar -->
          <div class="border-b-2 border-slate-200 dark:border-slate-800">
            <nav class="flex flex-wrap gap-2 sm:gap-6" aria-label="Tabs">
              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'overview' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="overview">
                ${renderIcon('BarChart3', 'w-4 h-4')}
                <span>Supervisión & Métricas</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'providers' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="providers">
                ${renderIcon('Building2', 'w-4 h-4')}
                <span>Gestión de Proveedores</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'providers' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${providersList.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'tools' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="tools">
                ${renderIcon('Truck', 'w-4 h-4')}
                <span>Toda la Flota</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'tools' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${allTools.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'rentals' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="rentals">
                ${renderIcon('FileText', 'w-4 h-4')}
                <span>Contratos Globales</span>
                <span class="px-2 py-0.5 rounded-md text-xs font-black ${activeSection === 'rentals' ? 'bg-[#FF7A00] text-white' : 'bg-slate-200 text-slate-700'}">${rentalsList.length}</span>
              </button>

              <button class="admin-sec-btn py-3 px-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'users' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-sec="users">
                ${renderIcon('Users', 'w-4 h-4')}
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
              
              <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <h3 class="font-black text-slate-900 text-sm font-display">Maquinaria Más Arrendada</h3>
                  <span class="text-xs text-slate-400 font-mono">Top 5</span>
                </div>
                <div class="space-y-3 pt-2">
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div class="font-bold text-xs text-slate-900">Excavadora CAT 320D2</div>
                      <div class="text-[10px] text-slate-400 font-mono">24 contratos registrados</div>
                    </div>
                    <span class="font-mono font-black text-xs text-[#FF7A00]">$ 15.600.000 COP</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div class="font-bold text-xs text-slate-900">Rodillo Vibrocompactador CS54B</div>
                      <div class="text-[10px] text-slate-400 font-mono">18 contratos registrados</div>
                    </div>
                    <span class="font-mono font-black text-xs text-[#FF7A00]">$ 8.640.000 COP</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div class="font-bold text-xs text-slate-900">Minicargador Bobcat S570</div>
                      <div class="text-[10px] text-slate-400 font-mono">14 contratos registrados</div>
                    </div>
                    <span class="font-mono font-black text-xs text-[#FF7A00]">$ 4.900.000 COP</span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <h3 class="font-black text-slate-900 text-sm font-display">Auditoría Telemática de Flota</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">En Línea</span>
                </div>
                <div class="space-y-3 pt-2 text-xs">
                  <div class="p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
                    ${renderIcon('CheckCircle2', 'w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5')}
                    <div>
                      <div class="font-bold text-slate-900">Telemetría GPS Satelital</div>
                      <div class="text-[11px] text-slate-500">100% de equipos en obra transmitiendo ubicación y horas de motor.</div>
                    </div>
                  </div>
                  <div class="p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
                    ${renderIcon('ShieldCheck', 'w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5')}
                    <div>
                      <div class="font-bold text-slate-900">Pólizas SURA Todo Riesgo</div>
                      <div class="text-[11px] text-slate-500">Contratos respaldados con cobertura por volcamiento, incendio y hurto.</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 2. GESTIÓN DE PROVEEDORES                                                 -->
          <!-- ========================================================================= -->
          ${activeSection === 'providers' ? `
            <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 class="text-base font-black text-slate-900 font-display">Directorio Oficial de Proveedores de Maquinaria</h3>
                  <p class="text-xs text-slate-500">Administra el estado de verificación oficial, flota asignada y canales de contacto.</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Empresa Proveedora</th>
                      <th class="py-3 px-4">NIT / RUT</th>
                      <th class="py-3 px-4">Contacto Directo</th>
                      <th class="py-3 px-4">Sede / Patio</th>
                      <th class="py-3 px-4">Flota</th>
                      <th class="py-3 px-4">Estado Verificación</th>
                      <th class="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    ${providersList.map(p => `
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="font-black text-slate-900 text-xs">${p.name}</div>
                          <div class="text-[10px] text-slate-400 font-mono">ID: ${p.id}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono font-bold text-slate-700">
                          ${p.taxId}
                        </td>
                        <td class="py-3.5 px-4">
                          <div class="font-bold text-slate-800">${p.phone}</div>
                          <div class="text-[10px] text-slate-400 font-mono">${p.email}</div>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600">
                          ${p.city}
                        </td>
                        <td class="py-3.5 px-4 font-mono font-black text-slate-900">
                          ${p.fleetCount} unid.
                        </td>
                        <td class="py-3.5 px-4">
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${p.verified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
                            <span class="w-1.5 h-1.5 rounded-full ${p.verified ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                            ${p.verified ? 'Verificado' : 'En Revisión'}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          <button class="btn-toggle-verify px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${p.verified ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#FF7A00] hover:bg-[#E56E00] text-white shadow-xs'}" data-id="${p.id}">
                            ${p.verified ? 'Suspender Verificación' : 'Aprobar Verificado'}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 3. TODA LA FLOTA GLOBAL                                                   -->
          <!-- ========================================================================= -->
          ${activeSection === 'tools' ? `
            <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="text-base font-black text-slate-900 font-display">Inventario Consolidado de Toda la Plataforma</h3>
                <span class="text-xs text-slate-500 font-mono">${allTools.length} máquinas activas en base de datos</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Equipo</th>
                      <th class="py-3 px-4">Línea</th>
                      <th class="py-3 px-4">Marca</th>
                      <th class="py-3 px-4">Tarifa Diaria</th>
                      <th class="py-3 px-4">Estado</th>
                      <th class="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    ${allTools.map(t => `
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="font-bold text-slate-900">${t.name}</div>
                          <div class="text-[10px] text-slate-400 font-mono">ID: ${t.id}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono text-[11px] text-slate-600">${t.categoryName || 'Construcción'}</td>
                        <td class="py-3.5 px-4 font-bold text-slate-700">${t.brand || 'CAT'}</td>
                        <td class="py-3.5 px-4 font-black font-mono text-slate-900">${formatCurrency(t.dailyPrice)}</td>
                        <td class="py-3.5 px-4">${getToolStatusBadge(t.status)}</td>
                        <td class="py-3.5 px-4 text-right">
                          <a href="#/product/${t.id}" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 font-bold text-xs inline-flex items-center gap-1">
                            ${renderIcon('ExternalLink', 'w-3 h-3')} Ficha
                          </a>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 4. CONTRATOS GLOBALES                                                     -->
          <!-- ========================================================================= -->
          ${activeSection === 'rentals' ? `
            <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="text-base font-black text-slate-900 font-display">Contratos de Alquiler y Facturación DIAN</h3>
                <span class="text-xs text-slate-500 font-mono">${rentalsList.length} contratos auditados</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 font-mono font-black">
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
                  <tbody class="divide-y divide-slate-100 font-medium">
                    ${rentalsList.map(r => `
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold">#${r.id}</td>
                        <td class="py-3.5 px-4 font-bold text-slate-900">${r.client}</td>
                        <td class="py-3.5 px-4 text-slate-600">${r.provider}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-800">${r.tool}</td>
                        <td class="py-3.5 px-4 font-black font-mono text-slate-900">${formatCurrency(r.total)}</td>
                        <td class="py-3.5 px-4">${getRentalStatusBadge(r.status)}</td>
                        <td class="py-3.5 px-4 text-right">
                          <button class="btn-admin-invoice px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer" data-id="${r.id}">
                            ${renderIcon('FileText', 'w-3 h-3 text-[#FF7A00]')} Ver PDF
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- ========================================================================= -->
          <!-- 5. USUARIOS DEL SISTEMA                                                   -->
          <!-- ========================================================================= -->
          ${activeSection === 'users' ? `
            <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="text-base font-black text-slate-900 font-display">Control de Usuarios y Permisos</h3>
                <span class="text-xs text-slate-500 font-mono">${usersList.length} cuentas registradas</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b-2 border-slate-100 font-mono font-black">
                    <tr>
                      <th class="py-3 px-4">Usuario</th>
                      <th class="py-3 px-4">Correo</th>
                      <th class="py-3 px-4">Rol</th>
                      <th class="py-3 px-4">Registro</th>
                      <th class="py-3 px-4">Estado</th>
                      <th class="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    ${usersList.map(u => `
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="py-3.5 px-4 font-bold text-slate-900">${u.name}</td>
                        <td class="py-3.5 px-4 font-mono text-slate-600">${u.email}</td>
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
                          <button class="btn-toggle-user px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-xs cursor-pointer" data-id="${u.id}">
                            ${u.active ? 'Suspender' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
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

    // Provider verify toggle
    container.querySelectorAll('.btn-toggle-verify').forEach(btn => {
      btn.addEventListener('click', () => {
        const prov = providersList.find(p => p.id === btn.dataset.id);
        if (prov) {
          prov.verified = !prov.verified;
          showToast(`Estado de ${prov.name} cambiado a: ${prov.verified ? 'Verificado' : 'En Revisión'}`, 'success');
          render();
        }
      });
    });

    // User active toggle
    container.querySelectorAll('.btn-toggle-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = usersList.find(usr => usr.id === btn.dataset.id);
        if (u) {
          u.active = !u.active;
          showToast(`Usuario ${u.name} ${u.active ? 'activado' : 'suspendido'}`, 'info');
          render();
        }
      });
    });

    // Invoice viewer
    container.querySelectorAll('.btn-admin-invoice').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = rentalsList.find(item => item.id === btn.dataset.id) || rentalsList[0];
        openInvoiceViewer({
          invoiceNumber: 'OP-INV-' + r.id,
          issueDate: '16 oct 2026',
          client: {
            name: r.client,
            taxId: '900.342.112-4',
            address: 'Frente de Obra Central Bogotá',
            email: 'compras@cliente.com',
            phone: '+57 (1) 745-8900'
          },
          provider: {
            name: r.provider,
            taxId: '901.884.219-5',
            address: 'Patio Principal de Despachos',
            email: 'despachos@caterpillar.com',
            phone: '+57 (1) 745-8900'
          },
          tool: {
            name: r.tool,
            sku: 'OP-FLEET-' + r.id
          },
          rentalPeriod: {
            startDate: '16 oct 2026',
            endDate: '24 oct 2026',
            days: 8
          },
          dailyRate: Math.round(r.total / 8),
          subtotal: r.total,
          tax: Math.round(r.total * 0.19),
          total: Math.round(r.total * 1.19),
          paymentMethod: 'Transferencia PSE Bancolombia',
          bank: 'Bancolombia',
          reference: 'REF-' + r.id,
          paymentDate: '16 oct 2026'
        });
      });
    });
  }

  render();
}

export default renderAdminDashboard;
