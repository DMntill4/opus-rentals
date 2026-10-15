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
      <section class="min-h-[70vh] bg-[#f5f5f5] flex items-center justify-center p-4">
        <div class="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full shadow-sm text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            ${renderIcon('Lock', 'w-6 h-6')}
          </div>
          <h2 class="text-lg font-bold text-slate-900">Inicia sesión para ver tus alquileres</h2>
          <p class="text-xs text-slate-500">Consulta tus órdenes activas, fechas de entrega en obra y comprobantes fiscales.</p>
          <div class="flex flex-col gap-2 pt-2">
            <button id="btn-login-prompt" class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Iniciar Sesión
            </button>
            <button id="btn-demo-client-login" class="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">
              Entrar como Cliente (Demo)
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
    <div class="bg-[#f5f5f5] dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100 font-sans">
      
      <!-- Top Bar: Mercado Libre "Mis Compras" Style -->
      <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 shadow-2xs">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Mis Alquileres de Maquinaria
            </h1>
            <p class="text-xs text-slate-500 font-mono mt-0.5">
              Historial de órdenes, contratos en curso y facturación oficial
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-refresh-rentals" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              ${renderIcon('RefreshCw', 'w-3.5 h-3.5')} Actualizar
            </button>
            <a href="#/catalog" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
              ${renderIcon('PlusCircle', 'w-4 h-4')} Alquilar Nuevo Equipo
            </a>
          </div>
        </div>
      </div>

      <!-- Orders List Container -->
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div id="client-rentals-container" class="space-y-4">
          ${renderTableSkeleton(3)}
        </div>
      </div>

    </div>
  `;

  const rentalsContainer = container.querySelector('#client-rentals-container');
  const refreshBtn = container.querySelector('#btn-refresh-rentals');
  if (refreshBtn) refreshBtn.addEventListener('click', loadClientRentals);

  async function loadClientRentals() {
    try {
      let rentals = [];
      try {
        rentals = await api.get('/rentals/my-rentals');
      } catch (e) {
        const clientId = user.profile?.id || user.id;
        rentals = await api.get(`/rentals/client/${clientId}`);
      }

      if (!rentals || rentals.length === 0) {
        rentalsContainer.innerHTML = `
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              ${renderIcon('FileText', 'w-7 h-7')}
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Aún no tienes alquileres registrados</h3>
            <p class="text-xs text-slate-500">Explora nuestro catálogo para reservar maquinaria con entrega garantizada en tu frente de obra.</p>
            <a href="#/catalog" class="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold">
              Ir al Catálogo de Maquinaria
            </a>
          </div>
        `;
        return;
      }

      rentalsContainer.innerHTML = rentals.map(rental => {
        const isPending = rental.status === 'PENDING';
        const toolName = rental.toolName || rental.items?.[0]?.toolName || 'Maquinaria Pesada';
        const dailyRate = rental.dailyRate || rental.items?.[0]?.dailyPrice || 0;
        const days = rental.totalDays || 1;
        const baseSubtotal = rental.subtotal || (days * dailyRate);
        const total = Math.round(baseSubtotal * 1.19);

        return `
          <!-- Mercado Libre Style Order Card -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row justify-between gap-5 items-start md:items-center">
            
            <!-- Left: Order Info & Dates -->
            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-3 text-xs">
                <span class="font-mono font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Orden #${rental.id}
                </span>
                ${getRentalStatusBadge(rental.status)}
                <span class="text-slate-400 font-mono text-[11px]">
                  Fecha: ${formatDate(rental.createdAt ? String(rental.createdAt).split('T')[0] : '2026-10-14')}
                </span>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 flex-shrink-0">
                  ${renderIcon('Truck', 'w-6 h-6')}
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    ${toolName}
                  </h3>
                  <div class="text-xs text-slate-500 font-mono mt-0.5">
                    Tarifa: ${formatCurrency(dailyRate)}/día · Duración: ${days} día${days > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div class="text-xs text-slate-600 dark:text-slate-300 pt-1 flex flex-wrap gap-4">
                <span>Vigencia en obra: <strong>${formatDate(rental.startDate)}</strong> hasta <strong>${formatDate(rental.endDate)}</strong></span>
                ${rental.providerCompanyName ? `<span>Proveedor: <strong>${rental.providerCompanyName}</strong></span>` : ''}
              </div>
            </div>

            <!-- Right: Exact Total & Actions -->
            <div class="flex flex-row md:flex-col items-end justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div class="text-left md:text-right">
                <div class="text-[10px] text-slate-400 uppercase font-bold font-mono">Total Liquidado (IVA 19%)</div>
                <div class="text-xl font-black text-slate-900 dark:text-white font-mono">
                  ${formatCurrency(total)}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button class="btn-check-invoice px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs" data-rental-id="${rental.id}">
                  ${renderIcon('FileText', 'w-3.5 h-3.5 text-blue-600')} Ver Factura Oficial
                </button>

                ${isPending ? `
                  <button class="btn-cancel-rental px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer" data-rental-id="${rental.id}">
                    ${renderIcon('XCircle', 'w-3.5 h-3.5')} Cancelar
                  </button>
                ` : ''}
              </div>
            </div>

          </div>
        `;
      }).join('');

      // Invoice viewer handler
      rentalsContainer.querySelectorAll('.btn-check-invoice').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rentalId = btn.dataset.rentalId;
          const currentRental = rentals.find(r => String(r.id) === String(rentalId));

          let invoiceData = null;
          try {
            invoiceData = await api.get(`/invoices/rental/${rentalId}`);
          } catch (e) {
            console.warn('Could not fetch remote invoice, compiling fallback', e);
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

      // Cancel handler
      rentalsContainer.querySelectorAll('.btn-cancel-rental').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rentalId = btn.dataset.rentalId;
          const confirmed = await modal.confirm(
            '¿Deseas cancelar esta orden de alquiler? La maquinaria quedará liberada para otros frentes de obra.',
            'Confirmar Cancelación'
          );
          if (!confirmed) return;

          try {
            await api.post(`/rentals/${rentalId}/cancel`);
            showToast('Alquiler cancelado correctamente', 'success');
            loadClientRentals();
          } catch (e) {
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