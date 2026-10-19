/**
 * Format numeric value as Colombian Pesos (COP) matching Stitch reference design: "$ 185.000"
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '$ 0';
  const formattedNumber = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  }).format(amount);
  return `$ ${formattedNumber}`;
}

/**
 * Format ISO date string or date to friendly Spanish format e.g. "13 oct 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const clean = dateString.split('T')[0];
    const [year, month, day] = clean.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Return semantic HTML badge markup for Tool status matching Stitch ToolRent design
 */
export function getToolStatusBadge(status) {
  const map = {
    AVAILABLE: { label: 'Disponible', class: 'badge-disponible', dot: 'bg-emerald-500' },
    RENTED: { label: 'Alquilada', class: 'badge-alquilada', dot: 'bg-blue-500' },
    MAINTENANCE: { label: 'Mantenimiento', class: 'badge-mantenimiento', dot: 'bg-amber-500' },
    RETIRED: { label: 'Retirada', class: 'badge-cancelada', dot: 'bg-rose-500' },
  };

  const item = map[status] || { label: status, class: 'badge-pendiente', dot: 'bg-slate-400' };
  return `<span class="${item.class}">
    <span class="w-1.5 h-1.5 rounded-full ${item.dot}"></span>
    ${item.label}
  </span>`;
}

/**
 * Return semantic HTML badge markup for Rental status matching Stitch ToolRent design
 */
export function getRentalStatusBadge(status) {
  const norm = String(status || 'PENDING').toUpperCase();
  const map = {
    PENDING: { label: 'Pendiente de Aprobación', class: 'badge-pendiente', dot: 'bg-amber-400' },
    APPROVED: { label: 'Aprobada / Confirmada', class: 'badge-confirmada', dot: 'bg-emerald-500' },
    CONFIRMED: { label: 'Confirmada', class: 'badge-confirmada', dot: 'bg-emerald-500' },
    IN_PROGRESS: { label: 'En curso / Despachada', class: 'badge-en-curso', dot: 'bg-sky-500' },
    COMPLETED: { label: 'Completada', class: 'badge-completada', dot: 'bg-indigo-500' },
    RETURNED: { label: 'Devuelta a Patio', class: 'badge-completada', dot: 'bg-slate-500' },
    CANCELLED: { label: 'Cancelada', class: 'badge-cancelada', dot: 'bg-rose-500' },
    REJECTED: { label: 'Rechazada', class: 'badge-cancelada', dot: 'bg-rose-500' },
  };

  const item = map[norm] || { label: norm, class: 'badge-pendiente', dot: 'bg-slate-400' };
  return `<span class="${item.class}">
    <span class="w-1.5 h-1.5 rounded-full ${item.dot}"></span>
    ${item.label}
  </span>`;
}

export function getPaymentStatusBadge(status) {
  const norm = String(status || 'PENDING').toUpperCase();
  if (norm === 'PAID' || norm === 'COMPLETED') {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pagado
    </span>`;
  }
  if (norm === 'CANCELLED' || norm === 'FAILED') {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Anulado
    </span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pago Pendiente
  </span>`;
}
