import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

export const CatalogPage = ({ onNavigate, onSelectTool }) => {
  const [activeState, setActiveState] = useState('grid'); // 'grid' | 'skeleton' | 'empty'
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [selectedHub, setSelectedHub] = useState('Bogotá D.C.');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCart();

  const machineryItems = [
    {
      id: 'CAT-320D2-GC',
      code: 'CAT-320-COL',
      title: 'Caterpillar 320D2 GC',
      category: 'Maquinaria Pesada',
      subtitle: 'Excavadora Hidráulica 20 Toneladas',
      location: 'Bogotá D.C. • Parque Cazucá',
      power: '148 HP',
      weight: '21.5 Ton',
      capacity: 'Balde 1.0 m³',
      dailyRate: 1250000,
      warranty: 'COP $ 4.500.000',
      status: 'AVAILABLE',
      statusText: 'Disponible',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChjtlv4gRRPR4ALTi8WJE08vyNMJDxrL6y0YbMOIxc6mUFt92RfbXWvJnRZ01B3MjFhgcs-WliJtl1XjpxmsMKSNddyYqzoKop-_6t5T4lnp4U2vpbjZgjtSa8PvySbxeTORXb6_Bn3sYYHN3Cb5QLc3VlbpnBQoQ7ViDInZ5uHsYWd_9jFS2hGhjBJpxN7P8pvIfwmjBHq9Yfc0mNEUeJo6pITiVLvgZWuZ-eOD9y-5-bDQE_rbWaqg'
    },
    {
      id: 'BOB-S590',
      code: 'BOB-590-ANT',
      title: 'Bobcat S590',
      category: 'Maquinaria Pesada',
      subtitle: 'Minicargador sobre Ruedas Reforzado',
      location: 'Medellín • Itagüí Obrasur',
      power: '68 HP',
      weight: '3.1 Ton',
      capacity: 'ROC 998 kg',
      dailyRate: 380000,
      warranty: 'COP $ 1.800.000',
      status: 'AVAILABLE',
      statusText: 'Disponible',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvsf6z-ccALY_daDC-1m3tda3mrjpiAX7cRV6ZSfs92_c6VvxpX92uJnxArqk_-5eRAD6w9WofQ45JVYHZZQjKuJgF-XuDtoxBvrQxv8_A6R6V5t3QpiDJU955JLwtmR3dgkOBFBruWbNhp7vofF6woi7km7dt43pQui3DTSI61zQt20QVvymRnQ15pqqFpdeqqRaegfxEuhkfmW36fAg0_VPMVewPHL_3mrbUAsCFhmzP0sTvV_EMLA'
    },
    {
      id: 'BOMAG-BW211',
      code: 'BOM-211-VAL',
      title: 'Bomag BW 211 D-50',
      category: 'Compactación',
      subtitle: 'Rodillo Compactador Monocilíndrico',
      location: 'Cali • Yumbo Industrial',
      power: '130 HP',
      weight: '11.0 Ton',
      capacity: 'Tambor 2.13 m',
      dailyRate: 620000,
      warranty: 'COP $ 3.200.000',
      status: 'RENTED',
      statusText: 'Alquilada hasta 28 oct',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBYY_sY8LmtWXyVFwU3TZJ6wVcvWt0NOeJsfpq1Dh3KzXi_g7R_KN_fF-Ss0TB4M14J9X0B6L5YiX-SfvlBTGPBRyrFn3XgnFkBzZZxwLuYUXtPUy8ZonkBQAzJbpUqEJLx7SZsWYlzenBvMzf0SzaDvFWeENreJ9_QcUZsy03-P32-KWbfhcRFNrcICAjK7oGBq56h2958MnkDWFANy7vMfxT13-OOCjFcGsV6POvsI7EqlSQ_GPHmA'
    },
    {
      id: 'CAT-336D2-L',
      code: 'CAT-336-COL',
      title: 'Caterpillar 336D2 L',
      category: 'Maquinaria Pesada',
      subtitle: 'Excavadora de Alto Rendimiento 36 Ton',
      location: 'Barranquilla • Zona Portuaria',
      power: '280 HP',
      weight: '36.8 Ton',
      capacity: 'Balde 2.2 m³',
      dailyRate: 2100000,
      warranty: 'COP $ 8.000.000',
      status: 'AVAILABLE',
      statusText: 'Disponible',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChjtlv4gRRPR4ALTi8WJE08vyNMJDxrL6y0YbMOIxc6mUFt92RfbXWvJnRZ01B3MjFhgcs-WliJtl1XjpxmsMKSNddyYqzoKop-_6t5T4lnp4U2vpbjZgjtSa8PvySbxeTORXb6_Bn3sYYHN3Cb5QLc3VlbpnBQoQ7ViDInZ5uHsYWd_9jFS2hGhjBJpxN7P8pvIfwmjBHq9Yfc0mNEUeJo6pITiVLvgZWuZ-eOD9y-5-bDQE_rbWaqg'
    },
    {
      id: 'GEN-CUMMINS-150',
      code: 'CUM-150-BOG',
      title: 'Planta Eléctrica Cummins 150 kVA',
      category: 'Generación Eléctrica',
      subtitle: 'Generador Diésel Insonorizado para Obra',
      location: 'Bogotá D.C. • Cota Hub',
      power: '180 HP',
      weight: '2.4 Ton',
      capacity: '150 kVA / 120 kW',
      dailyRate: 450000,
      warranty: 'COP $ 2.000.000',
      status: 'AVAILABLE',
      statusText: 'Disponible',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvsf6z-ccALY_daDC-1m3tda3mrjpiAX7cRV6ZSfs92_c6VvxpX92uJnxArqk_-5eRAD6w9WofQ45JVYHZZQjKuJgF-XuDtoxBvrQxv8_A6R6V5t3QpiDJU955JLwtmR3dgkOBFBruWbNhp7vofF6woi7km7dt43pQui3DTSI61zQt20QVvymRnQ15pqqFpdeqqRaegfxEuhkfmW36fAg0_VPMVewPHL_3mrbUAsCFhmzP0sTvV_EMLA'
    },
    {
      id: 'JLG-800AJ',
      code: 'JLG-800-ANT',
      title: 'Plataforma Articulada JLG 800AJ',
      category: 'Elevación & Grúas',
      subtitle: 'Manlift 4x4 Altura de Trabajo 26m',
      location: 'Medellín • Guarne Hub',
      power: '84 HP',
      weight: '15.5 Ton',
      capacity: 'Alcance 26.3 m',
      dailyRate: 890000,
      warranty: 'COP $ 3.500.000',
      status: 'MAINTENANCE',
      statusText: 'En Mantenimiento Preventivo',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBYY_sY8LmtWXyVFwU3TZJ6wVcvWt0NOeJsfpq1Dh3KzXi_g7R_KN_fF-Ss0TB4M14J9X0B6L5YiX-SfvlBTGPBRyrFn3XgnFkBzZZxwLuYUXtPUy8ZonkBQAzJbpUqEJLx7SZsWYlzenBvMzf0SzaDvFWeENreJ9_QcUZsy03-P32-KWbfhcRFNrcICAjK7oGBq56h2958MnkDWFANy7vMfxT13-OOCjFcGsV6POvsI7EqlSQ_GPHmA'
    }
  ];

  const handleRent = (item) => {
    addItem({
      id: item.id,
      name: item.title,
      category: item.category,
      pricePerDay: item.dailyRate,
      securityDeposit: 2500000,
      city: item.location.split('•')[0].trim(),
      image: item.image,
      days: 3
    });
    if (onSelectTool) {
      onSelectTool(item);
    }
    onNavigate('tool-detail');
  };

  return (
    <div className="max-w-[1240px] mx-auto px-gutter-desktop py-space-xl flex flex-col w-full">
      {/* Top Headline & Architecture Scope */}
      <section className="flex flex-col gap-space-sm pb-space-lg">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container dark:bg-slate-800 text-caption font-caption text-on-surface-variant dark:text-slate-300 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              Parque Maquinaria Activo • Colombia
            </span>
            <span className="text-caption font-caption text-outline dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
              Actualizado: 13 oct 2026
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-caption font-caption text-on-surface-variant dark:text-slate-300">
            <span className="material-symbols-outlined text-[16px] text-primary-container">verified</span>
            <span>Equipos auditados RUNT & DIAN UBL 2.1</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="max-w-3xl">
            <h1 className="font-display text-display text-on-surface dark:text-white tracking-tight">
              Alquila el equipo que necesitas. Sin comprarlo.
            </h1>
            <p className="font-body text-body text-on-surface-variant dark:text-slate-300 mt-1 max-w-2xl">
              Disponibilidad verificada en tiempo real para frentes de obra e infraestructura en Colombia. Tarifas transparentes por día, semana o mes con trazabilidad telemática.
            </p>
          </div>

          {/* Quick Interactive State Toggle for QA & Showcase */}
          <div className="flex items-center self-start md:self-end bg-surface-container-high dark:bg-slate-800 p-1 rounded-lg gap-1 shrink-0">
            <button
              onClick={() => setActiveState('grid')}
              className={`px-2.5 py-1 text-caption font-caption rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                activeState === 'grid'
                  ? 'bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] text-primary-container">grid_view</span>
              Cuadrícula (6)
            </button>
            <button
              onClick={() => setActiveState('skeleton')}
              className={`px-2.5 py-1 text-caption font-caption rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                activeState === 'skeleton'
                  ? 'bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
              Skeleton Loader
            </button>
            <button
              onClick={() => setActiveState('empty')}
              className={`px-2.5 py-1 text-caption font-caption rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                activeState === 'empty'
                  ? 'bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">search_off</span>
              Sin Resultados
            </button>
          </div>
        </div>
      </section>

      {/* Horizontal Category Chips Bar */}
      <section className="py-space-sm mb-space-lg overflow-x-auto no-scrollbar -mx-gutter-desktop px-gutter-desktop">
        <div className="flex items-center gap-space-xs min-w-max">
          {[
            { id: 'all', label: 'Maquinaria Pesada', count: '482 equipos' },
            { id: 'perforacion', label: 'Perforación', count: '194' },
            { id: 'compactacion', label: 'Compactación', count: '310' },
            { id: 'energia', label: 'Generación Eléctrica', count: '158' },
            { id: 'elevacion', label: 'Elevación & Grúas', count: '92' },
            { id: 'tierras', label: 'Movimiento de Tierras', count: '246' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-body-medium text-body-medium transition-all shadow-sm cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest dark:bg-slate-800 hover:bg-surface-container dark:hover:bg-slate-700 text-on-surface dark:text-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-caption font-caption ${
                activeCategory === cat.id ? 'bg-secondary text-white' : 'bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-300'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Main 12-Column Layout Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
        {/* Left Sidebar Filter Panel (3 Cols) */}
        <aside className="lg:col-span-3 flex flex-col gap-space-md bg-surface-container-lowest dark:bg-slate-800/80 p-space-md rounded-xl shadow-sm border border-outline-variant/30 dark:border-slate-700">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary-container">tune</span>
              <span className="font-section text-body-medium text-on-surface dark:text-white font-semibold">
                Filtros de Búsqueda
              </span>
            </div>
            <button
              onClick={() => { setOnlyAvailable(false); setActiveCategory('all'); setSearchQuery(''); }}
              className="font-caption text-caption text-primary hover:text-secondary uppercase tracking-wider cursor-pointer"
            >
              Limpiar
            </button>
          </div>

          {/* Disponibilidad Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="font-caption text-caption text-outline dark:text-slate-400 uppercase tracking-wider">
              Disponibilidad Inmediata
            </label>
            <div className="grid grid-cols-2 p-1 bg-surface-container dark:bg-slate-900 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setOnlyAvailable(false)}
                className={`py-1.5 text-caption font-caption rounded transition-colors text-center cursor-pointer ${
                  !onlyAvailable
                    ? 'bg-surface-container-lowest dark:bg-slate-800 text-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setOnlyAvailable(true)}
                className={`py-1.5 text-caption font-caption rounded transition-colors text-center cursor-pointer ${
                  onlyAvailable
                    ? 'bg-surface-container-lowest dark:bg-slate-800 text-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                }`}
              >
                Solo Disponibles
              </button>
            </div>
          </div>

          {/* Categorías Checkboxes */}
          <div className="flex flex-col gap-2 pt-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-outline dark:text-slate-400 uppercase tracking-wider">
                Tipo de Equipo
              </span>
              <span className="font-caption text-caption text-on-surface-variant dark:text-slate-400">5 selec.</span>
            </div>
            <div className="space-y-1.5">
              {[
                { name: 'Retroexcavadoras', count: '142' },
                { name: 'Minicargadores', count: '88' },
                { name: 'Torres de Iluminación', count: '64' },
                { name: 'Plantas Eléctricas', count: '94' },
                { name: 'Rodillos Vibrocompactadores', count: '76' }
              ].map((eq) => (
                <label key={eq.name} className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low dark:hover:bg-slate-700/50 cursor-pointer group">
                  <span className="flex items-center gap-2 font-body text-body text-on-surface dark:text-slate-200">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-primary-container accent-primary-container"
                    />
                    {eq.name}
                  </span>
                  <span className="font-caption text-caption text-outline group-hover:text-on-surface-variant font-mono">
                    {eq.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Hub Logístico */}
          <div className="flex flex-col gap-2 pt-space-xs">
            <label className="font-caption text-caption text-outline dark:text-slate-400 uppercase tracking-wider">
              Hub Logístico (Colombia)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Bogotá D.C.', count: '210' },
                { name: 'Medellín - Ant.', count: '145' },
                { name: 'Cali - Valle', count: '78' },
                { name: 'B/quilla - Atl.', count: '49' },
              ].map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => setSelectedHub(hub.name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-body-medium text-[12px] font-medium cursor-pointer transition-colors ${
                    selectedHub === hub.name
                      ? 'bg-surface-container-high dark:bg-slate-700 text-on-surface dark:text-white border border-primary-container'
                      : 'bg-surface-container-low dark:bg-slate-900 text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-high'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  {hub.name} <span className="font-mono text-outline">{hub.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rango de Tarifa Diaria */}
          <div className="flex flex-col gap-2.5 pt-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-outline dark:text-slate-400 uppercase tracking-wider">
                Tarifa Diaria (COP)
              </span>
              <span className="font-caption text-caption font-mono text-primary font-semibold">
                $ 150k - $ 2.2M
              </span>
            </div>
            <div className="relative py-2">
              <div className="h-1.5 w-full bg-surface-container dark:bg-slate-700 rounded-full overflow-hidden relative">
                <div className="absolute left-[12%] right-[16%] h-full bg-primary-container rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between font-caption text-caption text-outline font-mono">
              <span>Min: $ 50.000 COP</span>
              <span>Max: $ 2.500.000 COP</span>
            </div>
          </div>

          <div className="pt-space-xs">
            <button
              type="button"
              className="w-full h-10 rounded-lg bg-surface-container dark:bg-slate-700 hover:bg-surface-container-high dark:hover:bg-slate-600 text-on-surface dark:text-white font-body-medium text-body-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              Aplicar Parámetros
            </button>
          </div>
        </aside>

        {/* Main Content Area (9 Cols) */}
        <main className="lg:col-span-9 flex flex-col gap-space-md">
          {/* Active Search & Tag Bar */}
          <div className="flex flex-col gap-space-sm bg-surface-container-lowest dark:bg-slate-800/80 p-space-md rounded-xl shadow-sm border border-outline-variant/30 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm justify-between">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Retroexcavadora CAT 4x4, Bobcat, Plantas..."
                  className="w-full h-10 pl-9 pr-9 rounded-lg bg-surface-container-low dark:bg-slate-900 font-body text-body text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all border border-outline-variant/40 dark:border-slate-700"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-space-xs self-end sm:self-auto shrink-0">
                <div className="h-10 px-3 rounded-lg bg-surface-container-low dark:bg-slate-900 border border-outline-variant/40 dark:border-slate-700 flex items-center gap-2">
                  <span className="font-caption text-caption text-outline uppercase hidden sm:inline">Ordenar:</span>
                  <select className="bg-transparent font-body-medium text-body-medium text-on-surface dark:text-white focus:outline-none cursor-pointer">
                    <option className="dark:bg-slate-900">Tarifa: Menor a Mayor</option>
                    <option className="dark:bg-slate-900">Tarifa: Mayor a Menor</option>
                    <option className="dark:bg-slate-900">Mayor Capacidad (HP)</option>
                    <option className="dark:bg-slate-900">Ubicación Más Cercana</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Pills Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-slate-700 text-caption font-caption text-on-surface dark:text-slate-200">
                  {selectedHub}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-slate-700 text-caption font-caption text-on-surface dark:text-slate-200">
                  Solo Disponibles
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed dark:bg-blue-950 text-caption font-caption text-on-primary-fixed dark:text-blue-300">
                  Orden: Menor tarifa
                </span>
              </div>
              <span className="font-caption text-caption text-outline font-mono">
                Mostrando 6 de 482 equipos encontrados
              </span>
            </div>
          </div>

          {/* STATE 1: ACTIVE GRID */}
          {activeState === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
              {machineryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col bg-surface-container-lowest dark:bg-slate-800/90 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/30 dark:border-slate-700"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container dark:bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'AVAILABLE' ? 'bg-emerald-600' : item.status === 'RENTED' ? 'bg-amber-600' : 'bg-slate-500'
                      }`} />
                      <span className={`text-caption font-caption uppercase tracking-wider ${
                        item.status === 'AVAILABLE' ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                      }`}>
                        {item.statusText}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-on-background/80 text-on-primary text-caption font-caption font-mono backdrop-blur-xs">
                      ID #{item.code}
                    </div>
                  </div>

                  <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 font-caption text-caption text-outline dark:text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{item.location}</span>
                      </div>
                      <h2 className="font-section text-body-medium text-on-surface dark:text-white font-semibold group-hover:text-primary transition-colors">
                        {item.title}
                      </h2>
                      <p className="font-caption text-caption text-on-surface-variant dark:text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Technical Specification Pills */}
                    <div className="grid grid-cols-3 gap-1 py-1">
                      <div className="flex flex-col items-center justify-center p-1.5 rounded bg-surface-container-low dark:bg-slate-900 text-center">
                        <span className="font-caption text-[10px] text-outline">POTENCIA</span>
                        <span className="font-caption text-caption text-on-surface dark:text-slate-200 font-mono font-medium">
                          {item.power}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1.5 rounded bg-surface-container-low dark:bg-slate-900 text-center">
                        <span className="font-caption text-[10px] text-outline">PESO OP.</span>
                        <span className="font-caption text-caption text-on-surface dark:text-slate-200 font-mono font-medium">
                          {item.weight}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1.5 rounded bg-surface-container-low dark:bg-slate-900 text-center">
                        <span className="font-caption text-[10px] text-outline">CAPACIDAD</span>
                        <span className="font-caption text-caption text-on-surface dark:text-slate-200 font-mono font-medium">
                          {item.capacity}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-space-xs flex flex-col gap-space-xs">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-section text-section text-on-surface dark:text-white font-bold tracking-tight">
                            $ {item.dailyRate.toLocaleString('es-CO')}
                          </span>
                          <span className="font-caption text-caption text-outline"> / día COP</span>
                        </div>
                        <span className="font-caption text-caption text-on-surface-variant dark:text-slate-400 font-mono">
                          Garantía: {item.warranty}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRent(item)}
                        className="w-full h-10 rounded-lg bg-primary-container text-on-primary font-body-medium text-body-medium flex items-center justify-center gap-1.5 hover:bg-secondary active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                      >
                        <span>Alquilar Equipo</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATE 2: SKELETON */}
          {activeState === 'skeleton' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col bg-surface-container-lowest dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="h-48 w-full bg-surface-container-high dark:bg-slate-700 relative" />
                  <div className="p-space-md flex flex-col gap-space-sm">
                    <div className="h-3 w-32 bg-surface-container-high dark:bg-slate-700 rounded" />
                    <div className="h-5 w-48 bg-surface-container dark:bg-slate-600 rounded" />
                    <div className="h-3 w-56 bg-surface-container-high dark:bg-slate-700 rounded" />
                    <div className="grid grid-cols-3 gap-1 py-1">
                      <div className="h-10 bg-surface-container dark:bg-slate-700 rounded" />
                      <div className="h-10 bg-surface-container dark:bg-slate-700 rounded" />
                      <div className="h-10 bg-surface-container dark:bg-slate-700 rounded" />
                    </div>
                    <div className="h-10 w-full bg-surface-container dark:bg-slate-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATE 3: EMPTY */}
          {activeState === 'empty' && (
            <div className="flex flex-col items-center justify-center p-space-xl bg-surface-container-lowest dark:bg-slate-800 rounded-xl text-center py-16 shadow-sm border border-outline-variant/30 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-surface-container dark:bg-slate-700 flex items-center justify-center mb-space-md text-primary-container">
                <span className="material-symbols-outlined text-[36px]">travel_explore</span>
              </div>
              <h3 className="font-section text-section text-on-surface dark:text-white mb-2 font-semibold">
                No encontramos equipos con estos filtros
              </h3>
              <p className="font-body text-body text-on-surface-variant dark:text-slate-300 max-w-md mb-space-lg">
                Intenta ajustando el rango de tarifa diaria o ampliando la cobertura de ciudades a nivel nacional. Nuestro equipo logístico actualiza la flota cada hora.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => setActiveState('grid')}
                  className="h-10 px-5 rounded-lg bg-primary-container text-on-primary font-body-medium text-body-medium hover:bg-secondary transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Restablecer filtros
                </button>
              </div>
            </div>
          )}

          {/* Telemetry SLA Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-space-md rounded-xl bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white gap-space-md border border-outline-variant/30 dark:border-slate-700">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest dark:bg-slate-900 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">speed</span>
              </div>
              <div>
                <span className="font-section text-body-medium font-semibold block text-on-surface dark:text-white">
                  Telemetría Satelital Activa en 100% de la Flota
                </span>
                <span className="font-body text-body text-on-surface-variant dark:text-slate-400">
                  Horómetro certificado, control de combustible y geocerca antirrobo en obra.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0 font-mono text-caption text-on-surface-variant dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SLA ASISTENCIA TÉCNICA &lt; 3.5 HORAS</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
