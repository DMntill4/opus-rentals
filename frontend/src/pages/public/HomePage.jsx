import React, { useState } from 'react';
import {
  HardHat,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  Truck,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  const [quickQuery, setQuickQuery] = useState('');

  const featuredCategories = [
    { name: 'Maquinaria Pesada', count: '12 equipos', id: 1, icon: '🚜' },
    { name: 'Corte y Perforación', count: '8 equipos', id: 2, icon: '⚡' },
    { name: 'Compactación y Suelos', count: '6 equipos', id: 3, icon: '🏗️' },
    { name: 'Generación y Energía', count: '5 equipos', id: 4, icon: '🔋' },
  ];

  const popularEquipments = [
    {
      id: 1,
      name: 'Excavadora Oruga CAT 320D',
      brand: 'Caterpillar',
      category: 'Movimiento de Tierra',
      price: '$650.000',
      deposit: '$1.500.000',
      status: 'DISPONIBLE',
      city: 'Bogotá D.C.',
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Retroexcavadora Mixta 580N',
      brand: 'Case Construction',
      category: 'Maquinaria Pesada',
      price: '$480.000',
      deposit: '$1.200.000',
      status: 'DISPONIBLE',
      city: 'Medellín',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Minicargador Bobcat S570',
      brand: 'Bobcat',
      category: 'Carga Ligera',
      price: '$320.000',
      deposit: '$900.000',
      status: 'DISPONIBLE',
      city: 'Cali',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      name: 'Generador Diésel Trifásico 100 kVA',
      brand: 'Cummins Power',
      category: 'Generación Eléctrica',
      price: '$290.000',
      deposit: '$750.000',
      status: 'DISPONIBLE',
      city: 'Barranquilla',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="bg-[#f8fafc] text-slate-900 pb-20">
      {/* 1. HERO SEARCH BANNER (AIRBNB / PROFESSIONAL MARKETPLACE STYLE) */}
      <section className="bg-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Tagline */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Red Nacional de Renta de Maquinaria
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • Más de 20 proveedores certificados activos
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl text-white">
            Encuentra y alquila la maquinaria exacta <span className="text-blue-500">para tu obra civil</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Sin intermediarios manuales. Verificación instantánea de disponibilidad en tiempo real, seguro de depósito 4FN y facturación digital en Colombia.
          </p>

          {/* SEARCH BOX COMPONENT */}
          <div className="mt-8 bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-slate-200 max-w-4xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <input
                type="text"
                placeholder="¿Qué herramienta o máquina buscas? (Ej. Excavadora, Generador...)"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <select className="w-full bg-transparent text-sm text-slate-700 focus:outline-none font-medium cursor-pointer">
                <option value="">Todas las ciudades (Cobertura Colombia)</option>
                <option value="bogota">Bogotá D.C. / Cundinamarca</option>
                <option value="medellin">Medellín / Antioquia</option>
                <option value="cali">Cali / Valle</option>
                <option value="barranquilla">Barranquilla / Costa Caribe</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full py-3 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar Ahora
              </button>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Búsquedas rápidas:</span>
            {['Excavadoras', 'Bobcat', 'Generadores 100kVA', 'Torres de Iluminación', 'Martillos Hidráulicos'].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate('catalog')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES (MODERN AIRBNB-LIKE CHIPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featuredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {cat.name}
                </h4>
                <span className="text-xs text-slate-500 font-medium">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR EQUIPMENT MARKETPLACE FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Inventario Destacado en Tiempo Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Equipos de Alta Capacidad Disponibles Hoy
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Maquinaria certificada con mantenimiento al día lista para despacho inmediato a tu obra.
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
          >
            Ver Catálogo Completo (25+)
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularEquipments.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('catalog')}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col group"
            >
              {/* Photo Box */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 bg-white/95 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700 border border-slate-200 shadow-sm">
                  {item.city}
                </div>
              </div>

              {/* Data body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
                    {item.category} • {item.brand}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Depósito reembolsable: <span className="font-semibold text-slate-700">{item.deposit}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Tarifa de alquiler</span>
                    <span className="text-base font-black text-slate-900">
                      {item.price} <span className="text-xs text-slate-500 font-normal">/día</span>
                    </span>
                  </div>
                  <span className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Alquilar
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TECHNICAL GUARANTEES BAR (HEXAGONAL + 4FN HIGHLIGHTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Normalización 4FN Sin Fallos</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Eliminación de dependencias multivaluadas en coberturas, especificaciones y liquidación de daños e incidencias.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Reserva con Bloqueo de Fechas</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                El motor verifica matemáticamente traslapes temporales antes de emitir la confirmación para evitar colisiones en obra.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Facturación & IVA Integrado</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Generación automática de comprobantes contables con cálculo legal del 19% de IVA y conciliación con pasarelas de pago.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOR BOTH PROFILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
              ¿Eres propietario o empresa de maquinaria?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              Publica tu flota y arrienda a constructoras de todo el país
            </h3>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Panel especializado para proveedores: control de contratos, actas de recepción con registro fotográfico y liquidación de garantías.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('register')}
              className="py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center shadow-sm transition-colors"
            >
              Registrarme como Proveedor
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="py-3 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm text-center transition-colors"
            >
              Explorar como Cliente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
