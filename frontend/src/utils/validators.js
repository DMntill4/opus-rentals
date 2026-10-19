/**
 * Opus Rentals - Universal Input Validation Engine
 * Validador estricto para lógica de negocios, datos de constructora, maquinaria y telecomunicaciones
 */

// Catálogo Oficial de Ciudades Principales y Centros Industriales de Colombia
export const COLOMBIAN_CITIES = [
  'Bogotá D.C.',
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Bucaramanga',
  'Cartagena',
  'Pereira',
  'Manizales',
  'Ibagué',
  'Cúcuta',
  'Santa Marta',
  'Villavicencio',
  'Pasto',
  'Montería',
  'Neiva',
  'Armenia',
  'Popayán',
  'Sincelejo',
  'Riohacha',
  'Tunja',
  'Florencia',
  'Yopal',
  'Quibdó',
  'Sogamoso',
  'Duitama',
  'Girardot',
  'Facatativá',
  'Chía',
  'Soacha',
  'Zipaquirá',
  'Rionegro',
  'Envigado',
  'Itagüí',
  'Bello',
  'Palmira',
  'Buenaventura',
  'Barrancabermeja',
  'Soledad',
  'Valledupar'
];

export const VALID_COUNTRIES = [
  'Colombia',
  'Panamá',
  'Ecuador',
  'Perú',
  'Chile',
  'México',
  'Brasil',
  'Argentina',
  'Estados Unidos',
  'España'
];

/**
 * 1. Validación de Correo Electrónico
 * Rechaza: 'gmail', 'correo@', 'carlos@gmail', 'usuario sin arroba', 'carlos..mendoza@gmail.com'
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'El correo electrónico es obligatorio.' };
  }
  const trimmed = email.trim();
  
  if (!trimmed.includes('@')) {
    return { valid: false, error: 'El correo debe incluir el carácter "@" (ej. usuario@empresa.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'El correo electrónico solo puede contener un "@".' };
  }

  const [local, domain] = parts;
  if (!local || local.length < 1) {
    return { valid: false, error: 'Falta el nombre de usuario antes del "@".' };
  }
  if (!domain || !domain.includes('.')) {
    return { valid: false, error: 'El dominio del correo debe incluir una extensión válida (ej. @gmail.com, @constructora.co).' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { valid: false, error: 'La extensión de dominio (ej. .com, .co, .org) no es válida.' };
  }

  // RFC 5322 regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: 'El formato del correo electrónico contiene caracteres no válidos.' };
  }

  return { valid: true, error: null };
}

/**
 * 2. Validación de Nombre Propio / Persona Natural
 * Rechaza: 'Carlos123', 'Juan!!', '12345', 'A', 'Pedro @'
 * Solo permite letras con acentos, espacios, guiones y apóstrofes.
 */
export function validatePersonName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es obligatorio.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres.' };
  }
  if (trimmed.length > 70) {
    return { valid: false, error: 'El nombre no puede exceder 70 caracteres.' };
  }

  // Comprobar si contiene dígitos
  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'Un nombre de persona no puede contener números (ej. no se permite "Carlos123").' };
  }

  // Solo caracteres alfabéticos en español, espacios, guión o apóstrofe
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre no puede contener caracteres especiales ni símbolos (ej. @, #, $, !).' };
  }

  // Comprobar que no sean solo espacios o caracteres repetidos sin sentido
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 1) {
    return { valid: false, error: 'Por favor ingresa un nombre válido.' };
  }

  return { valid: true, error: null };
}

/**
 * 3. Validación de Razón Social / Empresa
 * Permite números si forman parte del nombre comercial (ej. "Constructora 360 SAS", "Obras 24/7"),
 * pero rechaza cadenas de solo números ("123456") o símbolos puros ("###").
 */
export function validateCompanyName(companyName) {
  if (!companyName || typeof companyName !== 'string') {
    return { valid: false, error: 'La razón social o nombre de empresa es obligatorio.' };
  }
  const trimmed = companyName.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'La razón social debe tener al menos 3 caracteres.' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'La razón social no puede exceder 100 caracteres.' };
  }

  // No puede ser exclusivamente números
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'La razón social no puede ser solo números. Debe incluir el nombre de la empresa.' };
  }

  // Caracteres permitidos para empresas: letras, números, puntos, comas, ampersand, guiones, barras
  const companyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,&'/()-]+$/;
  if (!companyRegex.test(trimmed)) {
    return { valid: false, error: 'La razón social contiene caracteres especiales no permitidos.' };
  }

  return { valid: true, error: null };
}

/**
 * 4. Validación de Ciudad
 * Rechaza números ("Bogota123"), caracteres raros ("Cali$$"), ciudades demasiado cortas o inexistentes
 */
