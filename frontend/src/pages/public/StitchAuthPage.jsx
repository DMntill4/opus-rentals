import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Globe, Eye, EyeOff, Check, ArrowRight, ShieldCheck, FileCheck, Lock, Building2, User, AlertCircle, X } from 'lucide-react';

export const StitchAuthPage = ({ onNavigate }) => {
  const { login, registerClient, registerProvider, loading } = useAuth();
  const { isDark, toggleTheme, lang, toggleLang } = useTheme();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('cliente'); // 'cliente' or 'proveedor'
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('gerencia@obrasbogota.co');
  const [password, setPassword] = useState('password123');
  const [rememberSession, setRememberSession] = useState(true);

  const t = {
    ES: {
      tabLogin: "Iniciar Sesión",
      tabRegister: "Crear Cuenta",
      accessBadge: "ACCESO CORPORATIVO",
      region: "BOG • MDE • BAQ • CLO",
      loginHeading: "Bienvenido al portal",
      loginSub: "Plataforma B2B para contratación y despacho de maquinaria pesada.",
      regHeading: "Crear cuenta corporativa",
      regSub: "Regístrese para gestionar contratos de alquiler o publicar maquinaria industrial.",
      nameLabel: "Nombre completo / Razón social",
      emailLabel: "Correo electrónico corporativo",
      pwdLabel: "Contraseña",
      remember: "Recordar sesión",
      forgot: "¿Olvidó su contraseña?",
      submitLogin: "Acceder al Portal",
      submitRegister: "Crear Cuenta Empresarial",
      roleTitle: "Seleccione su tipo de cuenta:",
      roleCliente: "Cliente / Constructor",
      roleClienteDesc: "Deseo alquilar maquinaria para mis proyectos y frentes de obra.",
      roleProv: "Proveedor de Maquinaria",
      roleProvDesc: "Deseo publicar mi flota de equipos pesados y generar ingresos.",
      demoTitle: "CREDENCIALES DE PRUEBA RÁPIDA (1-CLIC)",
      status: "Sistemas Operativos 100%",
      priv: "Privacidad",
      term: "Términos Comerciales",
      quote: "“Gestión digital y disponibilidad en tiempo real sin intermediarios para las principales constructoras y concesiones viales de Colombia.”",
      lastRental: "Último despacho: Retroexcavadora 336D en Antioquia",
      errTitle: "Credenciales incorrectas",
      errDesc: "El correo o la clave no corresponden a un usuario autorizado en Colombia."
    },
    EN: {
      tabLogin: "Sign In",
      tabRegister: "Create Account",
      accessBadge: "ENTERPRISE ACCESS",
      region: "BOG • MDE • BAQ • CLO",
      loginHeading: "Welcome to the portal",
      loginSub: "B2B platform for heavy machinery contracting and dispatching.",
      regHeading: "Create corporate account",
      regSub: "Register to manage rental contracts or list heavy industrial equipment.",
      nameLabel: "Full Name / Legal Entity",
      emailLabel: "Corporate Email Address",
      pwdLabel: "Password",
      remember: "Remember session",
      forgot: "Forgot your password?",
      submitLogin: "Access Portal",
      submitRegister: "Create Business Account",
      roleTitle: "Select your account type:",
      roleCliente: "Customer / Contractor",
      roleClienteDesc: "I need to rent machinery for construction sites and civil works.",
      roleProv: "Equipment Supplier",
      roleProvDesc: "I want to list my heavy fleet and monetize idle machinery.",
      demoTitle: "ONE-CLICK TEST CREDENTIALS",
      status: "All Systems Operational 100%",
      priv: "Privacy Policy",
      term: "Commercial Terms",
      quote: "“Digital management and real-time equipment availability with zero intermediaries for civil contractors in Colombia.”",
      lastRental: "Recent dispatch: Excavator 336D in Antioquia",
      errTitle: "Invalid credentials",
      errDesc: "The email or password does not match an authorized enterprise account."
    }
  }[lang.toUpperCase()] || {
    tabLogin: "Iniciar Sesión",
    tabRegister: "Crear Cuenta",
    accessBadge: "ACCESO CORPORATIVO",
    region: "BOG • MDE • BAQ • CLO",
    loginHeading: "Bienvenido al portal",
    loginSub: "Plataforma B2B para contratación y despacho de maquinaria pesada.",
    regHeading: "Crear cuenta corporativa",
    regSub: "Regístrese para gestionar contratos de alquiler o publicar maquinaria industrial.",
    nameLabel: "Nombre completo / Razón social",
    emailLabel: "Correo electrónico corporativo",
    pwdLabel: "Contraseña",
    remember: "Recordar sesión",
    forgot: "¿Olvidó su contraseña?",
    submitLogin: "Acceder al Portal",
    submitRegister: "Crear Cuenta Empresarial",
    roleTitle: "Seleccione su tipo de cuenta:",
    roleCliente: "Cliente / Constructor",
    roleClienteDesc: "Deseo alquilar maquinaria para mis proyectos y frentes de obra.",
    roleProv: "Proveedor de Maquinaria",
    roleProvDesc: "Deseo publicar mi flota de equipos pesados y generar ingresos.",
    demoTitle: "CREDENCIALES DE PRUEBA RÁPIDA (1-CLIC)",
    status: "Sistemas Operativos 100%",
    priv: "Privacidad",
    term: "Términos Comerciales",
    quote: "“Gestión digital y disponibilidad en tiempo real sin intermediarios para las principales constructoras y concesiones viales de Colombia.”",
    lastRental: "Último despacho: Retroexcavadora 336D en Antioquia",
    errTitle: "Credenciales incorrectas",
    errDesc: "El correo o la clave no corresponden a un usuario autorizado en Colombia."
  };

  const handleLoadCredential = (type) => {
    setShowErrorBanner(false);
    if (type === 'admin') {
      setEmail('admin@opusrentals.com');
      setPassword('password123');
    } else if (type === 'proveedor') {
      setEmail('provider.caterpillar@opusrentals.com');
      setPassword('password123');
    } else if (type === 'cliente') {
      setEmail('client.carlos@gmail.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrorBanner(false);

    try {
      if (authMode === 'login') {
        const session = await login(email, password);
        if (session.role === 'ROLE_ADMIN') onNavigate('admin-dashboard');
        else if (session.role === 'ROLE_PROVIDER') onNavigate('provider-dashboard');
        else onNavigate('client-dashboard');
      } else {
        if (selectedRole === 'cliente') {
          await registerClient({
            email,
            password,
            firstName: fullName.split(' ')[0] || 'Cliente',
            lastName: fullName.split(' ')[1] || 'Empresarial',
            documentType: 'CC',
            documentNumber: '1098' + Math.floor(100000 + Math.random() * 900000),
            phone: '+57 310 4509821',
            address: 'Zona Industrial Calle 80, Bogotá'
          });
          onNavigate('client-dashboard');
        } else {
          await registerProvider({
            email,
            password,
            companyName: fullName || 'Proveedor Maquinaria SAS',
            taxId: '900' + Math.floor(1000000 + Math.random() * 9000000) + '-1',
            address: 'Autopista Medellín Km 7, Cundinamarca',
            contacts: [{ contactType: 'PHONE', contactValue: '+57 601 7458900' }],
            coverageZones: [{ state: 'Cundinamarca', city: 'Bogotá D.C.' }]
          });
          onNavigate('provider-dashboard');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || t.errDesc);
      setShowErrorBanner(true);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      {/* 1440px CONTAINER SPLIT 50/50 */}
      <div className="w-full max-w-[1440px] mx-auto min-h-screen flex flex-col lg:flex-row relative">
        
        {/* LEFT COLUMN: AUTHENTICATION FORM & CONTROLS (50%) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1120] border-r border-[#E2E8F0] dark:border-[#1E293B]">
          
          {/* Top Bar inside form */}
          <div className="w-full flex items-center justify-between pb-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-blue-500/20 font-black">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <circle cx="12" cy="14" r="2.5" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[17px] font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">OPUS</span>
                  <span className="text-[17px] font-medium tracking-tight text-[#64748B] dark:text-[#94A3B8]">RENTALS</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">COLOMBIA • INDUSTRIAL</span>
              </div>
            </div>

            {/* Language & Theme Controls */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center p-0.5 bg-white dark:bg-[#131D31] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg shadow-sm">
                <button
                  onClick={toggleLang}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#2563EB] text-white uppercase flex items-center space-x-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>{lang.toUpperCase()}</span>
                </button>
              </div>

              <div className="flex items-center p-0.5 bg-white dark:bg-[#131D31] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg shadow-sm">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  title="Cambiar tema"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2563EB]" />}
                </button>
              </div>
            </div>
          </div>

          {/* Main Form Center */}
          <div className="w-full max-w-[480px] mx-auto my-auto py-6">
            
            {/* Segmented Control */}
            <div className="w-full p-1 bg-white dark:bg-[#131D31] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl flex items-center mb-6 shadow-sm">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {t.tabLogin}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {t.tabRegister}
              </button>
            </div>

            {/* Header Titles */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#2563EB] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/40">
                  {t.accessBadge}
                </span>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  {t.region}
                </span>
              </div>
              <h1 className="text-[32px] font-bold tracking-tight leading-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {authMode === 'login' ? t.loginHeading : t.regHeading}
              </h1>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 leading-relaxed">
                {authMode === 'login' ? t.loginSub : t.regSub}
              </p>
            </div>

            {/* Error Banner */}
            {showErrorBanner && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start space-x-3 text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-[13px] leading-tight">
                  <p className="font-semibold text-rose-900 dark:text-rose-200">{t.errTitle}</p>
                  <p className="text-rose-700 dark:text-rose-400 mt-0.5">{errorMessage || t.errDesc}</p>
                </div>
                <button onClick={() => setShowErrorBanner(false)} className="text-rose-500 hover:text-rose-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mb-1">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Carlos Gómez / Constructora Bolívar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-[48px] px-4 text-[14px] rounded-xl bg-white dark:bg-[#131D31] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder="gerencia@obrasbogota.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[48px] px-4 text-[14px] rounded-xl bg-white dark:bg-[#131D31] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mb-1">
                  {t.pwdLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[48px] px-4 pr-12 text-[14px] rounded-xl bg-white dark:bg-[#131D31] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'login' ? (
                <div className="flex items-center justify-between text-[13px] pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB] border-[#E2E8F0] dark:border-[#1E293B]"
                    />
                    <span className="text-[#64748B] dark:text-[#94A3B8]">{t.remember}</span>
                  </label>
                  <span
                    onClick={() => alert('Enlace de recuperación enviado al correo corporativo.')}
                    className="font-medium text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {t.forgot}
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {t.roleTitle}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">COLOMBIA B2B</span>
                  </div>

                  {/* Role Card 1: Cliente */}
                  <div
                    onClick={() => setSelectedRole('cliente')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      selectedRole === 'cliente'
                        ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131D31]'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{t.roleCliente}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">OBRAS</span>
                        </div>
                        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{t.roleClienteDesc}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 border-[#2563EB] flex items-center justify-center ml-2`}>
                      {selectedRole === 'cliente' && <div className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                    </div>
                  </div>

                  {/* Role Card 2: Proveedor */}
                  <div
                    onClick={() => setSelectedRole('proveedor')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      selectedRole === 'proveedor'
                        ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131D31]'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{t.roleProv}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">FLOTAS</span>
                        </div>
                        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{t.roleProvDesc}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center ml-2`}>
                      {selectedRole === 'proveedor' && <div className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] rounded-xl flex items-center justify-center space-x-2 shadow-sm shadow-blue-600/25 transition-all mt-4"
              >
                <span>{loading ? 'Validando...' : authMode === 'login' ? t.submitLogin : t.submitRegister}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 1-Click Credentials Bar (Stitch Feature) */}
            <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8]">
                  {t.demoTitle}
                </span>
                <span
                  onClick={() => {
                    setErrorMessage(t.errDesc);
                    setShowErrorBanner(true);
                  }}
                  className="text-[11px] font-medium text-[#2563EB] cursor-pointer hover:underline"
                >
                  Simular Error
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadCredential('admin')}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131D31] hover:border-[#2563EB] text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">Admin</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">admin@opusrentals.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadCredential('proveedor')}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131D31] hover:border-[#2563EB] text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">Proveedor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">provider.caterpillar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadCredential('cliente')}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131D31] hover:border-[#2563EB] text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">Cliente</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">client.carlos</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Security status */}
          <div className="w-full pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{t.status}</span>
              </span>
              <span>•</span>
              <span>Bogotá GMT-5</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>v2.8.4-PROD</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CINEMATIC ARCHITECTURAL PHOTOGRAPHY & TRUST BADGES (50%) */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
          
          {/* Background Image */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY8--SgHisXMJFWbPvzDojSrbQV9WOP92P-ZU_A3PoEr_pn9-XX_dos20degXLeBC-TVhGm-UYJIMtUhlR70bRyfRyU9TRDoWmuZYIs7o6G7JoF5loquLnb9DMlLRm_93d0UBTcLfZtH00k76KPeqwsPxYmZ13S3SQW90z5el-YXttyRy5g8-Suw4dGIX9I4rfWLw2affE8_tc3EsE6YbVZvtb2oT74PnY8zYL1c4lzpCknP0WM4VzAw"
            alt="Caterpillar Hydraulic Excavator on construction site Colombia"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/50 pointer-events-none" />
          <div className="absolute inset-0 bg-blue-950/15 mix-blend-multiply pointer-events-none" />

          {/* Top Metric Overlay Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white shadow-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[12px] font-semibold tracking-wide">MAQUINARIA PESADA VERIFICADA</span>
              <span className="text-white/40">|</span>
              <span className="text-[12px] font-mono text-emerald-300 font-bold">+1.480 EQUIPOS</span>
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.lastRental}</span>
            </div>
          </div>

          {/* Bottom Content Block: Quote & 3 Trust Badges */}
          <div className="relative z-10 space-y-6">
            
            {/* Quote Container */}
            <div className="p-7 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-wider">
                  ESTÁNDAR OPERATIVO
                </span>
                <span className="text-amber-400 text-xs">★★★★★</span>
                <span className="text-[12px] font-mono text-white/70">4.98/5.0 CONTRACTOR RATING</span>
              </div>

              <blockquote className="text-[18px] font-semibold text-white leading-snug">
                {t.quote}
              </blockquote>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-white/70 text-[12px]">
                <div>
                  <p className="font-bold text-white text-[13px]">Consorcio Vial Andes 4G</p>
                  <p className="text-white/60">Medellín — Concesión Autopistas del Río</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                    $ 1.250.000 / DÍA
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white">Normalización 4FN</p>
                  <p className="text-[10px] text-white/60">Inspección de obra</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white">Seguridad JWT 256</p>
                  <p className="text-[10px] text-white/60">Cifrado bancario</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white">Facturación DIAN</p>
                  <p className="text-[10px] text-white/60">XML 1.9 Oficial</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
