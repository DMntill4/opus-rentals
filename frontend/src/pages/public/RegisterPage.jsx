import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Building2, AlertCircle, HardHat } from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { registerClient, registerProvider, loading } = useAuth();
  const [roleType, setRoleType] = useState('CLIENT'); // 'CLIENT' or 'PROVIDER'
  const [error, setError] = useState(null);

  // Common
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Client fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Provider fields
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [coverageCity, setCoverageCity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (roleType === 'CLIENT') {
        await registerClient({
          email,
          password,
          firstName,
          lastName,
          documentType,
          documentNumber,
          phone,
          address,
        });
        onNavigate('client-dashboard');
      } else {
        await registerProvider({
          email,
          password,
          companyName,
          taxId,
          address,
          contacts: contactPhone ? [{ contactType: 'PHONE', contactValue: contactPhone }] : [],
          coverageZones: coverageCity ? [{ state: 'Principal', city: coverageCity }] : [],
        });
        onNavigate('provider-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error durante el registro');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-md border border-slate-200/80 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto shadow-md shadow-blue-600/20">
            <HardHat className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Crear Cuenta en Opus Rentals
          </h2>
          <p className="text-xs text-slate-500">
            Selecciona el tipo de cuenta según tus necesidades
          </p>
        </div>

        {/* Role Type Selector Pills */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setRoleType('CLIENT')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-all ${
              roleType === 'CLIENT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Soy Cliente / Contratista
          </button>
          <button
            type="button"
            onClick={() => setRoleType('PROVIDER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-all ${
              roleType === 'PROVIDER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Soy Proveedor de Maquinaria
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña (Mínimo 6 carácteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {roleType === 'CLIENT' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Carlos"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Gómez"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  >
                    <option value="CC">Cédula (CC)</option>
                    <option value="CE">Cédula Extranjería (CE)</option>
                    <option value="NIT">NIT Persona Jurídica</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento</label>
                  <input
                    type="text"
                    required
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="1018273645"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 310 1234567"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección de Despacho</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle 100 #15-20, Bogotá"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Razón Social de la Empresa</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Equipos del Norte SAS"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIT / ID Tributario</label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="NIT-901234567-8"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección Fiscal / Bodega</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Zona Industrial Calle 13 #68-20"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ciudad Principal</label>
                  <input
                    type="text"
                    required
                    value={coverageCity}
                    onChange={(e) => setCoverageCity(e.target.value)}
                    placeholder="Bogotá"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Línea Telefónica Comercial</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+57 601 7458900"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            {loading ? 'Creando cuenta...' : 'Finalizar Registro'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          ¿Ya tienes cuenta registrada?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-blue-600 hover:underline"
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
};
