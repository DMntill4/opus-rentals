import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationsContext = createContext();

export const translations = {
  es: {
    brandSubtitle: 'Maquinaria & Equipos',
    navHome: 'Inicio',
    navCatalog: 'Catálogo',
    navMyRentals: 'Mis Alquileres',
    navProviderPanel: 'Panel Proveedor',
    navAdmin: 'Administración',
    navCart: 'Mi Reserva',
    loginBtn: 'Iniciar Sesión',
    registerBtn: 'Crear Cuenta',
    logoutBtn: 'Cerrar Sesión',
    heroTag: 'Red Nacional de Renta de Maquinaria',
    heroTitle: 'Encuentra y alquila la maquinaria exacta para tu obra civil',
    heroSubtitle: 'Sin intermediarios manuales. Disponibilidad en tiempo real, protección de depósito 4FN y facturación digital en Colombia.',
    searchPlaceholder: '¿Qué herramienta o máquina buscas? (Ej. Excavadora, Generador...)',
    searchCityAll: 'Todas las ciudades (Colombia)',
    searchBtn: 'Buscar Equipos',
    featuredCategories: 'Categorías Destacadas',
    featuredInventory: 'Inventario Disponible Hoy',
    dailyRate: 'Tarifa diaria',
    depositLabel: 'Depósito reembolsable',
    rentNow: 'Alquilar',
    viewDetails: 'Ficha Técnica',
    availablePill: 'Disponible',
    rentedPill: 'Alquilada',
    maintPill: 'Mantenimiento',
    cartEmpty: 'No has agregado herramientas a tu reserva.',
    addToCart: 'Agregar a mi reserva',
    reserveNow: 'Proceder a Reserva y Pago',
    checkoutTitle: 'Reserva y Pago de Maquinaria',
    step1: '1. Reserva',
    step2: '2. Pago',
    step3: '3. Confirmación',
    subtotal: 'Subtotal neto',
    tax19: 'IVA (19%)',
    totalCop: 'Total liquidado (COP)',
    payButton: 'Pagar con Pasarela Segura',
    paymentSuccess: '¡Reserva confirmada con éxito!',
    viewInvoice: 'Ver Factura Legal',
    downloadPdf: 'Descargar PDF',
    printInvoice: 'Imprimir',
    invoiceTitle: 'FACTURA ELECTRÓNICA DE ALQUILER',
    clientData: 'Datos del Cliente',
    providerData: 'Datos del Proveedor',
    specsTitle: 'Especificaciones Técnicas',
    systemStatesGallery: 'Galería de Estados del Sistema',
  },
  en: {
    brandSubtitle: 'Machinery & Equipment',
    navHome: 'Home',
    navCatalog: 'Catalog',
    navMyRentals: 'My Rentals',
    navProviderPanel: 'Supplier Portal',
    navAdmin: 'Admin Console',
    navCart: 'My Booking',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    logoutBtn: 'Sign Out',
    heroTag: 'National Heavy Machinery Rental Network',
    heroTitle: 'Find and rent heavy equipment for your construction projects',
    heroSubtitle: 'No manual friction. Real-time availability checks, 4FN damage deposits, and automated legal invoices in Colombia.',
    searchPlaceholder: 'Search equipment (e.g. Excavator, Power Generator...)',
    searchCityAll: 'All cities (Colombia)',
    searchBtn: 'Search Fleet',
    featuredCategories: 'Featured Categories',
    featuredInventory: 'Available Fleet Today',
    dailyRate: 'Daily rate',
    depositLabel: 'Refundable deposit',
    rentNow: 'Rent Now',
    viewDetails: 'Technical Specs',
    availablePill: 'Available',
    rentedPill: 'Rented',
    maintPill: 'Maintenance',
    cartEmpty: 'No equipment added to your booking yet.',
    addToCart: 'Add to my booking',
    reserveNow: 'Proceed to Checkout',
    checkoutTitle: 'Machinery Booking & Checkout',
    step1: '1. Booking',
    step2: '2. Payment',
    step3: '3. Confirmation',
    subtotal: 'Net subtotal',
    tax19: 'VAT / IVA (19%)',
    totalCop: 'Total Amount (COP)',
    payButton: 'Pay with Secure Gateway',
    paymentSuccess: 'Booking confirmed successfully!',
    viewInvoice: 'View Legal Invoice',
    downloadPdf: 'Download PDF',
    printInvoice: 'Print',
    invoiceTitle: 'ELECTRONIC RENTAL INVOICE',
    clientData: 'Client Information',
    providerData: 'Supplier Information',
    specsTitle: 'Technical Specifications',
    systemStatesGallery: 'System States Gallery',
  }
};

export const formatMoneyCOP = (amount) => {
  const num = Math.round(Number(amount) || 0);
  return '$ ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatDateCO = (dateStr) => {
  if (!dateStr) return '13 oct 2026';
  try {
    const d = new Date(dateStr);
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};
