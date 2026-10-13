import React, { useState } from 'react';
import { formatMoneyCOP, formatDateCO, translations } from '../../context/i18n';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ChevronLeft,
  Share2,
  Heart,
  Tag,
  Wrench,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const ToolDetailPage = ({ tool, onBack, onNavigate }) => {
  const { addToCart, dateRange, setDateRange, daysCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { lang } = useTheme();
  const t = translations[lang] || translations.es;

  const [activePhoto, setActivePhoto] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  if (!tool) return null;

  const photos = tool.images?.length > 0
    ? tool.images.map((img) => img.imageUrl)
    : [
        tool.coverImageUrl || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      ];

  const specs = tool.specifications?.length > 0
    ? tool.specifications
    : [
        { specKey: 'Potencia de Motor', specValue: '158 HP (118 kW)' },
        { specKey: 'Peso Operativo', specValue: '21.500 kg' },
        { specKey: 'Capacidad de Balde', specValue: '1.2 m³' },
        { specKey: 'Profundidad de Excavación', specValue: '6.72 m' },
        { specKey: 'Tipo de Combustible', specValue: 'Diésel con filtro de partículas' },
        { specKey: 'Año de Fabricación', specValue: '2023 Certificado' },
      ];

  const isAvailable = tool.status === 'AVAILABLE';
  const subtotalLive = (tool.dailyPrice || 580000) * daysCount;

  const handleAddReservation = () => {
    addToCart(tool);
    setToastMessage('¡Equipo agregado con éxito a tu reserva!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs font-bold">{toastMessage}</div>
          <button
            onClick={() => onNavigate('checkout')}
            className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
          >
            Ver Reserva
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al Catálogo
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Catálogo &gt; {tool.categoryName || 'Maquinaria'} &gt; <strong className="text-slate-700 dark:text-slate-300">{tool.name}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Photos Gallery & Specs (60% width) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Photo */}
          <div className="relative h-96 sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <img
              src={photos[activePhoto]}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isAvailable
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {isAvailable ? 'Disponible para Despacho' : 'Alquilada / En Obra'}
              </span>
            </div>
          </div>

          {/* Thumbnails Carousel */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhoto(idx)}
                className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activePhoto === idx ? 'border-blue-600 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p} alt="mini" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Descripción y Aplicación en Obra</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {tool.description ||
                'Maquinaria pesada certificada para movimientos de tierra de alto rendimiento, zanjeo masivo y cimentaciones. Cuenta con certificación técnica vigente y plan de mantenimiento preventivo ejecutado por personal especializado.'}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              Ficha Técnica y Especificaciones
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {specs.map((s, idx) => (
                <div key={idx} className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">{s.specKey}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{s.specValue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Provider Badge */}
          <div className="p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Proveedor Certificado</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {tool.providerCompanyName || 'Caterpillar Rental Services'}
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-emerald-600 font-bold">98% Cumplimiento</div>
              <div className="text-slate-400 text-[10px]">Póliza 4FN Vigente</div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Calculator Card (40% width) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">{tool.categoryName}</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{tool.name}</h1>
              <div className="text-xs text-slate-500 mt-1">
                Marca: <strong className="text-slate-700 dark:text-slate-300">{tool.brand}</strong> • Modelo: {tool.model}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-500">Tarifa Diaria:</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatMoneyCOP(tool.dailyPrice)}
                  <span className="text-xs text-slate-500 font-normal"> /día</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-500 mt-1">
                <span>Depósito Reembolsable:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoneyCOP(tool.depositAmount)}</span>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-500">Programar Fechas de Uso</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Inicio</span>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Fin</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Line Items */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cálculo en vivo ({daysCount} días × {formatMoneyCOP(tool.dailyPrice)})</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatMoneyCOP(subtotalLive)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Depósito de garantía (reembolsable)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatMoneyCOP(tool.depositAmount)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                <span>Total Estimado</span>
                <span className="text-blue-600">{formatMoneyCOP(subtotalLive + (tool.depositAmount || 0))}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                disabled={!isAvailable}
                onClick={handleAddReservation}
                className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isAvailable
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{isAvailable ? 'Agregar a mi reserva' : 'No disponible para las fechas'}</span>
                {isAvailable && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  addToCart(tool);
                  onNavigate('checkout');
                }}
                disabled={!isAvailable}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Reservar y Pagar Ahora
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Garantía de reposición y seguro 4FN incluido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
