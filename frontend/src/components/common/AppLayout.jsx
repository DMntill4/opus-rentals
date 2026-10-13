import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import {
  Wrench,
  Search,
  Globe,
  Sun,
  Moon,
  User,
  LogOut,
  ShoppingCart,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  Layers,
  Award
} from 'lucide-react';

export const AppLayout = ({ currentTab, onNavigate, children }) => {
  const { user, isAuthenticated, isAdmin, isProvider, isClient, logout } = useAuth();
  const { isDark, toggleTheme, lang, toggleLang } = useTheme();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  // If in pure auth screen, let StitchAuthPage take full canvas
  if (['login', 'register'].includes(currentTab)) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'dark bg-[#0b1120] text-slate-100' : 'bg-[#faf8ff] text-slate-900'} antialiased`}>
      {/* Stitch 1:1 Precision Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="w-full max-w-[1440px] mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo & Quick Search */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shadow-blue-500/20 shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  OPUS RENTALS
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  COLOMBIA • INDUSTRIAL
                </span>
              </div>
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden xl:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar equipo o código..."
                className="w-full h-10 pl-9 pr-14 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onNavigate('catalog')}
              className={`transition-colors cursor-pointer ${
                currentTab === 'catalog'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Catálogo de Maquinaria
            </button>
            <button
              onClick={() => onNavigate('checkout')}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'checkout'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Reserva & Alquiler</span>
              {items && items.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('system-states')}
              className={`transition-colors cursor-pointer ${
                currentTab === 'system-states'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Estados del Sistema
            </button>

            {isAuthenticated && (
              <>
                {(isClient || isAdmin) && (
                  <button
                    onClick={() => onNavigate('client-dashboard')}
                    className={`transition-colors cursor-pointer ${
                      currentTab === 'client-dashboard'
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Mis Alquileres
                  </button>
                )}
                {(isProvider || isAdmin) && (
                  <button
                    onClick={() => onNavigate('provider-dashboard')}
                    className={`transition-colors cursor-pointer ${
                      currentTab === 'provider-dashboard'
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Portal Proveedor
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin-dashboard')}
                    className={`transition-colors cursor-pointer ${
                      currentTab === 'admin-dashboard'
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Portal Admin
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Controls: Lang, Theme, Auth */}
          <div className="flex items-center gap-3">
            {/* Lang Switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={toggleLang}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  lang === 'ES'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={toggleLang}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  lang === 'EN'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={toggleTheme}
                title="Alternar Modo Oscuro/Claro"
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </button>
            </div>

            {/* User Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : isProvider ? 'provider-dashboard' : 'client-dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium hover:border-blue-600 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold">{user?.displayName || user?.name || 'Mi Cuenta'}</span>
                </button>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 font-medium text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  Publicar Equipo
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {children}
      </main>

      {/* Stitch 1:1 Precision Footer */}
      <footer className="w-full bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
            {/* Columna 1: Info Empresa */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  OPUS RENTALS
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                Plataforma líder en Colombia para el despliegue, gestión telemática y arrendamiento corporativo de maquinaria pesada y equipos para infraestructura vial, minería y obras civiles.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                  SLA OPERATIVO 99.8%
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ISO 9001:2015
                </span>
              </div>
            </div>

            {/* Columna 2: Hubs Logísticos */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                Centros Logísticos Activos
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Bogotá D.C. (Cota Hub)
                  </span>
                  <span className="text-xs text-slate-400">Disp. Alta</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Medellín (Guarne Hub)
                  </span>
                  <span className="text-xs text-slate-400">Disp. Alta</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Cali (Yumbo Patio)
                  </span>
                  <span className="text-xs text-slate-400">Normal</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Barranquilla (Zona Portuaria)
                  </span>
                  <span className="text-xs text-slate-400">Normal</span>
                </li>
              </ul>
            </div>

            {/* Columna 3: Navegación */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                Navegación
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <button onClick={() => onNavigate('catalog')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                    Catálogo General
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('checkout')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                    Tarifas & Seguros
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('provider-dashboard')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                    Portal Proveedores
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('system-states')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                    Inspección & Telemetría
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 4: Contacto */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                Contacto & Soporte 24/7
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Línea Nacional: 01 8000 423 800<br />
                Directo Operaciones: +57 (601) 745-9200<br />
                soporte@opusrentals.co
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mt-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block uppercase">
                  Facturación Electrónica DIAN
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Emisión XML UBL 2.1 habilitada para Grandes Contribuyentes y Consorcios.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>© 2026 OPUS RENTALS COLOMBIA S.A.S. • NIT 901.482.930-1. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <button className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Términos de Servicio</button>
              <button className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Política Habeas Data</button>
              <button className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Cumplimiento SAGRILAFT</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
