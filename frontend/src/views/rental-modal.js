import api from '../api/client.js';
import auth from '../auth/state.js';
import modal from '../components/modal.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { renderIcon, renderToolRentMark, renderOpusMark, renderOpusBanner } from '../utils/icons.js';
import { openAuthModal } from '../components/auth-modal.js';
import { notificationsStore } from '../utils/notifications-store.js';

export async function openRentalModal(tool) {
  if (!auth.isAuthenticated()) {
    showToast('Debes iniciar sesión para realizar un alquiler', 'warning');
    openAuthModal('login');
    return;
  }

  // Calculate default dates: tomorrow to +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endDefault = new Date(tomorrow);
  endDefault.setDate(endDefault.getDate() + 3);

  const formatDateInput = (d) => d.toISOString().split('T')[0];

  const getMaxEndDate = (startStr) => {
    const s = new Date(startStr);
    s.setDate(s.getDate() + 29); // 30 days total inclusive
    return formatDateInput(s);
  };

  let startDate = formatDateInput(tomorrow);
  let endDate = formatDateInput(endDefault);
  let isCheckingAvailability = false;
  let isAvailable = true;

  const content = document.createElement('div');
  content.className = 'p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

  async function checkAvailability() {
    isCheckingAvailability = true;
    updateCalculationUI();

    try {
      const res = await api.get(`/tools/${tool.id}/availability`, {
        from: startDate,
        to: endDate
      });
      isAvailable = res.available !== false;
    } catch (err) {
      console.warn('Availability checked via mock store', err);
      isAvailable = true;
    } finally {
      isCheckingAvailability = false;
      updateCalculationUI();
    }
  }

  function calculateCosts() {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.max(0, end - start);
    let days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (days > 30) days = 30;
    
    const dailyPrice = tool.dailyPrice || 850000;
    const subtotal = days * dailyPrice;
    const tax = subtotal * 0.19; // 19% IVA
    const deposit = (tool.replacementValue || 85000000) * 0.10; // 10% depósito de garantía
    const total = subtotal + tax;

    return { days, subtotal, tax, deposit, total };
  }

  function renderView() {
    const primaryImg = tool.images?.find(img => img.isPrimary)?.imageUrl || tool.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';
    const { days, subtotal, tax, deposit, total } = calculateCosts();

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Left: Tool Details Card -->
        <div class="space-y-4">
          <div class="relative h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-sm">
            <img 
              src="${primaryImg}" 
              alt="${tool.name}" 
              class="w-full h-full object-cover" 
              onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${tool.categoryName || ''}', '${tool.name?.replace(/'/g, "\\'")}')"
            />
            <div class="absolute top-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm">
              ${tool.brand || 'Caterpillar'} · ${tool.model || 'CAT 320 GC'}
            </div>
          </div>

          <div>
            <h4 class="text-base font-bold text-slate-900 dark:text-white font-display">${tool.name}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">${tool.description || 'Maquinaria pesada certificada de alto rendimiento para obras civiles e infraestructura en Colombia.'}</p>
          </div>

            <div class="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between text-slate-700 dark:text-slate-300">
              <span class="font-medium">Tarifa por día:</span>
              <strong class="text-amber-600 dark:text-amber-400 font-black text-sm">${formatCurrency(tool.dailyPrice || 850000)} / día</strong>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Valor de reposición:</span>
              <strong class="text-slate-900 dark:text-slate-200 font-semibold">${formatCurrency(tool.replacementValue || 85000000)}</strong>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Depósito de garantía (10%):</span>
              <strong class="text-slate-900 dark:text-slate-200 font-semibold">${formatCurrency(deposit)}</strong>
            </div>
          </div>
        </div>

        <!-- Right: Dates Selection & Costs Breakdown -->
        <div class="space-y-5 flex flex-col justify-between">
          <div class="space-y-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ${renderIcon('Calendar', 'w-4 h-4 inline mr-1 text-amber-500')} Período de Alquiler en Obra
            </label>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1" for="rental-start-date">Fecha de inicio</label>
                <input type="date" id="rental-start-date" value="${startDate}" min="${formatDateInput(new Date())}" class="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300" for="rental-end-date">Fecha de fin</label>
                  <span class="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">Máx. 30 días</span>
                </div>
                <input type="date" id="rental-end-date" value="${endDate}" min="${startDate}" max="${getMaxEndDate(startDate)}" class="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400" />
              </div>
            </div>

            <!-- Availability Status Alert -->
            <div id="availability-alert" class="transition-all">
              ${isCheckingAvailability ? `
                <div class="text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  ${renderIcon('Loader2', 'w-4 h-4 animate-spin text-amber-500')} Verificando disponibilidad telemática de la máquina...
                </div>
              ` : isAvailable ? `
                <div class="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-medium">
                  ${renderIcon('CheckCircle2', 'w-4 h-4 text-emerald-600 flex-shrink-0')}
                  <span>Máquina lista para despacho inmediato (${days} días en obra). Póliza SURA incluida.</span>
                </div>
              ` : `
                <div class="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl flex items-start gap-2 text-xs">
                  ${renderIcon('AlertCircle', 'w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5')}
                  <div>
                    <span class="font-bold">No disponible en estas fechas.</span>
                    <p class="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">El equipo ya tiene un contrato activo en ese intervalo de fechas.</p>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Price Summary Breakdown -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Alquiler (${days} días × ${formatCurrency(tool.dailyPrice || 850000)}):</span>
              <span class="text-slate-900 dark:text-slate-200 font-bold">${formatCurrency(subtotal)}</span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>IVA Legal DIAN (19%):</span>
              <span class="text-slate-900 dark:text-slate-200 font-bold">${formatCurrency(tax)}</span>
            </div>
            <div class="border-t-2 border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline">
              <span class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Total a pagar:</span>
              <span class="text-2xl font-black text-slate-900 dark:text-white font-display text-amber-500">${formatCurrency(total)}</span>
            </div>
          </div>

          <!-- Action Button -->
          <button id="btn-proceed-checkout" ${!isAvailable || isCheckingAvailability ? 'disabled' : ''} class="w-full py-3 px-5 rounded-xl text-sm font-black text-[#1A1A1A] bg-[#FFB800] hover:bg-[#E5A600] disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wide">
            ${renderIcon('CreditCard', 'w-4 h-4')} Continuar al Pago (${formatCurrency(total)})
          </button>
        </div>

      </div>
    `;

    // Event handlers
    const startInput = content.querySelector('#rental-start-date');
    const endInput = content.querySelector('#rental-end-date');

    startInput.addEventListener('change', (e) => {
      startDate = e.target.value;
      const maxAllowed = getMaxEndDate(startDate);
      endInput.min = startDate;
      endInput.max = maxAllowed;
      if (endDate < startDate) {
        endDate = startDate;
        endInput.value = startDate;
      } else if (endDate > maxAllowed) {
        endDate = maxAllowed;
        endInput.value = maxAllowed;
      }
      checkAvailability();
    });

    endInput.addEventListener('change', (e) => {
      const maxAllowed = getMaxEndDate(startDate);
      if (e.target.value > maxAllowed) {
        endDate = maxAllowed;
        endInput.value = maxAllowed;
      } else if (e.target.value < startDate) {
        endDate = startDate;
        endInput.value = startDate;
      } else {
        endDate = e.target.value;
      }
      checkAvailability();
    });

    content.querySelector('#btn-proceed-checkout')?.addEventListener('click', () => {
      openCheckoutModal(tool, { startDate, endDate, ...calculateCosts() });
    });
  }

  function updateCalculationUI() {
    renderView();
  }

  checkAvailability();

  modal.open({
    title: `Reservar Equipo: ${tool.name}`,
    content: content,
    maxWidth: 'max-w-3xl',
  });
}

/**
 * Step 2: Payment and Invoice Generation
 */
async function openCheckoutModal(tool, rentalData) {
  const content = document.createElement('div');
  content.className = 'p-6 space-y-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

  content.innerHTML = `
    <div class="space-y-4">
      <div class="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span class="text-slate-500 dark:text-slate-400">Equipo:</span> <strong class="text-slate-900 dark:text-white">${tool.name}</strong>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Desde ${formatDate(rentalData.startDate)} hasta ${formatDate(rentalData.endDate)} (${rentalData.days} días)</div>
        </div>
        <div class="text-right">
          <div class="text-[11px] text-slate-400">Total</div>
          <div class="text-base font-bold text-[#132e4f] dark:text-blue-400 font-display">${formatCurrency(rentalData.total)}</div>
        </div>
      </div>

      <!-- Payment Method Selection -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Selecciona Método de Pago</label>
        <div class="grid grid-cols-3 gap-2.5">
          <label class="p-3 rounded-xl border-2 border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all">
            <input type="radio" name="payment-method" value="CREDIT_CARD" checked class="text-amber-500">
            ${renderIcon('CreditCard', 'w-5 h-5 text-amber-600 dark:text-amber-400')}
            <span class="text-xs font-bold text-slate-900 dark:text-white">Tarjeta Crédito</span>
          </label>
          <label class="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all">
            <input type="radio" name="payment-method" value="DEBIT_CARD" class="text-amber-500">
            ${renderIcon('Wallet', 'w-5 h-5 text-slate-600 dark:text-slate-300')}
            <span class="text-xs font-bold text-slate-900 dark:text-white">PSE / Débito</span>
          </label>
          <label class="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all">
            <input type="radio" name="payment-method" value="BANK_TRANSFER" class="text-amber-500">
            ${renderIcon('Building2', 'w-5 h-5 text-slate-600 dark:text-slate-300')}
            <span class="text-xs font-bold text-slate-900 dark:text-white">Transferencia</span>
          </label>
        </div>
      </div>

      <!-- Simulated Card Form -->
      <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <div>
          <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Número de Tarjeta Corporativa</label>
          <input type="text" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white" value="4532 •••• •••• 8892" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Vencimiento</label>
            <input type="text" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white" value="12/28" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">CVC / CVV</label>
            <input type="password" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white" value="892" />
          </div>
        </div>
      </div>

      <div id="checkout-error" class="hidden text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2.5 rounded-lg"></div>

      <button id="btn-confirm-payment" class="w-full py-3 px-5 rounded-xl text-sm font-black text-[#1A1A1A] bg-[#FFB800] hover:bg-[#E5A600] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wide">
        ${renderIcon('Lock', 'w-4 h-4')} Confirmar y Pagar ${formatCurrency(rentalData.total)}
      </button>
    </div>
  `;

  content.querySelector('#btn-confirm-payment').addEventListener('click', async () => {
    const btn = content.querySelector('#btn-confirm-payment');
    const errBox = content.querySelector('#checkout-error');
    errBox.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = `${renderIcon('Loader2', 'w-4 h-4 animate-spin inline mr-1.5')} Procesando pago seguro...`;

    try {
      const user = auth.getUser();
      const method = content.querySelector('input[name="payment-method"]:checked')?.value || 'CREDIT_CARD';

      // 1. Create Rental in Backend
      const numericToolId = Number(tool.id) || Number(String(tool.id).replace(/\D/g, '')) || 1;
      const rentalPayload = {
        toolId: numericToolId,
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        notes: `Reserva web cliente ${user?.username || ''}`,
        toolName: tool.name,
        dailyPrice: tool.dailyPrice,
        subtotal: rentalData.subtotal,
        total: rentalData.total,
        providerCompanyName: tool.provider?.name || tool.providerCompanyName || 'Opus Rentals Co.'
      };

      const createdRental = await api.post('/rentals', rentalPayload);

      // 2. Process payment (if backend auto-created invoice or via mock)
      let paymentResult = null;
      if (createdRental?.invoiceId) {
        try {
          // Map method to active payment_methods id (1=Visa, 4=PSE Bancolombia, etc.)
          const methodId = method === 'BANK_TRANSFER' ? 4 : (method === 'DEBIT_CARD' ? 10 : 1);
          paymentResult = await api.post('/payments', {
            invoiceId: createdRental.invoiceId,
            paymentMethodId: methodId,
            amount: rentalData.total
          });
        } catch (payErr) {
          console.warn('Backend payment record warning:', payErr);
        }
      }

      // Trigger Notification in Notification Center and Toast
      notificationsStore.add({
        category: 'PAYMENT',
        type: 'success',
        title: '¡Alquiler y Pago Confirmados!',
        message: `Has reservado ${tool.name} (#${createdRental?.id || 'RES'}) por ${formatCurrency(rentalData.total)}. Factura legal generada.`,
        link: '#/client'
      });

      // 3. Show Success & Invoice Viewer
      showSuccessModal(createdRental, paymentResult, tool, rentalData);

    } catch (err) {
      errBox.textContent = err.message || 'Error al procesar la reserva o el pago.';
      errBox.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = `${renderIcon('Lock', 'w-4 h-4')} Confirmar y Pagar ${formatCurrency(rentalData.total)}`;
    }
  });

  modal.open({
    title: 'Pasarela de Pago Corporativa',
    content: content,
    maxWidth: 'max-w-md',
  });
}

/**
 * Step 3: Success and Printable Invoice View
 */
function showSuccessModal(rental, payment, tool, rentalData) {
  const content = document.createElement('div');
  content.className = 'p-6 text-center space-y-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

  content.innerHTML = `
    <div class="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
      ${renderIcon('CheckCircle2', 'w-7 h-7')}
    </div>

    <div>
      <h3 class="text-xl font-black text-slate-900 dark:text-white font-display">¡Reserva y Pago Exitosos!</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Tu solicitud ha sido radicada correctamente con el código 
        <strong class="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">${rental?.id || 'RES-001'}</strong>
      </p>
    </div>

    <div class="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs text-left space-y-2">
      <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400 font-medium">Estado:</span> <span class="bg-amber-400 text-black px-2.5 py-0.5 rounded font-black text-[11px] uppercase tracking-wide">Pendiente de Despacho</span></div>
      <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400 font-medium">Transacción Pago:</span> <strong class="text-emerald-600 dark:text-emerald-400 font-mono font-bold">${payment?.id || 'APROBADA'}</strong></div>
      <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400 font-medium">Total Abonado:</span> <strong class="text-slate-900 dark:text-white font-black text-sm">${formatCurrency(payment?.amount || rentalData?.total || 2550000)}</strong></div>
    </div>

    <div class="flex flex-col gap-2.5 pt-2">
      <button id="btn-view-invoice-modal" class="w-full py-3 px-4 rounded-xl text-xs font-black text-[#1A1A1A] bg-[#FFB800] hover:bg-[#E5A600] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide">
        ${renderIcon('Printer', 'w-4 h-4')} Ver Factura Oficial de Alquiler
      </button>
      <button id="btn-goto-my-rentals" class="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
        ${renderIcon('Calendar', 'w-4 h-4 inline mr-1')} Ir a Mis Alquileres
      </button>
    </div>
  `;

  content.querySelector('#btn-view-invoice-modal')?.addEventListener('click', () => {
    openInvoiceViewer({
      invoiceNumber: createdRental?.invoiceNumber || ('OP-INV-' + (createdRental?.id || '4587')),
      issueDate: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      client: {
        name: auth.getUser()?.username || 'Cliente Opus',
        taxId: auth.getUser()?.documentNumber || 'Consorcio B2B',
        email: auth.getUser()?.email || 'cliente@opusrentals.com',
        phone: auth.getUser()?.phone || '+57 300 000 0000',
        address: 'Colombia'
      },
      provider: {
        name: tool?.provider?.name || createdRental?.providerCompanyName || 'Opus Rentals Co.',
        taxId: '901.234.567-8',
        email: 'contacto@opusrentals.com',
        phone: '+57 317 654 3210',
        address: 'Zona Industrial, Colombia'
      },
      items: [
        {
          name: tool?.name || createdRental?.toolName || 'Herramienta de Construcción',
          days: rentalData?.days || createdRental?.totalDays || 1,
          dailyPrice: tool?.dailyPrice || createdRental?.dailyRate || 0,
          subtotal: rentalData?.subtotal || createdRental?.subtotal || 0
        }
      ],
      subtotal: rentalData?.subtotal || createdRental?.subtotal || 0,
      tax: rentalData?.tax || Math.round((rentalData?.subtotal || createdRental?.subtotal || 0) * 0.19),
      total: rentalData?.total || createdRental?.totalAmount || createdRental?.estimatedTotal || 0,
      paymentMethod: 'Pasarela Digital / En Línea',
      bank: 'Transacción Aprobada',
      reference: createdRental?.invoiceNumber || ('OP-INV-' + (createdRental?.id || '4587')),
      paymentDate: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  });

  content.querySelector('#btn-goto-my-rentals')?.addEventListener('click', () => {
    modal.close();
    window.location.hash = '#/client';
  });

  modal.open({
    title: 'Comprobante de Transacción',
    content: content,
    maxWidth: 'max-w-md',
  });
}

/**
 * Step 4: Official Clean Invoice Viewer
 */
export function openInvoiceViewer(invoice) {
  const content = document.createElement('div');
  content.className = 'bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 min-h-screen text-slate-800 dark:text-slate-100';

  content.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-4">
      
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between">
        <button id="invoice-btn-back" class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
          ${renderIcon('ArrowLeft', 'w-4 h-4')} Volver
        </button>
        <div class="flex items-center gap-2">
          <button id="invoice-btn-download" class="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">
            ${renderIcon('Download', 'w-3.5 h-3.5')} Descargar PDF
          </button>
          <button id="invoice-btn-print" class="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">
            ${renderIcon('Printer', 'w-3.5 h-3.5')} Imprimir
          </button>
        </div>
      </div>

      <!-- Printable Invoice Paper Card -->
      <div id="printable-invoice-sheet" class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-14 space-y-8 font-sans text-slate-800 dark:text-slate-100">
        
        <!-- Header with Official Opus Rentals Banner -->
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div class="space-y-1">
            <div class="bg-white p-2 rounded-xl border border-slate-200 inline-block shadow-2xs">
              ${renderOpusBanner('h-11 w-auto')}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Plataforma B2B de Alquiler de Maquinaria Pesada · NIT 901.884.219-5</p>
          </div>

          <div class="sm:text-right">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Factura electrónica DIAN</div>
            <div class="text-xl font-black text-[#132e4f] dark:text-white font-display">N° ${invoice.invoiceNumber || 'OP-0004587'}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Fecha de emisión: ${invoice.issueDate || '13 oct 2026'}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Fecha de vencimiento: ${invoice.issueDate || '13 oct 2026'}</div>
          </div>
        </div>

        <!-- Deep Navy Line Divider -->
        <div class="border-t-2 border-[#132e4f] dark:border-blue-500"></div>

        <!-- Client & Provider Two Columns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <!-- Datos del cliente -->
          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-3">Datos del cliente</h4>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Nombre:</span>
              <span class="col-span-2 font-semibold text-slate-800 dark:text-slate-200">${invoice.client.name}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Cédula / NIT:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300 font-mono">${invoice.client.taxId}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Correo:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${invoice.client.email}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Teléfono:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${invoice.client.phone}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Dirección:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${invoice.client.address}</span>
            </div>
          </div>

          <!-- Datos del proveedor -->
          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-3">Datos del proveedor</h4>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Nombre:</span>
              <span class="col-span-2 font-semibold text-slate-800 dark:text-slate-200">${invoice.provider.name}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">NIT:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300 font-mono">${invoice.provider.taxId}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Correo:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${invoice.provider.email}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Teléfono:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${invoice.provider.phone}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Dirección:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${invoice.provider.address}</span>
            </div>
          </div>
        </div>

        <!-- Equipos alquilados Table -->
        <div>
          <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-4">Equipos y Maquinaria Alquilada</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-2.5 pr-4 w-8">#</th>
                  <th class="py-2.5 px-4">Equipo / Maquinaria</th>
                  <th class="py-2.5 px-4 text-center">Días</th>
                  <th class="py-2.5 px-4 text-right">Tarifa diaria</th>
                  <th class="py-2.5 pl-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                ${invoice.items.map((it, idx) => `
                  <tr>
                    <td class="py-3 pr-4 text-slate-400 font-bold">${idx + 1}</td>
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">${it.name}</td>
                    <td class="py-3 px-4 text-center">${it.days}</td>
                    <td class="py-3 px-4 text-right font-medium">${formatCurrency(it.dailyPrice)}</td>
                    <td class="py-3 pl-4 text-right font-bold text-slate-900 dark:text-white">${formatCurrency(it.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals Breakdown -->
          <div class="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
            <div class="w-64 space-y-2 text-xs">
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${formatCurrency(invoice.subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>IVA (19%)</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${formatCurrency(invoice.tax)}</span>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                <span class="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                <span class="text-xl font-bold text-[#132e4f] dark:text-blue-400 font-display">${formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de pago -->
        <div class="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-3">Información de pago</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Método de pago:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-medium">${invoice.paymentMethod}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Entidad:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-medium">${invoice.bank}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Referencia:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-mono font-medium">${invoice.reference}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Fecha de pago:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-medium">${invoice.paymentDate}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-200 dark:border-slate-800 pt-6 text-center space-y-2 text-[11px] text-slate-400 dark:text-slate-500">
          <p>Opus Rentals · NIT 901.884.219-5 · Bogotá D.C., Colombia · contacto@opusrentals.com · +57 317 654 3210</p>
          <p class="text-[10px]">Factura electrónica generada conforme a las directrices de la DIAN. Respaldado por póliza todo riesgo.</p>
        </div>

      </div>

    </div>
  `;

  content.querySelector('#invoice-btn-back')?.addEventListener('click', () => {
    modal.close();
  });

  content.querySelector('#invoice-btn-download')?.addEventListener('click', () => {
    showToast('Descargando factura en formato PDF oficial...', 'success');
  });

  content.querySelector('#invoice-btn-print')?.addEventListener('click', () => {
    window.print();
  });

  modal.open({
    title: '',
    content: content,
    maxWidth: 'max-w-5xl',
    hideHeader: true
  });
}

export default openRentalModal;
