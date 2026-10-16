/**
 * Opus Rentals Notifications Popover Menu Component
 * Color scheme: Vibrant Opus Orange (#FF7A00) + Gris Carbón (#1A1A1A) + Blanco
 */

import { renderIcon } from '../utils/icons.js';
import { notificationsStore } from '../utils/notifications-store.js';
import auth from '../auth/state.js';

let isOpen = false;
let currentFilter = 'all'; // 'all' | 'unread'

export function renderNotificationsMenu() {
  const container = document.getElementById('notifications-menu-container');
  if (!container) return;

  const notifications = notificationsStore.getAll();
  const unreadCount = notificationsStore.getUnreadCount();

  const filtered = currentFilter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  if (!isOpen) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  const isProvider = auth.isProvider();
  const footerLink = isProvider ? '#/provider' : '#/client';
  const footerText = isProvider ? 'Gestionar mi flota y despachos' : 'Ver mis contratos de alquiler';

  container.innerHTML = `
    <!-- Backdrop for click-outside dismissal -->
    <div id="notifications-backdrop" class="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"></div>

    <!-- Floating Popover Card -->
    <div 
      id="notifications-popover" 
      class="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style="transform-origin: top right;"
    >
      <!-- Header -->
      <div class="p-3.5 px-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#FF7A00]">
            ${renderIcon('Bell', 'w-4 h-4')}
          </span>
          <h3 class="text-xs font-black text-slate-900 dark:text-white tracking-tight font-display">Notificaciones</h3>
          ${unreadCount > 0 ? `
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF7A00] text-white shadow-xs">
              ${unreadCount} nueva${unreadCount === 1 ? '' : 's'}
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-1">
          ${unreadCount > 0 ? `
            <button 
              id="btn-mark-all-read" 
              class="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#FF7A00] hover:bg-orange-50 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="Marcar todas como leídas"
            >
              Marcar leídas
            </button>
          ` : ''}
          <button 
            id="btn-close-notifs" 
            class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            ${renderIcon('X', 'w-4 h-4')}
          </button>
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="px-3.5 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
        <button 
          id="btn-filter-all" 
          class="px-2.5 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
            currentFilter === 'all' 
              ? 'bg-[#FF7A00] text-white shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#FF7A00] hover:bg-slate-100 dark:hover:bg-slate-800'
          }"
        >
          Todas (${notifications.length})
        </button>
        <button 
          id="btn-filter-unread" 
          class="px-2.5 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
            currentFilter === 'unread' 
              ? 'bg-[#FF7A00] text-white shadow-xs' 
              : 'text-slate-500 dark:text-slate-400 hover:text-[#FF7A00] hover:bg-slate-100 dark:hover:bg-slate-800'
          }"
        >
          No leídas (${unreadCount})
        </button>
      </div>

      <!-- Notifications List -->
      <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overscroll-contain">
        ${filtered.length === 0 ? `
          <div class="p-8 text-center space-y-2">
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              ${renderIcon('CheckCircle2', 'w-5 h-5 text-emerald-500')}
            </div>
            <p class="text-xs font-black text-slate-800 dark:text-slate-200">¡Estás al día!</p>
            <p class="text-[11px] text-slate-400 dark:text-slate-500">No tienes notificaciones ${currentFilter === 'unread' ? 'sin leer' : 'registradas'} para tu cuenta.</p>
          </div>
        ` : filtered.map(item => {
          let icon = 'Info';
          let badgeBg = 'bg-orange-50 dark:bg-orange-950/40 text-[#FF7A00] border-orange-200 dark:border-orange-800/60';

          if (item.category === 'RENTAL') {
            icon = 'CheckCircle2';
            badgeBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
          } else if (item.category === 'PAYMENT') {
            icon = 'Receipt';
            badgeBg = 'bg-orange-50 dark:bg-orange-950/40 text-[#FF7A00] border-orange-200 dark:border-orange-800/60';
          } else if (item.category === 'ALERT') {
            icon = 'Clock';
            badgeBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
          } else if (item.category === 'INSPECTION') {
            icon = 'Wrench';
            badgeBg = 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
          } else if (item.category === 'DAMAGE') {
            icon = 'AlertTriangle';
            badgeBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
          }

          return `
            <div 
              class="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-start gap-3 cursor-pointer group notif-item ${
                !item.read ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''
              }"
              data-id="${item.id}"
              data-link="${item.link || footerLink}"
            >
              <!-- Category Icon Badge -->
              <div class="w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0 mt-0.5 ${badgeBg}">
                ${renderIcon(icon, 'w-4 h-4')}
              </div>

              <!-- Message Body -->
              <div class="flex-1 min-w-0 pr-1">
                <div class="flex items-center justify-between gap-1 mb-0.5">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate ${!item.read ? 'text-[#FF7A00] font-black' : ''}">
                    ${item.title}
                  </h4>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap flex-shrink-0 font-mono">
                    ${item.timeAgo}
                  </span>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                  ${item.message}
                </p>
              </div>

              <!-- Unread dot & Delete button on hover -->
              <div class="flex items-center gap-1 flex-shrink-0 pt-1">
                ${!item.read ? `
                  <span class="w-2 h-2 rounded-full bg-[#FF7A00] ring-2 ring-orange-200 dark:ring-orange-900" title="No leída"></span>
                ` : ''}
                <button 
                  class="btn-delete-notif opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity" 
                  data-id="${item.id}"
                  title="Eliminar"
                >
                  ${renderIcon('Trash2', 'w-3 h-3')}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Footer Actions -->
      <div class="p-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end text-[11px]">
        <a 
          href="${footerLink}" 
          id="link-go-client-rentals"
          class="font-black text-[#FF7A00] hover:text-[#E56E00] flex items-center gap-1 transition-colors"
        >
          <span>${footerText}</span>
          ${renderIcon('ArrowRight', 'w-3 h-3')}
        </a>
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelector('#notifications-backdrop')?.addEventListener('click', closeNotificationsMenu);
  container.querySelector('#btn-close-notifs')?.addEventListener('click', closeNotificationsMenu);

  container.querySelector('#btn-mark-all-read')?.addEventListener('click', () => {
    notificationsStore.markAllAsRead();
    renderNotificationsMenu();
  });

  container.querySelector('#btn-filter-all')?.addEventListener('click', () => {
    currentFilter = 'all';
    renderNotificationsMenu();
  });

  container.querySelector('#btn-filter-unread')?.addEventListener('click', () => {
    currentFilter = 'unread';
    renderNotificationsMenu();
  });

  container.querySelector('#link-go-client-rentals')?.addEventListener('click', () => {
    closeNotificationsMenu();
  });

  // Individual notification item click
  container.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-notif')) return;
      const id = el.dataset.id;
      const link = el.dataset.link;
      notificationsStore.markAsRead(id);
      closeNotificationsMenu();
      if (link) {
        window.location.hash = link;
      }
    });
  });

  // Delete notification item
  container.querySelectorAll('.btn-delete-notif').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      notificationsStore.delete(id);
      renderNotificationsMenu();
    });
  });
}

export function openNotificationsMenu() {
  isOpen = true;
  renderNotificationsMenu();
}

export function closeNotificationsMenu() {
  isOpen = false;
  renderNotificationsMenu();
}

export function toggleNotificationsMenu() {
  isOpen = !isOpen;
  renderNotificationsMenu();
}
