import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HardHat, LogIn, AlertCircle, Key, UserCheck } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
            <HardHat className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500">
            Accede a tu panel de control de Opus Rentals
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="ejemplo@opusrentals.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01]"
          >
            {loading ? 'Validando...' : 'Entrar a la Plataforma'}
          </button>
        </form>

        {/* Quick Test Credentials Helper Box */}
        <div className="pt-4 border-t border-slate-100">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Credenciales de Prueba Rápida (Demostración)
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillCredentials('admin@opusrentals.com')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('provider.caterpillar@opusrentals.com')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-center"
            >
              Proveedor
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('client.carlos@gmail.com')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-center"
            >
              Cliente
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          ¿No tienes una cuenta aún?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-orange-600 hover:underline"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};