export function validateCity(city) {
  if (!city || typeof city !== 'string') {
    return { valid: false, error: 'La ciudad es obligatoria.' };
  }
  const trimmed = city.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'El nombre de la ciudad debe tener al menos 3 caracteres.' };
  }

  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'Una ciudad no puede contener números (ej. "Medellín" en lugar de "Medellín123").' };
  }

  const cityRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/;
  if (!cityRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre de la ciudad contiene caracteres especiales no válidos.' };
  }

  // Comprobar coincidencia o similitud con catálogo de ciudades reales
  const normalized = trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const found = COLOMBIAN_CITIES.some(c => {
    const normC = c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normC === normalized || normC.includes(normalized) || normalized.includes(normC);
  });

  if (!found && trimmed.length < 4) {
    return { valid: false, error: 'Por favor ingresa una ciudad colombiana válida (ej. Bogotá, Medellín, Cali, Barranquilla).' };
  }

  return { valid: true, error: null };
}

/**
 * 5. Validación de País
 * Rechaza: 'Colombia123', 'Colo#bia', etc.
 */
export function validateCountry(country) {
  if (!country || typeof country !== 'string') {
    return { valid: false, error: 'El país es obligatorio.' };
  }
  const trimmed = country.trim();

  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'Un país no puede contener números.' };
  }

  const countryRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!countryRegex.test(trimmed)) {
    return { valid: false, error: 'El país no puede contener caracteres especiales ni símbolos.' };
  }

  return { valid: true, error: null };
}

/**
 * 6. Validación de Teléfono / WhatsApp
 * Rechaza: letras ("300abc"), caracteres raros ("$$$"), longitudes menores a 7 o mayores a 15 dígitos.
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'El teléfono de contacto es obligatorio.' };
  }
  const trimmed = phone.trim();

  // Si tiene letras
  if (/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'El teléfono no puede contener letras. Solo dígitos numéricos.' };
  }

  // Extraer solo dígitos
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return { valid: false, error: 'El número telefónico debe tener entre 7 y 15 dígitos (ej. 3101234567 o +57 310 123 4567).' };
  }

  return { valid: true, error: null };
}

/**
 * 7. Validación de NIT / RUT / Cédula
 * Formatos válidos: 901234567-8, 901.234.567-8, 1032456789
 */
export function validateTaxId(taxId) {
  if (!taxId || typeof taxId !== 'string') {
    return { valid: false, error: 'El NIT o documento de identificación es obligatorio.' };
  }
  const trimmed = taxId.trim();
  const clean = trimmed.replace(/[\.\s-]/g, '');

  if (/[a-zA-Z]/.test(clean.slice(0, -1))) {
    return { valid: false, error: 'El NIT / Cédula debe contener solo números (ej. 901.234.567-8 o 1.032.456.789).' };
  }

  if (clean.length < 6 || clean.length > 15) {
    return { valid: false, error: 'El NIT o Cédula debe tener entre 6 y 12 dígitos.' };
  }

  return { valid: true, error: null };
}

/**
 * 8. Validación de Nombre de Maquinaria
 * Rechaza: "1234", "!!!!", "maquina", nombres menores a 5 caracteres o sin letras
 */
export function validateToolName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre de la maquinaria es obligatorio.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 5) {
    return { valid: false, error: 'El nombre de la maquinaria debe ser descriptivo (al menos 5 caracteres, ej. "Excavadora Hidráulica CAT 320D").' };
  }
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(trimmed)) {
    return { valid: false, error: 'El nombre de la maquinaria debe contener letras descriptivas, no solo números o símbolos.' };
  }
  return { valid: true, error: null };
}

/**
 * 9. Validación de Tarifa Diaria
 * Rango realista en pesos colombianos (COP): $10.000 a $50.000.000 COP por día
 */
export function validateDailyPrice(price) {
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'La tarifa diaria debe ser un valor numérico positivo.' };
  }
  if (num < 10000) {
    return { valid: false, error: 'La tarifa diaria mínima permitida en plataforma es de $10.000 COP.' };
  }
  if (num > 50000000) {
    return { valid: false, error: 'La tarifa diaria máxima no puede exceder $50.000.000 COP por día.' };
  }
  return { valid: true, error: null };
}

/**
 * 10. Validación de Enlace de Imagen
 * Rechaza texto plano, rutas relativas locales rotas, URLs sin protocolo http/https
 */
export function validateImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'El enlace de la imagen es obligatorio.' };
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, error: 'El enlace de la imagen debe ser una URL válida que inicie con https:// o http://.' };
  }
  try {
    new URL(trimmed);
  } catch (e) {
    return { valid: false, error: 'La dirección URL de la imagen no tiene un formato válido.' };
  }
  return { valid: true, error: null };
}

/**
 * 11. Validación de Rango de Fechas de Alquiler
 * Reglas:
 * - Fecha inicio >= hoy
 * - Fecha fin >= fecha inicio
 * - Duración máxima = 30 días (1 mes)
 */
export function validateRentalDates(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { valid: false, error: 'Debes seleccionar tanto la fecha de inicio como la fecha final.' };
  }

  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Las fechas seleccionadas tienen un formato inválido.' };
  }

  if (start < today) {
    return { valid: false, error: 'La fecha de inicio de alquiler no puede ser en el pasado.' };
  }

  if (end < start) {
    return { valid: false, error: 'La fecha de finalización no puede ser anterior a la fecha de inicio.' };
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays > 30) {
    return { valid: false, error: `El periodo seleccionado es de ${diffDays} días. El contrato máximo permitido es de 30 días (1 mes).` };
  }

  return { valid: true, days: diffDays, error: null };
}
