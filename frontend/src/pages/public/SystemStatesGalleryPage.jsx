import React from 'react';
import {
  AlertTriangle,
  Lock,
  Search,
  ServerCrash,
  CheckCircle2,
  Info,
  XCircle,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const SystemStatesGalleryPage = ({ onNavigate }) => {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Galería de Estados del Sistema</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Estados de Error, Sesión, Toasts y Skeleton Loaders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Demostración visual de todos los estados del sistema bajo el lenguaje sobrio Apple/Linear en modo claro y oscuro.
        </p>
      </div>

      {/* 1. ERROR SCREENS GRID */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Pantallas de Error y Control de Acceso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 404 */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">404</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Página no encontrada</h4>
            <p className="text-xs text-slate-500">El equipo o recurso solicitado no existe o fue movido.</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Volver al Inicio
            </button>
          </div>

          {/* 403 Forbidden */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">403</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Acceso Denegado</h4>
            <p className="text-xs text-slate-500">Se requiere rol de Proveedor o Administrador para este recurso.</p>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl"
            >
              Cambiar de Cuenta
            </button>
          </div>

          {/* Expired Session */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">JWT Expired</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sesión Caducada</h4>
            <p className="text-xs text-slate-500">Por seguridad el token expiró. Ingresa tus credenciales de nuevo.</p>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Iniciar Sesión
            </button>
          </div>

          {/* 500 Server Error */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <ServerCrash className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">500</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Error del Servidor</h4>
            <p className="text-xs text-slate-500">Inconsistencia en transacción o base de datos temporal.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl flex items-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reintentar
            </button>
          </div>
        </div>
      </section>

      {/* 2. TOASTS VARIANTS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Sistema de Notificaciones Toast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Reserva Confirmada</div>
              <div className="text-[11px] text-slate-500">Orden #ALQ-2026 liquidada correctamente.</div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Conflicto de Fechas</div>
              <div className="text-[11px] text-slate-500">La excavadora ya fue reservada para esos días.</div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Nueva Solicitud de Alquiler</div>
              <div className="text-[11px] text-slate-500">El contratista espera confirmación de entrega.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SKELETON PULSE LOADERS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Skeleton Pulse Loaders (Carga Asíncrona)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
