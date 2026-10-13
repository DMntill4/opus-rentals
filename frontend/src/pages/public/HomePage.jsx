import React from 'react';
import { HardHat, Search, ShieldCheck, Truck, Clock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,88,12,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Plataforma Líder en Renta de Equipos de Construcción
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Alquila maquinaria pesada y herramientas <span className="text-orange-500">sin intermediarios</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Conectamos proveedores de maquinaria certificada con contratistas e ingenieros. Reservas digitales, verificación en tiempo real y facturación automatizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all hover:scale-105"
              >
                <Search className="w-5 h-5" />
                Explorar Catálogo de Equipos
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 transition-all hover:text-white"
              >
                Registrarse como Proveedor / Cliente
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center lg:text-left">
              <div>
                <div className="text-2xl font-extrabold text-orange-500">25+</div>
                <div className="text-xs text-slate-400">Maquinarias Certificadas</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-orange-500">100%</div>
                <div className="text-xs text-slate-400">Disponibilidad Garantizada</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-orange-500">0</div>
                <div className="text-xs text-slate-400">Conflictos de Fechas</div>
              </div>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-800/40 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80"
                alt="Excavadora de Construcción Opus Rentals"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-orange-400 font-semibold uppercase">Destacado de Flota</span>
                    <h4 className="text-base font-bold">Excavadora Hidráulica Komatsu PC200</h4>
                  </div>
                  <span className="text-sm font-extrabold text-orange-400">$580.000 /día</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            ¿Por qué elegir la plataforma de Opus Rentals?
          </h2>
          <p className="text-slate-600 mt-2 text-base">
            Diseñada con estándares de ingeniería de software para maximizar la productividad de tus obras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Validación Anti-Colisiones</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nuestro motor de reservas valida en tiempo real la disponibilidad de cada equipo, imposibilitando reservas duplicadas en las mismas fechas.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gestión de Devoluciones & Daños</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inspecciones detalladas con actas de estado y liquidación de penalizaciones aisladas (diseño en Cuarta Forma Normal 4FN).
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Facturación y Pagos en Línea</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Generación automática de facturas legales con IVA, simulación de pasarelas de pago y soporte para depósitos de garantía.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
