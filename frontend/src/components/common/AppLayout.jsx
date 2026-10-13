import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

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
    <div className={`min-h-screen flex flex-col font-body ${isDark ? 'dark bg-[#0b1120] text-slate-100' : 'bg-background text-on-surface'} antialiased`}>
      {/* Stitch 1:1 Precision Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-outline-variant/40 dark:border-slate-800">
        <div className="max-w-[1240px] mx-auto h-20 px-gutter-desktop flex items-center justify-between gap-space-md">
          {/* Logo & Quick Search */}
          <div className="flex items-center gap-space-lg">
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-space-sm group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">precision_manufacturing</span>
              </div>
              <div className="flex flex-col">
                <span className="font-section text-section tracking-tight text-on-surface dark:text-white font-bold leading-tight">
                  OPUS RENTALS
                </span>
                <span className="font-caption text-caption text-outline dark:text-slate-400 uppercase tracking-wider">
                  COLOMBIA • INDUSTRIAL
                </span>
              </div>
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden xl:block w-72">
              <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar equipo o código..."
                className="w-full h-10 pl-9 pr-14 rounded-lg bg-surface-container-low dark:bg-slate-900 border border-outline-variant/60 dark:border-slate-700 font-body text-body text-on-surface dark:text-slate-100 placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
              <kbd className="absolute right-space-xs top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-[10px] font-caption text-on-surface-variant dark:text-slate-400 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-space-lg text-body font-body-medium">
            <button
              onClick={() => onNavigate('catalog')}
              className={`transition-colors cursor-pointer ${
                currentTab === 'catalog'
                  ? 'text-primary-container font-semibold'
                  : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              Catálogo de Maquinaria
            </button>
            <button
              onClick={() => onNavigate('checkout')}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'checkout'
                  ? 'text-primary-container font-semibold'
                  : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              <span>Reserva & Alquiler</span>
              {items && items.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-white text-[11px] font-mono">
                  {items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('system-states')}
              className={`transition-colors cursor-pointer ${
                currentTab === 'system-states'
                  ? 'text-primary-container font-semibold'
                  : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
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
                        ? 'text-primary-container font-semibold'
                        : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
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
                        ? 'text-primary-container font-semibold'
                        : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
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
                        ? 'text-primary-container font-semibold'
                        : 'text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white'
                    }`}
                  >
                    Portal Admin
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Controls: Lang, Theme, Auth */}
          <div className="flex items-center gap-space-sm">
            {/* Lang Switch */}
            <div className="flex items-center p-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 border border-outline-variant/50 dark:border-slate-700 text-caption font-caption">
              <button
                type="button"
                onClick={toggleLang}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  lang === 'ES'
                    ? 'bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white shadow-sm font-bold'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={toggleLang}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  lang === 'EN'
                    ? 'bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white shadow-sm font-bold'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Switch */}
            <div className="flex items-center p-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 border border-outline-variant/50 dark:border-slate-700">
              <button
                type="button"
                onClick={toggleTheme}
                title="Modo Claro"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  !isDark
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                title="Modo Oscuro"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
              </button>
            </div>

            {/* User Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : isProvider ? 'provider-dashboard' : 'client-dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-800 border border-outline-variant/60 dark:border-slate-700 text-on-surface dark:text-white text-body-medium font-medium hover:border-primary-container transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user?.name || 'Usuario'}</span>
                </button>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 rounded-lg text-outline hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="hidden sm:inline-flex items-center justify-center h-10 px-space-md rounded-lg border border-outline-variant/80 dark:border-slate-700 font-body-medium text-body-medium text-on-surface dark:text-slate-200 hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center justify-center h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-body-medium text-body-medium hover:bg-secondary active:scale-[0.98] transition-all shadow-sm cursor-pointer"
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
      <footer className="w-full bg-surface-container-lowest dark:bg-[#0f172a] border-t border-outline-variant/40 dark:border-slate-800 mt-auto">
        <div className="max-w-[1240px] mx-auto px-gutter-desktop py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-gutter-desktop pb-space-xl border-b border-outline-variant/30 dark:border-slate-800">
            {/* Columna 1: Info Empresa */}
            <div className="lg:col-span-4 flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
                </div>
                <span className="font-section text-section tracking-tight text-on-surface dark:text-white font-bold">
                  OPUS RENTALS
                </span>
              </div>
              <p className="font-body text-body text-on-surface-variant dark:text-slate-400 max-w-sm">
                Plataforma líder en Colombia para el despliegue, gestión telemática y arrendamiento corporativo de maquinaria pesada y equipos para infraestructura vial, minería y obras civiles.
              </p>
              <div className="flex items-center gap-space-xs mt-space-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 text-caption font-caption text-on-surface-variant dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container mr-1.5"></span>
                  SLA OPERATIVO 99.8%
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 text-caption font-caption text-on-surface-variant dark:text-slate-300">
                  ISO 9001:2015
                </span>
              </div>
            </div>

            {/* Columna 2: Hubs Logísticos */}
            <div className="lg:col-span-3 flex flex-col gap-space-sm">
              <h3 className="font-caption text-caption text-on-surface dark:text-slate-200 uppercase tracking-wider font-bold">
                Centros Logísticos Activos
              </h3>
              <ul className="space-y-space-xs font-body text-body text-on-surface-variant dark:text-slate-400">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    Bogotá D.C. (Cota Hub)
                  </span>
                  <span className="font-caption text-caption text-outline dark:text-slate-500">Disp. Alta</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    Medellín (Guarne Hub)
                  </span>
                  <span className="font-caption text-caption text-outline dark:text-slate-500">Disp. Alta</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    Cali (Yumbo Patio)
                  </span>
                  <span className="font-caption text-caption text-outline dark:text-slate-500">Normal</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    Barranquilla (Zona Portuaria)
                  </span>
                  <span className="font-caption text-caption text-outline dark:text-slate-500">Normal</span>
                </li>
              </ul>
            </div>

            {/* Columna 3: Navegación */}
            <div className="lg:col-span-2 flex flex-col gap-space-sm">
              <h3 className="font-caption text-caption text-on-surface dark:text-slate-200 uppercase tracking-wider font-bold">
                Navegación
              </h3>
              <ul className="space-y-space-xs font-body text-body text-on-surface-variant dark:text-slate-400">
                <li>
                  <button onClick={() => onNavigate('catalog')} className="hover:text-primary transition-colors text-left cursor-pointer">
                    Catálogo General
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('checkout')} className="hover:text-primary transition-colors text-left cursor-pointer">
                    Tarifas & Seguros
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('provider-dashboard')} className="hover:text-primary transition-colors text-left cursor-pointer">
                    Portal Proveedores
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('system-states')} className="hover:text-primary transition-colors text-left cursor-pointer">
                    Inspección & Telemetría
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 4: Contacto */}
            <div className="lg:col-span-3 flex flex-col gap-space-sm">
              <h3 className="font-caption text-caption text-on-surface dark:text-slate-200 uppercase tracking-wider font-bold">
                Contacto & Soporte 24/7
              </h3>
              <p className="font-body text-body text-on-surface-variant dark:text-slate-400">
                Línea Nacional: 01 8000 423 800<br />
                Directo Operaciones: +57 (601) 745-9200<br />
                soporte@opusrentals.co
              </p>
              <div className="p-space-sm rounded-lg bg-surface-container-low dark:bg-slate-900 border border-outline-variant/40 dark:border-slate-800 mt-space-xs">
                <span className="font-caption text-caption text-on-surface dark:text-slate-200 block uppercase font-bold">
                  Facturación Electrónica DIAN
                </span>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                  Emisión XML UBL 2.1 habilitada para Grandes Contribuyentes y Consorcios.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Bar */}
          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-outline dark:text-slate-500">
            <p>© 2026 OPUS RENTALS COLOMBIA S.A.S. • NIT 901.482.930-1. Todos los derechos reservados.</p>
            <div className="flex items-center gap-space-md">
              <button className="hover:text-on-surface dark:hover:text-slate-300 transition-colors">Términos de Servicio</button>
              <button className="hover:text-on-surface dark:hover:text-slate-300 transition-colors">Política Habeas Data</button>
              <button className="hover:text-on-surface dark:hover:text-slate-300 transition-colors">Cumplimiento SAGRILAFT</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
