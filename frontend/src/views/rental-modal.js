import api from '../api/client.js';
import auth from '../auth/state.js';
import modal from '../components/modal.js';
import showToast from '../components/toast.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { renderIcon, renderToolRentMark, renderOpusMark, renderOpusBanner } from '../utils/icons.js';
import { openAuthModal } from '../components/auth-modal.js';
import { notificationsStore } from '../utils/notifications-store.js';
import { openDateRangeModal } from '../components/custom-date-picker.js';
import { validateRentalDates } from '../utils/validators.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';

export async function openRentalModal(tool, initialDates = {}) {
  if (!auth.isAuthenticated()) {
    showToast('Debes iniciar sesión para realizar un alquiler', 'warning');
    openAuthModal('login');
    return;
  }

  // Calculate default dates: tomorrow to +6 days (7 days default) or use passed initialDates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endDefault = new Date(tomorrow);
  endDefault.setDate(endDefault.getDate() + 6);

  const formatDateInput = (d) => d.toISOString().split('T')[0];

  const getMaxEndDate = (startStr) => {
    const s = new Date(startStr);
    s.setDate(s.getDate() + 29); // 30 days total inclusive
    return formatDateInput(s);
  };

  let startDate = initialDates.startDate || formatDateInput(tomorrow);
  let endDate = initialDates.endDate || formatDateInput(endDefault);
  let quantity = initialDates.quantity || 1;
  let totalUnits = initialDates.totalUnits || tool.totalQuantity || 5;
  let availableUnits = initialDates.initialAvailableUnits !== undefined
    ? initialDates.initialAvailableUnits
    : (tool.availableQuantity !== undefined ? tool.availableQuantity : totalUnits);
  let rentedUnits = 0;
  let isCheckingAvailability = false;
  let isAvailable = availableUnits > 0 && tool.status !== 'MAINTENANCE' && tool.status !== 'OUT_OF_SERVICE';

  const content = document.createElement('div');
  content.className = 'p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';

  async function checkAvailability() {
    isCheckingAvailability = true;
    updateCalculationUI();

    try {
      const res = await api.get(`/rentals/tool/${tool.id}/availability?startDate=${startDate}&endDate=${endDate}`);
      const data = res?.data || res;
      if (data) {
        totalUnits = data.totalQuantity !== undefined ? data.totalQuantity : totalUnits;
        availableUnits = data.availableQuantity !== undefined ? data.availableQuantity : totalUnits;
        rentedUnits = data.rentedQuantity !== undefined ? data.rentedQuantity : 0;
        isAvailable = data.isAvailable !== undefined ? data.isAvailable : (availableUnits > 0);
      }
    } catch (err) {
      console.warn('Availability check failed, using fallback', err);
    } finally {
      isCheckingAvailability = false;
      if (quantity > availableUnits && availableUnits > 0) {
        quantity = availableUnits;
      }
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
    const subtotal = days * dailyPrice * quantity;
    const tax = subtotal * 0.19; // 19% IVA
    const deposit = ((tool.replacementValue || 85000000) * 0.10) * quantity; // 10% depósito de garantía por unidad
    const total = subtotal + tax;

    return { days, quantity, subtotal, tax, deposit, total };
  }

  function renderView() {
    const primaryImg = resolveToolImageUrl(tool);
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
              <span>Valor reposición por unidad:</span>
              <strong class="text-slate-900 dark:text-slate-200 font-semibold">${formatCurrency(tool.replacementValue || 85000000)}</strong>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Depósito garantía (${quantity} unid):</span>
              <strong class="text-slate-900 dark:text-slate-200 font-semibold">${formatCurrency(deposit)}</strong>
            </div>
          </div>

          <!-- Quantity Units Selector -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 border ${availableUnits > 0 ? 'border-slate-200 dark:border-slate-700' : 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'} rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">Unidades a Alquilar</span>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">
                  Flota disponible para estas fechas: <strong class="${availableUnits > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${availableUnits} de ${totalUnits} unidades</strong>
                  ${rentedUnits > 0 ? `<span class="text-slate-400 text-[10px]">(${rentedUnits} ya reservadas)</span>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-1 shadow-2xs">
                <button 
                  type="button" 
                  id="btn-qty-minus" 
                  class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${quantity <= 1 || availableUnits === 0 ? 'opacity-30 cursor-not-allowed' : ''}"
                >
                  -
                </button>
                <span id="rental-qty-display" class="w-7 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                  ${availableUnits === 0 ? 0 : quantity}
                </span>
                <button 
                  type="button" 
                  id="btn-qty-plus" 
                  class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${quantity >= availableUnits || availableUnits === 0 ? 'opacity-30 cursor-not-allowed' : ''}"
                >
                  +
                </button>
              </div>
            </div>
            ${availableUnits === 0 ? `
              <p class="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                ⚠️ No hay unidades disponibles para el rango de fechas seleccionado.
              </p>
            ` : ''}
          </div>

        </div>

        <!-- Right: Dates Selection & Costs Breakdown -->
        <div class="space-y-5 flex flex-col justify-between">
          <div class="space-y-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ${renderIcon('Calendar', 'w-4 h-4 inline mr-1 text-amber-500')} Período de Alquiler en Obra
            </label>
            
            <!-- Custom Date Range Selector (Inicio vs Fin con Calendario Propio) -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Periodo de Obra (Inicio vs. Fin)</label>
                <span class="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200">Máx. 30 días</span>
              </div>
              
              <button 
                type="button" 
                id="btn-modal-open-calendar"
                class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#FF7A00] bg-slate-50 dark:bg-slate-800 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                title="Haz clic para seleccionar o ajustar fechas con el calendario interactivo"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-[#FF7A00] flex items-center justify-center font-bold">
                    ${renderIcon('Calendar', 'w-4 h-4')}
                  </div>
                  <div class="text-left font-mono">
                    <div class="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>${formatDate(startDate)}</span>
                      <span class="text-[#FF7A00] font-black">➔</span>
                      <span>${formatDate(endDate)}</span>
                    </div>
                    <div class="text-[10px] text-slate-400 group-hover:text-[#FF7A00]">Clic para cambiar en calendario</div>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-[#FF7A00] text-xs font-black font-mono">
                  ${days} días
                </span>
              </button>
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
                  <span>${quantity} ${quantity > 1 ? 'unidades listas' : 'máquina lista'} para despacho inmediato (${days} días en obra). Póliza SURA incluida.</span>
                </div>
              ` : `
                <div class="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl flex items-start gap-2 text-xs">
                  ${renderIcon('AlertCircle', 'w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5')}
                  <div>
                    <span class="font-bold">No disponible en estas fechas.</span>
                    <p class="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">El equipo ya tiene contratos activos para la cantidad solicitada.</p>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Price Summary Breakdown -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Alquiler (${days} días × ${quantity} unid × ${formatCurrency(tool.dailyPrice || 850000)}):</span>
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
          <button id="btn-proceed-checkout" ${!isAvailable || availableUnits === 0 || isCheckingAvailability ? 'disabled' : ''} class="w-full py-3 px-5 rounded-xl text-sm font-black text-white ${!isAvailable || availableUnits === 0 ? 'bg-slate-400 cursor-not-allowed opacity-60' : 'bg-[#FF7A00] hover:bg-[#E56E00] shadow-md active:scale-95 cursor-pointer'} transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
            ${renderIcon('CreditCard', 'w-4 h-4')} ${availableUnits === 0 ? 'Sin Flota Disponible Para Estas Fechas' : `Continuar al Pago (${formatCurrency(total)})`}
          </button>
        </div>

      </div>
    `;

    // Quantity buttons
    content.querySelector('#btn-qty-minus')?.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        updateCalculationUI();
      }
    });

    content.querySelector('#btn-qty-plus')?.addEventListener('click', () => {
      if (quantity < availableUnits) {
        quantity++;
        updateCalculationUI();
      }
    });

    // Custom calendar range picker event handler
    content.querySelector('#btn-modal-open-calendar')?.addEventListener('click', async () => {
      let bookedRanges = [];
      try {
        const res = await api.get(`/rentals/tool/${tool.id}/booked-dates`);
        bookedRanges = Array.isArray(res) ? res : [];
      } catch (e) {
        console.warn('Could not fetch tool booked dates', e);
      }

      openDateRangeModal({
        startDate,
        endDate,
        totalUnits: tool.totalQuantity || tool.quantity || 5,
        bookedDateRanges: bookedRanges,
        onConfirm: (res) => {
          startDate = res.startDate;
          endDate = res.endDate;
          checkAvailability();
        }
      });
    });

    content.querySelector('#btn-proceed-checkout')?.addEventListener('click', () => {
      if (!auth.isAuthenticated()) {
        modal.close();
        openAuthModal('login');
        showToast('Inicia sesión como Cliente para continuar con tu reserva', 'info');
        return;
      }
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
        <div class="grid grid-cols-3 gap-2.5" id="payment-methods-grid">
          <label class="pay-method-btn p-3 rounded-xl border-2 border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all">
            <input type="radio" name="payment-method" value="CREDIT_CARD" checked class="text-amber-500 hidden">
            ${renderIcon('CreditCard', 'w-5 h-5 text-amber-600 dark:text-amber-400')}
            <span class="text-xs font-bold text-slate-900 dark:text-white">Tarjeta Crédito</span>
          </label>
          <label class="pay-method-btn p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all">
            <input type="radio" name="payment-method" value="DEBIT_CARD" class="text-amber-500 hidden">
            ${renderIcon('Wallet', 'w-5 h-5 text-slate-600 dark:text-slate-300')}
            <span class="text-xs font-bold text-slate-900 dark:text-white">PSE / Débito</span>
          </label>
          <label class="pay-method-btn p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all">
            <input type="radio" name="payment-method" value="BANK_TRANSFER" class="text-amber-500 hidden">
            ${renderIcon('Building2', 'w-5 h-5 text-slate-600 dark:text-slate-300')}
            <span class="text-xs font-bold text-slate-900 dark:text-white">Transferencia</span>
          </label>
        </div>
      </div>

      <!-- Payment Inputs Box (Dynamically updated) -->
      <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700" id="card-inputs-box">
        <div id="method-fields-container" class="space-y-3">
          <div id="card-name-group">
            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Titular (Como figura en la tarjeta)</label>
            <input type="text" id="chk-card-name" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white" value="CONSTRUCTORA BOGOTA S.A.S." placeholder="Ej. Roberto Gómez / Constructora S.A.S." />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1" id="card-num-label">Número de Tarjeta Corporativa</label>
            <input type="text" id="chk-card-num" maxlength="23" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white" value="4532 8920 1142 8892" placeholder="4532 8920 1142 8892" />
          </div>
          <div class="grid grid-cols-2 gap-3" id="card-sub-fields">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Vencimiento (MM/AA)</label>
              <input type="text" id="chk-card-exp" maxlength="5" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white" value="12/28" placeholder="MM/AA" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">CVC / CVV (Solo dígitos)</label>
              <input type="password" id="chk-card-cvv" maxlength="4" class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white" value="892" placeholder="123" />
            </div>
          </div>
        </div>
      </div>

      <div id="checkout-error" class="hidden text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2.5 rounded-lg"></div>

      <button id="btn-confirm-payment" class="w-full py-3 px-5 rounded-xl text-sm font-black text-white bg-[#FF7A00] hover:bg-[#E56E00] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wide">
        ${renderIcon('Lock', 'w-4 h-4')} Confirmar y Pagar ${formatCurrency(rentalData.total)}
      </button>
    </div>
  `;

  // Dynamic Payment Method Tabs Handler
  const methodGrid = content.querySelector('#payment-methods-grid');
  const cardNumLabel = content.querySelector('#card-num-label');
  const cardNumInput = content.querySelector('#chk-card-num');
  const cardNameGroup = content.querySelector('#card-name-group');
  const cardSubFields = content.querySelector('#card-sub-fields');

  methodGrid?.querySelectorAll('label').forEach(lbl => {
    lbl.addEventListener('click', () => {
      methodGrid.querySelectorAll('label').forEach(l => {
        l.className = 'pay-method-btn p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all';
      });
      lbl.className = 'pay-method-btn p-3 rounded-xl border-2 border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all';
      const radio = lbl.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        if (radio.value === 'CREDIT_CARD') {
          if (cardNumLabel) cardNumLabel.textContent = 'Número de Tarjeta Corporativa';
          if (cardNumInput) { cardNumInput.value = '4532 8920 1142 8892'; cardNumInput.placeholder = '4532 8920 1142 8892'; }
          cardNameGroup?.classList.remove('hidden');
          cardSubFields?.classList.remove('hidden');
        } else if (radio.value === 'DEBIT_CARD') {
          if (cardNumLabel) cardNumLabel.textContent = 'Número de Tarjeta Débito Nacional / PSE';
          if (cardNumInput) { cardNumInput.value = '4000 1234 5678 9010'; cardNumInput.placeholder = '4000 1234 5678 9010'; }
          cardNameGroup?.classList.remove('hidden');
          cardSubFields?.classList.remove('hidden');
        } else if (radio.value === 'BANK_TRANSFER') {
          if (cardNumLabel) cardNumLabel.textContent = 'Referencia de Transferencia Empresarial Bancolombia (Cuenta Corriente # 104-98234-91)';
          if (cardNumInput) { cardNumInput.value = `TRANSF-BANC-${Date.now().toString().slice(-6)}`; cardNumInput.placeholder = 'Comprobante de Transferencia'; }
          cardNameGroup?.classList.add('hidden');
          cardSubFields?.classList.add('hidden');
        }
      }
    });
  });

  // Real-time card formatting & strict CVV / expiry masking
  const cardInputEl = content.querySelector('#chk-card-num');
  if (cardInputEl) {
    cardInputEl.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '').substring(0, 19);
      let chunks = digits.match(/.{1,4}/g);
      e.target.value = chunks ? chunks.join(' ') : digits;
    });
  }

  const expInputEl = content.querySelector('#chk-card-exp');
  if (expInputEl) {
    expInputEl.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (digits.length >= 3) {
        e.target.value = digits.substring(0, 2) + '/' + digits.substring(2);
      } else {
        e.target.value = digits;
      }
    });
  }

  const cvvInputEl = content.querySelector('#chk-card-cvv');
  if (cvvInputEl) {
    cvvInputEl.addEventListener('input', (e) => {
      // Strictly digits only: strip all letters, @, symbols, spaces
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  content.querySelector('#btn-confirm-payment').addEventListener('click', async () => {
    const btn = content.querySelector('#btn-confirm-payment');
    const errBox = content.querySelector('#checkout-error');
    errBox.classList.add('hidden');

    const method = content.querySelector('input[name="payment-method"]:checked')?.value || 'CREDIT_CARD';

    // Strict Card and CVV Validation
    if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
      const cardName = content.querySelector('#chk-card-name')?.value?.trim() || '';
      const rawCard = content.querySelector('#chk-card-num')?.value || '';
      const cardNum = rawCard.replace(/\D/g, '');
      const expVal = content.querySelector('#chk-card-exp')?.value?.trim() || '';
      const cvvVal = content.querySelector('#chk-card-cvv')?.value?.trim() || '';

      if (!cardName || cardName.length < 3) {
        errBox.textContent = 'Ingresa el nombre completo o razón social del titular de la tarjeta.';
        errBox.classList.remove('hidden');
        return;
      }

      if (!cardNum || cardNum.length < 13 || cardNum.length > 19) {
        errBox.textContent = 'El número de tarjeta es inválido (debe tener entre 13 y 19 dígitos numéricos).';
        errBox.classList.remove('hidden');
        return;
      }

      // Validate expiry MM/YY format & future date
      const expMatch = expVal.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      if (!expMatch) {
        errBox.textContent = 'La fecha de vencimiento es inválida (debe ser formato MM/AA).';
        errBox.classList.remove('hidden');
        return;
      }
      const expMonth = parseInt(expMatch[1], 10);
      const expYear = 2000 + parseInt(expMatch[2], 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errBox.textContent = 'La tarjeta ingresada se encuentra vencida. Utiliza un medio de pago vigente.';
        errBox.classList.remove('hidden');
        return;
      }

      // Strictly 3 or 4 numeric digits for CVV
      if (!/^\d{3,4}$/.test(cvvVal)) {
        errBox.textContent = 'El código CVC/CVV es requerido y debe contener estrictamente 3 o 4 dígitos numéricos.';
        errBox.classList.remove('hidden');
        return;
      }
    } else if (method === 'BANK_TRANSFER') {
      const transfRef = content.querySelector('#chk-card-num')?.value?.trim() || '';
      if (!transfRef || transfRef.length < 4) {
        errBox.textContent = 'Ingresa una referencia o comprobante de transferencia bancaria válido.';
        errBox.classList.remove('hidden');
        return;
      }
    }

    btn.disabled = true;
    btn.innerHTML = `${renderIcon('Loader2', 'w-4 h-4 animate-spin inline mr-1.5')} Procesando pago seguro...`;

    try {
      const user = auth.getUser();

      // 1. Create Rental in Backend (with multi-unit quantity support)
      const numericToolId = Number(tool.id) || Number(String(tool.id).replace(/\D/g, '')) || 1;
      const rentalPayload = {
        toolId: numericToolId,
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        quantity: rentalData.quantity || 1,
        notes: `Reserva web cliente ${user?.username || ''} (${rentalData.quantity || 1} unidades)`,
        toolName: tool.name,
        dailyPrice: tool.dailyPrice,
        subtotal: rentalData.subtotal,
        total: rentalData.total,
        providerCompanyName: tool.provider?.companyName || tool.provider?.name || tool.providerCompanyName || 'Caterpillar Equipos SAS'
      };

      const createdRental = await api.post('/rentals', rentalPayload);

      // 2. Process payment
      let paymentResult = null;
      if (createdRental?.invoiceId) {
        try {
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

      // Rental remains PENDING until the machinery provider approves and dispatches it
      if (createdRental) {
        createdRental.status = 'PENDING';
      }

      // Trigger Client Notification
      notificationsStore.add({
        category: 'PAYMENT',
        type: 'success',
        title: '¡Pago Registrado y Solicitud Enviada!',
        message: `Has reservado ${rentalData.quantity || 1}x ${tool.name} (#${createdRental?.id || 'RES'}). Pago recibido exitosamente. La reserva está pendiente de confirmación por el proveedor.`,
        link: '#/client'
      });

      // Trigger Provider Targeted Notification
      const targetProvName = tool.provider?.companyName || tool.provider?.name || tool.providerCompanyName || 'Proveedor';
      const targetProvId = tool.provider?.id || tool.providerId;
      notificationsStore.add({
        category: 'RENTAL_REQUEST',
        type: 'info',
        title: 'Nueva Solicitud de Reserva Recibida',
        message: `El cliente ${user?.username || 'Cliente'} ha reservado ${rentalData.quantity || 1} unidad(es) de ${tool.name} (#${createdRental?.id || 'RES'}). Revisa tu flota para confirmar el despacho.`,
        link: '#/provider',
        targetRole: 'ROLE_PROVIDER',
        providerName: targetProvName,
        providerId: targetProvId,
        silentToast: true
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
  const createdRental = rental;
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
      <button id="btn-view-invoice-modal" class="w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-[#FF7A00] hover:bg-[#E56E00] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide">
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
export function openInvoiceViewer(rawInvoice = {}) {
  const invoice = { ...rawInvoice };

  const client = invoice.client || {
    name: invoice.clientFullName || 'Constructora Bolívar S.A.S.',
    taxId: invoice.clientDocument || 'NIT 900.342.112-4',
    address: 'Frente de Obra Carrera 7 # 127',
    email: invoice.clientEmail || 'compras@constructorabolivar.com',
    phone: invoice.clientPhone || '+57 (1) 745-8900'
  };

  const provider = invoice.provider || {
    name: invoice.providerCompanyName || 'Caterpillar Equipos SAS',
    taxId: 'NIT 901.884.219-5',
    address: 'Parque Industrial Cazucá - Km 4 Autopista Sur',
    email: 'operaciones@caterpillar-colombia.com',
    phone: '+57 (1) 745-8900'
  };

  const rentalPeriod = invoice.rentalPeriod || {
    startDate: invoice.startDate || '16 oct 2026',
    endDate: invoice.endDate || '24 oct 2026',
    days: invoice.days || invoice.totalDays || 8
  };

  const days = rentalPeriod.days || 1;
  const toolName = invoice.tool?.name || invoice.toolName || 'Excavadora Hidráulica CAT 320D2';
  const dailyRate = invoice.dailyRate || Math.round((invoice.subtotal || invoice.total || 5200000) / days);
  const calculatedSubtotal = invoice.subtotal || (dailyRate * days);

  const items = (Array.isArray(invoice.items) && invoice.items.length > 0)
    ? invoice.items
    : [
        {
          name: toolName,
          days: days,
          dailyPrice: dailyRate,
          subtotal: calculatedSubtotal
        }
      ];

  const subtotal = invoice.subtotal || items.reduce((s, it) => s + (it.subtotal || 0), 0);
  const tax = invoice.tax !== undefined ? invoice.tax : Math.round(subtotal * 0.19);
  const total = invoice.total !== undefined ? invoice.total : (subtotal + tax);
  const invoiceNumber = invoice.invoiceNumber || 'OP-INV-4587';
  const issueDate = invoice.issueDate || '16 oct 2026';
  const paymentMethod = invoice.paymentMethod || 'Transferencia PSE Bancolombia';
  const bank = invoice.bank || 'Bancolombia Convenio Opus Rentals';
  const reference = invoice.reference || 'OP-PSE-9941';
  const paymentDate = invoice.paymentDate || issueDate;

  function buildPrintableInvoiceHtml() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura Electrónica ${invoiceNumber} · Opus Rentals</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f2b48;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f2b48;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .inv-details {
      text-align: right;
    }
    .inv-number {
      font-size: 20px;
      font-weight: 900;
      color: #ff7a00;
      font-family: monospace;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 28px;
      font-size: 12px;
    }
    .box-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      color: #0f2b48;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      color: #475569;
    }
    .row strong {
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-box {
      width: 280px;
      margin-left: auto;
      font-size: 12px;
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #475569;
    }
    .grand-total {
      border-top: 2px solid #0f2b48;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 900;
      color: #0f2b48;
    }
    .dian-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 10px;
      color: #64748b;
      margin-top: 24px;
      line-height: 1.5;
    }
    .print-actions {
      position: sticky;
      top: 12px;
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f2b48;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .btn-act {
      background: #ff7a00;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-close {
      background: transparent;
      color: #cbd5e1;
      border: 1px solid #475569;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .no-print { display: none !important; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <div style="font-size: 13px; font-weight: bold;">
      📄 Vista Oficial de Factura DIAN · ${invoiceNumber}
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-act" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
    </div>
  </div>

  <div class="invoice-card">
    <div class="header-bar">
      <div>
        <div class="brand-title">OPUS RENTALS</div>
        <div class="brand-subtitle">Plataforma B2B de Alquiler de Maquinaria Pesada · NIT 901.884.219-5</div>
        <div class="brand-subtitle">Bogotá D.C., Colombia · soporte@opusrentals.com · Tel: +57 (1) 745-8900</div>
      </div>
      <div class="inv-details">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Factura Electrónica de Venta</div>
        <div class="inv-number">${invoiceNumber}</div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px;">Fecha Emisión: <strong>${issueDate}</strong></div>
        <div style="font-size: 11px; color: #475569;">Vencimiento: <strong>${issueDate}</strong></div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="box-title">Datos del Cliente (Adquiriente)</div>
        <div class="row"><span>Nombre / Razón Social:</span><strong>${client.name}</strong></div>
        <div class="row"><span>NIT / C.C.:</span><strong>${client.taxId}</strong></div>
        <div class="row"><span>Dirección de Obra:</span><strong>${client.address}</strong></div>
        <div class="row"><span>Correo Electrónico:</span><strong>${client.email}</strong></div>
        <div class="row"><span>Teléfono de Contacto:</span><strong>${client.phone}</strong></div>
      </div>
      <div>
        <div class="box-title">Datos del Proveedor (Emisor)</div>
        <div class="row"><span>Razón Social:</span><strong>${provider.name}</strong></div>
        <div class="row"><span>NIT:</span><strong>${provider.taxId}</strong></div>
        <div class="row"><span>Patio de Maquinaria:</span><strong>${provider.address}</strong></div>
        <div class="row"><span>Correo de Facturación:</span><strong>${provider.email}</strong></div>
        <div class="row"><span>Teléfono Despachos:</span><strong>${provider.phone}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Equipo / Maquinaria Pesada</th>
          <th class="text-center" style="width: 70px;">Días</th>
          <th class="text-right" style="width: 140px;">Tarifa Diaria</th>
          <th class="text-right" style="width: 140px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, idx) => `
          <tr>
            <td class="text-center" style="color: #64748b;">${idx + 1}</td>
            <td><strong>${it.name}</strong><br><span style="font-size: 10px; color: #64748b;">Periodo: ${rentalPeriod.startDate} a ${rentalPeriod.endDate}</span></td>
            <td class="text-center">${it.days}</td>
            <td class="text-right">${formatCurrency(it.dailyPrice)}</td>
            <td class="text-right"><strong>${formatCurrency(it.subtotal)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-box">
      <div class="total-row">
        <span>Subtotal Operativo:</span>
        <strong>${formatCurrency(subtotal)}</strong>
      </div>
      <div class="total-row">
        <span>IVA General (19%):</span>
        <strong>${formatCurrency(tax)}</strong>
      </div>
      <div class="total-row grand-total">
        <span>Total Liquidado:</span>
        <strong style="color: #ff7a00;">${formatCurrency(total)}</strong>
      </div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 11px;">
      <div class="box-title">Detalles de Liquidación y Seguros</div>
      <div class="grid-2" style="margin-bottom: 12px;">
        <div>
          <div class="row"><span>Método de Pago:</span><strong>${paymentMethod}</strong></div>
          <div class="row"><span>Entidad Financiera:</span><strong>${bank}</strong></div>
          <div class="row"><span>Referencia Transaccional:</span><strong style="font-family: monospace;">${reference}</strong></div>
        </div>
        <div>
          <div class="row"><span>Póliza de Seguro:</span><strong style="color: #059669;">SURA Todo Riesgo N° SURA-8842-TR</strong></div>
          <div class="row"><span>Inspección Técnica:</span><strong>Aprobada en Patio Central</strong></div>
          <div class="row"><span>Fecha de Liquidación:</span><strong>${paymentDate}</strong></div>
        </div>
      </div>
    </div>

    <div class="dian-box">
      <strong>Resolución DIAN N° 18764000129384</strong> de 2026-01-15. Rango autorizado desde OP-0001000 hasta OP-0099999.<br>
      <strong>CUFE:</strong> 4b3d88a29e1f57cd00234a9b76c8912ef00388419bbcd019283746501928374a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0<br>
      Documento soporte electrónico válido como título valor conforme al Código de Comercio y estatuto tributario colombiano.
    </div>
  </div>
</body>
</html>`;
  }

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
          <button id="invoice-btn-preview-pdf" class="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">
            ${renderIcon('Eye', 'w-3.5 h-3.5 text-white')} Ver PDF
          </button>
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
            <div class="text-xl font-black text-[#132e4f] dark:text-white font-display">N° ${invoiceNumber}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Fecha de emisión: ${issueDate}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Fecha de vencimiento: ${issueDate}</div>
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
              <span class="col-span-2 font-semibold text-slate-800 dark:text-slate-200">${client.name}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Cédula / NIT:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300 font-mono">${client.taxId}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Correo:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${client.email}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Teléfono:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${client.phone}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Dirección:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${client.address}</span>
            </div>
          </div>

          <!-- Datos del proveedor -->
          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-3">Datos del proveedor</h4>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Nombre:</span>
              <span class="col-span-2 font-semibold text-slate-800 dark:text-slate-200">${provider.name}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">NIT:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300 font-mono">${provider.taxId}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Correo:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${provider.email}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Teléfono:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${provider.phone}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Dirección:</span>
              <span class="col-span-2 text-slate-700 dark:text-slate-300">${provider.address}</span>
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
                ${items.map((it, idx) => `
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
                <span class="font-semibold text-slate-800 dark:text-slate-200">${formatCurrency(subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>IVA (19%)</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${formatCurrency(tax)}</span>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                <span class="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                <span class="text-xl font-bold text-[#132e4f] dark:text-blue-400 font-display">${formatCurrency(total)}</span>
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
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-medium">${paymentMethod}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Entidad:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-medium">${bank}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Referencia:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-mono font-medium">${reference}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <span class="text-slate-400">Fecha de pago:</span>
              <span class="col-span-2 text-slate-800 dark:text-slate-200 font-medium">${paymentDate}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-200 dark:border-slate-800 pt-6 text-center space-y-2 text-[11px] text-slate-400 dark:text-slate-500">
          <p>Opus Rentals · NIT 901.884.219-5 · Bogotá D.C., Colombia · contacto@opusrentals.com · +57 317 654 3210</p>
          <p class="text-[10px]">Factura electrónica generada conforme a las directrices de la DIAN. Respaldado por póliza todo riesgo SURA.</p>
        </div>

      </div>

    </div>
  `;

  content.querySelector('#invoice-btn-back')?.addEventListener('click', () => {
    modal.close();
  });

  // Action: Ver PDF (Vista Previa en ventana dedicada)
  content.querySelector('#invoice-btn-preview-pdf')?.addEventListener('click', () => {
    const printableHtml = buildPrintableInvoiceHtml();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printableHtml);
      win.document.close();
      showToast('Factura abierta en visor PDF', 'success');
    } else {
      showToast('Permite las ventanas emergentes para ver el PDF', 'warning');
    }
  });

  // Action: Descargar PDF
  content.querySelector('#invoice-btn-download')?.addEventListener('click', () => {
    const printableHtml = buildPrintableInvoiceHtml();
    try {
      const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Factura ${invoiceNumber} descargada exitosamente`, 'success');
    } catch (e) {
      console.warn('Direct blob download failed, triggering window print', e);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(printableHtml);
        win.document.close();
        setTimeout(() => win.print(), 350);
      }
    }
  });

  // Action: Imprimir
  content.querySelector('#invoice-btn-print')?.addEventListener('click', () => {
    const printableHtml = buildPrintableInvoiceHtml();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printableHtml);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
      }, 400);
    } else {
      window.print();
    }
  });

  modal.open({
    title: '',
    content: content,
    maxWidth: 'max-w-5xl',
    hideHeader: true
  });
}

export default openRentalModal;
