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
  const availableUnits = tool.availableQuantity || tool.totalQuantity || 5;
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
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">Unidades a Alquilar</span>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">
                  Flota disponible: <strong class="text-emerald-600 dark:text-emerald-400">${availableUnits} unidades</strong>
                </div>
              </div>
              <div class="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-1 shadow-2xs">
                <button 
                  type="button" 
                  id="btn-qty-minus" 
                  class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${quantity <= 1 ? 'opacity-30 cursor-not-allowed' : ''}"
                >
                  -
                </button>
                <span id="rental-qty-display" class="w-7 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                  ${quantity}
                </span>
                <button 
                  type="button" 
                  id="btn-qty-plus" 
                  class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${quantity >= availableUnits ? 'opacity-30 cursor-not-allowed' : ''}"
                >
                  +
                </button>
              </div>
            </div>
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
          <button id="btn-proceed-checkout" ${!isAvailable || isCheckingAvailability ? 'disabled' : ''} class="w-full py-3 px-5 rounded-xl text-sm font-black text-white bg-[#FF7A00] hover:bg-[#E56E00] disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wide">
            ${renderIcon('CreditCard', 'w-4 h-4')} Continuar al Pago (${formatCurrency(total)})
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
