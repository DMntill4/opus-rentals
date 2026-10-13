import React from 'react';
import { Tag, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ToolCard = ({ tool, onSelect, onRent }) => {
  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const isAvailable = tool.status === 'AVAILABLE';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Tool Image with status badge */}
      <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
        <img
          src={
            tool.coverImageUrl ||
            'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
          }
          alt={tool.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase ${
              isAvailable
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {isAvailable ? 'Disponible' : 'En Uso / Ocupada'}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded text-xs font-semibold text-slate-700 border border-slate-200">
          {tool.categoryName}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate font-medium">{tool.providerCompanyName}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {tool.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Marca: <span className="font-semibold text-slate-700">{tool.brand}</span> | Modelo: {tool.model}
          </p>

          {/* Pricing Box */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Tarifa Diaria:</span>
              <span className="text-base font-extrabold text-blue-700">
                {formatMoney(tool.dailyPrice)}
                <span className="text-xs font-normal text-slate-500"> /día</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1 text-xs text-slate-500">
              <span>Depósito de Garantía:</span>
              <span className="font-semibold text-slate-700">{formatMoney(tool.depositAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(tool)}
            className="w-full py-2 px-3 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors text-center"
          >
            Ficha Técnica
          </button>
          <button
            onClick={() => onRent(tool)}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-md text-xs font-bold transition-colors text-center ${
              isAvailable
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Alquilar' : 'No Disponible'}
          </button>
        </div>
      </div>
    </div>
  );
};
