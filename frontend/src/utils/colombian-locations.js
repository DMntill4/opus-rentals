/**
 * Catálogo Oficial de Departamentos y Municipios de Colombia
 * Utilizado para selectores jerárquicos y normalización de cobertura logística
 */

export const COLOMBIAN_REGIONS = {
  'Bogotá D.C.': [
    'Bogotá D.C.'
  ],
  'Antioquia': [
    'Medellín',
    'Envigado',
    'Itagüí',
    'Bello',
    'Rionegro',
    'Sabaneta',
    'Apartadó',
    'Caucasia',
    'Turbo',
    'Caldas'
  ],
  'Cundinamarca': [
    'Soacha',
    'Chía',
    'Zipaquirá',
    'Facatativá',
    'Girardot',
    'Fusagasugá',
    'Madrid',
    'Mosquera',
    'Funza',
    'Cajicá',
    'Cota'
  ],
  'Valle del Cauca': [
    'Cali',
    'Palmira',
    'Buenaventura',
    'Tuluá',
    'Cartago',
    'Guadalajara de Buga',
    'Jamundí',
    'Yumbo'
  ],
  'Santander': [
    'Bucaramanga',
    'Floridablanca',
    'Girón',
    'Piedecuesta',
    'Barrancabermeja',
    'San Gil'
  ],
  'Atlántico': [
    'Barranquilla',
    'Soledad',
    'Malambo',
    'Puerto Colombia',
    'Sabanalarga'
  ],
  'Bolívar': [
    'Cartagena de Indias',
    'Magangué',
    'Turbaco',
    'Arjona',
    'El Carmen de Bolívar'
  ],
  'Risaralda': [
    'Pereira',
    'Dosquebradas',
    'Santa Rosa de Cabal'
  ],
  'Caldas': [
    'Manizales',
    'Villamaría',
    'La Dorada',
    'Chinchiná'
  ],
  'Quindío': [
    'Armenia',
    'Calarcá',
    'Montenegro',
    'Quimbaya'
  ],
  'Tolima': [
    'Ibagué',
    'Espinal',
    'Melgar',
    'Mariquita',
    'Honda'
  ],
  'Huila': [
    'Neiva',
    'Pitalito',
    'Garzón',
    'La Plata'
  ],
  'Boyacá': [
    'Tunja',
    'Duitama',
    'Sogamoso',
    'Chiquinquirá',
    'Paipa'
  ],
  'Meta': [
    'Villavicencio',
    'Acacías',
    'Granada',
    'Puerto López'
  ],
  'Norte de Santander': [
    'Cúcuta',
    'Ocaña',
    'Villa del Rosario',
    'Los Patios',
    'Pamplona'
  ],
  'Córdoba': [
    'Montería',
    'Cereté',
    'Lorica',
    'Montelíbano'
  ],
  'Magdalena': [
    'Santa Marta',
    'Ciénaga',
    'Fundación',
    'El Banco'
  ],
  'Cesar': [
    'Valledupar',
    'Aguachica',
    'Agustín Codazzi'
  ],
  'Nariño': [
    'Pasto',
    'Tumaco',
    'Ipiales',
    'Túquerres'
  ],
  'Cauca': [
    'Popayán',
    'Santander de Quilichao',
    'Puerto Tejada'
  ]
};

export const DEPARTMENTS = Object.keys(COLOMBIAN_REGIONS);

export function getMunicipalitiesByDepartment(department) {
  if (!department) return [];
  return COLOMBIAN_REGIONS[department] || [];
}
