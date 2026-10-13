import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ToolCard } from '../../components/cards/ToolCard';
import { Modal } from '../../components/common/Modal';
import { Search, Filter, Calendar, ShieldAlert, CheckCircle2, DollarSign, Building2, Tag } from 'lucide-react';

export const CatalogPage = ({ onNavigate }) => {
  const { isAuthenticated, isClient } = useAuth();
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [detailTool, setDetailTool] = useState(null);
  const [rentingTool, setRentingTool] = useState(null);

  // Rental form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchTools();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      const res = await api.get('/tools', { params });
      setTools(res.data || []);
    } catch (err) {
      console.error('Error fetching tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTools();
  };

  const handleOpenRent = (tool) => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    if (!isClient) {
      alert('Debe tener una cuenta de Cliente para realizar solicitudes de alquiler.');
      return;
    }
    setRentingTool(tool);
    setBookingSuccess(null);
    setBookingError(null);
    // Default dates: tomorrow to +3 days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const end = new Date();
    end.setDate(end.getDate() + 4);

    setStartDate(tomorrow.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const subtotal = rentingTool ? rentingTool.dailyPrice * days : 0;
  const tax = subtotal * 0.19;
  const deposit = rentingTool ? rentingTool.depositAmount : 0;
  const totalEstimated = subtotal + tax + deposit;

  const handleConfirmRental = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    try {
      const payload = {
        toolId: rentingTool.id,
        startDate,
        endDate,
        notes,
      };
      const res = await api.post('/rentals', payload);
      setBookingSuccess(res.data);
      fetchTools(); // Refresh tool availability
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
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
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Catálogo de Maquinaria y Equipos
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Explora maquinaria pesada, herramientas de demolición y equipos certificados para tu obra.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-semibold transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todas las Categorías
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id.toString())}
            className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id.toString()
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">
          Cargando inventario de equipos...
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500 text-base font-semibold">
            No se encontraron herramientas con los criterios de búsqueda.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchTerm('');
              fetchTools();
            }}
            className="mt-4 px-4 py-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={(t) => setDetailTool(t)}
              onRent={(t) => handleOpenRent(t)}
            />
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailTool}
        onClose={() => setDetailTool(null)}
        title={detailTool ? `${detailTool.name} - Ficha Técnica` : ''}
        maxWidth="max-w-3xl"
      >
        {detailTool && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <img
                src={
                  detailTool.coverImageUrl ||
                  'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80'
                }
                alt={detailTool.name}
                className="w-full h-64 object-cover rounded-md border border-slate-200 shadow-sm"
              />
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                  {detailTool.categoryName}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{detailTool.name}</h3>
                <p className="text-sm text-slate-500">
                  Marca: <span className="font-semibold text-slate-800">{detailTool.brand}</span> | Modelo:{' '}
                  <span className="font-semibold text-slate-800">{detailTool.model}</span>
                </p>

                <div className="p-4 bg-slate-50 rounded-md border border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tarifa Diaria:</span>
                    <span className="font-bold text-blue-600 text-base">{formatMoney(detailTool.dailyPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Depósito de Garantía:</span>
                    <span className="font-semibold text-slate-800">{formatMoney(detailTool.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Proveedor:</span>
                    <span className="font-semibold text-slate-800">{detailTool.providerCompanyName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications List (4FN) */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Especificaciones Técnicas Certificadas (4FN)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {detailTool.specifications?.length > 0 ? (
                  detailTool.specifications.map((s) => (
                    <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">{s.specKey}:</span>
                      <span className="font-bold text-slate-800">{s.specValue}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Sin especificaciones técnicas adicionales registradas.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setDetailTool(null)}
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const t = detailTool;
                  setDetailTool(null);
                  handleOpenRent(t);
                }}
                disabled={detailTool.status !== 'AVAILABLE'}
                className="px-5 py-2 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                Continuar a Reserva
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* RENT BOOKING MODAL */}
      <Modal
        isOpen={!!rentingTool}
        onClose={() => setRentingTool(null)}
        title={rentingTool ? `Solicitud de Alquiler: ${rentingTool.name}` : ''}
      >
        {rentingTool && (
          <div>
            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">¡Reserva Registrada Exitosamente!</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Tu reserva para <span className="font-bold">{rentingTool.name}</span> fue creada con código #{bookingSuccess.id}. Se generó la factura automática #{bookingSuccess.invoiceNumber || 'INV-PENDIENTE'} para realizar el pago.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setRentingTool(null);
                      onNavigate('client-dashboard');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold shadow-sm"
                  >
                    Ir a Mis Alquileres & Pagar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmRental} className="space-y-5">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha de Inicio del Alquiler
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha de Devolución
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instrucciones o Notas de la Obra (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Lugar de entrega en obra, operario asignado, etc."
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Calculation Summary */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duración estimada:</span>
                    <span className="font-bold text-slate-800">{days} día(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal de renta ({days} x {formatMoney(rentingTool.dailyPrice)}):</span>
                    <span className="font-bold text-slate-800">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IVA (19%):</span>
                    <span className="font-bold text-slate-800">{formatMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Depósito de Garantía (Reembolsable):</span>
                    <span className="font-bold text-slate-800">{formatMoney(deposit)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-slate-900">Total Liquidado:</span>
                    <span className="font-extrabold text-blue-600 text-base">{formatMoney(totalEstimated)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRentingTool(null)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-md transition-all"
                  >
                    {bookingLoading ? 'Validando disponibilidad...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
