import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { Calendar, DollarSign, CreditCard, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment checkout modal state
  const [payingRental, setPayingRental] = useState(null);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // View invoice modal state
  const [viewInvoice, setViewInvoice] = useState(null);

  useEffect(() => {
    fetchRentals();
    fetchPaymentMethods();
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

  const fetchPaymentMethods = async () => {
    try {
      const res = await api.get('/payment-methods');
      setPaymentMethods(res.data || []);
      if (res.data?.length > 0) {
        setSelectedMethodId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const handleOpenPay = async (rental) => {
    setPayingRental(rental);
    setPaymentReceipt(null);
    setPaymentError(null);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    setPaymentError(null);
    try {
      const payload = {
        invoiceId: payingRental.invoiceId,
        paymentMethodId: parseInt(selectedMethodId),
        amount: payingRental.estimatedTotal,
      };
      const res = await api.post('/payments', payload);
      setPaymentReceipt(res.data);
      fetchRentals(); // Refresh invoice & rental status
    } catch (err) {
      setPaymentError(err.message || 'Error al procesar el pago');
    } finally {
      setPayLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}`);
      setViewInvoice(res.data);
    } catch (err) {
      alert('Error cargando la factura: ' + err.message);
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

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pendiente de Aprobación</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Aprobado / Listo</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">En Obra (En Curso)</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Devuelto & Finalizado</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 bg-slate-900 rounded-xl text-white border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Portal del Cliente</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Hola, {user?.displayName}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Administra tus reservas de maquinaria, descarga facturas legales y realiza pagos seguros en línea.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-center">
            <span className="block text-2xl font-black text-blue-400">{rentals.length}</span>
            <span className="text-[10px] uppercase text-slate-300 font-medium">Alquileres Totales</span>
          </div>
        </div>
      </div>

      {/* Rentals Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Historial y Estado de Alquileres</h2>
          <button
            onClick={fetchRentals}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Actualizar Lista
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            Cargando tus alquileres...
          </div>
        ) : rentals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-slate-500 font-medium">Aún no has solicitado el alquiler de ninguna herramienta.</p>
            <p className="text-xs text-slate-400">Dirígete al catálogo para explorar la maquinaria disponible.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID & Herramienta</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Periodo & Días</th>
                  <th className="px-6 py-4">Total Liquidado</th>
                  <th className="px-6 py-4">Estado Alquiler</th>
                  <th className="px-6 py-4">Factura & Pago</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">#{r.id} - {r.toolName}</div>
                      <div className="text-xs text-slate-400">{r.toolBrand} {r.toolModel}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {r.providerCompanyName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-800">{r.startDate} al {r.endDate}</div>
                      <div className="text-xs text-slate-400">{r.totalDays} día(s) de obra</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600">{formatMoney(r.estimatedTotal)}</div>
                      <div className="text-[10px] text-slate-400">Garantía: {formatMoney(r.depositAmount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="px-6 py-4">
                      {r.invoiceId ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.invoiceStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.invoiceStatus === 'PAID' ? 'PAGADA' : 'PENDIENTE PAGO'}
                          </span>
                          <button
                            onClick={() => handleViewInvoice(r.invoiceId)}
                            className="block text-xs text-blue-600 hover:underline font-medium"
                          >
                            {r.invoiceNumber}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sin Factura</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {r.invoiceStatus !== 'PAID' && r.status !== 'CANCELLED' && r.invoiceId && (
                        <button
                          onClick={() => handleOpenPay(r)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                        >
                          Pagar Factura
                        </button>
                      )}
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelRental(r.id)}
                          className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT CHECKOUT MODAL */}
      <Modal
        isOpen={!!payingRental}
        onClose={() => setPayingRental(null)}
        title="Pasarela de Pago en Línea (Simulación Segura)"
      >
        {payingRental && (
          <div>
            {paymentReceipt ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">¡Pago Exitoso Aprobado!</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 max-w-sm mx-auto text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ref. Transacción:</span>
                    <span className="font-bold text-slate-800">{paymentReceipt.transactionReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Factura:</span>
                    <span className="font-bold text-slate-800">{paymentReceipt.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Método:</span>
                    <span className="font-bold text-slate-800">{paymentReceipt.paymentMethodName}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Monto Cobrado:</span>
                    <span className="font-extrabold text-blue-600">{formatMoney(paymentReceipt.amount)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPayingRental(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold"
                >
                  Cerrar Comprobante
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-5">
                {paymentError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="p-4 bg-orange-50/60 rounded-lg border border-blue-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Alquiler:</span>
                    <span className="font-bold text-slate-900">#{payingRental.id} - {payingRental.toolName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Factura Relacionada:</span>
                    <span className="font-bold text-slate-900">{payingRental.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-blue-600 pt-2 border-t border-orange-200/60">
                    <span>Total a Pagar:</span>
                    <span>{formatMoney(payingRental.estimatedTotal)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Seleccionar Método de Pago
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {paymentMethods.map((pm) => (
                      <label
                        key={pm.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedMethodId === pm.id.toString()
                            ? 'border-blue-600 bg-orange-50/50 text-orange-950 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={pm.id}
                          checked={selectedMethodId === pm.id.toString()}
                          onChange={(e) => setSelectedMethodId(e.target.value)}
                          className="text-blue-600 focus:ring-blue-600"
                        />
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>{pm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPayingRental(null)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={payLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20"
                  >
                    {payLoading ? 'Procesando transacción...' : 'Simular Pago Exitoso'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* VIEW INVOICE MODAL */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title={viewInvoice ? `Factura Electrónica: ${viewInvoice.invoiceNumber}` : ''}
      >
        {viewInvoice && (
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight">OPUS RENTALS</span>
                <p className="text-xs text-slate-500">NIT: 900.888.777-1 | Régimen Común</p>
                <p className="text-xs text-slate-500">Parque Industrial Cota, Colombia</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    viewInvoice.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {viewInvoice.status === 'PAID' ? 'PAGADA' : 'PENDIENTE'}
                </span>
                <p className="text-xs text-slate-500 mt-1">Fecha Emisión: {viewInvoice.issueDate}</p>
              </div>
            </div>

            {/* Client & Tool Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Cliente Receptor</span>
                <p className="font-semibold text-slate-900">{viewInvoice.clientFullName}</p>
                <p className="text-slate-500">{viewInvoice.clientDocument}</p>
                <p className="text-slate-500">{viewInvoice.clientEmail}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Equipo Alquilado</span>
                <p className="font-semibold text-slate-900">{viewInvoice.toolName}</p>
                <p className="text-slate-500">Proveedor: {viewInvoice.providerCompanyName}</p>
                <p className="text-slate-500">Duración: {viewInvoice.totalDays} día(s)</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal Neto:</span>
                <span className="font-bold text-slate-800">{formatMoney(viewInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IVA (19%):</span>
                <span className="font-bold text-slate-800">{formatMoney(viewInvoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-blue-600 pt-2 border-t border-slate-200">
                <span>Total Facturado:</span>
                <span>{formatMoney(viewInvoice.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Imprimir Factura
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
