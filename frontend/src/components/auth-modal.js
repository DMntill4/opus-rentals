import auth from '../auth/state.js';
import modal from './modal.js';
import showToast from './toast.js';
import { renderIcon, renderToolRentMark } from '../utils/icons.js';
import { loginConstructionImage } from '../utils/tool-images.js';

export function openAuthModal(initialTab = 'login') {
  let currentTab = initialTab; // 'login' or 'register'
  let selectedRole = 'ROLE_CLIENTE'; // ROLE_CLIENTE or ROLE_PROVEEDOR
  let showPassword = false;

  const content = document.createElement('div');
  content.className = 'w-full';

  function renderView() {
    content.innerHTML = `
      <!-- Spacious Split-Screen Auth Modal: Left Form + Right Aerial Construction Visual -->
      <div class="w-full bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 max-w-5xl mx-auto border-2 border-slate-200">
        
        <!-- ========================================================================= -->
        <!-- LEFT COLUMN: AUTH FORM (Spacious, High Contrast, Readable Typography)    -->
        <!-- ========================================================================= -->
        <div class="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
          <div>
            
            <!-- Brand Header -->
            <div class="flex items-center justify-between pb-5 border-b border-slate-200">
              <div class="flex items-center gap-3">
                <img src="/assets/brand/logo.png" alt="Opus Rentals" class="w-10 h-10 object-contain drop-shadow-sm" onerror="this.src='/assets/brand/opus-logo-orange.svg'" />
                <div>
                  <span class="text-xl font-black tracking-tight text-slate-950 font-display">OPUS <span class="text-[#FF7A00]">RENTALS</span></span>
                  <span class="block text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">Portal Constructor B2B</span>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-black uppercase tracking-wider border border-amber-300">
                Seguridad SSL
              </span>
            </div>

            <!-- Tab Switcher (Iniciar Sesión / Registrarse) -->
            <div class="flex p-1.5 bg-slate-100 rounded-2xl my-6 border border-slate-300">
              <button id="auth-tab-login" class="flex-1 py-3 text-sm font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                currentTab === 'login' ? 'bg-[#FFB800] text-[#1A1A1A] shadow-md' : 'text-slate-600 hover:text-slate-900'
              }">
                Iniciar Sesión
              </button>
              <button id="auth-tab-register" class="flex-1 py-3 text-sm font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                currentTab === 'register' ? 'bg-[#FFB800] text-[#1A1A1A] shadow-md' : 'text-slate-600 hover:text-slate-900'
              }">
                Crear Cuenta
              </button>
            </div>

            <!-- Title & Subtitle -->
            <div class="mb-6 space-y-1">
              <h2 class="text-2xl sm:text-3xl font-black text-slate-950 font-display tracking-tight">
                ${currentTab === 'login' ? 'Acceso al Portal de Maquinaria' : 'Registro de Constructora o Proveedor'}
              </h2>
              <p class="text-sm text-slate-600 leading-relaxed font-normal">
                ${currentTab === 'login' 
                  ? 'Supervisa equipos activos en obra, contratos vigentes y facturación oficial DIAN.' 
                  : 'Ingresa para cotizar maquinaria con seguro todo riesgo SURA o gestionar tu flota.'}
              </p>
            </div>

            <!-- Form -->
            <form id="toolrent-auth-form" class="space-y-4">
              
              <!-- Role Visual Selector in Register -->
              ${currentTab === 'register' ? `
                <div class="space-y-2">
                  <label class="block text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                    ¿Cómo usarás Opus Rentals?
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      id="role-btn-cliente" 
                      class="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedRole === 'ROLE_CLIENTE' 
                          ? 'border-[#FFB800] bg-amber-50 ring-2 ring-[#FFB800]/40' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }"
                    >
                      <div class="flex items-center gap-2 font-black text-sm text-slate-950">
                        ${renderIcon('UserCheck', 'w-5 h-5 text-amber-600')}
                        <span>Cliente / Constructora</span>
                      </div>
                      <p class="text-xs text-slate-600 mt-1 leading-snug">Alquila maquinaria para tus obras y proyectos civiles</p>
                    </button>

                    <button 
                      type="button" 
                      id="role-btn-proveedor" 
                      class="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedRole === 'ROLE_PROVEEDOR' 
                          ? 'border-[#FFB800] bg-amber-50 ring-2 ring-[#FFB800]/40' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }"
                    >
                      <div class="flex items-center gap-2 font-black text-sm text-slate-950">
                        ${renderIcon('Truck', 'w-5 h-5 text-amber-600')}
                        <span>Proveedor de Maquinaria</span>
                      </div>
                      <p class="text-xs text-slate-600 mt-1 leading-snug">Publica y rentabiliza tu flota pesada en patio</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-black text-slate-800 font-mono uppercase tracking-wider mb-1.5">
                    ${selectedRole === 'ROLE_CLIENTE' ? 'Nombre Completo o Empresa' : 'Razón Social de la Empresa'}
                  </label>
                  <input 
                    type="text" 
                    id="reg-name" 
                    required 
                    placeholder="${selectedRole === 'ROLE_CLIENTE' ? 'Ej. Juan Rodríguez o Constructora Bolívar' : 'Ej. Maquinarias Andinas SAS'}" 
                    class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/30 transition-all" 
                  />
                </div>
              ` : ''}

              <!-- Username / Email -->
              <div>
                <label class="block text-xs font-black text-slate-800 font-mono uppercase tracking-wider mb-1.5">
                  Correo Electrónico o Usuario
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    ${renderIcon('Mail', 'w-5 h-5')}
                  </span>
                  <input 
                    type="text" 
                    id="auth-username" 
                    required 
                    placeholder="usuario@constructora.com" 
                    class="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/30 transition-all" 
                  />
                </div>
              </div>

              <!-- Password with Show/Hide toggle -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-xs font-black text-slate-800 font-mono uppercase tracking-wider">
                    Contraseña
                  </label>
                  <button type="button" id="btn-toggle-password" class="text-xs text-amber-700 hover:text-amber-900 font-bold font-mono underline cursor-pointer">
                    ${showPassword ? 'Ocultar' : 'Mostrar contraseña'}
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    ${renderIcon('Lock', 'w-5 h-5')}
                  </span>
                  <input 
                    type="${showPassword ? 'text' : 'password'}" 
                    id="auth-password" 
                    required 
                    placeholder="••••••••" 
                    class="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/30 transition-all" 
                  />
                </div>
              </div>

              <!-- Error Alert -->
              <div id="auth-error-box" class="hidden p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                ${renderIcon('AlertCircle', 'w-5 h-5 text-rose-600 flex-shrink-0')}
                <span id="auth-error-msg">Credenciales incorrectas</span>
              </div>

              <!-- Submit Button -->
              <div class="pt-3">
                <button 
                  type="submit" 
                  id="auth-submit-btn" 
                  class="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-[#1A1A1A] bg-[#FFB800] hover:bg-[#E5A600] active:scale-98 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span id="auth-submit-text">
                    ${currentTab === 'login' ? 'Ingresar al Sistema' : 'Crear Cuenta Empresarial'}
                  </span>
                  ${renderIcon('ArrowRight', 'w-4 h-4')}
                </button>
              </div>

            </form>

            <!-- Quick Demo Credentials for Fast Testing -->
            <div class="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-mono">
              <span class="font-bold">Accesos directos (Demo):</span>
              <div class="flex items-center gap-3">
                <button type="button" id="fill-demo-client" class="text-amber-700 font-bold hover:underline cursor-pointer">Cliente</button>
                <span>·</span>
                <button type="button" id="fill-demo-provider" class="text-amber-700 font-bold hover:underline cursor-pointer">Proveedor</button>
                <span>·</span>
                <button type="button" id="fill-demo-admin" class="text-amber-700 font-bold hover:underline cursor-pointer">Admin</button>
              </div>
            </div>

          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- RIGHT COLUMN: AERIAL TOWER CRANE CONSTRUCTION VISUAL                      -->
        <!-- ========================================================================= -->
        <div class="lg:col-span-5 bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden hidden lg:flex min-h-[580px]">
          
          <!-- Background photo of real aerial high-rise crane civil engineering -->
          <img 
            src="${loginConstructionImage}" 
            alt="Construcción e Ingeniería de Altura" 
            class="absolute inset-0 w-full h-full object-cover select-none"
            loading="eager"
            onerror="this.src='https://plus.unsplash.com/premium_photo-1682144435143-97c426ff3a77?auto=format&fit=crop&w=1200&q=85';"
          />
          <!-- Full dark protective overlay for high contrast, dramatic construction feel -->
          <div class="absolute inset-0 bg-slate-950/75"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          <!-- Top Badge & Title with Drop Shadow -->
          <div class="relative z-10 space-y-4">
            <span class="inline-block px-3.5 py-1.5 rounded-full text-xs font-mono font-black uppercase bg-[#FF7A00] text-white shadow-md">
              Infraestructura B2B Certificada
            </span>
            <h3 class="text-2xl sm:text-3xl font-black font-display leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              La Plataforma de Alquiler de Maquinaria Más Robusta de Colombia
            </h3>
            <p class="text-sm text-slate-200 leading-relaxed font-normal drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Flota supervisada con telemetría satelital en vivo, póliza todo riesgo SURA e inspección técnica previa a cada entrega en frente de obra.
            </p>
          </div>

          <!-- Trust Badges -->
          <div class="relative z-10 space-y-4 pt-6 border-t border-white/20">
            <div class="text-xs font-mono uppercase text-[#FF7A00] font-black tracking-wider">
              Garantías Contractuales en Obra
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs text-slate-200">
              <div class="flex items-center gap-2">
                ${renderIcon('CheckCircle2', 'w-4 h-4 text-emerald-400 flex-shrink-0')}
                <span>Póliza SURA Todo Riesgo</span>
              </div>
              <div class="flex items-center gap-2">
                ${renderIcon('CheckCircle2', 'w-4 h-4 text-emerald-400 flex-shrink-0')}
                <span>Factura DIAN Electrónica</span>
              </div>
              <div class="flex items-center gap-2">
                ${renderIcon('CheckCircle2', 'w-4 h-4 text-emerald-400 flex-shrink-0')}
                <span>Relevo Mecánico 24h</span>
              </div>
              <div class="flex items-center gap-2">
                ${renderIcon('CheckCircle2', 'w-4 h-4 text-emerald-400 flex-shrink-0')}
                <span>Telemetría en Vivo</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    // Event listeners
    content.querySelector('#auth-tab-login')?.addEventListener('click', () => {
      currentTab = 'login';
      renderView();
    });

    content.querySelector('#auth-tab-register')?.addEventListener('click', () => {
      currentTab = 'register';
      renderView();
    });

    content.querySelector('#role-btn-cliente')?.addEventListener('click', () => {
      selectedRole = 'ROLE_CLIENTE';
      renderView();
    });

    content.querySelector('#role-btn-proveedor')?.addEventListener('click', () => {
      selectedRole = 'ROLE_PROVEEDOR';
      renderView();
    });

    content.querySelector('#btn-toggle-password')?.addEventListener('click', () => {
      showPassword = !showPassword;
      const passInput = content.querySelector('#auth-password');
      if (passInput) passInput.type = showPassword ? 'text' : 'password';
      const toggleBtn = content.querySelector('#btn-toggle-password');
      if (toggleBtn) toggleBtn.textContent = showPassword ? 'Ocultar' : 'Mostrar';
    });

    // Demo Fillers
    content.querySelector('#fill-demo-client')?.addEventListener('click', () => {
      const u = content.querySelector('#auth-username');
      const p = content.querySelector('#auth-password');
      if (u && p) { u.value = 'client.carlos@gmail.com'; p.value = 'password123'; }
    });

    content.querySelector('#fill-demo-provider')?.addEventListener('click', () => {
      const u = content.querySelector('#auth-username');
      const p = content.querySelector('#auth-password');
      if (u && p) { u.value = 'provider.caterpillar@opusrentals.com'; p.value = 'password123'; }
    });

    content.querySelector('#fill-demo-admin')?.addEventListener('click', () => {
      const u = content.querySelector('#auth-username');
      const p = content.querySelector('#auth-password');
      if (u && p) { u.value = 'admin@opusrentals.com'; p.value = 'password123'; }
    });

    // Form Submission
    content.querySelector('#toolrent-auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = content.querySelector('#auth-username');
      const passwordInput = content.querySelector('#auth-password');
      const errorBox = content.querySelector('#auth-error-box');
      const errorMsg = content.querySelector('#auth-error-msg');
      const submitBtn = content.querySelector('#auth-submit-btn');
      const submitText = content.querySelector('#auth-submit-text');

      errorBox?.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Verificando con servidor...';

      const username = usernameInput?.value?.trim();
      const password = passwordInput?.value;

      try {
        if (currentTab === 'login') {
          await auth.login(username, password);
          showToast(`Bienvenido al sistema, ${username}`, 'success');
          modal.close();
          window.location.reload();
        } else {
          const fullName = content.querySelector('#reg-name')?.value?.trim();
          await auth.register({
            username,
            password,
            email: username.includes('@') ? username : `${username}@constructora.com`,
            role: selectedRole,
            fullName: fullName || username
          });
          showToast('Cuenta creada con éxito. Iniciando sesión...', 'success');
          modal.close();
          window.location.reload();
        }
      } catch (err) {
        if (errorBox && errorMsg) {
          errorMsg.textContent = err.message || 'Error de autenticación. Verifica tus datos.';
          errorBox.classList.remove('hidden');
        }
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = currentTab === 'login' ? 'Ingresar al Sistema' : 'Crear Cuenta';
      }
    });
  }

  renderView();
  modal.open({
    title: '',
    content,
    hideHeader: true,
    maxWidth: 'max-w-5xl'
  });
}

export default openAuthModal;
