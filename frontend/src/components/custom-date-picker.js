import { renderIcon } from '../utils/icons.js';
import { formatDate } from '../utils/formatters.js';

/**
 * Format a Date object to YYYY-MM-DD
 */
export function toIsoDate(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d + (d.includes('T') ? '' : 'T00:00:00')) : d;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date
 */
export function parseIsoDate(isoStr) {
  if (!isoStr) return new Date();
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculate total inclusive rental days between two dates
 */
export function calculateRentalDays(startIso, endIso) {
  if (!startIso || !endIso) return 1;
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  const diffTime = e.getTime() - s.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

/**
 * Get the maximum allowed end date (max 30 days inclusive from start)
 */
export function getMaxAllowedEndDate(startIso) {
  const s = parseIsoDate(startIso);
  s.setDate(s.getDate() + 29); // 30 days total inclusive
  return toIsoDate(s);
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * Reusable Interactive Custom Date Range Picker Component
 */
export class CustomDateRangePicker {
  constructor({
    initialStartDate,
    initialEndDate,
    onDateChange,
    maxDays = 30,
    containerId = null,
    totalUnits = 5,
    bookedDateRanges = []
  } = {}) {
    const today = new Date();
    const defaultStart = toIsoDate(today);
    
    const defaultEndObj = new Date(today);
    defaultEndObj.setDate(defaultEndObj.getDate() + 6); // 7 days default
    const defaultEnd = toIsoDate(defaultEndObj);

    this.totalUnits = Number(totalUnits || 5);
    this.bookedDateRanges = Array.isArray(bookedDateRanges) ? bookedDateRanges : [];
    this.startDate = initialStartDate ? toIsoDate(parseIsoDate(initialStartDate)) : defaultStart;
    this.endDate = initialEndDate ? toIsoDate(parseIsoDate(initialEndDate)) : defaultEnd;
    this.maxDays = maxDays;
    this.onDateChange = onDateChange;
    this.containerId = containerId;

    // View month initialized to the start date's month
    const sDate = parseIsoDate(this.startDate);
    this.viewYear = sDate.getFullYear();
    this.viewMonth = sDate.getMonth();

    this.selectionStep = 'start'; // 'start' -> waiting for end, or 'end' -> start picked
    this.hoverDate = null;
    this.errorMessage = null;

    // Ensure valid initial range
    this.validateAndEnforceRange();
  }

  isDateBooked(iso) {
    if (!this.bookedDateRanges || !this.bookedDateRanges.length) return false;
    
    const maxUnits = Number(this.totalUnits) > 0 ? Number(this.totalUnits) : 5;
    let rentedOnIso = 0;
    let hasExplicitFullBook = false;

    this.bookedDateRanges.forEach(r => {
      if (!r) return;
      if (r.status === 'CANCELLED' || r.status === 'RETURNED' || r.status === 'COMPLETED' || r.status === 'REJECTED') {
        return;
      }
      const s = typeof r === 'string' ? r : (r.startDate || r.start);
      const e = typeof r === 'string' ? r : (r.endDate || r.end || s);
      if (iso >= s && iso <= e) {
        if (r.status === 'FULLY_BOOKED') {
          hasExplicitFullBook = true;
        }
        rentedOnIso += (r.quantity !== undefined ? Number(r.quantity) : 1);
      }
    });

    if (hasExplicitFullBook) return true;
    return rentedOnIso >= maxUnits;
  }

  hasBookedOverlap(startIso, endIso) {
    if (!this.bookedDateRanges || !this.bookedDateRanges.length) return false;
    const s = parseIsoDate(startIso);
    const e = parseIsoDate(endIso);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (this.isDateBooked(toIsoDate(d))) {
        return true;
      }
    }
    return false;
  }

  validateAndEnforceRange() {
    const s = parseIsoDate(this.startDate);
    let e = parseIsoDate(this.endDate);

    if (e < s) {
      this.endDate = this.startDate;
      e = s;
    }

    const days = calculateRentalDays(this.startDate, this.endDate);
    if (days > this.maxDays) {
      this.endDate = getMaxAllowedEndDate(this.startDate);
      this.errorMessage = `Periodo máximo permitido: 1 mes (${this.maxDays} días). Fechas ajustadas automáticamente.`;
    } else {
      this.errorMessage = null;
    }
  }

  setRange(startIso, endIso) {
    this.startDate = startIso;
    this.endDate = endIso;
    this.validateAndEnforceRange();
    this.notifyChange();
  }

  applyPreset(presetDays) {
    const s = parseIsoDate(this.startDate);
    const endObj = new Date(s);
    endObj.setDate(endObj.getDate() + (presetDays - 1));
    this.endDate = toIsoDate(endObj);
    this.validateAndEnforceRange();
    this.selectionStep = 'start';
    this.notifyChange();
  }

  notifyChange() {
    const days = calculateRentalDays(this.startDate, this.endDate);
    if (typeof this.onDateChange === 'function') {
      this.onDateChange({
        startDate: this.startDate,
        endDate: this.endDate,
        days: days,
        isValid: days <= this.maxDays,
        error: this.errorMessage
      });
    }
  }

  render(parentElement) {
    if (!parentElement) return;
    parentElement.innerHTML = this.getHtml();
    this.attachEvents(parentElement);
  }

  getHtml() {
    const todayIso = toIsoDate(new Date());
    const daysCount = calculateRentalDays(this.startDate, this.endDate);
    const maxAllowedEnd = getMaxAllowedEndDate(this.startDate);
    const isExceeded = daysCount > this.maxDays;

    // Generate Calendar Grid
    const firstDayOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const totalDaysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    
    // Day of week: 0 = Sun, 1 = Mon ... In Spanish calendar Mon = 0, Sun = 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const monthLabel = `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;

    let daysHtml = '';

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysHtml += `<div class="h-9 w-full"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(this.viewYear, this.viewMonth, day);
      const iso = toIsoDate(dateObj);
      const isPast = iso < todayIso;
      const isStart = iso === this.startDate;
      const isEnd = iso === this.endDate;
      const isInRange = iso > this.startDate && iso < this.endDate;
      
      const isBooked = this.isDateBooked(iso);
      
      // Calculate if this day exceeds max 30 days from startDate
      let isBeyondMax = false;
      if (this.startDate) {
        isBeyondMax = iso > maxAllowedEnd;
      }

      let cellClasses = 'h-9 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all relative select-none ';

      if (isBooked) {
        // Alquilado: VIBRANT RED with border, strike-through and warning indicator
        cellClasses += 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-2 border-rose-400 dark:border-rose-700 line-through cursor-not-allowed font-black shadow-inner ';
      } else if (isPast) {
        cellClasses += 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40 ';
      } else if (isStart) {
        cellClasses += 'bg-[#FF7A00] text-white font-black shadow-md shadow-orange-500/30 z-10 scale-105 ';
      } else if (isEnd) {
        cellClasses += 'bg-[#FF7A00] text-white font-black shadow-md shadow-orange-500/30 z-10 scale-105 ';
      } else if (isInRange) {
        cellClasses += 'bg-orange-100 dark:bg-orange-950/50 text-[#FF7A00] dark:text-orange-300 rounded-none ';
      } else if (isBeyondMax) {
        cellClasses += 'text-rose-400/80 bg-rose-50/40 dark:bg-rose-950/20 cursor-not-allowed hover:bg-rose-100/50 line-through ';
      } else {
        cellClasses += 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer ';
      }

      const titleAttr = isBooked 
        ? '⛔ Maquinaria ya alquilada en esta fecha (Ocupada)'
        : (isBeyondMax ? 'Excede el límite máximo de 1 mes (30 días)' : (isPast ? 'Fecha pasada no disponible' : `Seleccionar ${iso}`));

      daysHtml += `
        <button 
          type="button" 
          class="cal-day-btn ${cellClasses}" 
          data-date="${iso}"
          data-disabled="${isPast || isBeyondMax || isBooked}"
          title="${titleAttr}"
        >
          ${day}
          ${isBooked ? `<span class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>` : ''}
          ${iso === todayIso && !isBooked ? `<span class="absolute bottom-1 w-1 h-1 rounded-full ${isStart || isEnd ? 'bg-white' : 'bg-[#FF7A00]'}"></span>` : ''}
        </button>
      `;
    }

    return `
      <div class="w-full bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xl space-y-4 font-sans select-none">
        
        <!-- Top Month Navigation -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <button type="button" class="btn-cal-prev-month p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            ${renderIcon('ChevronLeft', 'w-4 h-4')}
          </button>
          
          <div class="text-sm font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
            ${renderIcon('Calendar', 'w-4 h-4 text-[#FF7A00]')}
            <span>${monthLabel}</span>
          </div>

          <button type="button" class="btn-cal-next-month p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            ${renderIcon('ChevronRight', 'w-4 h-4')}
          </button>
        </div>

        <!-- Quick Rental Presets (Strictly capped to max 1 month) -->
        <div class="space-y-1.5">
          <div class="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
            Duraciones frecuentes (Máx. 1 mes):
          </div>
          <div class="grid grid-cols-4 gap-1.5 text-xs">
            <button type="button" class="btn-cal-preset py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#FF7A00] font-bold text-slate-700 dark:text-slate-300 transition-all ${daysCount === 3 ? 'bg-orange-50 border-[#FF7A00] text-[#FF7A00]' : 'bg-slate-50 dark:bg-slate-800'}" data-days="3">
              3 días
            </button>
            <button type="button" class="btn-cal-preset py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#FF7A00] font-bold text-slate-700 dark:text-slate-300 transition-all ${daysCount === 7 ? 'bg-orange-50 border-[#FF7A00] text-[#FF7A00]' : 'bg-slate-50 dark:bg-slate-800'}" data-days="7">
              1 semana
            </button>
            <button type="button" class="btn-cal-preset py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#FF7A00] font-bold text-slate-700 dark:text-slate-300 transition-all ${daysCount === 15 ? 'bg-orange-50 border-[#FF7A00] text-[#FF7A00]' : 'bg-slate-50 dark:bg-slate-800'}" data-days="15">
              15 días
            </button>
            <button type="button" class="btn-cal-preset py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#FF7A00] font-bold text-slate-700 dark:text-slate-300 transition-all ${daysCount === 30 ? 'bg-orange-50 border-[#FF7A00] text-[#FF7A00]' : 'bg-slate-50 dark:bg-slate-800'}" data-days="30">
              1 mes (Máx)
            </button>
          </div>
        </div>

        <!-- Days of Week Headers -->
        <div class="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-black uppercase text-slate-400">
          ${WEEKDAY_NAMES.map(w => `<div>${w}</div>`).join('')}
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1 text-center">
          ${daysHtml}
        </div>

        <!-- Legend for Available, Selected, and Booked in RED -->
        <div class="flex items-center justify-between text-[11px] pt-1 px-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-md bg-[#FF7A00]"></span>
            <span class="text-slate-600 dark:text-slate-400 font-medium">Seleccionado</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-md bg-rose-500/30 border border-rose-400"></span>
            <span class="text-rose-600 dark:text-rose-400 font-bold">Agotado 100% (En Rojo)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-md bg-white dark:bg-slate-800 border border-slate-300"></span>
            <span class="text-slate-600 dark:text-slate-400 font-medium">Disponible</span>
          </div>
        </div>

        <!-- Real-Time Validation & Summary Card -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          
          <!-- Selected Range Indicator -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span class="block text-[10px] font-mono uppercase text-slate-400 font-bold">Fecha Inicio</span>
              <span class="font-black text-slate-900 dark:text-white font-mono">${formatDate(this.startDate)}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span class="block text-[10px] font-mono uppercase text-slate-400 font-bold">Fecha Fin</span>
              <span class="font-black text-slate-900 dark:text-white font-mono">${formatDate(this.endDate)}</span>
            </div>
          </div>

          <!-- Dynamic Status Badge -->
          <div class="flex items-center justify-between p-2.5 rounded-xl ${isExceeded ? 'bg-rose-50 border border-rose-300 text-rose-800' : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'} text-xs font-bold">
            <div class="flex items-center gap-1.5">
              <span>${isExceeded ? '⚠️' : '✓'}</span>
              <span>${isExceeded ? 'Límite superado (máx. 30 días)' : `Duración seleccionada: ${daysCount} día${daysCount > 1 ? 's' : ''}`}</span>
            </div>
            <span class="font-mono text-[11px] uppercase tracking-wider font-black ${isExceeded ? 'text-rose-600' : 'text-emerald-600'}">
              ${daysCount}/30 días
            </span>
          </div>

          ${this.errorMessage ? `
            <div class="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-ping"></span>
              <span>${this.errorMessage}</span>
            </div>
          ` : ''}

        </div>

      </div>
    `;
  }

  attachEvents(parentElement) {
    // Month navigation
    parentElement.querySelector('.btn-cal-prev-month')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewMonth--;
      if (this.viewMonth < 0) {
        this.viewMonth = 11;
        this.viewYear--;
      }
      this.render(parentElement);
    });

    parentElement.querySelector('.btn-cal-next-month')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewMonth++;
      if (this.viewMonth > 11) {
        this.viewMonth = 0;
        this.viewYear++;
      }
      this.render(parentElement);
    });

    // Preset buttons
    parentElement.querySelectorAll('.btn-cal-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const days = parseInt(btn.dataset.days, 10);
        this.applyPreset(days);
        this.render(parentElement);
      });
    });

    // Day buttons click
    parentElement.querySelectorAll('.cal-day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clickedDate = btn.dataset.date;

        if (this.isDateBooked(clickedDate)) {
          this.errorMessage = `⛔ Esta maquinaria se encuentra 100% agotada el ${formatDate(clickedDate)} (marcado en rojo). Elige días con disponibilidad.`;
          this.render(parentElement);
          return;
        }

        if (btn.dataset.disabled === 'true') {
          const maxAllowed = getMaxAllowedEndDate(this.startDate);
          if (clickedDate > maxAllowed) {
            this.errorMessage = `Por normativa, los contratos solo pueden durar hasta 1 mes (${this.maxDays} días). Para proyectos mayores consulta a soporte.`;
            this.render(parentElement);
          }
          return;
        }

        if (this.selectionStep === 'start') {
          // Setting new start date
          this.startDate = clickedDate;
          // Set tentative end date to start + 6 days or capped at 30 days
          const tentativeEnd = parseIsoDate(clickedDate);
          tentativeEnd.setDate(tentativeEnd.getDate() + 6);
          const maxAllowed = getMaxAllowedEndDate(clickedDate);
          const tentativeIso = toIsoDate(tentativeEnd) > maxAllowed ? maxAllowed : toIsoDate(tentativeEnd);
          
          if (!this.hasBookedOverlap(clickedDate, tentativeIso)) {
            this.endDate = tentativeIso;
          } else {
            this.endDate = clickedDate;
          }
          this.selectionStep = 'end';
          this.errorMessage = null;
        } else {
          // Setting end date
          if (clickedDate < this.startDate) {
            // Clicked before start: becomes new start date
            this.startDate = clickedDate;
            const tentativeEnd = parseIsoDate(clickedDate);
            tentativeEnd.setDate(tentativeEnd.getDate() + 6);
            const maxAllowed = getMaxAllowedEndDate(clickedDate);
            this.endDate = toIsoDate(tentativeEnd) > maxAllowed ? maxAllowed : toIsoDate(tentativeEnd);
            this.selectionStep = 'end';
            this.errorMessage = null;
          } else {
            // Check if any booked dates are in the range [this.startDate, clickedDate]
            if (this.hasBookedOverlap(this.startDate, clickedDate)) {
              this.errorMessage = `⛔ El rango seleccionado incluye días donde la máquina se encuentra 100% agotada (en rojo). Elige otro rango con disponibilidad.`;
              this.render(parentElement);
              return;
            }

            // Verify within max 30 days
            const maxAllowed = getMaxAllowedEndDate(this.startDate);
            if (clickedDate > maxAllowed) {
              this.endDate = maxAllowed;
              this.errorMessage = `El periodo de alquiler ha sido ajustado al máximo permitido de 1 mes (30 días).`;
            } else {
              this.endDate = clickedDate;
              this.errorMessage = null;
            }
            this.selectionStep = 'start';
          }
        }

        this.validateAndEnforceRange();
        this.notifyChange();
        this.render(parentElement);
      });
    });
  }
}

/**
 * Open Custom Date Range Picker Modal Popover
 */
export function openDateRangeModal({
  startDate,
  endDate,
  totalUnits = 5,
  bookedDateRanges = [],
  onConfirm
}) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in';

  let currentStart = startDate || toIsoDate(new Date());
  let currentEnd = endDate || toIsoDate(new Date(Date.now() + 6 * 86400000));
  let currentDays = calculateRentalDays(currentStart, currentEnd);

  const container = document.createElement('div');
  container.className = 'w-full max-w-md relative';

  const picker = new CustomDateRangePicker({
    initialStartDate: currentStart,
    initialEndDate: currentEnd,
    totalUnits: totalUnits,
    bookedDateRanges: bookedDateRanges,
    maxDays: 30,
    onDateChange: (result) => {
      currentStart = result.startDate;
      currentEnd = result.endDate;
      currentDays = result.days;
    }
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-3';

  const calendarMount = document.createElement('div');
  wrapper.appendChild(calendarMount);

  // Actions footer
  const footer = document.createElement('div');
  footer.className = 'flex items-center justify-end gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-md';
  footer.innerHTML = `
    <button type="button" class="btn-cancel-cal px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
      Cancelar
    </button>
    <button type="button" class="btn-confirm-cal btn-primary !py-2 !px-5 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5">
      <span>Confirmar Fechas</span>
      ${renderIcon('CheckCircle2', 'w-3.5 h-3.5')}
    </button>
  `;

  wrapper.appendChild(footer);
  container.appendChild(wrapper);
  overlay.appendChild(container);

  document.body.appendChild(overlay);
  picker.render(calendarMount);

  const close = () => {
    overlay.remove();
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  footer.querySelector('.btn-cancel-cal')?.addEventListener('click', close);

  footer.querySelector('.btn-confirm-cal')?.addEventListener('click', () => {
    if (picker.hasBookedOverlap(currentStart, currentEnd)) {
      picker.errorMessage = '⛔ La fecha seleccionada incluye días 100% agotados (en rojo). Por favor selecciona días con disponibilidad en el calendario.';
      picker.render(calendarMount);
      return;
    }
    if (typeof onConfirm === 'function') {
      onConfirm({
        startDate: currentStart,
        endDate: currentEnd,
        days: currentDays
      });
    }
    close();
  });
}
