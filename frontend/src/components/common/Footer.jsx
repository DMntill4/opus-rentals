import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  HardHat,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileCheck,
  Globe,
  Sun,
  Moon,
  Github,
  Server,
  Database,
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const Footer = () => {
  const { isDark, toggleTheme, lang, toggleLang } = useTheme();

  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Value Banner */}
      <div className="border-b border-slate-100 dark:border-slate-900 py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                OPUS RENTALS ENTERPRISE PLATFORM
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'es'
                  ? 'Red certificada de maquinaria pesada, herramientas industriales y contratistas.'
                  : 'Certified network for heavy machinery, industrial tools, and contractors.'}
              </div>
            </div>
          </div>

          {/* Language & Theme Controls Pill (Apple/Windows Style) */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Lang switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cambiar idioma / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'es' ? 'Español (CO)' : 'English (US)'}</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Oscuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Platform & Compliance */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {lang === 'es' ? 'Infraestructura & Estándares' : 'Infrastructure & Standards'}
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pr-6">
              {lang === 'es'
                ? 'Plataforma diseñada bajo Arquitectura Hexagonal y Domain-Driven Design (DDD). Modelo relacional normalizado en Cuarta Forma Normal (4FN) para garantizar consistencia operativa sin traslapes.'
                : 'Platform engineered with Hexagonal Architecture and Domain-Driven Design (DDD). Relational schema normalized to 4th Normal Form (4FN) preventing overlapping schedules.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Database className="w-3 h-3 text-blue-500" /> MySQL 8.0 (4FN)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Server className="w-3 h-3 text-emerald-500" /> Spring Boot 3.3.4
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3 h-3 text-purple-500" /> Spring Security JWT
              </span>
            </div>
          </div>

          {/* Col 2: Documentation & API */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {lang === 'es' ? 'Documentación' : 'Documentation'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="http://localhost:8080/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  Swagger UI / OpenAPI <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/DMntill4/opus-rentals"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  GitHub Repository <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-500">docs/COMPILACION.md</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-500">docs/DESPLIEGUE.md</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-500">docs/ARQUITECTURA_4FN.md</span>
              </li>
            </ul>
          </div>

          {/* Col 3: National Coverage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {lang === 'es' ? 'Centros de Operación' : 'Operational Hubs'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Bogotá D.C. & Cundinamarca</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Medellín & Antioquia</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Cali & Valle del Cauca</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Barranquilla & Costa Norte</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {lang === 'es' ? 'Contacto & Soporte' : 'Contact & Support'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>+57 (601) 745-8900</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>soporte@opusrentals.com</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>NIT: 901.834.120-7</span>
              </li>
              <li className="pt-2 text-slate-400 dark:text-slate-500">
                Lunes - Sábado: 07:00 - 18:00 COT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="border-t border-slate-100 dark:border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Opus Rentals Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
              {lang === 'es' ? 'Términos de Alquiler' : 'Rental Terms'}
            </span>
            <span>•</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
              {lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
            </span>
            <span>•</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
              {lang === 'es' ? 'Seguridad & Garantías' : 'Security & Guarantees'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
