import api from '../api/client.js';
import auth from '../auth/state.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate, getRentalStatusBadge, getPaymentStatusBadge } from '../utils/formatters.js';
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
      <section class="min-h-[70vh] bg-[#F4F5F7] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-sm text-center space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            ${renderIcon('Lock', 'w-7 h-7')}
          </div>
          <h2 class="text-xl font-black text-slate-900">Inicia sesión para ver tus alquileres</h2>
          <p class="text-xs text-slate-500 font-normal">Consulta tus órdenes activas en obra, fechas de entrega y facturación oficial DIAN.</p>
          <div class="flex flex-col gap-2 pt-2">
            <button id="btn-login-prompt" class="btn-primary w-full !py-3 text-xs font-black">
              Iniciar Sesión
            </button>
            <button id="btn-demo-client-login" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">
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
    <div class="bg-[#F4F5F7] min-h-screen pb-16 text-[#1A1A1A] font-sans">
      
      <!-- Top Bar: Mis Alquileres -->
      <div class="bg-white border-b border-slate-200 py-4 shadow-2xs">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">Gestión de Obra B2B</span>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Mis Alquileres de Maquinaria
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-refresh-rentals" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              ${renderIcon('RefreshCw', 'w-3.5 h-3.5')} Actualizar
            </button>
            <a href="#/catalog" class="btn-primary !px-4 !py-2 text-xs font-black shadow-xs flex items-center gap-1.5">
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
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              ${renderIcon('FileText', 'w-7 h-7')}
            </div>
            <h3 class="text-base font-black text-slate-900">Aún no tienes alquileres registrados</h3>
            <p class="text-xs text-slate-500 font-normal">Explora nuestro catálogo para reservar maquinaria con entrega garantizada en tu frente de obra.</p>
            <a href="#/catalog" class="btn-primary !px-5 !py-2.5 text-xs font-black inline-block">
              Ir al Catálogo de Maquinaria
            </a>
          </div>
        `;
        return;
      }

function renderOrderTimeline(rental) {
  if (rental.status === 'CANCELLED') {
    return `
      <div class="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
        ${renderIcon('XCircle', 'w-4 h-4 flex-shrink-0')}
        <span><strong>Orden Cancelada:</strong> Esta reserva fue anulada y el inventario de maquinaria ha sido liberado para otros frentes de obra.</span>
      </div>
    `;
  }

  let activeStep = 1;
  if (rental.status === 'APPROVED') activeStep = 2;
  else if (rental.status === 'DISPATCHED' || rental.status === 'IN_TRANSIT') activeStep = 3;
  else if (rental.status === 'IN_PROGRESS' || rental.status === 'ACTIVE') activeStep = 4;
  else if (rental.status === 'RETURNED' || rental.status === 'COMPLETED') activeStep = 5;

  const steps = [
    { num: 1, label: 'Radicado & Pago', sub: 'Confirmado' },
    { num: 2, label: 'Aprobado Proveedor', sub: 'Alistamiento' },
    { num: 3, label: 'Cama Baja', sub: 'En tránsito' },
    { num: 4, label: 'En Frente de Obra', sub: 'Operativo' },
    { num: 5, label: 'Devolución', sub: 'Inspección Final' }
  ];

  return `
    <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">
          Seguimiento de Despacho & Obra (Tiempo Real)
        </span>
        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeStep >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-[#FF7A00]'}">
          ${activeStep === 5 ? 'Contrato Finalizado' : (activeStep >= 4 ? 'En Operación en Obra' : (activeStep >= 2 ? 'En Alistamiento / Ruta' : 'En Espera de Proveedor'))}
        </span>
      </div>

      <!-- Modern Temu / Amazon Stepper -->
      <div class="relative flex items-center justify-between w-full pt-2 pb-1">
        <!-- Progress Bar Background Line -->
        <div class="absolute left-4 right-4 top-6 h-1 bg-slate-200 dark:bg-slate-700 -z-0"></div>
        <!-- Active Progress Line -->
        <div class="absolute left-4 top-6 h-1 bg-gradient-to-r from-emerald-500 via-[#FF7A00] to-orange-500 -z-0 transition-all duration-500" style="width: calc((100% - 2rem) * ${(activeStep - 1) / (steps.length - 1)})"></div>

        ${steps.map((st) => {
          const isDone = st.num < activeStep;
          const isCurrent = st.num === activeStep;

          let circleClass = 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-2 border-slate-300 dark:border-slate-600';
          if (isDone) {
            circleClass = 'bg-emerald-500 text-white border-2 border-emerald-400 shadow-sm';
          } else if (isCurrent) {
            circleClass = 'bg-[#FF7A00] text-white border-2 border-white dark:border-slate-900 ring-4 ring-[#FF7A00]/30 shadow-md animate-pulse';
          }

          return `
            <div class="relative z-10 flex flex-col items-center text-center">
              <div class="w-8 h-8 rounded-full ${circleClass} flex items-center justify-center text-xs font-black transition-all">
                ${isDone ? renderIcon('Check', 'w-4 h-4 stroke-[3]') : st.num}
              </div>
              <span class="text-[10px] font-bold mt-1.5 leading-tight ${isCurrent ? 'text-slate-900 dark:text-white font-black' : (isDone ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400')}">
                ${st.label}
              </span>
              <span class="text-[9px] font-mono text-slate-400 mt-0.5 hidden sm:block">
                ${st.sub}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function openClaimModal(rental, onSubmitted) {
  const content = document.createElement('div');
  content.className = 'p-6 space-y-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900';

  const toolName = rental.toolName || rental.items?.[0]?.toolName || 'Equipo';

  const maxRefund = rental.totalAmount || rental.total || rental.estimatedTotal || (rental.subtotal ? Math.round(rental.subtotal * 1.19) : 4462500);

  content.innerHTML = `
    <div class="space-y-4">
      <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1">
        <div class="font-bold text-amber-900 dark:text-amber-300">Orden #${rental.id} · ${toolName}</div>
        <div class="text-[11px] text-amber-800 dark:text-amber-400">Proveedor: <strong>${rental.providerCompanyName || 'Proveedor Opus'}</strong> · Total Facturado: <strong>${formatCurrency(maxRefund)}</strong></div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Solicitud / Novedad *</label>
        <select id="claim-type" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]">
          <option value="WARRANTY_REPLACEMENT">Garantía Técnica - Falla en Obra / Solicitud de Reemplazo</option>
          <option value="DAMAGE_REPORT">Reporte de Siniestro o Avería de la Maquinaria</option>
          <option value="REFUND_REQUEST">Solicitud de Reembolso Parcial o Total</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Motivo / Asunto de la Reclamación *</label>
        <input type="text" id="claim-reason" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" placeholder="Ej: Falla hidráulica del brazo, motor no enciende..." required />
      </div>

      <div id="refund-amount-group" class="hidden space-y-1.5 p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">Monto de Reembolso Solicitado (COP) *</label>
          <span class="text-[10px] font-mono font-bold text-[#FF7A00]">Máx: ${formatCurrency(maxRefund)}</span>
        </div>
        <div class="flex gap-2">
          <input 
            type="number" 
            id="claim-amount" 
            min="1000" 
            max="${maxRefund}" 
            class="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold" 
            placeholder="Ej: ${Math.round(maxRefund / 2)}" 
          />
          <button 
            type="button" 
            id="btn-claim-max-amount" 
            class="px-2.5 py-1 text-[11px] font-black rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 hover:bg-orange-200 cursor-pointer whitespace-nowrap"
          >
            100% Total
          </button>
        </div>
        <p class="text-[10px] text-slate-500">El valor solicitado no puede superar el total pagado de la orden (${formatCurrency(maxRefund)}).</p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción Detallada de los Hechos en Obra *</label>
        <textarea id="claim-desc" rows="3" class="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]" placeholder="Describe qué ocurrió con la maquinaria en el frente de obra, horómetro de falla o motivo de la reclamación..."></textarea>
      </div>

      <!-- Mandatory Evidence Section -->
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Pruebas Técnicas & Evidencia de Falla en Obra *
        </label>
        <div class="space-y-2">
          <input 
            type="text" 
            id="claim-evidence-url" 
            class="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200" 
            placeholder="Enlace a fotos/video de la falla o informe de obra (Drive, Dropbox, Cloud)" 
          />
          <textarea 
            id="claim-evidence-notes" 
            rows="2" 
            class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#FF7A00]" 
            placeholder="Detalle de pruebas técnicas (ej: foto del horómetro con 12 hrs, fisura en manguera hidráulica, bitácora del ingeniero residente)..."
          ></textarea>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">Obligatorio: Toda solicitud de garantía o reembolso requiere soporte probatorio del frente de obra.</p>
      </div>

      <div id="claim-error" class="hidden text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200"></div>

      <div class="flex gap-2 pt-2">
        <button id="btn-submit-claim" class="btn-primary flex-1 !py-2.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer">
          ${renderIcon('CheckCircle2', 'w-4 h-4')} Radicar Solicitud Oficial
        </button>
      </div>
    </div>
  `;

  const typeSelect = content.querySelector('#claim-type');
  const amountGroup = content.querySelector('#refund-amount-group');
  const amountInput = content.querySelector('#claim-amount');
  
  content.querySelector('#btn-claim-max-amount')?.addEventListener('click', () => {
    if (amountInput) amountInput.value = maxRefund;
  });

  typeSelect?.addEventListener('change', () => {
    if (typeSelect.value === 'REFUND_REQUEST') {
      amountGroup?.classList.remove('hidden');
    } else {
      amountGroup?.classList.add('hidden');
    }
  });

  content.querySelector('#btn-submit-claim')?.addEventListener('click', async () => {
    const claimType = typeSelect?.value;
    const reason = content.querySelector('#claim-reason')?.value?.trim();
    const description = content.querySelector('#claim-desc')?.value?.trim();
    const amountVal = content.querySelector('#claim-amount')?.value;
    const evidenceUrl = content.querySelector('#claim-evidence-url')?.value?.trim();
    const evidenceNotes = content.querySelector('#claim-evidence-notes')?.value?.trim();
    const errBox = content.querySelector('#claim-error');
    errBox.classList.add('hidden');

    if (!reason || reason.length < 3) {
      errBox.textContent = 'Ingresa el motivo o asunto de la reclamación (al menos 3 caracteres).';
      errBox.classList.remove('hidden');
      return;
    }

    if (!description || description.length < 10) {
      errBox.textContent = 'Ingresa una descripción de al menos 10 caracteres explicando los hechos.';
      errBox.classList.remove('hidden');
      return;
    }

    if (claimType === 'REFUND_REQUEST') {
      const parsedAmount = parseFloat(amountVal);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        errBox.textContent = 'Ingresa un monto de reembolso válido mayor a cero.';
        errBox.classList.remove('hidden');
        return;
      }
      if (parsedAmount > maxRefund) {
        errBox.textContent = `El monto solicitado (${formatCurrency(parsedAmount)}) supera el valor total pagado del alquiler (${formatCurrency(maxRefund)}).`;
        errBox.classList.remove('hidden');
        return;
      }
    }

    if (!evidenceUrl && (!evidenceNotes || evidenceNotes.length < 10)) {
      errBox.textContent = 'Es obligatorio adjuntar un enlace o describir las pruebas técnicas de la falla en obra (mínimo 10 caracteres).';
      errBox.classList.remove('hidden');
      return;
    }

    const payload = {
      claimType,
      reason,
      description,
      evidenceUrl: evidenceUrl || null,
      evidenceNotes: evidenceNotes || null,
      requestedAction: claimType === 'REFUND_REQUEST' ? 'PARTIAL_REFUND' : (claimType === 'DAMAGE_REPORT' ? 'TECHNICIAN_VISIT' : 'REPLACEMENT'),
      requestedAmount: claimType === 'REFUND_REQUEST' ? (parseFloat(amountVal) || null) : null
    };

    try {
      await api.post(`/rentals/${rental.id}/claims`, payload);
      showToast('Novedad y pruebas radicadas exitosamente. El equipo técnico y proveedor las revisarán.', 'success');
      modal.close();
      if (onSubmitted) onSubmitted();
    } catch (err) {
      errBox.textContent = err.message || 'Error al radicar la reclamación.';
      errBox.classList.remove('hidden');
    }
  });

  modal.open({
    title: `Radicar Novedad / Garantía: Orden #${rental.id}`,
    content,
    maxWidth: 'max-w-md'
  });
}

      rentalsContainer.innerHTML = rentals.map(rental => {
        const isPending = rental.status === 'PENDING';
        const isCancelled = rental.status === 'CANCELLED';
        const toolName = rental.toolName || rental.items?.[0]?.toolName || 'Maquinaria Pesada';
        const dailyRate = rental.dailyRate || rental.items?.[0]?.dailyPrice || 0;
        const days = rental.totalDays || 1;
        const units = rental.quantity || 1;
        const baseSubtotal = rental.subtotal || (days * dailyRate * units);
        const total = Math.round(baseSubtotal * 1.19);

        return `
          <!-- Order Card with Industrial Yellow & Slate Accents -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col gap-4">
            
            <div class="flex flex-col md:flex-row justify-between gap-5 items-start md:items-center">
              <div class="space-y-2 flex-1">
                <div class="flex flex-wrap items-center gap-2.5 text-xs">
                  <span class="font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Orden #${rental.id}
                  </span>
                  ${getRentalStatusBadge(rental.status)}
                  ${getPaymentStatusBadge(rental.invoiceStatus || (rental.status === 'APPROVED' ? 'PAID' : 'PENDING'))}
                  <span class="text-slate-400 font-mono text-[11px]">
                    Fecha: ${formatDate(rental.createdAt ? String(rental.createdAt).split('T')[0] : '2026-10-14')}
                  </span>
                </div>

                <div class="flex items-center gap-3 pt-1">
                  <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-800">
                    ${renderIcon('Truck', 'w-6 h-6')}
                  </div>
                  <div>
                    <h3 class="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      ${toolName}
                    </h3>
                    <div class="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                      Unidades: <strong class="text-slate-900 dark:text-slate-200">${units}</strong> · Tarifa: ${formatCurrency(dailyRate)}/día · Duración: ${days} día${days > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div class="text-xs text-slate-600 dark:text-slate-400 pt-1 flex flex-wrap gap-4 font-normal">
                  <span>Vigencia en obra: <strong>${formatDate(rental.startDate)}</strong> hasta <strong>${formatDate(rental.endDate)}</strong></span>
                  ${rental.providerCompanyName ? `<span>Proveedor: <strong>${rental.providerCompanyName}</strong></span>` : ''}
                </div>

                ${isPending ? `
                  <div class="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 font-medium mt-1">
                    ${renderIcon('Clock', 'w-3.5 h-3.5 text-amber-600 flex-shrink-0')} 
                    Pago recibido. En espera de confirmación y despacho por parte de <strong>${rental.providerCompanyName || 'el proveedor'}</strong>.
                  </div>
                ` : (rental.status === 'APPROVED' ? `
                  <div class="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 font-medium mt-1">
                    ${renderIcon('CheckCircle2', 'w-3.5 h-3.5 text-emerald-600 flex-shrink-0')} 
                    ¡Reserva confirmada por el proveedor! Maquinaria programada para entrega en obra.
                  </div>
                ` : '')}
              </div>

              <!-- Right: Exact Total & Actions -->
              <div class="flex flex-row md:flex-col items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div class="text-left md:text-right">
                  <div class="text-[9px] text-slate-400 uppercase font-black font-mono">Total Liquidado (IVA 19%)</div>
                  <div class="text-xl font-black text-slate-900 dark:text-white font-mono">
                    ${formatCurrency(total)}
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button class="btn-check-invoice btn-dark !py-2 !px-3 text-xs flex items-center gap-1.5 cursor-pointer" data-rental-id="${rental.id}">
                    ${renderIcon('FileText', 'w-3.5 h-3.5 text-[#FFB800]')} Ver Factura Oficial
                  </button>

                  ${!isCancelled ? `
                    <button class="btn-open-claim px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-amber-200 dark:border-amber-800 transition-colors" data-rental-id="${rental.id}">
                      ${renderIcon('AlertTriangle', 'w-3.5 h-3.5 text-amber-600')} Novedad / Garantía
                    </button>
                  ` : ''}

                  ${isPending ? `
                    <button class="btn-cancel-rental px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900" data-rental-id="${rental.id}">
                      ${renderIcon('XCircle', 'w-3.5 h-3.5')} Cancelar
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Temu / Amazon Style Order Tracking Stepper -->
            ${renderOrderTimeline(rental)}

          </div>
        `;
      }).join('');

      rentalsContainer.querySelectorAll('.btn-open-claim').forEach(btn => {
        btn.addEventListener('click', () => {
          const rentalId = btn.dataset.rentalId;
          const currentRental = rentals.find(r => String(r.id) === String(rentalId));
          if (currentRental) {
            openClaimModal(currentRental, loadClientRentals);
          }
        });
      });

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

      rentalsContainer.querySelectorAll('.btn-cancel-rental').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rentalId = btn.dataset.rentalId;
          const confirmed = await modal.confirm(
            '¿Deseas cancelar esta orden de alquiler? La maquinaria quedará liberada para otros frentes de obra.',
            'Confirmar Cancelación'
          );
          if (!confirmed) return;

          try {
            await api.patch(`/rentals/${rentalId}/status`, { status: 'CANCELLED' });
            showToast('Alquiler cancelado correctamente', 'success');
            loadClientRentals();
          } catch (e) {
            try {
              await api.post(`/rentals/${rentalId}/cancel`);
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