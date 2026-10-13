import React from 'react';
import { formatMoneyCOP, formatDateCO, translations } from '../../context/i18n';
import { useTheme } from '../../context/ThemeContext';
import { HardHat, Printer, Download, ChevronLeft, ShieldCheck, Building2, User, FileText } from 'lucide-react';

export const InvoicePage = ({ rental, onBack }) => {
  const { lang } = useTheme();
  const t = translations[lang] || translations.es;

  const invoiceNumber = rental?.invoiceNumber || `FE-9841-${rental?.id || '01'}`;
  const totalAmount = rental?.estimatedTotal || 2499000;
  const subtotalNet = Math.round(totalAmount / 1.19);
  const ivaAmount = totalAmount - subtotalNet;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 sm:px-6">
      {/* Floating Top Toolbar (Hidden on print) */}
      <div className="max-w-[840px] mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            {t.printInvoice}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t.downloadPdf}
          </button>
        </div>
      </div>

      {/* A4 PROPORTIONED PAPER SHEET */}
      <div className="max-w-[840px] mx-auto bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xl p-10 sm:p-14 print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">OPUS RENTALS S.A.S.</h1>
              <div className="text-xs text-slate-500">NIT: 901.834.120-7 • Régimen Común</div>
              <div className="text-xs text-slate-500">Parque Industrial, Bogotá D.C., Colombia</div>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <div className="inline-block px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider mb-1">
              FACTURA ELECTRÓNICA
            </div>
            <div className="text-lg font-black text-slate-900">{invoiceNumber}</div>
            <div className="text-xs text-slate-500">
              Fecha de Expedición: <strong>{formatDateCO(rental?.createdAt || rental?.startDate)}</strong>
            </div>
            <div className="text-xs text-slate-500">
              Vigencia Orden: <strong>{formatDateCO(rental?.startDate)} al {formatDateCO(rental?.endDate)}</strong>
            </div>
          </div>
        </div>

        {/* Client & Provider 2-Column Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              ADQUIRIENTE / CLIENTE
            </span>
            <div className="font-extrabold text-sm text-slate-900">{rental?.clientFullName || 'Carlos Gómez Contratista'}</div>
            <div className="text-slate-600 mt-0.5">Identificación: CC 79.458.120</div>
            <div className="text-slate-600">Contacto: cliente.carlos@gmail.com</div>
            <div className="text-slate-600">Destino de Maquinaria: Obra Principal Bogotá</div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              PROVEEDOR CERTIFICADO
            </span>
            <div className="font-extrabold text-sm text-slate-900">{rental?.providerCompanyName || 'Caterpillar Rental Services'}</div>
            <div className="text-slate-600 mt-0.5">NIT: 860.001.240-5</div>
            <div className="text-slate-600">Zona de Despacho: Parque Central Cundinamarca</div>
            <div className="text-slate-600">Póliza de Daños: Cobertura Vigente 4FN</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="pb-3">Descripción de Equipo</th>
                <th className="pb-3 text-center">Días de Uso</th>
                <th className="pb-3 text-right">Tarifa Diaria</th>
                <th className="pb-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4">
                  <div className="font-bold text-slate-900">{rental?.toolName || 'Excavadora Hidráulica CAT 320D'}</div>
                  <div className="text-[11px] text-slate-500">Maquinaria pesada certificada con operador e inspección técnica</div>
                </td>
                <td className="py-4 text-center font-bold">{rental?.totalDays || 4}</td>
                <td className="py-4 text-right font-semibold">{formatMoneyCOP((rental?.dailyPrice) || 650000)}</td>
                <td className="py-4 text-right font-bold text-slate-900">{formatMoneyCOP(subtotalNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="border-t border-slate-200 pt-6 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Neto:</span>
              <span className="font-bold text-slate-900">{formatMoneyCOP(subtotalNet)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA Legal (19%):</span>
              <span className="font-bold text-slate-900">{formatMoneyCOP(ivaAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
              <span>Depósito en Garantía (4FN):</span>
              <span className="font-bold text-slate-900">{formatMoneyCOP(1200000)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1">
              <span>Total Pagado:</span>
              <span className="text-blue-600">{formatMoneyCOP(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Thin Cobalt Accent Rule */}
        <div className="h-0.5 bg-blue-600 my-8" />

        {/* Legal Text & Verification Bar */}
        <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
          <p>
            Resolución DIAN No. 18764000192842 de fecha 2026-01-15. Rango autorizado FE-9000 al FE-99999.
            Esta factura electrónica de venta constituye título valor según el Artículo 774 del Código de Comercio de Colombia.
          </p>
          <p>
            El depósito de garantía será reembolsado al finalizar el acta de recepción de devolución libre de reportes de daños o penalizaciones.
          </p>
        </div>
      </div>
    </div>
  );
};
