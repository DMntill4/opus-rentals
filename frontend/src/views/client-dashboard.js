import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate, getRentalStatusBadge } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { openAuthModal } from '../components/auth-modal.js';
import { openInvoiceViewer } from './rental-modal.js';
import { renderTableSkeleton } from '../components/system-states.js';
import modal from '../components/modal.js';

export async function renderClientDashboard() {
  const container = document.getElementById('app-content');
  if (!container) return;

  if (!auth.isAuthenticated()) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-10 max-w-lg mx-auto shadow-sm space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-[#132e4f]/10 dark:bg-blue-950/40 text-[#132e4f] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto">
            ${renderIcon('Lock', 'w-7 h-7')}
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white font-display">Inicia Sesión para ver tus Contratos</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Accede a tus actas de entrega en obra, liquidaciones telemáticas y facturación DIAN.</p>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button id="btn-demo-client-login" class="btn-primary flex-1 !py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-sm">
              ${renderIcon('UserCheck', 'w-4 h-4')} Entrar como Cliente (Demo)
            </button>
            <button id="btn-login-prompt" class="btn-secondary flex-1 !py-2.5 text-xs flex items-center justify-center gap-1.5">
              ${renderIcon('LogIn', 'w-4 h-4')} Iniciar Sesión
            </button>
          </div>
        </div>
      </section>
    `;
    container.querySelector('#btn-demo-client-login')?.addEventListener('click', () => {
      auth.setSession({
        token: 'demo-client-jwt',
        user: { username: 'carlos.mendoza', roles: ['ROLE_CLIENTE'], profile: { name: 'Carlos Mendoza - Obras Bogotá', id: 'client-001' } }
      });
      showToast('Sesión iniciada como Cliente', 'success');
      renderClientDashboard();
    });
    container.querySelector('#btn-login-prompt')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  const user = auth.getUser();

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <!-- Dashboard Header -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#132e4f]/10 dark:bg-blue-950/40 text-[#132e4f] dark:text-blue-400 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-800 font-mono">
              ${renderIcon('UserCheck', 'w-3.5 h-3.5')} Portal Constructor · Opus Rentals
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
              Mis Contratos y Maquinaria en Obra
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Supervisa el estado de entrega de tus herramientas, fechas de vigencia y comprobantes fiscales.
            </p>
          </div>

          <a href="#/catalog" class="btn-primary !py-2.5 text-xs font-semibold shadow-sm flex items-center gap-1.5">
            ${renderIcon('PlusCircle', 'w-4 h-4')} Nuevo Alquiler
          </a>
        </div>

        <!-- Rentals List / Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              ${renderIcon('ListOrdered', 'w-4 h-4 text-[#132e4f] dark:text-blue-400')} Historial de Transacciones
            </h3>
            <button id="btn-refresh-rentals" class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium cursor-pointer">
              ${renderIcon('RefreshCw', 'w-3.5 h-3.5')} Actualizar
            </button>
          </div>

          <div id="client-rentals-container" class="divide-y divide-slate-100 dark:divide-slate-800">
            ${renderTableSkeleton(4)}
          </div>
        </div>

      </div>
    </div>
  `;

  const rentalsContainer = container.querySelector('#client-rentals-container');
  const refreshBtn = container.querySelector('#btn-refresh-rentals');
  if (refreshBtn) refreshBtn.addEventListener('click', loadClientRentals);

  async function loadClientRentals() {
    try {
      // 1. Fetch live client rentals from Spring Boot endpoint /rentals/my-rentals
      let rentals = [];
      try {
        rentals = await api.get('/rentals/my-rentals');
      } catch (e) {
        const clientId = user.profile?.id || user.id;
        rentals = await api.get(`/rentals/client/${clientId}`);
      }

      if (!rentals || rentals.length === 0) {
        rentalsContainer.innerHTML = `
          <div class="py-16 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              ${renderIcon('CalendarX', 'w-6 h-6')}
            </div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">No tienes alquileres registrados todavía</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Explora nuestro catálogo para reservar maquinaria y herramientas de construcción con entrega garantizada.</p>
            <a href="#/catalog" class="btn-primary !py-2 text-xs inline-flex mt-2">
              Explorar Catálogo
            </a>
          </div>
        `;
        return;
      }

      rentalsContainer.innerHTML = rentals.map(rental => {
        const isPending = rental.status === 'PENDING';
        const toolName = rental.toolName || rental.items?.[0]?.toolName || 'Maquinaria Industrial';
        const dailyRate = rental.dailyRate || rental.items?.[0]?.dailyPrice || 0;
        const days = rental.totalDays || 1;
        
        // Exact transaction value: (Days * Daily Rate) + 19% IVA, disregarding deposit inflation
        const baseSubtotal = rental.subtotal || (days * dailyRate);
        const total = Math.round(baseSubtotal * 1.19);

        return `
          <div class="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
            
            <!-- Rental Info -->
            <div class="space-y-2 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  #${rental.id}
                </span>
                ${getRentalStatusBadge(rental.status)}
                <span class="text-xs text-slate-400 dark:text-slate-500">
                  Creada el ${formatDate(rental.createdAt ? String(rental.createdAt).split('T')[0] : '2026-10-14')}
                </span>
              </div>

              <!-- Dates and Items -->
              <div class="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div class="flex items-center gap-1.5">
                  ${renderIcon('Calendar', 'w-4 h-4 text-[#132e4f] dark:text-blue-400')}
                  <span>Vigencia: <strong>${formatDate(rental.startDate)}</strong> hasta <strong>${formatDate(rental.endDate)}</strong></span>
                </div>
                <div class="flex items-center gap-1.5">
                  ${renderIcon('Layers', 'w-4 h-4 text-[#132e4f] dark:text-blue-400')}
                  <span>Duración: <strong>${rental.totalDays || 1} día(s)</strong></span>
                </div>
              </div>

              <!-- Items list -->
              <div class="flex flex-wrap gap-2 pt-1">
                <span class="inline-flex items-center gap-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 font-medium">
                  ${renderIcon('Check', 'w-3 h-3 text-emerald-600')} ${toolName} (${formatCurrency(dailyRate)}/día)
                </span>
                ${rental.providerCompanyName ? `
                  <span class="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg text-[#132e4f] dark:text-blue-300 font-medium">
                    ${renderIcon('Building2', 'w-3 h-3')} Proveedor: ${rental.providerCompanyName}
                  </span>
                ` : ''}
              </div>
            </div>

            <!-- Price & Action Buttons -->
            <div class="flex flex-row lg:flex-col items-end justify-between w-full lg:w-auto gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
              <div class="text-left lg:text-right">
                <span class="text-[10px] text-slate-400 dark:text-slate-500 block font-medium uppercase tracking-wider">Total Transacción</span>
                <span class="text-lg font-bold text-slate-900 dark:text-white font-display">
                  ${formatCurrency(total)}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Check Invoice Button -->
                <button class="btn-check-invoice btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm cursor-pointer" data-rental-id="${rental.id}">
                  ${renderIcon('FileText', 'w-3.5 h-3.5 text-[#132e4f] dark:text-blue-400')} Ver Factura Oficial
                </button>

                <!-- Cancel Button if Pending -->
                ${isPending ? `
                  <button class="btn-cancel-rental !py-2 !px-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer" data-rental-id="${rental.id}">
                    ${renderIcon('XCircle', 'w-3.5 h-3.5')} Cancelar
                  </button>
                ` : ''}
              </div>
            </div>

          </div>
        `;
      }).join('');

      // Attach Actions
      rentalsContainer.querySelectorAll('.btn-check-invoice').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rentalId = btn.dataset.rentalId;
          const currentRental = rentals.find(r => String(r.id) === String(rentalId));

          let invoiceData = null;
          try {
            invoiceData = await api.get(`/invoices/rental/${rentalId}`);
          } catch (e) {
            console.warn('Could not fetch remote invoice, compiling from rental details', e);
          }

          openInvoiceViewer({
            invoiceNumber: invoiceData?.invoiceNumber || currentRental?.invoiceNumber || `OP-INV-${rentalId}`,
            issueDate: formatDate(invoiceData?.issueDate || currentRental?.createdAt || '2026-10-14'),
            client: {
              name: invoiceData?.clientFullName || currentRental?.clientFullName || user.profile?.fullName || user.username || 'Cliente Opus Rentals',
              taxId: invoiceData?.clientDocument || user.profile?.taxId || '1.032.456.789',
              email: invoiceData?.clientEmail || user.email || 'contacto@empresa.com',
              phone: user.profile?.phone || currentRental?.clientPhone || '+57 300 123 4567',
              address: user.profile?.address || 'Zona Industrial, Colombia'
            },
            provider: {
              name: invoiceData?.providerCompanyName || currentRental?.providerCompanyName || 'Equipos & Maquinaria Colombia S.A.S.',
              taxId: '901.234.567-8',
              email: 'proveedores@opusrentals.com',
              phone: '+57 317 654 3210',
              address: 'Av. Industrial # 45-12, Colombia'
            },
            items: [
              {
                name: invoiceData?.toolName || currentRental?.toolName || 'Maquinaria Pesada',
                days: invoiceData?.totalDays || currentRental?.totalDays || 1,
                dailyPrice: invoiceData?.dailyRate || currentRental?.dailyRate || 0,
                subtotal: invoiceData?.subtotal || currentRental?.subtotal || ((invoiceData?.dailyRate || currentRental?.dailyRate || 0) * (invoiceData?.totalDays || currentRental?.totalDays || 1))
              }
            ],
            subtotal: invoiceData?.subtotal || currentRental?.subtotal || ((invoiceData?.dailyRate || currentRental?.dailyRate || 0) * (invoiceData?.totalDays || currentRental?.totalDays || 1)),
            tax: invoiceData?.taxAmount || Math.round((invoiceData?.subtotal || currentRental?.subtotal || 0) * 0.19),
            total: invoiceData?.totalAmount || Math.round((invoiceData?.subtotal || currentRental?.subtotal || 0) * 1.19),
            paymentMethod: 'Pasarela Digital Opus Pay (PSE / Tarjeta)',
            bank: 'Bancolombia S.A.',
            reference: `TXN-OPUS-${rentalId}`,
            paymentDate: formatDate(invoiceData?.createdAt || currentRental?.createdAt || '2026-10-14')
          });
        });
      });

      rentalsContainer.querySelectorAll('.btn-cancel-rental').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rentalId = btn.dataset.rentalId;

          // Custom clean Modal Confirmation (NO browser alert/confirm)
          const confirmed = await modal.confirmDialog({
            title: 'Cancelar Solicitud de Alquiler',
            message: `¿Estás seguro de que deseas cancelar la solicitud de alquiler #${rentalId}? El equipo quedará liberado inmediatamente.`,
            confirmText: 'Sí, Cancelar Alquiler',
            cancelText: 'Volver',
            isDestructive: true
          });

          if (!confirmed) return;

          try {
            await api.patch(`/rentals/${rentalId}/status`, {
              status: 'CANCELLED',
              reason: 'Cancelado por el cliente desde el panel'
            });
            showToast('Alquiler cancelado correctamente', 'success');
            loadClientRentals();
          } catch (e) {
            // Fallback for legacy endpoints
            try {
              await api.patch(`/rentals/${rentalId}/cancel`);
              showToast('Alquiler cancelado correctamente', 'success');
              loadClientRentals();
            } catch (err) {
              showToast(err.message || 'Error al cancelar la reserva', 'error');
            }
          }
        });
      });

    } catch (err) {
      rentalsContainer.innerHTML = `
        <div class="p-8 text-center text-rose-500 text-xs">
          ${renderIcon('AlertCircle', 'w-6 h-6 mx-auto mb-2')}
          ${err.message || 'No fue posible cargar tu historial de alquileres'}
        </div>
      `;
    }
  }

  await loadClientRentals();
}

export default renderClientDashboard;
