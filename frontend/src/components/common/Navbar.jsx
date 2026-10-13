import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HardHat, LogIn, LogOut, UserPlus, Shield, Wrench, Calendar, LayoutDashboard } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, isAdmin, isProvider, isClient, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                OPUS <span className="text-orange-600">RENTALS</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium -mt-1">
                Maquinaria & Equipos
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'catalog'
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Catálogo de Equipos
            </button>

            {isAuthenticated && isClient && (
              <button
                onClick={() => setCurrentTab('client-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'client-dashboard'
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Mis Alquileres
              </button>
            )}

            {isAuthenticated && isProvider && (
              <button
                onClick={() => setCurrentTab('provider-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'provider-dashboard'
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Panel Proveedor
              </button>
            )}

            {isAuthenticated && isAdmin && (
              <button
                onClick={() => setCurrentTab('admin-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'admin-dashboard'
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Administración
              </button>
            )}
          </nav>

          {/* User Session Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">
                    {user?.displayName}
                  </div>
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {user?.role?.replace('ROLE_', '')}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar Sesión"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.02]"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
