import React from 'react';
import { HardHat, Search, ShieldCheck, Truck, Clock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Plataforma de Renta de Maquinaria y Equipos
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Alquiler de equipos de construcción <span className="text-blue-400">seguro y sin intermediarios</span>
            </h1>

            <p className="text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Conectamos proveedores de maquinaria pesada certificada con contratistas e ingenieros. Reservas digitales, verificación en tiempo real y facturación automatizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Explorar Catálogo de Equipos
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Registrarse como Proveedor / Cliente
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center lg:text-left">
              <div>
                <div className="text-2xl font-black text-blue-400">25+</div>
                <div className="text-xs text-slate-400">Maquinarias en Catálogo</div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-400">100%</div>
                <div className="text-xs text-slate-400">Disponibilidad Validada</div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-400">0</div>
                <div className="text-xs text-slate-400">Conflictos de Fechas</div>
              </div>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="mx-auto max-w-lg lg:max-w-none">
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80"
                alt="Excavadora de Construcción Opus Rentals"
                className="w-full h-80 object-cover"
              />
              <div className="p-4 bg-slate-850 border-t border-slate-750 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider block">Equipo Destacado</span>
                  <h4 className="text-sm font-bold text-white">Excavadora Hidráulica Komatsu PC200</h4>
                </div>
                <div className="text-sm font-black text-blue-400">$580.000 /día</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ¿Por qué operar con Opus Rentals?
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Diseñada con estándares de ingeniería de software para maximizar la productividad de tus obras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Validación Anti-Colisiones</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Motor de reservas que valida la disponibilidad de cada equipo en tiempo real, garantizando cero conflictos de fechas en obra.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Gestión de Devoluciones & Daños</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inspecciones detalladas con actas de estado y liquidación de penalizaciones aisladas (diseño en Cuarta Forma Normal 4FN).
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Facturación y Pagos en Línea</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Generación automática de facturas legales con IVA, simulación de pasarelas de pago y soporte para depósitos de garantía.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
