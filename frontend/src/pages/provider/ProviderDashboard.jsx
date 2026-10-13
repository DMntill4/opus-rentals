import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { PlusCircle, Wrench, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, Tag, Building2 } from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'rentals'
  const [tools, setTools] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Tool Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toolName, setToolName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [specsList, setSpecsList] = useState([{ specKey: '', specValue: '' }]);
  const [addLoading, setAddLoading] = useState(false);

  // Return & Damage Modal state
  const [returnRental, setReturnRental] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [damagesList, setDamagesList] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catsRes, rentalsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/rentals/provider-requests'),
      ]);
      setCategories(catsRes.data || []);
      setRentals(rentalsRes.data || []);
      if (catsRes.data?.length > 0) {
        setCategoryId(catsRes.data[0].id.toString());
      }

      // Fetch provider tools
      if (user?.profileId) {
        const toolsRes = await api.get(`/tools/provider/${user.profileId}`);
        setTools(toolsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload = {
        name: toolName,
        categoryId: parseInt(categoryId),
        brand,
        model,
        dailyPrice: parseFloat(dailyPrice),
        depositAmount: parseFloat(depositAmount || '0'),
        images: imageUrl ? [{ imageUrl, isCover: true }] : [],
        specifications: specsList.filter((s) => s.specKey && s.specValue),
      };

      await api.post('/tools', payload);
      setIsAddModalOpen(false);
      // Reset
      setToolName('');
      setBrand('');
      setModel('');
      setDailyPrice('');
      setDepositAmount('');
      setImageUrl('');
      setSpecsList([{ specKey: '', specValue: '' }]);
      fetchInitialData();
    } catch (err) {
      alert('Error agregando herramienta: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateRentalStatus = async (rentalId, status) => {
    try {
      await api.patch(`/rentals/${rentalId}/status`, { status });
      fetchInitialData();
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const handleAddSpecRow = () => {
    setSpecsList([...specsList, { specKey: '', specValue: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specsList];
    updated[index][field] = value;
    setSpecsList(updated);
  };

  const handleAddDamageRow = () => {
    setDamagesList([
      ...damagesList,
      { description: '', severity: 'MINOR', penaltyAmount: '0' },
    ]);
  };

  const handleDamageChange = (index, field, value) => {
    const updated = [...damagesList];
    updated[index][field] = value;
    setDamagesList(updated);
  };

  const handleRemoveDamageRow = (index) => {
    setDamagesList(damagesList.filter((_, i) => i !== index));
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    setReturnLoading(true);
    try {
      const payload = {
        returnDate,
        generalNotes,
        inspectorNotes,
        damages: damagesList.map((d) => ({
          description: d.description,
          severity: d.severity,
          penaltyAmount: parseFloat(d.penaltyAmount || '0'),
        })),
      };
      await api.post(`/returns/rental/${returnRental.id}`, payload);
      setReturnRental(null);
      setDamagesList([]);
      setGeneralNotes('');
      setInspectorNotes('');
      fetchInitialData();
    } catch (err) {
      alert('Error procesando devolución: ' + err.message);
    } finally {
      setReturnLoading(false);
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
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 rounded-xl text-white border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Portal del Proveedor</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {user?.displayName || 'Mi Empresa de Maquinaria'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Gestiona tu inventario, aprueba solicitudes de alquiler y certifica devoluciones con registro de daños (4FN).
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Herramienta
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Mi Inventario ({tools.length})
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'rentals'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Solicitudes & Alquileres ({rentals.length})
        </button>
      </div>

      {/* TAB 1: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Catálogo de Equipos Registrados</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Cargando inventario...</div>
          ) : tools.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No tienes herramientas registradas actualmente. Haz clic en "Nueva Herramienta" para comenzar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Equipo</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Tarifa Diaria</th>
                    <th className="px-6 py-4">Depósito</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tools.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.brand} {t.model}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {t.categoryName}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {formatMoney(t.dailyPrice)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {formatMoney(t.depositAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            t.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'MAINTENANCE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {t.status === 'AVAILABLE'
                            ? 'DISPONIBLE'
                            : t.status === 'MAINTENANCE'
                            ? 'MANTENIMIENTO'
                            : 'EN ALQUILER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-slate-400">Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RENTALS & REQUESTS */}
      {activeTab === 'rentals' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Solicitudes de Alquiler Recibidas</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Cargando solicitudes...</div>
          ) : rentals.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No tienes solicitudes de alquiler pendientes por atender.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">ID & Equipo</th>
                    <th className="px-6 py-4">Cliente Solicitante</th>
                    <th className="px-6 py-4">Fechas</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Gestión de Reserva</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rentals.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">#{r.id} - {r.toolName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{r.clientFullName}</div>
                        <div className="text-xs text-slate-400">{r.clientPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-800">{r.startDate} al {r.endDate}</div>
                        <div className="text-xs text-slate-400">{r.totalDays} día(s)</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {formatMoney(r.estimatedTotal)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            r.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : r.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : r.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-800'
                              : r.status === 'RETURNED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {r.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateRentalStatus(r.id, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleUpdateRentalStatus(r.id, 'CANCELLED')}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-all"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {r.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateRentalStatus(r.id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Marcar en Obra
                          </button>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => {
                              setReturnRental(r);
                              setDamagesList([]);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                          >
                            Recibir & Inspeccionar
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
      )}

      {/* ADD TOOL MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrar Nueva Herramienta en Inventario"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddTool} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Herramienta</label>
              <input
                type="text"
                required
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="Excavadora Oruga 303.5"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Caterpillar"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="303.5 CR"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarifa Diaria (COP)</label>
              <input
                type="number"
                required
                min={1}
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                placeholder="250000"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Depósito de Garantía (COP)</label>
              <input
                type="number"
                required
                min={0}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1000000"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL de Imagen Fotográfica</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Dynamic Specifications (4FN) */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Especificaciones Técnicas (4FN)
              </label>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Añadir Parámetro
              </button>
            </div>
            <div className="space-y-2">
              {specsList.map((s, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Clave (ej: Potencia)"
                    value={s.specKey}
                    onChange={(e) => handleSpecChange(idx, 'specKey', e.target.value)}
                    className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Valor (ej: 24.8 HP)"
                    value={s.specValue}
                    onChange={(e) => handleSpecChange(idx, 'specValue', e.target.value)}
                    className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20"
            >
              {addLoading ? 'Guardando...' : 'Guardar Herramienta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RETURN & DAMAGE INSPECTION MODAL (4FN) */}
      <Modal
        isOpen={!!returnRental}
        onClose={() => setReturnRental(null)}
        title={returnRental ? `Acta de Recepción e Inspección: Alquiler #${returnRental.id}` : ''}
        maxWidth="max-w-2xl"
      >
        {returnRental && (
          <form onSubmit={handleProcessReturn} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div><span className="text-slate-500">Equipo:</span> <span className="font-bold text-slate-900">{returnRental.toolName}</span></div>
              <div><span className="text-slate-500">Cliente:</span> <span className="font-bold text-slate-900">{returnRental.clientFullName}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Devolución</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones Generales</label>
                <input
                  type="text"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Equipo recibido en obra"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Informe del Inspector Técnico</label>
              <textarea
                rows={2}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Detalle de horómetro, fluidos, desgaste de piezas..."
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Damage items section (4FN) */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reporte de Daños o Averías (4FN Descompuesto)
                </label>
                <button
                  type="button"
                  onClick={handleAddDamageRow}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  + Reportar Daño
                </button>
              </div>

              {damagesList.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl text-center">
                  Sin daños reportados. El equipo se devolverá en estado 100% operativo sin penalizaciones.
                </p>
              ) : (
                <div className="space-y-2">
                  {damagesList.map((dmg, idx) => (
                    <div key={idx} className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Descripción del daño..."
                        required
                        value={dmg.description}
                        onChange={(e) => handleDamageChange(idx, 'description', e.target.value)}
                        className="flex-1 p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <select
                        value={dmg.severity}
                        onChange={(e) => handleDamageChange(idx, 'severity', e.target.value)}
                        className="p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="MINOR">Leve</option>
                        <option value="MODERATE">Moderado</option>
                        <option value="SEVERE">Severo</option>
                        <option value="TOTAL_LOSS">Pérdida Total</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Penalización (COP)"
                        required
                        value={dmg.penaltyAmount}
                        onChange={(e) => handleDamageChange(idx, 'penaltyAmount', e.target.value)}
                        className="w-32 p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDamageRow(idx)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnRental(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={returnLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20"
              >
                {returnLoading ? 'Procesando devolución...' : 'Finalizar Devolución'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
