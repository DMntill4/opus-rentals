import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LayoutDashboard, Users, TrendingUp, DollarSign, Wrench, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics', 'users', 'rentals'
  const [summary, setSummary] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, usersRes, rentalsRes] = await Promise.all([
        api.get('/admin/reports/dashboard'),
        api.get('/admin/users'),
        api.get('/rentals'),
      ]);
      setSummary(sumRes.data || null);
      setUsersList(usersRes.data || []);
      setAllRentals(rentalsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      fetchDashboardData();
    } catch (err) {
      alert('Error actualizando estado de usuario: ' + err.message);
    }
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">Consola Central de Administración</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Panel de Control & Supervisión de la Plataforma
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Supervisa ingresos, métricas de ocupación, auditoría de usuarios y facturación en tiempo real.
        </p>
      </div>

      {/* KPI Stats Grid */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Ingresos Recaudados</span>
              <span className="text-xl font-black text-slate-900">{formatMoney(summary.totalRevenue)}</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Por Recaudar (Facturado)</span>
              <span className="text-xl font-black text-amber-600">{formatMoney(summary.pendingRevenue)}</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Alquileres Activos / Total</span>
              <span className="text-xl font-black text-slate-900">{summary.activeRentals} / {summary.totalRentals}</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Clientes / Proveedores</span>
              <span className="text-xl font-black text-slate-900">{summary.totalClients} / {summary.totalProviders}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Métricas & Rentabilidad
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Gestión de Usuarios ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'rentals'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Auditoría de Alquileres ({allRentals.length})
        </button>
      </div>

      {/* TAB 1: METRICS & TOP TOOLS */}
      {activeTab === 'metrics' && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Rented Tools */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Herramientas con Mayor Demanda</h3>
            <div className="space-y-3">
              {summary.topRentedTools?.map((t, idx) => (
                <div key={t.toolId} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{t.toolName}</div>
                      <div className="text-xs text-slate-400">{t.categoryName} • {t.providerCompanyName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-orange-600">{t.totalRentals} alquiler(es)</div>
                    <div className="text-xs text-slate-500">{formatMoney(t.generatedRevenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Month Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ingresos Liquidados por Mes</h3>
            <div className="space-y-3">
              {summary.revenueHistory?.map((m) => (
                <div key={m.month} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Mes: {m.month}</div>
                    <div className="text-xs text-slate-400">{m.rentalsCount} facturas cobradas</div>
                  </div>
                  <div className="text-base font-black text-emerald-600">
                    {formatMoney(m.revenue)}
                  </div>
                </div>
              ))}
              {summary.revenueHistory?.length === 0 && (
                <p className="text-xs text-slate-400">Sin registros históricos de facturación.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Listado de Usuarios Registrados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID & Email</th>
                  <th className="px-6 py-4">Nombre / Empresa</th>
                  <th className="px-6 py-4">Rol en Sistema</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">#{u.userId}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {u.companyName || (u.firstName ? `${u.firstName} ${u.lastName}` : 'Administrador')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.userId, u.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            u.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Desactivar' : 'Reactivar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORIA DE ALQUILERES */}
      {activeTab === 'rentals' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Auditoría Global de Transacciones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Alquiler</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Fechas</th>
                  <th className="px-6 py-4">Monto Liquidado</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">#{r.id} - {r.toolName}</div>
                      <div className="text-xs text-slate-400">Factura: {r.invoiceNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{r.clientFullName}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{r.providerCompanyName}</td>
                    <td className="px-6 py-4 text-xs">{r.startDate} al {r.endDate} ({r.totalDays}d)</td>
                    <td className="px-6 py-4 font-bold text-orange-600">{formatMoney(r.estimatedTotal)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
