import { renderIcon } from '../utils/icons.js';

class ModalController {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.activeModal = null;
    this.keydownHandler = (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    };
  }

  open(optionsOrContent, maybeOptions = {}) {
    this.container = document.getElementById('modal-container');
    if (!this.container) return;

    let title = '';
    let content = null;
    let maxWidth = 'max-w-2xl';
    let hideHeader = false;
    let onClose = null;

    if (optionsOrContent instanceof HTMLElement || typeof optionsOrContent === 'string') {
      content = optionsOrContent;
      title = maybeOptions.title || '';
      maxWidth = maybeOptions.maxWidth || 'max-w-2xl';
      hideHeader = maybeOptions.hideHeader ?? (maybeOptions.showCloseBtn === false);
      onClose = maybeOptions.onClose || null;
    } else if (typeof optionsOrContent === 'object' && optionsOrContent !== null) {
      title = optionsOrContent.title || '';
      content = optionsOrContent.content;
      maxWidth = optionsOrContent.maxWidth || 'max-w-2xl';
      hideHeader = optionsOrContent.hideHeader ?? false;
      onClose = optionsOrContent.onClose || null;
    }

    this.onCloseCallback = onClose;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 opacity-0 overflow-y-auto';
    modalBackdrop.id = 'active-modal-backdrop';

    modalBackdrop.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full ${maxWidth} my-8 transform transition-all duration-300 scale-95 opacity-0 overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl relative text-slate-900 dark:text-slate-100" id="modal-box">
        ${!hideHeader ? `
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">${title}</h3>
            <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" aria-label="Cerrar modal">
              ${renderIcon('X', 'w-5 h-5')}
            </button>
          </div>
          <!-- Modal Content -->
          <div class="p-6 max-h-[85vh] overflow-y-auto" id="modal-body">
            ${typeof content === 'string' ? content : ''}
          </div>
        ` : `
          <button id="modal-close-btn" class="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Cerrar modal">
            ${renderIcon('X', 'w-5 h-5')}
          </button>
          <div class="max-h-[90vh] overflow-y-auto" id="modal-body">
            ${typeof content === 'string' ? content : ''}
          </div>
        `}
      </div>
    `;

    if (typeof content !== 'string' && content instanceof HTMLElement) {
      modalBackdrop.querySelector('#modal-body').appendChild(content);
    }

    this.container.innerHTML = '';
    this.container.appendChild(modalBackdrop);
    this.activeModal = modalBackdrop;

    // Attach listeners
    modalBackdrop.querySelector('#modal-close-btn').addEventListener('click', () => this.close());
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        this.close();
      }
    });

    document.addEventListener('keydown', this.keydownHandler);

    // Animate in
    requestAnimationFrame(() => {
      modalBackdrop.classList.remove('opacity-0');
      const box = modalBackdrop.querySelector('#modal-box');
      if (box) {
        box.classList.remove('scale-95', 'opacity-0');
        box.classList.add('scale-100', 'opacity-100');
      }
    });

    return modalBackdrop;
  }

  close() {
    if (!this.activeModal) return;

    const modal = this.activeModal;
    const box = modal.querySelector('#modal-box');
    if (box) {
      box.classList.add('scale-95', 'opacity-0');
    }
    modal.classList.add('opacity-0');

    setTimeout(() => {
      if (this.container) this.container.innerHTML = '';
      this.activeModal = null;
      document.removeEventListener('keydown', this.keydownHandler);
      if (this.onCloseCallback) {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }
    }, 200);
  }
  confirmDialog({ title = '¿Estás seguro?', message = '', confirmText = 'Aceptar', cancelText = 'Cancelar', isDestructive = false }) {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.className = 'space-y-4';
      content.innerHTML = `
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${message}</p>
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button id="modal-btn-cancel" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            ${cancelText}
          </button>
          <button id="modal-btn-confirm" class="px-4 py-2 rounded-xl text-xs font-bold text-white ${isDestructive ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-[#132e4f] hover:bg-[#0a1c33] shadow-[#132e4f]/20'} shadow-md transition-all cursor-pointer">
            ${confirmText}
          </button>
        </div>
      `;

      content.querySelector('#modal-btn-cancel').addEventListener('click', () => {
        this.close();
        resolve(false);
      });

      content.querySelector('#modal-btn-confirm').addEventListener('click', () => {
        this.close();
        resolve(true);
      });

      this.open({
        title,
        content,
        maxWidth: 'max-w-md',
        onClose: () => resolve(false)
      });
    });
  }
}

export const modal = new ModalController();
export default modal;
