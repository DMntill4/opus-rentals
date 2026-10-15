import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from '../components/auth-modal.js';

export async function renderAdminDashboard() {
  const container = document.getElementById('app-content');
  if (!container) return;

  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 max-w-lg mx-auto shadow-sm space-y-4">
          <div class="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
            ${renderIcon('ShieldAlert', 'w-7 h-7')}
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white font-display">Área Restringida a Administradores</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Acceso exclusivo para supervisión general de la plataforma Opus Rentals.</p>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button id="btn-demo-admin-login" class="btn-primary flex-1 !py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-sm">
              ${renderIcon('ShieldCheck', 'w-4 h-4')} Entrar como Admin (Demo)
            </button>
            <button id="btn-login-admin" class="btn-secondary flex-1 !py-2.5 text-xs flex items-center justify-center gap-1.5">
              ${renderIcon('LogIn', 'w-4 h-4')} Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    `;
    container.querySelector('#btn-demo-admin-login')?.addEventListener('click', () => {
      auth.setSession({
        token: 'demo-admin-jwt',
        user: { username: 'admin', role: 'ROLE_ADMIN', roles: ['ROLE_ADMIN'], profile: { name: 'Admin General', id: 'admin-001' } }
      });
      showToast('Sesión iniciada como Administrador', 'success');
      renderAdminDashboard();
    });
    container.querySelector('#btn-login-admin')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  // Initial local state for admin view
  let currentTab = 'all'; // all, client, provider, admin
  let searchQuery = '';
  let usersList = [
    { id: 'usr-01', name: 'Juan Pérez García', email: 'juan.perez@ejemplo.com', role: 'Cliente', date: '13 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: 'usr-02', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@ejemplo.com', role: 'Proveedor', date: '11 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 'usr-03', name: 'Laura Gómez', email: 'laura.gomez@ejemplo.com', role: 'Cliente', date: '09 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { id: 'usr-04', name: 'Diego Torres', email: 'diego.torres@ejemplo.com', role: 'Proveedor', date: '07 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { id: 'usr-05', name: 'Ana Martínez', email: 'ana.martinez@ejemplo.com', role: 'Cliente', date: '05 oct 2026', active: false, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    { id: 'usr-06', name: 'Admin General Opus', email: 'admin@opusrentals.com', role: 'Administrador', date: '01 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }
  ];

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Supervisión y Resumen</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Vista general del estado de la plataforma Opus Rentals.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative hidden sm:block">
              <input type="text" id="admin-global-search" placeholder="Buscar en el panel de administración..." class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs w-72 text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500 transition-colors" />
              <div class="absolute left-3 top-2.5 text-slate-400">
                ${renderIcon('Search', 'w-3.5 h-3.5')}
              </div>
            </div>
            <a href="http://localhost:8085/swagger-ui.html" target="_blank" rel="noopener noreferrer" class="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5">
              ${renderIcon('ExternalLink', 'w-3.5 h-3.5')} Swagger API
            </a>
          </div>
        </div>

        <!-- 4 Top KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-container">
          <!-- Ingresos Totales -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Ingresos totales</span>
              <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                ${renderIcon('DollarSign', 'w-4 h-4')}
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white mt-2">$ 12.450.000</div>
            <div class="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <span>↑ 12%</span>
              <span class="text-slate-400 dark:text-slate-500 font-normal">vs. mes anterior</span>
            </div>
          </div>

          <!-- Alquileres Activos -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Alquileres activos</span>
              <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                ${renderIcon('CalendarCheck', 'w-4 h-4')}
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white mt-2">18</div>
            <div class="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <span>↑ 5%</span>
              <span class="text-slate-400 dark:text-slate-500 font-normal">vs. mes anterior</span>
            </div>
          </div>

          <!-- Usuarios -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Usuarios</span>
              <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                ${renderIcon('Users', 'w-4 h-4')}
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white mt-2">42</div>
            <div class="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <span>↑ 8%</span>
              <span class="text-slate-400 dark:text-slate-500 font-normal">vs. mes anterior</span>
            </div>
          </div>

          <!-- Herramientas disponibles -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Maquinaria disponible</span>
              <div class="w-8 h-8 rounded-lg bg-[#132e4f]/10 dark:bg-blue-950/40 text-[#132e4f] dark:text-blue-400 flex items-center justify-center">
                ${renderIcon('Truck', 'w-4 h-4')}
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white mt-2">56</div>
            <div class="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-1">de 78 en total</div>
          </div>
        </div>

        <!-- 3 Middle Analytics Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Herramientas más alquiladas -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">Maquinaria más alquilada</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">Top 5 por número de contratos.</p>
              
              <div class="space-y-3.5 mt-5">
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-700 dark:text-slate-300 font-medium">Excavadora hidráulica CAT 320</span>
                    <span class="text-slate-900 dark:text-white font-bold">24</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div class="bg-[#132e4f] dark:bg-blue-600 h-2 rounded-full" style="width: 80%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-700 dark:text-slate-300 font-medium">Minicargador Bobcat S590</span>
                    <span class="text-slate-900 dark:text-white font-bold">18</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div class="bg-[#132e4f] dark:bg-blue-600 h-2 rounded-full" style="width: 60%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-700 dark:text-slate-300 font-medium">Rodillo compactador Bomag</span>
                    <span class="text-slate-900 dark:text-white font-bold">15</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div class="bg-[#132e4f] dark:bg-blue-600 h-2 rounded-full" style="width: 50%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-700 dark:text-slate-300 font-medium">Planta Eléctrica Cummins 150 kVA</span>
                    <span class="text-slate-900 dark:text-white font-bold">12</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div class="bg-[#132e4f] dark:bg-blue-600 h-2 rounded-full" style="width: 40%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-700 dark:text-slate-300 font-medium">Manlift articulado JLG 800AJ</span>
                    <span class="text-slate-900 dark:text-white font-bold">10</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div class="bg-[#132e4f] dark:bg-blue-600 h-2 rounded-full" style="width: 33%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Clientes frecuentes -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">Clientes corporativos</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">Top 5 por volumen de arrendamiento.</p>

              <div class="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-5 text-slate-400 font-bold text-[11px]">1</span>
                    <span class="text-slate-800 dark:text-slate-200 font-medium">Consorcio Vial Andes 4G</span>
                  </div>
                  <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">12 contratos</span>
                </div>

                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-5 text-slate-400 font-bold text-[11px]">2</span>
                    <span class="text-slate-800 dark:text-slate-200 font-medium">Constructora Bolívar S.A.S.</span>
                  </div>
                  <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">9 contratos</span>
                </div>

                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-5 text-slate-400 font-bold text-[11px]">3</span>
                    <span class="text-slate-800 dark:text-slate-200 font-medium">Obras Civiles del Río S.A.S</span>
                  </div>
                  <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">7 contratos</span>
                </div>

                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-5 text-slate-400 font-bold text-[11px]">4</span>
                    <span class="text-slate-800 dark:text-slate-200 font-medium">Alianza Constructores 5G</span>
                  </div>
                  <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">6 contratos</span>
                </div>

                <div class="py-2.5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="w-5 text-slate-400 font-bold text-[11px]">5</span>
                    <span class="text-slate-800 dark:text-slate-200 font-medium">Proyectos Urbanos de Occidente</span>
                  </div>
                  <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">5 contratos</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado del inventario (Donut Breakdown) -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">Estado de la flota</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">Disponibilidad en frentes de obra.</p>

              <div class="flex items-center justify-around mt-4">
                <!-- SVG Donut Chart -->
                <div class="relative w-32 h-32 flex items-center justify-center">
                  <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-width="12" fill="none" />
                    <!-- Green Disponible 72% -->
                    <circle cx="50" cy="50" r="38" stroke="#10b981" stroke-width="12" stroke-dasharray="172 238" stroke-dashoffset="0" fill="none" stroke-linecap="round" />
                    <!-- Blue Alquilada 21% -->
                    <circle cx="50" cy="50" r="38" stroke="#3b82f6" stroke-width="12" stroke-dasharray="50 238" stroke-dashoffset="-176" fill="none" stroke-linecap="round" />
                    <!-- Amber Mantenimiento 8% -->
                    <circle cx="50" cy="50" r="38" stroke="#f59e0b" stroke-width="12" stroke-dasharray="19 238" stroke-dashoffset="-228" fill="none" stroke-linecap="round" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-xl font-bold text-slate-900 dark:text-white">78</span>
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total</span>
                  </div>
                </div>

                <!-- Legend -->
                <div class="space-y-3 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <div>
                      <div class="font-medium text-slate-700 dark:text-slate-300">Disponible</div>
                      <div class="text-[11px] text-slate-400">56 (72%)</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <div>
                      <div class="font-medium text-slate-700 dark:text-slate-300">En obra</div>
                      <div class="text-[11px] text-slate-400">16 (21%)</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <div>
                      <div class="font-medium text-slate-700 dark:text-slate-300">Taller / Mant.</div>
                      <div class="text-[11px] text-slate-400">6 (8%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Section: Gestión de Usuarios -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Usuarios y Permisos</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control de cuentas de clientes, contratistas y proveedores autorizados.</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <div class="relative flex-1 sm:w-64">
                <input type="text" id="user-search-input" placeholder="Buscar usuario por nombre o correo..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500 transition-colors" />
                <div class="absolute left-2.5 top-2 text-slate-400">
                  ${renderIcon('Search', 'w-3.5 h-3.5')}
                </div>
              </div>
              <button id="btn-open-new-user-drawer" class="btn-primary !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-xs">
                ${renderIcon('Plus', 'w-3.5 h-3.5')} Nuevo usuario
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button class="admin-tab-btn py-3 border-b-2 border-[#132e4f] text-[#132e4f] dark:border-blue-400 dark:text-blue-400 font-semibold cursor-pointer" data-tab="all">
              Todos (<span id="count-all">42</span>)
            </button>
            <button class="admin-tab-btn py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer" data-tab="client">
              Clientes (<span id="count-clients">31</span>)
            </button>
            <button class="admin-tab-btn py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer" data-tab="provider">
              Proveedores (<span id="count-providers">10</span>)
            </button>
            <button class="admin-tab-btn py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer" data-tab="admin">
              Administradores (<span id="count-admins">1</span>)
            </button>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-6 w-10">
                    <input type="checkbox" class="rounded border-slate-300 text-[#132e4f] focus:ring-0" />
                  </th>
                  <th class="py-3 px-4">Nombre</th>
                  <th class="py-3 px-4">Correo electrónico</th>
                  <th class="py-3 px-4">Rol</th>
                  <th class="py-3 px-4">Fecha de registro</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300" id="users-table-body">
                <!-- Dynamically rendered -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section: Herramientas (Collapsible global catalog management) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none" id="tools-accordion-toggle">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Inventario Global de Maquinaria</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control y auditoría del catálogo completo de equipos.</p>
            </div>
            <div class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              ${renderIcon('ChevronDown', 'w-5 h-5 transition-transform', 'id="tools-accordion-chevron"')}
            </div>
          </div>

          <div id="tools-accordion-content" class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-6">Equipo</th>
                  <th class="py-3 px-4">Nombre / Modelo</th>
                  <th class="py-3 px-4">Proveedor</th>
                  <th class="py-3 px-4">Categoría</th>
                  <th class="py-3 px-4">Tarifa Diaria</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-6">
                    <img src="https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=120" class="w-12 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">Excavadora Hidráulica Caterpillar 320D2 GC</td>
                  <td class="py-3 px-4 text-slate-500 dark:text-slate-400">Caterpillar Equipos SAS</td>
                  <td class="py-3 px-4 text-slate-500 dark:text-slate-400">Excavación</td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">$ 1.250.000</td>
                  <td class="py-3 px-4">
                    <span class="badge-disponible">Disponible</span>
                  </td>
                  <td class="py-3 px-6 text-right">
                    <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors mr-1 cursor-pointer">
                      ${renderIcon('Edit', 'w-4 h-4')}
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer">
                      ${renderIcon('Trash2', 'w-4 h-4')}
                    </button>
                  </td>
                </tr>

                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-6">
                    <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=120" class="w-12 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">Minicargador Bobcat S590 Turbo</td>
                  <td class="py-3 px-4 text-slate-500 dark:text-slate-400">Caterpillar Equipos SAS</td>
                  <td class="py-3 px-4 text-slate-500 dark:text-slate-400">Carga</td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">$ 380.000</td>
                  <td class="py-3 px-4">
                    <span class="badge-disponible">Disponible</span>
                  </td>
                  <td class="py-3 px-6 text-right">
                    <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors mr-1 cursor-pointer">
                      ${renderIcon('Edit', 'w-4 h-4')}
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer">
                      ${renderIcon('Trash2', 'w-4 h-4')}
                    </button>
                  </td>
                </tr>

                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-6">
                    <img src="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=120" class="w-12 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">Rodillo Compactador Bomag BW 211 D-50</td>
                  <td class="py-3 px-4 text-slate-500 dark:text-slate-400">Equipos & Maquinaria Andina SAS</td>
                  <td class="py-3 px-4 text-slate-500 dark:text-slate-400">Compactación</td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">$ 620.000</td>
                  <td class="py-3 px-4">
                    <span class="badge-alquilada">Alquilada</span>
                  </td>
                  <td class="py-3 px-6 text-right">
                    <button class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors mr-1 cursor-pointer">
                      ${renderIcon('Edit', 'w-4 h-4')}
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer">
                      ${renderIcon('Trash2', 'w-4 h-4')}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Right Drawer: Nuevo Usuario -->
    <div id="drawer-new-user" class="fixed inset-0 z-50 overflow-hidden hidden" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" id="drawer-new-user-backdrop"></div>
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
          <div class="p-6 overflow-y-auto space-y-6 flex-1">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white font-display">Nuevo usuario</h3>
              <button id="btn-close-new-user-drawer" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer">
                ${renderIcon('X', 'w-5 h-5')}
              </button>
            </div>

            <form id="form-new-user" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre completo *</label>
                <input type="text" id="nu-name" required placeholder="Ej. María González" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo electrónico *</label>
                <input type="email" id="nu-email" required placeholder="ejemplo@correo.com" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contraseña *</label>
                <div class="relative">
                  <input type="password" id="nu-password" required placeholder="Mín. 8 caracteres" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" />
                  <button type="button" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    ${renderIcon('Eye', 'w-3.5 h-3.5')}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Rol *</label>
                <div class="grid grid-cols-2 gap-3" id="role-selector-cards">
                  <label class="relative border-2 border-[#132e4f] dark:border-blue-500 bg-[#132e4f]/5 dark:bg-blue-950/30 rounded-xl p-3 cursor-pointer flex flex-col justify-between transition-all" id="card-role-cliente">
                    <div class="flex items-center justify-between mb-2">
                      <div class="w-7 h-7 rounded-lg bg-[#132e4f]/10 dark:bg-blue-950/60 text-[#132e4f] dark:text-blue-400 flex items-center justify-center">
                        ${renderIcon('User', 'w-4 h-4')}
                      </div>
                      <input type="radio" name="nu-role" value="Cliente" checked class="text-[#132e4f]" />
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">Cliente</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">Puede alquilar maquinaria</div>
                    </div>
                  </label>

                  <label class="relative border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 cursor-pointer flex flex-col justify-between hover:border-slate-300 transition-all" id="card-role-proveedor">
                    <div class="flex items-center justify-between mb-2">
                      <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        ${renderIcon('Truck', 'w-4 h-4')}
                      </div>
                      <input type="radio" name="nu-role" value="Proveedor" class="text-[#132e4f]" />
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">Proveedor</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">Puede publicar maquinaria</div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div class="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
            <button type="submit" form="form-new-user" class="btn-primary w-full !py-2.5 text-xs font-semibold shadow-xs">
              Crear usuario
            </button>
            <button type="button" id="btn-cancel-new-user-drawer" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Editar Usuario -->
    <div id="modal-edit-user" class="fixed inset-0 z-50 overflow-y-auto hidden flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" id="modal-edit-user-backdrop"></div>
      <div class="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Editar usuario</h3>
          <button id="btn-close-edit-user-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            ${renderIcon('X', 'w-5 h-5')}
          </button>
        </div>

        <form id="form-edit-user" class="space-y-4">
          <input type="hidden" id="eu-id" />
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre completo</label>
            <input type="text" id="eu-name" required class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo electrónico</label>
            <input type="email" id="eu-email" required class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rol</label>
            <select id="eu-role" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500">
              <option value="Cliente">Cliente</option>
              <option value="Proveedor">Proveedor</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary flex-1 !py-2.5 text-xs font-semibold shadow-xs">
              Guardar cambios
            </button>
            <button type="button" id="btn-cancel-edit-user" class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Eliminar Usuario -->
    <div id="modal-delete-user" class="fixed inset-0 z-50 overflow-y-auto hidden flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" id="modal-delete-user-backdrop"></div>
      <div class="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Eliminar usuario</h3>
          <button id="btn-close-delete-user-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            ${renderIcon('X', 'w-5 h-5')}
          </button>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          ¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.
        </p>

        <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <img id="du-avatar" src="" class="w-9 h-9 rounded-full object-cover" />
          <div>
            <div id="du-name" class="text-xs font-bold text-slate-900 dark:text-white"></div>
            <div id="du-email" class="text-[11px] text-slate-500 dark:text-slate-400"></div>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" id="btn-cancel-delete-user" class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
            Cancelar
          </button>
          <button type="button" id="btn-confirm-delete-user" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;

  // Render users table with filtering
  function renderUsersTable() {
    const tbody = container.querySelector('#users-table-body');
    if (!tbody) return;

    let filtered = [...usersList];

    // Filter by tab
    if (currentTab === 'client') filtered = filtered.filter(u => u.role === 'Cliente');
    if (currentTab === 'provider') filtered = filtered.filter(u => u.role === 'Proveedor');
    if (currentTab === 'admin') filtered = filtered.filter(u => u.role === 'Administrador');

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
            No se encontraron usuarios con el criterio seleccionado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(u => {
      const roleColor = u.role === 'Cliente'
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
        : u.role === 'Proveedor'
        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';

      const statusBadge = u.active
        ? `<span class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo</span>`
        : `<span class="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Inactivo</span>`;

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
          <td class="py-3 px-6">
            <input type="checkbox" class="rounded border-slate-300 text-[#132e4f] focus:ring-0" />
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
              <span class="font-semibold text-slate-900 dark:text-white">${u.name}</span>
            </div>
          </td>
          <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">${u.email}</td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${roleColor}">
              ${u.role}
            </span>
          </td>
          <td class="py-3 px-4 text-slate-500 dark:text-slate-400">${u.date}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-6 text-right">
            <button class="btn-edit-user p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors mr-1 cursor-pointer" data-id="${u.id}">
              ${renderIcon('Edit', 'w-4 h-4')}
            </button>
            <button class="btn-delete-user p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer" data-id="${u.id}">
              ${renderIcon('Trash2', 'w-4 h-4')}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Wire edit buttons
    tbody.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = usersList.find(x => x.id === btn.dataset.id);
        if (!u) return;
        openEditUserModal(u);
      });
    });

    // Wire delete buttons
    tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = usersList.find(x => x.id === btn.dataset.id);
        if (!u) return;
        openDeleteUserModal(u);
      });
    });
  }

  renderUsersTable();

  // Search input binding
  container.querySelector('#user-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderUsersTable();
  });

  // Tab filtering
  container.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.admin-tab-btn').forEach(b => {
        b.className = 'admin-tab-btn py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer';
      });
      btn.className = 'admin-tab-btn py-3 border-b-2 border-[#132e4f] text-[#132e4f] dark:border-blue-400 dark:text-blue-400 font-semibold cursor-pointer';
      currentTab = btn.dataset.tab;
      renderUsersTable();
    });
  });

  // Accordion toggle for Herramientas
  const accToggle = container.querySelector('#tools-accordion-toggle');
  const accContent = container.querySelector('#tools-accordion-content');
  const accChevron = container.querySelector('#tools-accordion-chevron');
  if (accToggle && accContent) {
    accToggle.addEventListener('click', () => {
      accContent.classList.toggle('hidden');
      accChevron?.classList.toggle('rotate-180');
    });
  }

  // Drawer: Nuevo Usuario
  const drawerNewUser = container.querySelector('#drawer-new-user');
  const btnOpenDrawer = container.querySelector('#btn-open-new-user-drawer');
  const btnCloseDrawer = container.querySelector('#btn-close-new-user-drawer');
  const btnCancelDrawer = container.querySelector('#btn-cancel-new-user-drawer');
  const backdropDrawer = container.querySelector('#drawer-new-user-backdrop');

  const openDrawer = () => drawerNewUser?.classList.remove('hidden');
  const closeDrawer = () => drawerNewUser?.classList.add('hidden');

  btnOpenDrawer?.addEventListener('click', openDrawer);
  btnCloseDrawer?.addEventListener('click', closeDrawer);
  btnCancelDrawer?.addEventListener('click', closeDrawer);
  backdropDrawer?.addEventListener('click', closeDrawer);

  // Form: Nuevo Usuario
  container.querySelector('#form-new-user')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#nu-name').value;
    const email = container.querySelector('#nu-email').value;
    const role = container.querySelector('input[name="nu-role"]:checked').value;

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role,
      date: 'Hoy',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    };

    usersList.unshift(newUser);
    closeDrawer();
    renderUsersTable();
    showToast(`Usuario "${name}" creado exitosamente`, 'success');
  });

  // Modal: Editar Usuario
  const modalEdit = container.querySelector('#modal-edit-user');
  const closeEditModal = () => modalEdit?.classList.add('hidden');

  container.querySelector('#btn-close-edit-user-modal')?.addEventListener('click', closeEditModal);
  container.querySelector('#btn-cancel-edit-user')?.addEventListener('click', closeEditModal);
  container.querySelector('#modal-edit-user-backdrop')?.addEventListener('click', closeEditModal);

  function openEditUserModal(user) {
    if (!modalEdit) return;
    container.querySelector('#eu-id').value = user.id;
    container.querySelector('#eu-name').value = user.name;
    container.querySelector('#eu-email').value = user.email;
    container.querySelector('#eu-role').value = user.role;
    modalEdit.classList.remove('hidden');
  }

  container.querySelector('#form-edit-user')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#eu-id').value;
    const name = container.querySelector('#eu-name').value;
    const email = container.querySelector('#eu-email').value;
    const role = container.querySelector('#eu-role').value;

    const user = usersList.find(u => u.id === id);
    if (user) {
      user.name = name;
      user.email = email;
      user.role = role;
      closeEditModal();
      renderUsersTable();
      showToast(`Usuario "${name}" actualizado`, 'success');
    }
  });

  // Modal: Eliminar Usuario
  const modalDelete = container.querySelector('#modal-delete-user');
  let userToDeleteId = null;

  const closeDeleteModal = () => modalDelete?.classList.add('hidden');

  container.querySelector('#btn-close-delete-user-modal')?.addEventListener('click', closeDeleteModal);
  container.querySelector('#btn-cancel-delete-user')?.addEventListener('click', closeDeleteModal);
  container.querySelector('#modal-delete-user-backdrop')?.addEventListener('click', closeDeleteModal);

  function openDeleteUserModal(user) {
    if (!modalDelete) return;
    userToDeleteId = user.id;
    container.querySelector('#du-name').textContent = user.name;
    container.querySelector('#du-email').textContent = user.email;
    container.querySelector('#du-avatar').src = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
    modalDelete.classList.remove('hidden');
  }

  container.querySelector('#btn-confirm-delete-user')?.addEventListener('click', () => {
    if (userToDeleteId) {
      usersList = usersList.filter(u => u.id !== userToDeleteId);
      closeDeleteModal();
      renderUsersTable();
      showToast('Usuario eliminado del sistema', 'info');
    }
  });
}

export default renderAdminDashboard;
