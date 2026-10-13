import React from 'react';
import { HardHat, Phone, Mail, MapPin, ShieldCheck, FileCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                OPUS <span className="text-orange-500">RENTALS</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Plataforma empresarial de alquiler de maquinaria pesada, herramientas de construcción y equipos industriales.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Arquitectura & Calidad
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                Arquitectura Hexagonal + DDD
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-orange-500" />
                Base de Datos 4FN Normalizada
              </li>
              <li>Spring Security 6 con JWT</li>
              <li>MySQL 8.0 & Apache Tomcat</li>
            </ul>
          </div>

          {/* Coverage */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Cobertura Nacional
            </h4>
            <ul className="space-y-2 text-sm">
              <li>Bogotá D.C. & Cundinamarca</li>
              <li>Medellín & Antioquia</li>
              <li>Cali & Valle del Cauca</li>
              <li>Barranquilla & Costa Caribe</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Contacto & Soporte
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                +57 (601) 745-8900
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                soporte@opusrentals.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Parque Industrial, Bogotá - Colombia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Opus Rentals Inc. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">Cumplimiento de estándares de desarrollo y arquitectura empresarial.</p>
        </div>
      </div>
    </footer>
  );
};
