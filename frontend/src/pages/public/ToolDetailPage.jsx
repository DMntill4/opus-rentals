import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

export const ToolDetailPage = ({ tool, onBack, onNavigate }) => {
  const { addItem } = useCart();
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'telemetry' | 'provider' | 'dispatch'
  const [startDate, setStartDate] = useState('2026-10-18');
  const [endDate, setEndDate] = useState('2026-10-22');

  const photos = [
    {
      title: 'Vista Lateral Frontal',
      label: 'Lateral',
      url: tool?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSsmEE-ZOpR0kUKqPpVfqaLgNGkb5-yUxHFtQTss8c8AlaKMFYWC-1M45HoZVwZ_C2qg_H5_kv71kkM0aJpKWRAXDvuQpTq8rA7OAjWYnBA5m5PRnjJ0sgUSa7QCdKAlcX58TbkD4h5CBy2AJIZ9d28i2P2BPC7rkLlT_98W5fVSpA2YykPpO8ev_w-9aiMPqMwR7qVTBrU4ckY5EeoEetctCvR6jr3zWhCb4KYns0geyYS2nVUXjLYg'
    },
    {
      title: 'Balde & Brazo Hidráulico',
      label: 'Balde 1.0 m³',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt3MNKxikzhXdwUFST-XkDO1hJtxufBD-kfqJZ7_CcEm53N8CGD7AfQMmZ4qa0QD7gOE4V2UwdYx8MN3iaVFY0OKjvxWXAsqN7eqeRh1f8b76JxUMHhk5ltXW_8gXm2SMO2NTHzHmW60TybTfojC3PW1AIGzoHLJfCA3V12zSnOpfsNjSL8GHjmLYSruLfa6MwkZ346hKCLNl59SmOZfqEkAIiZg41v5Ppmn9iTSadkBBPBjxJu5laUw'
    },
    {
      title: 'Cabina con Climatización y Telemática',
      label: 'Cabina',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx4q9tjk7eMAh-igoDf26c2txXoKsSed7sXklN92n5OPExVliuUPwpOFuXf03n7atP_1bOcub5zKQI6ndnjDDeQaOSU_MsUoge5BwQ5PagAyhYpEU3hq7byAZEOaMv8u-P542WaejmLrY2WxCZaAOsWhMftK9pMsLol0d8fHkjEQ5Kd8mlhTNCc6M36XgbnXZ8zg342LuB_gGBfb_5ZZ6w7vGPXS6DUWIrD0MO9F0SiWpflLY5ABvtKg'
    },
    {
      title: 'Motor Cat C7.1 ACERT',
      label: 'Motor C7.1',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlGxtgU7H8Bb4G3133R6-51AYtUtIbpRT_sN9IQajLiTZNlEBFAJ44ErweEhbWVwullTZN8ce2zYajv6qBHgH5kqGmhW1UJ9blXsHE-UGAwXKeWXOIdM7idorwtSgBMiUMGczlWzrkqdXkTC7_qjnM68wXoWzc5qU1L9GkNVDKiQEfSTnvwl_UIwIzddsoUZ_dpZbYIj-uIqQuxJjg3P_Ln8kCrwoIHRG9WT38bmGIvIU7-2RHWluaGg'
    }
  ];

  const dailyRate = tool?.dailyRate || 1250000;
  const warrantyDeposit = 4500000;

  // Calculate days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.max(1, Math.round((endD - startD) / (1000 * 60 * 60 * 24)));
  const days = diffTime > 0 ? diffTime : 1;

  const subtotal = days * dailyRate;
  const insurance = Math.round(subtotal * 0.05);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + insurance + iva + warrantyDeposit;

  const handleBooking = () => {
    addItem({
      id: tool?.id || 'CAT-320D2-GC',
      name: tool?.title || 'Caterpillar 320D2 GC',
      category: tool?.category || 'Maquinaria Pesada',
      pricePerDay: dailyRate,
      securityDeposit: warrantyDeposit,
      city: 'Bogotá D.C.',
      image: photos[0].url,
      days: days,
      startDate: startDate,
      endDate: endDate
    });
    onNavigate('checkout');
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-gutter-desktop py-space-xl flex flex-col gap-space-lg">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-caption font-caption text-outline dark:text-slate-400">
        <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Catálogo</span>
        </button>
        <span>/</span>
        <span>Maquinaria Pesada</span>
        <span>/</span>
        <span className="text-on-surface dark:text-white font-semibold">
          {tool?.title || 'Caterpillar 320D2 GC'}
        </span>
      </nav>

      {/* Main Split Architecture View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
        {/* Left Column (60% Desktop: 7 cols of 12) */}
        <section className="lg:col-span-7 flex flex-col gap-space-xl">
          {/* Gallery Container */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/90 rounded-xl p-space-md flex flex-col gap-space-md shadow-sm border border-outline-variant/30 dark:border-slate-700">
            {/* Main Hero Gallery Image */}
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-surface-container-high dark:bg-slate-900 group">
              <img
                src={photos[selectedPhotoIdx].url}
                alt={photos[selectedPhotoIdx].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-lowest/90 dark:bg-slate-900/90 backdrop-blur text-caption font-caption text-on-surface dark:text-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-container mr-1.5 animate-pulse"></span>
                  TELEMETRÍA 4G EN VIVO
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-lowest/90 dark:bg-slate-900/90 backdrop-blur text-caption font-caption text-on-surface-variant dark:text-slate-300">
                  1.140 HORAS
                </span>
              </div>
              <div className="absolute bottom-space-md right-space-md bg-surface-container-lowest/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-md text-caption font-caption text-on-surface dark:text-white flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>{selectedPhotoIdx + 1} / 4 • {photos[selectedPhotoIdx].title}</span>
              </div>
            </div>

            {/* Thumbnails Selector Row */}
            <div className="grid grid-cols-4 gap-space-sm">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIdx(idx)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-high transition-all outline-none cursor-pointer ${
                    selectedPhotoIdx === idx
                      ? 'ring-2 ring-primary-container opacity-100'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-caption text-on-surface dark:text-white bg-surface-container-lowest/80 dark:bg-slate-900/80 backdrop-blur px-1 rounded truncate text-center">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Hardware Specs Pills */}
            <div className="flex items-center gap-space-xs flex-wrap pt-space-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-white font-body-medium text-body-medium">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <span>{tool?.power || '148 HP'} (109 kW)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-white font-body-medium text-body-medium">
                <span className="material-symbols-outlined text-primary text-[18px]">weight</span>
                <span>{tool?.weight || '21.5 Toneladas'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-white font-body-medium text-body-medium">
                <span className="material-symbols-outlined text-primary text-[18px]">hardware</span>
                <span>{tool?.capacity || 'Balde 1.0 m³ HD'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-white font-body-medium text-body-medium">
                <span className="material-symbols-outlined text-primary text-[18px]">local_gas_station</span>
                <span>Diésel B10 Col</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-white font-body-medium text-body-medium">
                <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                <span>1.140 Horas de Uso</span>
              </div>
            </div>
          </div>

          {/* Descriptive Overview Panel */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/90 rounded-xl p-space-lg flex flex-col gap-space-md shadow-sm border border-outline-variant/30 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-outline dark:text-slate-400 uppercase tracking-wider">
                RESUMEN DEL EQUIPO & CAMPO DE APLICACIÓN
              </span>
              <span className="font-caption text-caption text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified_user</span> RUNT & Póliza Todo Riesgo
              </span>
            </div>
            <p className="font-body text-body text-on-surface-variant dark:text-slate-300 leading-relaxed">
              Excavadora de orugas de alta resistencia optimizada para movimiento de tierras, zanjado de tubería pesada y obras viales 4G en Colombia. Equipada de fábrica con sistema hidráulico de flujo cruzado para ciclos de carga ultrarrápidos, cabina sellada con filtración presurizada para polvo de cantera, y monitoreo constante de consumo mediante enlace satelital. Incluye certificación RUNT al día y póliza todo riesgo de maquinaria pesada bajo cobertura Suramericana.
            </p>

            {/* Engineering Highlights Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 flex flex-col gap-1">
                <span className="font-caption text-caption text-outline uppercase">Profundidad Máxima</span>
                <span className="font-section text-section text-on-surface dark:text-white font-mono">6.72 m</span>
                <span className="font-caption text-caption text-on-surface-variant dark:text-slate-400">Brazo extendido 2.9m</span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 flex flex-col gap-1">
                <span className="font-caption text-caption text-outline uppercase">Alcance a Ras</span>
                <span className="font-section text-section text-on-surface dark:text-white font-mono">9.86 m</span>
                <span className="font-caption text-caption text-on-surface-variant dark:text-slate-400">Radio operativo 360°</span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 flex flex-col gap-1">
                <span className="font-caption text-caption text-outline uppercase">Fuerza de Desprendimiento</span>
                <span className="font-section text-section text-on-surface dark:text-white font-mono">140 kN</span>
                <span className="font-caption text-caption text-on-surface-variant dark:text-slate-400">Penetración suelo rocoso</span>
              </div>
            </div>
          </div>

          {/* Tabbed Technical Container */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/90 rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 dark:border-slate-700">
            {/* Tab Headers */}
            <div className="flex items-center bg-surface-container-low dark:bg-slate-900 px-space-md overflow-x-auto border-b border-outline-variant/30 dark:border-slate-700">
              {[
                { id: 'specs', label: 'Ficha Técnica y Especificaciones' },
                { id: 'telemetry', label: 'Inspección & Telemetría' },
                { id: 'provider', label: 'Proveedor Verificado' },
                { id: 'dispatch', label: 'Condiciones de Despacho' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-space-md px-space-sm font-body-medium text-body-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === t.id
                      ? 'text-primary border-b-2 border-primary font-semibold'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content 1: Ficha Técnica */}
            {activeTab === 'specs' && (
              <div className="p-space-lg flex flex-col gap-space-lg">
                <div className="flex items-center justify-between pb-space-xs">
                  <div className="flex flex-col">
                    <h2 className="font-section text-section text-on-surface dark:text-white">Especificaciones de Fabricante</h2>
                    <span className="font-caption text-caption text-outline">DOCUMENTO TÉCNICO OFICIAL CATERPILLAR GLOBAL SERIES 2</span>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-slate-700 text-on-surface dark:text-white font-caption text-caption uppercase tracking-wider transition-colors">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    PDF Certificado
                  </button>
                </div>
                <div className="flex flex-col divide-y divide-outline-variant/30 dark:divide-slate-700">
                  {[
                    { key: 'Potencia neta del motor', val: '109 kW / 148 HP @ 1.800 rpm' },
                    { key: 'Modelo de motor', val: 'Cat® C7.1 ACERT™ Turboalimentado' },
                    { key: 'Peso operativo certificado', val: '21.500 kg (47.400 lb)' },
                    { key: 'Capacidad del balde', val: '1.0 m³ (Severa penetración con calzas HD)' },
                    { key: 'Profundidad máx. de excavación', val: '6.72 m (22 pies 1 pulg)' },
                    { key: 'Alcance máx. a nivel del suelo', val: '9.86 m (32 pies 4 pulg)' },
                    { key: 'Año de fabricación & Horómetro', val: '2024 • 1.140 horas registradas' },
                    { key: 'Sistema telemático activo', val: 'Cat Product Link™ 4G GPS Activo 24/7' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 py-3 gap-2">
                      <span className="font-body text-body text-on-surface-variant dark:text-slate-400">{row.key}</span>
                      <span className="font-body-medium text-body-medium text-on-surface dark:text-slate-200 font-mono">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content 2: Telemetría */}
            {activeTab === 'telemetry' && (
              <div className="p-space-lg flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-section text-section text-on-surface dark:text-white">Diagnóstico Telemático en Vivo</h3>
                    <span className="font-caption text-caption text-outline">ÚLTIMA SINCRONIZACIÓN SENSOR: HACE 4 MINUTOS</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-slate-700 text-caption font-caption text-primary">SALUD GENERAL 99.4%</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                    <span className="font-caption text-caption text-outline uppercase">Nivel de Combustible</span>
                    <span className="font-section text-section text-on-surface dark:text-white font-mono">84%</span>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-primary-container w-[84%]"></div>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">Tanque lleno en patio</span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                    <span className="font-caption text-caption text-outline uppercase">Presión Hidráulica</span>
                    <span className="font-section text-section text-on-surface dark:text-white font-mono">35 MPa</span>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-primary-container w-[92%]"></div>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">Calibración nominal</span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                    <span className="font-caption text-caption text-outline uppercase">Batería & Alternador</span>
                    <span className="font-section text-section text-on-surface dark:text-white font-mono">24.2 V</span>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-primary-container w-[98%]"></div>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">Voltaje óptimo de arranque</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: Proveedor */}
            {activeTab === 'provider' && (
              <div className="p-space-lg flex flex-col gap-space-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high dark:bg-slate-700 flex items-center justify-center text-primary font-section text-section font-bold">
                    EM
                  </div>
                  <div className="flex flex-col">
                    <span className="font-section text-section text-on-surface dark:text-white font-bold">
                      Equipos & Maquinaria de Colombia SAS
                    </span>
                    <span className="font-caption text-caption text-outline">NIT: 900.832.114-6 • AFILIADO ASOCIACIÓN COLOMBIANA DE INGENIERÍA</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900">
                    <span className="font-caption text-caption text-outline uppercase block">SLA Reemplazo</span>
                    <span className="font-section text-section text-on-surface dark:text-white">&lt; 4 Horas</span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900">
                    <span className="font-caption text-caption text-outline uppercase block">Flota Propia</span>
                    <span className="font-section text-section text-on-surface dark:text-white">64 Equipos</span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900">
                    <span className="font-caption text-caption text-outline uppercase block">Taller Móvil 24/7</span>
                    <span className="font-section text-section text-on-surface dark:text-white">6 Unidades</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 4: Despacho */}
            {activeTab === 'dispatch' && (
              <div className="p-space-lg flex flex-col gap-space-md">
                <h3 className="font-section text-section text-on-surface dark:text-white">Condiciones de Movilización y Entrega</h3>
                <div className="space-y-space-sm font-body text-body text-on-surface-variant dark:text-slate-300">
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low dark:bg-slate-900">
                    <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                    <div>
                      <span className="font-body-medium text-body-medium text-on-surface dark:text-white block font-semibold">
                        Flete en Cama Baja Especializada
                      </span>
                      <p className="text-xs mt-0.5">Incluido sin costo adicional en el perímetro urbano de Bogotá, Chía, Cota, Mosquera y Funza.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column (40% Desktop: 5 cols of 12) - Sticky Booking Calculator Card */}
        <aside className="lg:col-span-5 sticky top-24">
          <div className="bg-surface-container-lowest dark:bg-slate-800/90 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg border border-outline-variant/30 dark:border-slate-700">
            {/* Header & Asset Title */}
            <div className="flex flex-col gap-space-xs pb-space-sm border-b border-outline-variant/30 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-outline uppercase tracking-wider">Excavadora Hidráulica de Orugas</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-700 text-primary font-caption text-caption">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  DISPONIBLE HOY
                </span>
              </div>
              <h1 className="font-display text-display text-on-surface dark:text-white tracking-tight">
                {tool?.title || 'Caterpillar 320D2 GC'}
              </h1>
              <span className="font-body text-body text-on-surface-variant dark:text-slate-400">
                Potencia {tool?.power || '148 HP'} • {tool?.capacity || 'Balde 1.0 m³'} • Modelo 2024
              </span>
            </div>

            {/* Daily Canon & Refundable Guarantee */}
            <div className="flex flex-col gap-1 p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900">
              <div className="flex items-baseline justify-between">
                <span className="font-caption text-caption text-outline uppercase">Tarifa Diaria Estándar</span>
                <span className="font-caption text-caption text-primary">Tarifa por Turno (8h)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-display text-on-surface dark:text-white font-mono tracking-tight">
                  $ {dailyRate.toLocaleString('es-CO')}
                </span>
                <span className="font-body text-body text-on-surface-variant font-medium">COP / día</span>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/20 dark:border-slate-700">
                <span>Depósito en garantía retornable:</span>
                <span className="font-mono font-medium text-on-surface dark:text-white">$ 4.500.000 COP</span>
              </div>
            </div>

            {/* Interactive Date Picker Form */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <label className="font-caption text-caption text-on-surface dark:text-slate-300 uppercase tracking-wider font-semibold">
                  Periodo de Arrendamiento
                </label>
                <span className="font-caption text-caption text-primary font-mono font-bold">
                  {days} DÍAS OPERATIVOS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-xs">
                <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low dark:bg-slate-900">
                  <span className="text-[11px] font-caption text-outline uppercase">Inicio de Obra</span>
                  <div className="flex items-center gap-1.5 text-on-surface dark:text-white font-body-medium text-body-medium">
                    <span className="material-symbols-outlined text-outline text-[16px]">calendar_today</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-on-surface dark:text-white font-body-medium text-body-medium focus:outline-none w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low dark:bg-slate-900">
                  <span className="text-[11px] font-caption text-outline uppercase">Finalización</span>
                  <div className="flex items-center gap-1.5 text-on-surface dark:text-white font-body-medium text-body-medium">
                    <span className="material-symbols-outlined text-outline text-[16px]">event_available</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-on-surface dark:text-white font-body-medium text-body-medium focus:outline-none w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Live Calculation Line Items */}
            <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low dark:bg-slate-900 font-body text-body">
              <span className="font-caption text-caption text-outline uppercase tracking-wider pb-1">
                Desglose de Liquidación
              </span>
              <div className="flex items-center justify-between text-on-surface-variant dark:text-slate-300">
                <span>{days} días × $ {dailyRate.toLocaleString('es-CO')}</span>
                <span className="font-mono text-on-surface dark:text-white font-medium">
                  $ {subtotal.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant dark:text-slate-300">
                <span>Seguro técnico amparado (5%)</span>
                <span className="font-mono text-on-surface dark:text-white font-medium">
                  $ {insurance.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant dark:text-slate-300">
                <span className="flex items-center gap-1">
                  Depósito en garantía
                  <span className="material-symbols-outlined text-outline text-[14px]">info</span>
                </span>
                <span className="font-mono text-on-surface dark:text-white font-medium">
                  $ {warrantyDeposit.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant dark:text-slate-300">
                <span>IVA (19% sobre canon)</span>
                <span className="font-mono text-on-surface dark:text-white font-medium">
                  $ {iva.toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="pt-space-xs mt-space-xs border-t border-outline-variant/30 dark:border-slate-700 flex items-baseline justify-between">
                <div>
                  <span className="font-section text-section text-on-surface dark:text-white block font-bold">TOTAL ESTIMADO</span>
                  <span className="text-[11px] font-caption text-outline">INCLUYE GARANTÍA REEMBOLSABLE</span>
                </div>
                <span className="font-section text-section text-primary font-mono text-xl font-black">
                  $ {total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={handleBooking}
                className="w-full h-11 rounded-lg bg-primary-container text-on-primary font-body-medium text-body-medium hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-space-sm shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                <span>Agregar a mi reserva</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-space-xs border-t border-outline-variant/20 dark:border-slate-700 flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                <span>Despacho en cama baja incluido en Bogotá y Sabana Norte</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">support_agent</span>
                <span>Asistencia técnica en frente de obra SLA &lt; 3.5 hrs</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
