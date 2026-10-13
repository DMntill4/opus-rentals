import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { ToolCard } from '../../components/cards/ToolCard';
import { formatMoneyCOP, translations } from '../../context/i18n';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const CatalogPage = ({ onNavigate, onSelectTool }) => {
  const { addToCart } = useCart();
  const { lang } = useTheme();
  const t = translations[lang] || translations.es;

  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' or 'AVAILABLE'
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

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

  const handleResetFilters = () => {
    setSelectedCategory('');
    setStatusFilter('ALL');
    setMaxPrice(2500000);
    setSearchTerm('');
    fetchTools();
  };

  const handleRentTool = (tool) => {
    addToCart(tool);
    setToastMessage(`"${tool.name}" agregado a tu reserva.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTools = tools.filter((tool) => {
    if (statusFilter === 'AVAILABLE' && tool.status !== 'AVAILABLE') return false;
    if (tool.dailyPrice && tool.dailyPrice > maxPrice) return false;
    return true;
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => onNavigate('checkout')}
            className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
          >
            Ir a Reserva
          </button>
        </div>
      )}

      {/* Hero header */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Catálogo de Maquinaria y Equipos</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Alquila el equipo que necesitas. Sin comprarlo.
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inventario certificado para constructoras, contratistas y particulares en Colombia con validación de fechas en tiempo real.
        </p>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todas ({tools.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === c.id.toString()
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 12-Column Layout with 260px Filter Sidebar (Prompt 2 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Panel (260px width equivalent ~ lg:col-span-3) */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <Filter className="w-4 h-4 text-blue-600" />
              Filtros Avanzados
            </div>
            <button
              onClick={handleResetFilters}
              title="Restablecer"
              className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar
            </button>
          </div>

          {/* Search field inside filter panel */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Buscar por palabra clave
            </label>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Excavadora, CAT, Bobcat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Disponibilidad Radio/Pills */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Estado de Disponibilidad
            </label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusF"
                  checked={statusFilter === 'ALL'}
                  onChange={() => setStatusFilter('ALL')}
                  className="text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Todas las herramientas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusF"
                  checked={statusFilter === 'AVAILABLE'}
                  onChange={() => setStatusFilter('AVAILABLE')}
                  className="text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Solo Disponibles hoy</span>
              </label>
            </div>
          </div>

          {/* Category List */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Categorías
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
              <div
                onClick={() => setSelectedCategory('')}
                className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === '' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Todas las categorías
              </div>
              {categories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id.toString())}
                  className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors truncate ${
                    selectedCategory === c.id.toString()
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tarifa Diaria Máxima
              </label>
              <span className="text-xs font-bold text-blue-600">{formatMoneyCOP(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={2500000}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$ 100.000</span>
              <span>$ 2.500.000 /día</span>
            </div>
          </div>
        </aside>

        {/* Main 3-Column Tool Cards Grid (lg:col-span-9) */}
        <div className="lg:col-span-9">
          {/* Header count */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">
              Mostrando <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong> equipos encontrados
            </span>
          </div>

          {/* Skeletons loader or Empty State or 3-Column Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No encontramos herramientas con esos filtros
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Intenta ampliar el rango de precio o cambiar la categoría seleccionada.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={(t) => onSelectTool(t)}
                  onRent={(t) => handleRentTool(t)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
