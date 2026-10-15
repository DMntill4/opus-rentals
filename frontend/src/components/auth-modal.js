import auth from '../auth/state.js';
import modal from './modal.js';
import showToast from './toast.js';
import { renderIcon, renderToolRentMark, renderOpusMark, renderOpusBanner } from '../utils/icons.js';
import { i18n } from '../utils/i18n.js';

export function openAuthModal(initialTab = 'login') {
  let currentTab = initialTab; // 'login' or 'register'
  let selectedRole = 'ROLE_CLIENTE'; // ROLE_CLIENTE or ROLE_PROVEEDOR
  const isEn = i18n.getLang() === 'EN';

  const content = document.createElement('div');
  content.className = 'w-full';

  function renderView() {
    content.innerHTML = `
      <div class="w-full bg-white text-slate-900 rounded-3xl p-7 sm:p-10 flex flex-col justify-between">
          <div>
            
            <!-- Brand & Security Header -->
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                ${renderToolRentMark('w-9 h-9')}
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xl font-black tracking-tight text-[#132e4f] dark:text-white font-display">Opus Rentals</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-[#132e4f] dark:text-blue-400 border border-slate-200 dark:border-slate-700">B2B COLOMBIA</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Plataforma Corporativa de Maquinaria y Equipos</p>
                </div>
              </div>

              <div class="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Acceso Seguro</span>
              </div>
            </div>

            <!-- Segmented Pill Tab Switcher -->
            <div class="flex p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 max-w-sm">
              <button id="auth-tab-login" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'login' 
                  ? 'bg-[#132e4f] dark:bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-white'
              }">
                ${isEn ? 'Sign In' : 'Iniciar Sesión'}
              </button>
              <button id="auth-tab-register" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'register' 
                  ? 'bg-[#132e4f] dark:bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#132e4f] dark:hover:text-white'
              }">
                ${isEn ? 'Create Account' : 'Registrarse'}
              </button>
            </div>

            <!-- Headings -->
            <div class="mb-5">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                ${currentTab === 'login' 
                  ? (isEn ? 'Access your fleet portal' : 'Ingreso al portal corporativo') 
                  : (isEn ? 'Register your company' : 'Crear cuenta empresarial')}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ${currentTab === 'login'
                  ? (isEn ? 'Enter your credentials to manage active machinery and leases.' : 'Ingresa tus credenciales autorizadas para gestionar contratos y alquileres en obra.')
                  : (isEn ? 'Join Opus Rentals to rent or list verified infrastructure machinery.' : 'Únete a Opus Rentals para cotizar maquinaria pesada o rentar tu flota en Colombia.')}
              </p>
            </div>

            <!-- Form with Floating-style inputs -->
            <form id="toolrent-auth-form" class="space-y-4">
              
              ${currentTab === 'register' ? `
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase">
                    ${isEn ? 'Full Name / Company Name' : 'Nombre Completo / Razón Social'}
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      ${renderIcon('User', 'w-4 h-4')}
                    </span>
                    <input 
                      type="text" 
                      id="reg-name" 
                      required 
                      placeholder="Ej. Consorcio Vial del Río SAS" 
                      class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#132e4f]/15 transition-all font-medium" 
                    />
                  </div>
                </div>
              ` : ''}

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase">
                  ${isEn ? 'Corporate Email / Username' : 'Correo Electrónico Corporativo'}
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Mail', 'w-4 h-4')}
                  </span>
                  <input 
                    type="text" 
                    id="auth-email" 
                    required 
                    placeholder="usuario@empresa.co" 
                    class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#132e4f]/15 transition-all font-medium font-mono" 
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase">
                    ${isEn ? 'Password' : 'Contraseña'}
                  </label>
                  ${currentTab === 'login' ? `
                    <a href="javascript:void(0)" id="btn-forgot-pass" class="text-[11px] font-semibold text-[#132e4f] dark:text-blue-400 hover:underline">
                      ${isEn ? 'Forgot password?' : '¿Olvidó su contraseña?'}
                    </a>
                  ` : ''}
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Lock', 'w-4 h-4')}
                  </span>
                  <input 
                    type="password" 
                    id="auth-pass" 
                    required 
                    placeholder="••••••••••••" 
                    class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#132e4f] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#132e4f]/15 transition-all font-mono" 
                  />
                  <button type="button" id="btn-toggle-pass" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    ${renderIcon('Eye', 'w-4 h-4')}
                  </button>
                </div>
              </div>

              ${currentTab === 'register' ? `
                <div class="pt-2 space-y-2">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase">
                    ${isEn ? 'Select Account Role' : 'Tipo de Operación en Colombia'}
                  </label>
                  <div class="grid grid-cols-2 gap-3" id="role-cards-wrapper">
                    
                    <!-- Card Cliente -->
                    <div id="role-card-client" class="border-2 ${
                      selectedRole === 'ROLE_CLIENTE' 
                        ? 'border-[#132e4f] dark:border-blue-500 bg-slate-50 dark:bg-slate-800/90' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    } rounded-2xl p-3.5 cursor-pointer flex flex-col justify-between transition-all">
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-[#132e4f] dark:text-blue-400">
                          ${renderIcon('User', 'w-5 h-5')}
                        </div>
                        <span class="w-2.5 h-2.5 rounded-full ${selectedRole === 'ROLE_CLIENTE' ? 'bg-[#132e4f] dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}"></span>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-slate-900 dark:text-white">Cliente / Constructor</div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400">Arriendo de maquinaria para obra</div>
                      </div>
                    </div>

                    <!-- Card Proveedor -->
                    <div id="role-card-provider" class="border-2 ${
                      selectedRole === 'ROLE_PROVEEDOR' 
                        ? 'border-[#132e4f] dark:border-blue-500 bg-slate-50 dark:bg-slate-800/90' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    } rounded-2xl p-3.5 cursor-pointer flex flex-col justify-between transition-all">
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-[#132e4f] dark:text-blue-400">
                          ${renderIcon('Building2', 'w-5 h-5')}
                        </div>
                        <span class="w-2.5 h-2.5 rounded-full ${selectedRole === 'ROLE_PROVEEDOR' ? 'bg-[#132e4f] dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}"></span>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-slate-900 dark:text-white">Proveedor de Flota</div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400">Publicar y rentar maquinaria</div>
                      </div>
                    </div>

                  </div>
                </div>
              ` : ''}

              <div id="auth-error-msg" class="hidden text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl font-medium"></div>

              <button type="submit" id="auth-submit-btn" class="w-full h-11 bg-[#132e4f] hover:bg-[#0a1c33] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all mt-4 cursor-pointer">
                <span>${currentTab === 'login' ? (isEn ? 'Sign In to Portal' : 'Acceder al Portal') : (isEn ? 'Complete Registration' : 'Completar Registro')}</span>
                ${renderIcon('ArrowRight', 'w-4 h-4')}
              </button>

              <!-- Quick Demo Access Bar (1-Click) for frictionless testing -->
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mt-4">
                <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  ${isEn ? 'FAST DEMO CREDENTIALS (1-CLICK)' : 'ACCESO DEMO INMEDIATO (1-CLIC)'}
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <button type="button" id="quick-admin" class="py-2 px-2.5 bg-white dark:bg-slate-900 hover:border-[#132e4f] dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer text-left">
                    <div class="flex items-center justify-between text-[11px]">
                      <span>Admin</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </button>
                  <button type="button" id="quick-provider" class="py-2 px-2.5 bg-white dark:bg-slate-900 hover:border-[#132e4f] dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer text-left">
                    <div class="flex items-center justify-between text-[11px]">
                      <span>Proveedor</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </div>
                  </button>
                  <button type="button" id="quick-client" class="py-2 px-2.5 bg-white dark:bg-slate-900 hover:border-[#132e4f] dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer text-left">
                    <div class="flex items-center justify-between text-[11px]">
                      <span>Cliente</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    </div>
                  </button>
                </div>
              </div>

            </form>
          </div>

          <!-- Bottom Footer Switcher -->
          <div class="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            ${currentTab === 'login'
              ? (isEn ? 'Don\'t have an account? <button id="btn-switch-tab" class="font-bold text-[#132e4f] dark:text-blue-400 hover:underline cursor-pointer">Register</button>' : '¿No tienes cuenta empresarial? <button id="btn-switch-tab" class="font-bold text-[#132e4f] dark:text-blue-400 hover:underline cursor-pointer">Regístrate</button>')
              : (isEn ? 'Already registered? <button id="btn-switch-tab" class="font-bold text-[#132e4f] dark:text-blue-400 hover:underline cursor-pointer">Sign In</button>' : '¿Ya tienes una cuenta activa? <button id="btn-switch-tab" class="font-bold text-[#132e4f] dark:text-blue-400 hover:underline cursor-pointer">Inicia sesión</button>')}
          </div>
        </div>

      </div>
    `;

    // Tab switching
    content.querySelector('#auth-tab-login')?.addEventListener('click', () => { currentTab = 'login'; renderView(); });
    content.querySelector('#auth-tab-register')?.addEventListener('click', () => { currentTab = 'register'; renderView(); });
    content.querySelector('#btn-switch-tab')?.addEventListener('click', () => {
      currentTab = currentTab === 'login' ? 'register' : 'login';
      renderView();
    });

    // Password toggle
    content.querySelector('#btn-toggle-pass')?.addEventListener('click', () => {
      const pass = content.querySelector('#auth-pass');
      if (pass) {
        pass.type = pass.type === 'password' ? 'text' : 'password';
      }
    });

    // Role selection in registration
    content.querySelector('#role-card-client')?.addEventListener('click', () => {
      selectedRole = 'ROLE_CLIENTE';
      renderView();
    });
    content.querySelector('#role-card-provider')?.addEventListener('click', () => {
      selectedRole = 'ROLE_PROVEEDOR';
      renderView();
    });

    // Quick login buttons
    const fillAndSubmit = (username, password) => {
      const emailInput = content.querySelector('#auth-email');
      const passInput = content.querySelector('#auth-pass');
      if (emailInput && passInput) {
        emailInput.value = username;
        passInput.value = password;
        content.querySelector('#auth-submit-btn')?.click();
      }
    };

    content.querySelector('#quick-admin')?.addEventListener('click', () => {
      currentTab = 'login';
      renderView();
      fillAndSubmit('admin@opusrentals.com', 'admin123');
    });

    content.querySelector('#quick-provider')?.addEventListener('click', () => {
      currentTab = 'login';
      renderView();
      fillAndSubmit('provider.caterpillar@opusrentals.com', 'provider123');
    });

    content.querySelector('#quick-client')?.addEventListener('click', () => {
      currentTab = 'login';
      renderView();
      fillAndSubmit('client.carlos@gmail.com', 'password123');
    });

    content.querySelector('#btn-forgot-pass')?.addEventListener('click', () => {
      showToast('Enlace de recuperación enviado a tu correo corporativo.', 'info', 4000, 'Recuperación de Clave');
    });

    // Form submit handler
    const form = content.querySelector('#toolrent-auth-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = content.querySelector('#auth-error-msg');
      const submitBtn = content.querySelector('#auth-submit-btn');

      if (errBox) errBox.classList.add('hidden');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Autenticando...
        `;
      }

      const email = content.querySelector('#auth-email')?.value.trim();
      const pass = content.querySelector('#auth-pass')?.value;
      const name = content.querySelector('#reg-name')?.value.trim();

      try {
        if (currentTab === 'login') {
          await auth.login(email, pass);
          modal.close();
          showToast(`¡Bienvenido de nuevo, ${auth.getUser()?.username || 'Usuario'}!`, 'success', 3500, 'Sesión Iniciada');
          
          if (auth.isAdmin()) {
            window.location.hash = '#/admin';
          } else if (auth.isProvider()) {
            window.location.hash = '#/provider';
          } else {
            window.location.hash = '#/client';
          }
        } else {
          await auth.register({
            username: name || email.split('@')[0],
            email: email,
            password: pass,
            role: selectedRole
          });
          modal.close();
          showToast('Cuenta corporativa creada con éxito.', 'success', 3500, 'Registro Exitoso');
          if (selectedRole === 'ROLE_PROVEEDOR' || auth.isProvider()) {
            window.location.hash = '#/provider';
          } else {
            window.location.hash = '#/client';
          }
        }
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message || 'Error en las credenciales. Por favor intenta de nuevo.';
          errBox.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>${currentTab === 'login' ? 'Acceder al Portal' : 'Completar Registro'}</span>`;
        }
      }
    });
  }

  renderView();
  modal.open(content, { maxWidth: 'max-w-xl', hideHeader: true });
}
