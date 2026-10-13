import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HardHat, LogIn, AlertCircle, Key, UserCheck, Shield, Wrench, User, ArrowRight } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userSession = await login(email, password);
      if (userSession.role === 'ROLE_ADMIN') {
        onNavigate('admin-dashboard');
      } else if (userSession.role === 'ROLE_PROVIDER') {
        onNavigate('provider-dashboard');
      } else {
        onNavigate('client-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  const handleFillCredentials = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Brand & Value proposition */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold uppercase tracking-wider mb-6">
              Plataforma SaaS B2B / B2C
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">
                OPUS<span className="text-blue-400">RENTALS</span>
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white mb-3">
              Gestión segura y centralizada de maquinaria
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Accede al ecosistema con validación de disponibilidad en tiempo real, liquidación de depósitos en garantía y facturación electrónica.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Autenticación Stateless con JWT y Roles RBAC</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>Base Normalizada en 4FN sin Colisiones</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Solid Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa tus credenciales para acceder a tu panel
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@opusrentals.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-slate-400">Default: password123</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Autenticando...' : 'Acceder al Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Helper Box */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Acceso Rápido por Perfil (1 clic):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin@opusrentals.com')}
                  className="p-2 rounded-md bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('provider.caterpillar@opusrentals.com')}
                  className="p-2 rounded-md bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  Proveedor
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('client.carlos@gmail.com')}
                  className="p-2 rounded-md bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  Cliente
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            ¿No tienes cuenta de usuario?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-blue-600 hover:underline"
            >
              Regístrate gratis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
