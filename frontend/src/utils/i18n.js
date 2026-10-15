// Language state helper for Opus Rentals
const LANG_STORAGE_KEY = 'opus_lang';

export const i18n = {
  currentLang: localStorage.getItem(LANG_STORAGE_KEY) || 'ES',

  getLang() {
    return this.currentLang;
  },

  setLang(lang) {
    this.currentLang = lang === 'EN' ? 'EN' : 'ES';
    localStorage.setItem(LANG_STORAGE_KEY, this.currentLang);
    window.dispatchEvent(new CustomEvent('lang:change', { detail: { lang: this.currentLang } }));
  },

  toggleLang() {
    this.setLang(this.currentLang === 'ES' ? 'EN' : 'ES');
  },

  t(key) {
    const dict = translations[this.currentLang] || translations.ES;
    return dict[key] || translations.ES[key] || key;
  }
};

export const translations = {
  ES: {
    navCatalog: 'Catálogo de Flota',
    navClient: 'Mis Contratos',
    navProvider: 'Portal Proveedores',
    navAdmin: 'Supervisión Admin',
    navSearchPlaceholder: 'Excavadoras, Bobcat, Cummins...',
    navHub: 'Hub Colombia',
    navLogin: 'Iniciar sesión',
    navLogout: 'Cerrar Sesión',
    heroBadge: 'Flota Certificada · B2B Colombia',
    heroTitle1: 'Alquila la maquinaria pesada que necesitas.',
    heroTitle2: 'Sin comprarla. Para grandes obras en Colombia.',
    heroSubtitle: 'Excavadoras, rodillos, minicargadores y plantas eléctricas con póliza todo riesgo SURA, mantenimiento preventivo al día y acta de entrega digital.',
    heroSearchPlaceholder: 'Buscar excavadora, rodillo, Bobcat, generador...',
    btnHeroSearch: 'Buscar',
    filterStatusLabel: 'Estado:',
    filterAll: 'Todos',
    filterAvailable: 'Disponible',
    filterRented: 'Alquilada',
    filterMaintenance: 'En mantenimiento',
    searchInCatalogPlaceholder: 'Buscar por marca o modelo...',
    sortRelevant: 'Más relevantes',
    sortPriceAsc: 'Menor precio',
    sortPriceDesc: 'Mayor precio',
    unitsFound: 'unidades disponibles',
    unitFound: 'unidad encontrada',
    btnResetFilters: 'Restablecer filtros',
    emptyTitle: 'No encontramos maquinaria con esos criterios',
    emptySubtitle: 'Intenta cambiar la categoría o limpiar el texto de búsqueda.',
    btnEmptyReset: 'Restablecer Filtros',
    cardDailyRate: 'Tarifa diaria',
    cardRent: 'Alquilar',
    cardDetails: 'Ver detalles',
    quoteSuccessTitle: 'Cotización Iniciada',
    quoteSuccessMsg: 'Maquinaria agregada al contrato con éxito',
    quoteLoginWarning: 'Debes iniciar sesión para realizar una cotización o alquiler',
    btnRent: 'Cotizar y Reservar',
    btnDetails: 'Ver ficha técnica',
    modalTitle: 'Reserva de Maquinaria y Equipos',
    modalSubtitle: 'Contratación directa con verificación telemática en obra',
    rentalPeriod: 'Período de Alquiler',
    startDate: 'Fecha de entrega en obra',
    endDate: 'Fecha de retorno prevista',
    dailyRate: 'Tarifa diaria contratada',
    warrantyDeposit: 'Depósito en garantía (Reembolsable)',
    subtotal: 'Subtotal flete y uso',
    vat: 'IVA DIAN (19%)',
    totalEstimated: 'Total estimado liquidación',
    btnConfirmBooking: 'Confirmar y Despachar a Obra',
    adminTitle: 'Consola Central de Operaciones',
    adminSubtitle: 'Auditoría telemática, ingresos brutos y control legal de contratos',
    providerTitle: 'Panel de Flota del Proveedor',
    providerSubtitle: 'Supervisión de horómetros, despachos y estado de maquinaria',
    clientTitle: 'Portal de Contratistas & Clientes',
    clientSubtitle: 'Trazabilidad de equipos en obra, facturación y actas de entrega'
  },
  EN: {
    navCatalog: 'Fleet Catalog',
    navClient: 'My Contracts',
    navProvider: 'Provider Portal',
    navAdmin: 'Admin Console',
    navSearchPlaceholder: 'Excavators, Bobcat, Cummins...',
    navHub: 'Colombia Hub',
    navLogin: 'Sign In',
    navLogout: 'Sign Out',
    heroBadge: 'Certified Fleet in Colombia',
    heroTitle1: 'Heavy Machinery & Equipment Rental.',
    heroTitle2: 'Zero friction. Enterprise grade.',
    heroSubtitle: 'Excavators, compactors, telehandlers and generators with guaranteed maintenance, insurance and verified telematics.',
    heroSearchPlaceholder: 'Search CAT 320, Bobcat, 150 kVA...',
    btnHeroSearch: 'Search',
    filterStatusLabel: 'Status:',
    filterAll: 'All',
    filterAvailable: 'Available',
    filterRented: 'Rented',
    filterMaintenance: 'In Maintenance',
    searchInCatalogPlaceholder: 'Search brand or model...',
    sortRelevant: 'Most relevant',
    sortPriceAsc: 'Lowest price',
    sortPriceDesc: 'Highest price',
    unitsFound: 'units available',
    unitFound: 'unit found',
    btnResetFilters: 'Reset filters',
    emptyTitle: 'No equipment matches your search criteria',
    emptySubtitle: 'Try changing category or clearing search query.',
    btnEmptyReset: 'Reset Filters',
    cardDailyRate: 'Daily rate',
    cardRent: 'Rent Now',
    cardDetails: 'View Details',
    quoteSuccessTitle: 'Quote Initiated',
    quoteSuccessMsg: 'Equipment added to draft lease successfully',
    quoteLoginWarning: 'You must sign in to start a quotation or rental',
    btnRent: 'Quote & Book',
    btnDetails: 'View Specifications',
    modalTitle: 'Equipment Rental Booking',
    modalSubtitle: 'Direct enterprise lease with job-site telematics audit',
    rentalPeriod: 'Rental Period',
    startDate: 'Job Site Delivery Date',
    endDate: 'Expected Return Date',
    dailyRate: 'Agreed Daily Rate',
    warrantyDeposit: 'Security Deposit (Refundable)',
    subtotal: 'Equipment & Usage Subtotal',
    vat: 'DIAN VAT (19%)',
    totalEstimated: 'Estimated Settlement Total',
    btnConfirmBooking: 'Confirm & Dispatch to Site',
    adminTitle: 'Central Operations Console',
    adminSubtitle: 'Telematics audit, gross revenue and legal contract oversight',
    providerTitle: 'Provider Fleet Dashboard',
    providerSubtitle: 'Hour meter monitoring, dispatches and machine status',
    clientTitle: 'Contractor & Client Portal',
    clientSubtitle: 'Job site equipment tracking, invoices and handover logs'
  }
};
