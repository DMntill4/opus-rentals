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
      <!-- Split-Screen Auth Modal: Left Form + Right Heavy Construction Visual -->
      <div class="w-full bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 max-w-4xl mx-auto border border-slate-200">
        
        <!-- ========================================================================= -->
        <!-- LEFT COLUMN: AUTH FORM -->
        <!-- ========================================================================= -->
        <div class="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            
            <!-- Brand Header -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                ${renderToolRentMark('w-8 h-8')}
                <div>
                  <span class="text-lg font-black tracking-tight text-slate-900 font-display">Opus Rentals</span>
                  <span class="block text-[9px] font-mono text-slate-400 uppercase">Portal Constructor B2B</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-black uppercase">
                Seguridad SSL
              </span>
            </div>

            <!-- Tab Switcher (Iniciar Sesión / Registrarse) -->
            <div class="flex p-1 bg-slate-100 rounded-xl my-5 border border-slate-200">
              <button id="auth-tab-login" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'login' ? 'bg-[#FFB800] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }">
                Iniciar Sesión
              </button>
              <button id="auth-tab-register" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'register' ? 'bg-[#FFB800] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }">
                Crear Cuenta
              </button>
            </div>

            <!-- Title & Subtitle -->
            <div class="mb-4">
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-display">
                ${currentTab === 'login' ? 'Acceso al Portal de Operaciones' : 'Registro de Constructora o Proveedor'}
              </h2>
              <p class="text-xs text-slate-500 mt-1">
                ${currentTab === 'login' 
                  ? 'Gestiona maquinaria activa en obra, órdenes de despacho y facturas DIAN.' 
                  : 'Únete para cotizar equipos con seguro SURA o publicar tu inventario de patio.'}
              </p>
            </div>

            <!-- Form -->
            <form id="toolrent-auth-form" class="space-y-3.5">
              
              <!-- Role Visual Selector in Register -->
              ${currentTab === 'register' ? `
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-mono">
                    Selecciona tu Perfil
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      id="role-btn-cliente" 
                      class="p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'ROLE_CLIENTE' 
                          ? 'border-[#FFB800] bg-amber-50 ring-2 ring-[#FFB800]/40' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }"
                    >
                      <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        ${renderIcon('Building2', 'w-4 h-4 text-amber-600')}
                        <span>Constructora</span>
                      </div>
                      <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">Alquila maquinaria para proyectos</p>
                    </button>

                    <button 
                      type="button" 
                      id="role-btn-proveedor" 
                      class="p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'ROLE_PROVEEDOR' 
                          ? 'border-[#FFB800] bg-amber-50 ring-2 ring-[#FFB800]/40' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }"
                    >
                      <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        ${renderIcon('Truck', 'w-4 h-4 text-amber-600')}
                        <span>Proveedor</span>
                      </div>
                      <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">Publica tu flota pesada en patio</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 font-mono uppercase mb-1">
                    Razón Social o Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    id="reg-name" 
                    required 
                    placeholder="Ej. Consorcio Infraestructura Andina SAS" 
                    class="input-field" 
                  />
                </div>
              ` : ''}

              <!-- Username / Email -->
              <div>
                <label class="block text-[11px] font-bold text-slate-700 font-mono uppercase mb-1">
                  Correo Electrónico o Usuario
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Mail', 'w-4 h-4')}
                  </span>
                  <input 
                    type="text" 
                    id="auth-username" 
                    required 
                    placeholder="usuario@constructora.com" 
                    class="input-field !pl-10" 
                  />
                </div>
              </div>

              <!-- Password with Show/Hide toggle -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold text-slate-700 font-mono uppercase">
                    Contraseña
                  </label>
                  <button type="button" id="btn-toggle-password" class="text-[10px] text-slate-500 hover:text-slate-800 font-mono underline cursor-pointer">
                    ${showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Lock', 'w-4 h-4')}
                  </span>
                  <input 
                    type="${showPassword ? 'text' : 'password'}" 
                    id="auth-password" 
                    required 
                    placeholder="••••••••" 
                    class="input-field !pl-10" 
                  />
                </div>
              </div>

              <!-- Error Alert -->
              <div id="auth-error-box" class="hidden p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                ${renderIcon('AlertCircle', 'w-4 h-4 text-rose-500 flex-shrink-0')}
                <span id="auth-error-msg">Credenciales incorrectas</span>
              </div>

              <!-- Submit Button (Yellow Industrial with Dark Accessible Text) -->
              <div class="pt-2">
                <button 
                  type="submit" 
                  id="auth-submit-btn" 
                  class="btn-primary w-full !py-3 text-xs font-black shadow-md"
                >
                  <span id="auth-submit-text">
                    ${currentTab === 'login' ? 'Ingresar al Sistema' : 'Crear Cuenta Empresarial'}
                  </span>
                </button>
              </div>

            </form>

            <!-- Quick Demo Credentials for Fast Testing -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
              <span>Accesos rápidos (Demo):</span>
              <div class="flex gap-2">
                <button type="button" id="fill-demo-client" class="text-blue-600 font-bold hover:underline">Cliente</button>
                <span>·</span>
                <button type="button" id="fill-demo-provider" class="text-blue-600 font-bold hover:underline">Proveedor</button>
                <span>·</span>
                <button type="button" id="fill-demo-admin" class="text-blue-600 font-bold hover:underline">Admin</button>
              </div>
            </div>

          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- RIGHT COLUMN: HEAVY MACHINERY VISUAL & TRUST TESTIMONIALS -->
        <!-- ========================================================================= -->
        <div class="lg:col-span-5 bg-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          
          <!-- Background photo of real civil engineering worksite -->
          <div 
            class="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
            style="background-image: url('${loginConstructionImage}');"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

          <!-- Top Badge -->
          <div class="relative z-10">
            <span class="inline-block px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-[#FFB800] text-slate-950">
              Infraestructura Segura
            </span>
            <h3 class="text-xl font-black mt-3 leading-snug">
              La Red de Alquiler de Maquinaria Más Confiable de Colombia
            </h3>
            <p class="text-xs text-slate-300 mt-2 leading-relaxed">
              Supervisamos cada unidad con telemetría satelital, póliza todo riesgo SURA e inspección mecánica antes del despacho a obra.
            </p>
          </div>

          <!-- Trust Proof: Logos / Companies Fictitious (Clearly marked as Demo) -->
          <div class="relative z-10 space-y-3 pt-6 border-t border-white/10">
            <div class="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Constructoras que confían en nosotros (Red B2B):
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-300">
              <div class="p-2 rounded-lg bg-white/10 border border-white/10">
                Consorcio Sabana Norte
              </div>
              <div class="p-2 rounded-lg bg-white/10 border border-white/10">
                Vías del Río SAS
              </div>
              <div class="p-2 rounded-lg bg-white/10 border border-white/10">
                Minera Andina Central
              </div>
              <div class="p-2 rounded-lg bg-white/10 border border-white/10">
                Cimentaciones & Pilotes
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
      if (u && p) { u.value = 'carlos.mendoza'; p.value = 'password123'; }
    });

    content.querySelector('#fill-demo-provider')?.addEventListener('click', () => {
      const u = content.querySelector('#auth-username');
      const p = content.querySelector('#auth-password');
      if (u && p) { u.value = 'caterpillar.equipos'; p.value = 'password123'; }
    });

    content.querySelector('#fill-demo-admin')?.addEventListener('click', () => {
      const u = content.querySelector('#auth-username');
      const p = content.querySelector('#auth-password');
      if (u && p) { u.value = 'admin'; p.value = 'admin123'; }
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
    showFooter: false,
    size: 'lg'
  });
}

export default openAuthModal;
