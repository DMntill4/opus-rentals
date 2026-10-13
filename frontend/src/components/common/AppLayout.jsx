import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HardHat,
  LayoutDashboard,
  Wrench,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  LogOut,
  FolderOpen,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  User,
  ExternalLink
} from 'lucide-react';

export const AppLayout = ({ currentTab, onNavigate, children }) => {
  const { user, isAuthenticated, isAdmin, isProvider, isClient, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If public browsing (Home, Catalog, Login, Register) and not explicitly in dashboard
  const isDashboardView = ['client-dashboard', 'provider-dashboard', 'admin-dashboard'].includes(currentTab);

  if (!isDashboardView) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        {/* Modern Top Header for Public & Marketplace */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand */}
              <div
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => onNavigate('home')}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-black">
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    OPUS<span className="text-blue-600">RENTALS</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Plataforma de Maquinaria
                  </span>
                </div>
              </div>

              {/* Center Nav */}
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${
                    currentTab === 'home'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => onNavigate('catalog')}
                  className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${
                    currentTab === 'catalog'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Catálogo de Equipos
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      if (isAdmin) onNavigate('admin-dashboard');
                      else if (isProvider) onNavigate('provider-dashboard');
                      else onNavigate('client-dashboard');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors ml-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Ir a Mi Portal
                  </button>
                )}
              </nav>

              {/* Right Auth controls */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-900">{user?.displayName}</div>
                      <div className="text-[10px] font-semibold text-blue-700 uppercase">
                        {user?.role?.replace('ROLE_', '')}
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      title="Cerrar sesión"
                      className="p-2 rounded-md text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('login')}
                      className="px-3.5 py-2 rounded-md text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => onNavigate('register')}
                      className="px-4 py-2 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      Crear Cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Public Content Body */}
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // DASHBOARD SAAS PORTAL WITH LATERAL SIDEBAR
  const getRoleLabel = () => {
    if (isAdmin) return 'Administrador Global';
    if (isProvider) return 'Empresa Proveedora';
    return 'Cliente / Contratista';
  };

  const getDashboardHomeTab = () => {
    if (isAdmin) return 'admin-dashboard';
    if (isProvider) return 'provider-dashboard';
    return 'client-dashboard';
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* LATERAL SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header in Sidebar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <HardHat className="w-4 h-4" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              OPUS<span className="text-blue-400">RENTALS</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Pill */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.displayName}</div>
              <div className="text-[10px] text-blue-400 font-semibold tracking-wide uppercase truncate">
                {getRoleLabel()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Plataforma
          </div>

          <button
            onClick={() => {
              onNavigate(getDashboardHomeTab());
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
              isDashboardView
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-white" />
            <span>Panel Principal</span>
          </button>

          <button
            onClick={() => {
              onNavigate('catalog');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span>Catálogo de Equipos</span>
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Página de Inicio</span>
          </button>

          {/* Role specific quick indicators */}
          <div className="pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Garantías del Sistema
          </div>
          <div className="px-3 py-2 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Base 4FN Anti-Colisión</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Token JWT Autenticado</span>
            </div>
          </div>
        </div>

        {/* Footer actions in sidebar */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar for Dashboard View */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-xs text-slate-500 font-medium">
              Opus Rentals &gt; <span className="text-slate-900 font-bold">{getRoleLabel()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('catalog')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              Explorar Catálogo Público
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">En línea</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
