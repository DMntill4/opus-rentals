import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatMoneyCOP, formatDateCO } from '../../context/i18n';
import {
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  XCircle,
  Truck,
  RotateCcw,
  Search,
  ExternalLink
} from 'lucide-react';

export const ClientDashboard = ({ onOpenInvoice, onNavigate }) => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rentals/my-rentals');
      setRentals(res.data || []);
    } catch (err) {
      console.error('Error fetching client rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRental = async (rentalId) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta solicitud de alquiler?')) return;
    try {
      await api.patch(`/rentals/${rentalId}/status`, {
        status: 'CANCELLED',
        reason: 'Cancelado por el cliente',
      });
      fetchRentals();
    } catch (err) {
      alert('Error al cancelar: ' + err.message);
    }
  };

  const filteredRentals = rentals.filter((r) => {
    if (activeTab === 'ACTIVE') return r.status === 'IN_PROGRESS' || r.status === 'APPROVED' || r.status === 'PENDING';
    if (activeTab === 'COMPLETED') return r.status === 'RETURNED';
    if (activeTab === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  const getStatusPill = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Pendiente</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">Confirmada</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white">En Curso / Obra</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Completada</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400">Cancelada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Portal del Cliente</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Mis Alquileres & Órdenes en Obra
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revisa el estado de entrega, descarga facturas legales y gestiona tus reservas de maquinaria pesada.
          </p>
        </div>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          + Nueva Reserva
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'ALL', label: `Todos (${rentals.length})` },
          { id: 'ACTIVE', label: 'En Curso & Activos' },
          { id: 'COMPLETED', label: 'Completados' },
          { id: 'CANCELLED', label: 'Cancelados' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Expandable Rows Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Sin alquileres en este estado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No tienes órdenes de alquiler registradas en esta categoría. Puedes explorar el catálogo de maquinaria disponible.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map((r) => {
            const isExpanded = expandedRow === r.id;
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-600">
                      #{r.id}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.toolName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDateCO(r.startDate)} al {formatDateCO(r.endDate)} ({r.totalDays}d) • Proveedor: <span className="font-semibold text-slate-700 dark:text-slate-300">{r.providerCompanyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Total liquidado</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatMoneyCOP(r.estimatedTotal)}
                      </span>
                    </div>

                    <div>{getStatusPill(r.status)}</div>

                    <div className="p-1 rounded-lg text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Card Details (Prompt 6 Spec) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-5">
                    {/* Horizontal Stepper: Pendiente -> Confirmada -> En curso -> Completada */}
                    <div className="py-3">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                        Línea de Vida del Alquiler en Obra
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {[
                          { key: 'PENDING', label: '1. Pendiente' },
                          { key: 'APPROVED', label: '2. Confirmada' },
                          { key: 'IN_PROGRESS', label: '3. En Obra' },
                          { key: 'RETURNED', label: '4. Completada' },
                        ].map((st, sIdx) => {
                          const isDone = ['APPROVED', 'IN_PROGRESS', 'RETURNED'].includes(r.status) && sIdx <= (r.status === 'RETURNED' ? 3 : r.status === 'IN_PROGRESS' ? 2 : 1);
                          return (
                            <div
                              key={st.key}
                              className={`p-2 rounded-lg font-bold text-[11px] border ${
                                isDone
                                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                              }`}
                            >
                              {st.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Breakdown & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div>Factura Electrónica: <strong>{r.invoiceNumber || 'Emitida en pasarela'}</strong></div>
                        <div>Depósito Reembolsable: <strong>{formatMoneyCOP(r.depositAmount || 0)}</strong></div>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.invoiceNumber && (
                          <button
                            onClick={() => onOpenInvoice(r)}
                            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            Ver Factura Imprimible
                          </button>
                        )}

                        {r.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelRental(r.id)}
                            className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
                          >
                            Cancelar Reserva
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
