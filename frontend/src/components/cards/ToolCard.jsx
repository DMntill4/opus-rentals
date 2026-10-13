import React from 'react';
import { formatMoneyCOP } from '../../context/i18n';
import { Building2 } from 'lucide-react';

export const ToolCard = ({ tool, onSelect, onRent }) => {
  const isAvailable = tool.status === 'AVAILABLE';

  return (
    <div
      className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col overflow-hidden shadow-sm ${
        isAvailable
          ? 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md'
          : 'border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      {/* Tool Image with soft status badge (Prompt Tokens Spec) */}
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <img
          src={
            tool.coverImageUrl ||
            tool.image ||
            'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
          }
          alt={tool.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isAvailable ? 'Disponible' : 'Alquilada'}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm">
          {tool.categoryName || 'Maquinaria'}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate font-medium">{tool.providerCompanyName || 'Caterpillar Rental'}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
            {tool.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Marca: <span className="font-semibold text-slate-700 dark:text-slate-300">{tool.brand}</span> | Modelo: {tool.model}
          </p>

          {/* Pricing Box */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Tarifa Diaria:</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                {formatMoneyCOP(tool.dailyPrice)}
                <span className="text-xs font-normal text-slate-500"> /día</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1 text-xs text-slate-500">
              <span>Depósito de Garantía:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatMoneyCOP(tool.depositAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(tool)}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-center"
          >
            Ficha Técnica
          </button>
          <button
            onClick={() => onRent(tool)}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors text-center ${
              isAvailable
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Alquilar' : 'No Disponible'}
          </button>
        </div>
      </div>
    </div>
  );
};
