/**
 * In-memory Mock Data Store for ToolRent Frontend
 * Exactly matching the ToolRent Design Specs from img/
 */

export const mockCategories = [
  { id: 'cat-all', name: 'Toda la Flota', icon: 'LayoutGrid', count: 48 },
  { id: 'cat-excavacion', name: 'Excavación y Movimiento', icon: 'Truck', count: 18 },
  { id: 'cat-compactacion', name: 'Compactación y Pavimento', icon: 'Layers', count: 12 },
  { id: 'cat-elevacion', name: 'Grúas y Manlifts 4x4', icon: 'ArrowUpCircle', count: 8 },
  { id: 'cat-energia', name: 'Generación Eléctrica Diésel', icon: 'BatteryCharging', count: 6 },
  { id: 'cat-demolicion', name: 'Demolición y Martillos', icon: 'Hammer', count: 4 },
];

export const mockTools = [
  {
    id: 'tool-001',
    name: 'Excavadora Hidráulica Caterpillar 320D2 GC',
    categoryId: 'cat-excavacion',
    categoryName: 'Excavación y Movimiento',
    brand: 'Caterpillar',
    model: '320D2 GC',
    dailyPrice: 1250000,
    replacementValue: 450000000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1000&auto=format&fit=crop&q=80', isPrimary: true },
      { imageUrl: 'https://images.unsplash.com/photo-1652303518314-e1196ef221f6?w=1000&auto=format&fit=crop&q=80', isPrimary: false },
    ],
    description: 'Excavadora sobre orugas para movimiento masivo de tierras y zanjas en obra de infraestructura. Motor diésel Cat C4.4 de 148 HP con certificación de emisiones y telemetría telemática Product Link.',
    specs: [
      { specName: 'Potencia Neta', specValue: '148 HP (110 kW)' },
      { specName: 'Peso Operativo', specValue: '21.5 Toneladas' },
      { specName: 'Capacidad de Balde', specValue: '1.0 m³ Reforzado' },
      { specName: 'Profundidad de Excavación', specValue: '6.72 metros' },
      { specName: 'Horómetro Actual', specValue: '1.450 Horas' },
      { specName: 'Ubicación Hub', specValue: 'Bogotá D.C. · Parque Cazucá' }
    ],
    highlights: ['Telemetría satelital activa', 'Seguro todo riesgo incluido', 'Operador certificado opcional', 'Mantenimiento preventivo al día'],
    provider: {
      id: 'prov-001',
      name: 'Caterpillar Equipos SAS',
      rating: 4.9,
      reviewsCount: 142,
      phone: '+57 310 450 9821',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-002',
    name: 'Minicargador sobre Ruedas Bobcat S590',
    categoryId: 'cat-excavacion',
    categoryName: 'Excavación y Movimiento',
    brand: 'Bobcat',
    model: 'S590 Turbo',
    dailyPrice: 380000,
    replacementValue: 180000000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Minicargador compacto de trayectoria de elevación vertical para carga rápida de volquetas y movimiento de agregados en frentes urbanos estrechos.',
    specs: [
      { specName: 'Potencia del Motor', specValue: '68 HP Diésel' },
      { specName: 'Capacidad de Carga (ROC)', specValue: '998 kg' },
      { specName: 'Peso Operativo', specValue: '3.127 kg' },
      { specName: 'Altura de Descarga', specValue: '3.02 metros' },
      { specName: 'Ubicación Hub', specValue: 'Medellín · Itagüí Obrasur' }
    ],
    highlights: ['Cabina climatizada con ROPS/FOPS', 'Balde de 0.45 m³', 'Llantas antipinchazo de servicio pesado'],
    provider: {
      id: 'prov-001',
      name: 'Caterpillar Equipos SAS',
      rating: 4.9,
      reviewsCount: 142,
      phone: '+57 310 450 9821',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-003',
    name: 'Rodillo Compactador Bomag BW 211 D-50',
    categoryId: 'cat-compactacion',
    categoryName: 'Compactación y Pavimento',
    brand: 'Bomag',
    model: 'BW 211 D-50',
    dailyPrice: 620000,
    replacementValue: 260000000,
    status: 'RENTED',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Rodillo monocilíndrico tándem vibratorio para compactación pesada de subbases granulares y mezclas asfálticas en vías primarias y secundarias.',
    specs: [
      { specName: 'Potencia', specValue: '130 HP' },
      { specName: 'Peso Operativo', specValue: '11.0 Toneladas' },
      { specName: 'Ancho de Tambor', specValue: '2.13 metros' },
      { specName: 'Frecuencia de Vibración', specValue: '30 / 36 Hz' },
      { specName: 'Ubicación Hub', specValue: 'Cali · Yumbo Industrial' }
    ],
    highlights: ['Medidor de compactación Terrameter', 'Tracción hidrostática 4x4', 'Freno de parqueo automático'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Andina SAS',
      rating: 4.8,
      reviewsCount: 96,
      phone: '+57 312 876 5432',
      city: 'Cali, Valle'
    }
  },
  {
    id: 'tool-004',
    name: 'Excavadora de Alto Rendimiento Caterpillar 336D2 L',
    categoryId: 'cat-excavacion',
    categoryName: 'Excavación y Movimiento',
    brand: 'Caterpillar',
    model: '336D2 L',
    dailyPrice: 2100000,
    replacementValue: 720000000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Excavadora pesada de 36 toneladas para explotación de canteras y excavación profunda en cortes de montaña. Balde de roca de 2.2 m³.',
    specs: [
      { specName: 'Potencia', specValue: '280 HP' },
      { specName: 'Peso Operativo', specValue: '36.8 Toneladas' },
      { specName: 'Capacidad de Balde', specValue: '2.2 m³' },
      { specName: 'Ubicación Hub', specValue: 'Barranquilla · Zona Portuaria' }
    ],
    highlights: ['Balde para roca abrasiva', 'Sistema hidráulico dual Cat', 'Cabina FOPS Nivel II'],
    provider: {
      id: 'prov-001',
      name: 'Caterpillar Equipos SAS',
      rating: 4.9,
      reviewsCount: 142,
      phone: '+57 310 450 9821',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-005',
    name: 'Plataforma Articulada Diésel 4x4 JLG 800AJ',
    categoryId: 'cat-elevacion',
    categoryName: 'Grúas y Manlifts 4x4',
    brand: 'JLG',
    model: '800AJ Manlift',
    dailyPrice: 890000,
    replacementValue: 340000000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Plataforma articulada todo terreno con tracción 4x4 y altura de trabajo de 26.38 metros para montaje electromecánico y puentes.',
    specs: [
      { specName: 'Altura de Trabajo', specValue: '26.38 metros' },
      { specName: 'Alcance Horizontal', specValue: '15.8 metros' },
      { specName: 'Capacidad en Canastilla', specValue: '230 kg' },
      { specName: 'Tracción', specValue: '4x4 Eje Oscilante' },
      { specName: 'Ubicación Hub', specValue: 'Medellín · Guarne Hub' }
    ],
    highlights: ['Brazo articulado JibPLUS', 'Generador a bordo SkyPower', 'Neumáticos de espuma antipinchazo'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Andina SAS',
      rating: 4.8,
      reviewsCount: 96,
      phone: '+57 312 876 5432',
      city: 'Medellín, Antioquia'
    }
  },
  {
    id: 'tool-006',
    name: 'Planta Eléctrica Cummins 150 kVA Diésel',
    categoryId: 'cat-energia',
    categoryName: 'Generación Eléctrica Diésel',
    brand: 'Cummins',
    model: 'C150D5 Insonorizada',
    dailyPrice: 450000,
    replacementValue: 125000000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Generador diésel cabinado super silencioso de 150 kVA / 120 kW con panel digital PowerCommand para alimentación eléctrica ininterrumpida de campamentos y obra.',
    specs: [
      { specName: 'Potencia Standby', specValue: '150 kVA / 120 kW' },
      { specName: 'Voltaje Salida', specValue: '220V / 440V Trifásico' },
      { specName: 'Consumo al 75%', specValue: '24 L/hora Diésel' },
      { specName: 'Nivel de Ruido', specValue: '68 dBA a 7 metros' },
      { specName: 'Ubicación Hub', specValue: 'Bogotá D.C. · Cota Hub' }
    ],
    highlights: ['Tanque de combustible de 350 L', 'Transferencia automática incluida', 'Protección ambiental antifugas'],
    provider: {
      id: 'prov-001',
      name: 'Caterpillar Equipos SAS',
      rating: 4.9,
      reviewsCount: 142,
      phone: '+57 310 450 9821',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-007',
    name: 'Trituradora de Mandíbula Móvil Terex Finlay J-1170',
    categoryId: 'cat-demolicion',
    categoryName: 'Demolición y Martillos',
    brand: 'Terex Finlay',
    model: 'J-1170',
    dailyPrice: 3200000,
    replacementValue: 1800000000,
    status: 'MAINTENANCE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Planta trituradora primaria sobre orugas para chancado de roca dura y reciclaje de escombros de concreto in situ.',
    specs: [
      { specName: 'Capacidad de Procesamiento', specValue: '280 Ton/Hora' },
      { specName: 'Boca de Entrada', specValue: '1.100 x 700 mm' },
      { specName: 'Motor Diésel', specValue: 'Scania DC9 350 HP' },
      { specName: 'Ubicación Hub', specValue: 'Bucaramanga · Floridablanca' }
    ],
    highlights: ['Separador magnético de metales', 'Banda transportadora plegable', 'Control remoto por radio'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Andina SAS',
      rating: 4.8,
      reviewsCount: 96,
      phone: '+57 312 876 5432',
      city: 'Bucaramanga'
    }
  },
  {
    id: 'tool-008',
    name: 'Placa compactadora 90 kg',
    categoryId: 'cat-compactacion',
    categoryName: 'Compactación',
    brand: 'Wacker Neuson',
    model: 'VP 1550',
    dailyPrice: 150000,
    replacementValue: 5600000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Placa vibratoria unidireccional para compactación de asfalto y suelos mixtos. Excelente avance y maniobrabilidad en espacios reducidos.',
    specs: [
      { specName: 'Fuerza centrífuga', specValue: '15 kN' },
      { specName: 'Ancho de la placa', specValue: '500 mm' },
      { specName: 'Velocidad de trabajo', specValue: '20 m/min' },
      { specName: 'Motor', specValue: 'Honda GX160 5.5 HP' },
      { specName: 'Peso', specValue: '91 kg' },
    ],
    highlights: ['Tanque de agua desmontable', 'Manillar antivibración plegable', 'Ruedas de transporte'],
    provider: {
      id: 'prov-001',
      name: 'Constructoras del Norte S.A.S.',
      rating: 4.8,
      reviewsCount: 124,
      phone: '+57 317 654 3210',
      city: 'Floridablanca, Santander'
    }
  },
  {
    id: 'tool-009',
    name: 'Andamio multidireccional',
    categoryId: 'cat-construccion',
    categoryName: 'Construcción',
    brand: 'Layher',
    model: 'Allround',
    dailyPrice: 28000,
    replacementValue: 1800000,
    status: 'MAINTENANCE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Cuerpo de andamio certificado de alta seguridad para fachadas e interiores. Nudo de disco autoblocante con 8 conexiones por punto.',
    specs: [
      { specName: 'Material', specValue: 'Acero galvanizado' },
      { specName: 'Carga admisible', specValue: '600 kg/m²' },
      { specName: 'Altura por cuerpo', specValue: '2.0 m' },
      { specName: 'Ancho de plataforma', specValue: '0.73 m' },
      { specName: 'Normativa', specValue: 'NTC 1644 / OSHA' },
    ],
    highlights: ['Plataformas antideslizantes', 'Rodapiés de seguridad', 'Diagonales de arriostramiento'],
    provider: {
      id: 'prov-001',
      name: 'Constructoras del Norte S.A.S.',
      rating: 4.8,
      reviewsCount: 124,
      phone: '+57 317 654 3210',
      city: 'Floridablanca, Santander'
    }
  },
  {
    id: 'tool-010',
    name: 'Pulidora angular 7"',
    categoryId: 'cat-electricas',
    categoryName: 'Herramientas eléctricas',
    brand: 'Makita',
    model: 'GA7020',
    dailyPrice: 95000,
    replacementValue: 780000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Esmeriladora angular de 7 pulgadas con motor de alto rendimiento para desbaste pesado y corte en vigas de acero y mampostería.',
    specs: [
      { specName: 'Potencia', specValue: '2.200 W' },
      { specName: 'Diámetro de disco', specValue: '180 mm (7")' },
      { specName: 'Velocidad sin carga', specValue: '8.500 RPM' },
      { specName: 'Eje', specValue: 'M14' },
      { specName: 'Peso', specValue: '5.5 kg' },
    ],
    highlights: ['Guarda de protección sin llave', 'Empuñadura antivibración', 'Arranque suave'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Colombia',
      rating: 4.9,
      reviewsCount: 89,
      phone: '+57 310 888 7766',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-011',
    name: 'Desbrozadora a gasolina Stihl FS 250',
    categoryId: 'cat-jardineria',
    categoryName: 'Jardinería',
    brand: 'Stihl',
    model: 'FS 250',
    dailyPrice: 45000,
    replacementValue: 2400000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Potente guadañadora profesional para desmalezado de terrenos rústicos, mantenimiento de taludes y desmonte de matorrales.',
    specs: [
      { specName: 'Cilindrada', specValue: '40.2 cm³' },
      { specName: 'Potencia', specValue: '2.15 HP' },
      { specName: 'Peso', specValue: '6.3 kg' },
      { specName: 'Capacidad tanque', specValue: '0.64 L' }
    ],
    highlights: ['Arnés profesional doble', 'Cuchilla de 3 puntas y yoyo de nylon', 'Sistema antivibratorio'],
    provider: {
      id: 'prov-001',
      name: 'Constructoras del Norte S.A.S.',
      rating: 4.8,
      reviewsCount: 124,
      phone: '+57 317 654 3210',
      city: 'Floridablanca, Santander'
    }
  },
  {
    id: 'tool-012',
    name: 'Soldador Inverter Miller Maxstar 210',
    categoryId: 'cat-soldadura',
    categoryName: 'Soldadura',
    brand: 'Miller',
    model: 'Maxstar 210',
    dailyPrice: 95000,
    replacementValue: 6800000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Equipo de soldadura TIG y electrodo revestido con tecnología Auto-Line. Arco ultraestable para tuberías, estructuras y acero inoxidable.',
    specs: [
      { specName: 'Corriente de salida', specValue: '5 - 210 A' },
      { specName: 'Voltaje de entrada', specValue: '120 - 480 V' },
      { specName: 'Ciclo de trabajo', specValue: '60% @ 175 A' },
      { specName: 'Peso', specValue: '15.9 kg' }
    ],
    highlights: ['Portaelectrodo y pinza de masa', 'Careta fotosensible incluida', 'Función Hot Start'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Colombia',
      rating: 4.9,
      reviewsCount: 89,
      phone: '+57 310 888 7766',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-013',
    name: 'Hidrolavadora industrial Kärcher HD 6/15',
    categoryId: 'cat-limpieza',
    categoryName: 'Limpieza',
    brand: 'Kärcher',
    model: 'HD 6/15-4 Classic',
    dailyPrice: 65000,
    replacementValue: 3900000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Lavadora a presión de agua fría con bomba de cigüeñal y pistones cerámicos. Especial para limpieza de fachadas, maquinaria y obras.',
    specs: [
      { specName: 'Presión de trabajo', specValue: '150 bar / 2.175 PSI' },
      { specName: 'Caudal de agua', specValue: '600 L/h' },
      { specName: 'Potencia conectada', specValue: '3.4 kW' },
      { specName: 'Peso', specValue: '52 kg' }
    ],
    highlights: ['Manguera de alta presión 10m', 'Lanza de acero inoxidable 850mm', 'Boquilla de alto impacto'],
    provider: {
      id: 'prov-001',
      name: 'Constructoras del Norte S.A.S.',
      rating: 4.8,
      reviewsCount: 124,
      phone: '+57 317 654 3210',
      city: 'Floridablanca, Santander'
    }
  },
  {
    id: 'tool-014',
    name: 'Compresor de aire DeWalt 15 Galones',
    categoryId: 'cat-otros',
    categoryName: 'Otros',
    brand: 'DeWalt',
    model: 'DXCM271.COM',
    dailyPrice: 55000,
    replacementValue: 2800000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Compresor vertical de 200 PSI máx con motor de inducción libre de aceite. Ideal para clavadoras neumáticas, pintura y soplado.',
    specs: [
      { specName: 'Capacidad de tanque', specValue: '57 L (15 Gal)' },
      { specName: 'Presión máx.', specValue: '200 PSI' },
      { specName: 'Flujo de aire', specValue: '5.1 SCFM @ 90 PSI' },
      { specName: 'Nivel de ruido', specValue: '78 dBA' }
    ],
    highlights: ['Ruedas neumáticas de 10"', 'Regulador de alta precisión', 'Doble acople rápido'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Colombia',
      rating: 4.9,
      reviewsCount: 89,
      phone: '+57 310 888 7766',
      city: 'Bogotá D.C.'
    }
  },
  {
    id: 'tool-015',
    name: 'Rotomartillo demoledor SDS-Max 1500W',
    categoryId: 'cat-demolicion',
    categoryName: 'Demolición',
    brand: 'Bosch',
    model: 'GBH 8-45 D',
    dailyPrice: 85000,
    replacementValue: 4600000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Combinado robusto para perforaciones profundas en hormigón armado y demolición media con embrague de seguridad.',
    specs: [
      { specName: 'Potencia', specValue: '1.500 W' },
      { specName: 'Energía de impacto', specValue: '12.5 J' },
      { specName: 'Diámetro de perforación', specValue: '12 - 45 mm' }
    ],
    highlights: ['Bloqueo automático de gatillo', 'Maletín de transporte', 'Puntero y cincel SDS-Max'],
    provider: {
      id: 'prov-001',
      name: 'Constructoras del Norte S.A.S.',
      rating: 4.8,
      reviewsCount: 124,
      phone: '+57 317 654 3210',
      city: 'Floridablanca, Santander'
    }
  },
  {
    id: 'tool-016',
    name: 'Torre de iluminación móvil 4x1000W',
    categoryId: 'cat-generadores',
    categoryName: 'Generadores',
    brand: 'Generac Mobile',
    model: 'VT1 Light Tower',
    dailyPrice: 180000,
    replacementValue: 28000000,
    status: 'AVAILABLE',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80', isPrimary: true }
    ],
    description: 'Torre telescópica con mástil vertical de 8.5 m y 4 reflectores de halogenuros metálicos de 1.000 W cada uno. Motor diésel con generador integrado.',
    specs: [
      { specName: 'Potencia luminosa', specValue: '360.000 lúmenes' },
      { specName: 'Mástil telescópico', specValue: '8.5 m rotación 340°' },
      { specName: 'Autonomía de combustible', specValue: '60 horas continuas' }
    ],
    highlights: ['Remolque vial con luces y tiro', 'Estabilizadores mecánicos', 'Arranque eléctrico'],
    provider: {
      id: 'prov-002',
      name: 'Equipos & Maquinaria Colombia',
      rating: 4.9,
      reviewsCount: 89,
      phone: '+57 310 888 7766',
      city: 'Bogotá D.C.'
    }
  }
];

export const curatedCatalogImageUrls = [
  'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1652303518314-e1196ef221f6?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1000&auto=format&fit=crop&q=80',
];

export const mockRequests = [];

export const mockAdminUsers = [
  { id: 'usr-01', name: 'Juan Pérez García', email: 'juan.perez@ejemplo.com', role: 'Cliente', date: '13 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 'usr-02', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@ejemplo.com', role: 'Proveedor', date: '11 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 'usr-03', name: 'Laura Gómez', email: 'laura.gomez@ejemplo.com', role: 'Cliente', date: '09 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: 'usr-04', name: 'Diego Torres', email: 'diego.torres@ejemplo.com', role: 'Proveedor', date: '07 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  { id: 'usr-05', name: 'Ana Martínez', email: 'ana.martinez@ejemplo.com', role: 'Cliente', date: '05 oct 2026', active: false, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
  { id: 'usr-06', name: 'Admin General ToolRent', email: 'admin@toolrent.co', role: 'Administrador', date: '01 oct 2026', active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
];

export const mockAdminKpis = {
  totalIncome: 12450000,
  activeRentals: 18,
  totalUsers: 42,
  availableTools: 56,
  totalTools: 78,
  topTools: [
    { name: 'Excavadora hidráulica', count: 24, percent: 80 },
    { name: 'Taladro percutor', count: 18, percent: 60 },
    { name: 'Compresor de aire', count: 15, percent: 50 },
    { name: 'Martillo demoledor', count: 12, percent: 40 },
    { name: 'Andamio multidireccional', count: 10, percent: 33 },
  ],
  topClients: [
    { name: 'Constructora del Norte S.A.S.', count: 12 },
    { name: 'Juan Carlos Ramírez', count: 9 },
    { name: 'Obras y Diseños S.A.S', count: 7 },
    { name: 'Alianza Constructores', count: 6 },
    { name: 'Proyectos del Valle', count: 5 },
  ]
};
