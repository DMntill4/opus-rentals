-- =============================================================================
-- OPUS RENTALS - SEED DATA (02_data.sql)
-- Complete seed data with 20+ records per entity
-- Default user password for all users: "password123"
-- BCrypt Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- =============================================================================

USE `opus_rentals_db`;

-- -----------------------------------------------------------------------------
-- 1. ROLES (20 records)
-- -----------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'ROLE_ADMIN', 'Platform System Administrator with full operational privileges'),
(2, 'ROLE_PROVIDER', 'Equipment Provider who manages inventory and approves rentals'),
(3, 'ROLE_CLIENT', 'Registered Client who rents machinery and performs online payments'),
(4, 'ROLE_AUDITOR', 'Financial and operational auditor'),
(5, 'ROLE_SUPPORT', 'Customer support specialist'),
(6, 'ROLE_LOGISTICS', 'Logistics coordinator for machinery transport'),
(7, 'ROLE_INSPECTOR', 'Field inspector certifying returned equipment conditions'),
(8, 'ROLE_FINANCE', 'Finance officer reviewing billing and tax deductions'),
(9, 'ROLE_COMPLIANCE', 'Legal compliance and safety standards officer'),
(10, 'ROLE_MAINTENANCE', 'Fleet maintenance supervisor'),
(11, 'ROLE_DISPATCHER', 'Depot tool dispatch coordinator'),
(12, 'ROLE_REGIONAL_MGR', 'Regional operations manager'),
(13, 'ROLE_WAREHOUSE_LEAD', 'Lead warehouse inventory manager'),
(14, 'ROLE_CLAIMS_AGENT', 'Insurance and damages claims handler'),
(15, 'ROLE_SAFETY_OFFICER', 'Occupational safety and health certifier'),
(16, 'ROLE_FLEET_COORDINATOR', 'Heavy equipment fleet dispatcher'),
(17, 'ROLE_BILLING_CLERK', 'Invoicing assistant'),
(18, 'ROLE_SALES_AGENT', 'Enterprise sales specialist'),
(19, 'ROLE_TECHNICIAN', 'Field mechanic and electrical diagnostic technician'),
(20, 'ROLE_SUPERVISOR', 'General operations supervisor');

-- -----------------------------------------------------------------------------
-- 2. USERS (25 records)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `is_active`) VALUES
(1, 'admin@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, TRUE),
(2, 'provider.caterpillar@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(3, 'provider.komatsu@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(4, 'provider.bosch@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(5, 'provider.hilti@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(6, 'provider.makita@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(7, 'provider.dewalt@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(8, 'provider.wacker@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(9, 'provider.jcb@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(10, 'provider.bobcat@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(11, 'provider.genie@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(12, 'provider.atlas@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(13, 'provider.sany@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(14, 'provider.volvo@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(15, 'provider.liebherr@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(16, 'provider.husqvarna@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(17, 'provider.kubota@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(18, 'provider.stihl@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(19, 'provider.miller@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(20, 'provider.lincoln@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(21, 'provider.terex@opusrentals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, TRUE),
(22, 'client.carlos@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(23, 'client.maria@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(24, 'client.juan@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(25, 'client.ana@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE);

-- Insert 16 more client users to have 20 clients
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `is_active`) VALUES
(26, 'client.andres@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(27, 'client.laura@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(28, 'client.diego@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(29, 'client.sofia@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(30, 'client.felipe@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(31, 'client.valeria@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(32, 'client.esteban@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(33, 'client.camila@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(34, 'client.mateo@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(35, 'client.natalia@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(36, 'client.sebastian@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(37, 'client.daniela@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(38, 'client.gabriel@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(39, 'client.isabella@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(40, 'client.alejandro@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE),
(41, 'client.paula@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, TRUE);

-- -----------------------------------------------------------------------------
-- 3. PROVIDERS (20 records)
-- -----------------------------------------------------------------------------
INSERT INTO `providers` (`id`, `user_id`, `company_name`, `tax_id`, `address`, `rating`) VALUES
(1, 2, 'Caterpillar Equipos SAS', 'NIT-900123456-1', 'Zona Industrial Calle 13 #68-20, Bogota', 4.95),
(2, 3, 'Komatsu Maquinaria Andina', 'NIT-900234567-2', 'Av. Las Americas #45-12, Medellin', 4.88),
(3, 4, 'Bosch Herramientas Pro', 'NIT-900345678-3', 'Cra. 50 #72-30, Barranquilla', 4.92),
(4, 5, 'Hilti Soluciones de Anclaje', 'NIT-900456789-4', 'Calle 100 #19-45, Bogota', 4.97),
(5, 6, 'Makita Alquiler Industrial', 'NIT-900567890-5', 'Av. 6N #22-10, Cali', 4.75),
(6, 7, 'DeWalt Maquinaria Pesada', 'NIT-900678901-6', 'Cra. 33 #48-25, Bucaramanga', 4.81),
(7, 8, 'Wacker Neuson Compactacion', 'NIT-900789012-7', 'Calle 26 #85D-55, Bogota', 4.89),
(8, 9, 'JCB Equipos Viales', 'NIT-900890123-8', 'Autopista Sur Km 7, Itagui', 4.78),
(9, 10, 'Bobcat Maquinaria Compacta', 'NIT-900901234-9', 'Av. Circunvalar #15-30, Pereira', 4.84),
(10, 11, 'Genie Plataformas de Elevacion', 'NIT-901012345-0', 'Parque Industrial Cota Km 3', 4.91),
(11, 12, 'Atlas Copco Compresores', 'NIT-901123456-1', 'Zona Franca Fontibon, Bogota', 4.93),
(12, 13, 'Sany Gruas y Excavadoras', 'NIT-901234567-2', 'Av. El Dorado #103-15, Bogota', 4.70),
(13, 14, 'Volvo Maquinaria de Construccion', 'NIT-901345678-3', 'Via 40 #85-10, Barranquilla', 4.86),
(14, 15, 'Liebherr Ingenieria Pesada', 'NIT-901456789-4', 'Transversal 93 #51-80, Bogota', 4.98),
(15, 16, 'Husqvarna Equipos de Corte', 'NIT-901567890-5', 'Cra. 15 #124-10, Bogota', 4.79),
(16, 17, 'Kubota Mini-excavadoras', 'NIT-901678901-6', 'Cra. 42 #54-18, Itagui', 4.82),
(17, 18, 'Stihl Motores de Construccion', 'NIT-901789012-7', 'Av. Boyaca #64C-12, Bogota', 4.77),
(18, 19, 'Miller Soldaduras y Generadores', 'NIT-901890123-8', 'Zona Industrial Acopi, Yumbo', 4.85),
(19, 20, 'Lincoln Electric Rental', 'NIT-901901234-9', 'Cra. 65 #34-20, Medellin', 4.83),
(20, 21, 'Terex Maquinaria de Demolicion', 'NIT-902012345-0', 'Calle 80 Km 5, Siberia', 4.76);

-- -----------------------------------------------------------------------------
-- 4. CLIENTS (20 records)
-- -----------------------------------------------------------------------------
INSERT INTO `clients` (`id`, `user_id`, `first_name`, `last_name`, `document_type`, `document_number`, `phone`, `address`) VALUES
(1, 22, 'Carlos', 'Gomez', 'CC', '1018273645', '+57 3102345678', 'Cra. 15 #85-30, Bogota'),
(2, 23, 'Maria', 'Rodriguez', 'CC', '1029384756', '+57 3113456789', 'Calle 50 #40-12, Medellin'),
(3, 24, 'Juan', 'Perez', 'CC', '1038475629', '+57 3124567890', 'Av. 4N #18-25, Cali'),
(4, 25, 'Ana', 'Martinez', 'CC', '1047586920', '+57 3135678901', 'Cra. 53 #80-45, Barranquilla'),
(5, 26, 'Andres', 'Castillo', 'CC', '1056473829', '+57 3146789012', 'Calle 36 #28-10, Bucaramanga'),
(6, 27, 'Laura', 'Torres', 'CC', '1065748392', '+57 3157890123', 'Av. Santander #55-12, Manizales'),
(7, 28, 'Diego', 'Morales', 'CC', '1074859601', '+57 3168901234', 'Cra. 7 #12-45, Pereira'),
(8, 29, 'Sofia', 'Sanchez', 'CC', '1083920174', '+57 3179012345', 'Calle 60 #10-30, Ibague'),
(9, 30, 'Felipe', 'Vargas', 'CC', '1092837465', '+57 3180123456', 'Cra. 27 #34-18, Pasto'),
(10, 31, 'Valeria', 'Rios', 'CC', '1101928374', '+57 3191234567', 'Av. Bolivar #14-20, Armenia'),
(11, 32, 'Esteban', 'Gutierrez', 'CC', '1110839274', '+57 3109876543', 'Calle 10 #43E-15, Medellin'),
(12, 33, 'Camila', 'Silva', 'CC', '1129748362', '+57 3118765432', 'Cra. 13 #72-10, Bogota'),
(13, 34, 'Mateo', 'Diaz', 'CC', '1138659473', '+57 3127654321', 'Calle 77B #57-141, Barranquilla'),
(14, 35, 'Natalia', 'Ortiz', 'CC', '1147568392', '+57 3136543210', 'Av. Roosevelt #38-25, Cali'),
(15, 36, 'Sebastian', 'Mendoza', 'CC', '1156473820', '+57 3145432109', 'Cra. 19 #35-12, Bucaramanga'),
(16, 37, 'Daniela', 'Herrera', 'CC', '1165384910', '+57 3154321098', 'Calle 22 #18-40, Santa Marta'),
(17, 38, 'Gabriel', 'Castro', 'CC', '1174295830', '+57 3163210987', 'Cra. 2 #11-50, Cartagena'),
(18, 39, 'Isabella', 'Navarro', 'CC', '1183106740', '+57 3172109876', 'Av. Las Palmas Km 4, Envigado'),
(19, 40, 'Alejandro', 'Paredes', 'CC', '1192017650', '+57 3181098765', 'Cra. 9 #116-20, Bogota'),
(20, 41, 'Paula', 'Mejia', 'CC', '1201928370', '+57 3190987654', 'Calle 33 #65-10, Cucuta');

-- -----------------------------------------------------------------------------
-- 5. PROVIDER CONTACTS (20 records - 4FN)
-- -----------------------------------------------------------------------------
INSERT INTO `provider_contacts` (`id`, `provider_id`, `contact_type`, `contact_value`) VALUES
(1, 1, 'PHONE', '+57 1 7458900'),
(2, 1, 'EMAIL', 'alquileres@cat-colombia.com'),
(3, 2, 'PHONE', '+57 4 4441234'),
(4, 2, 'WHATSAPP', '+57 3108889900'),
(5, 3, 'PHONE', '+57 5 3601245'),
(6, 4, 'EMAIL', 'contacto@hilti.com.co'),
(7, 5, 'PHONE', '+57 2 6605544'),
(8, 6, 'WHATSAPP', '+57 3127776655'),
(9, 7, 'EMAIL', 'rentas@wackerneuson.co'),
(10, 8, 'PHONE', '+57 4 3721000'),
(11, 9, 'PHONE', '+57 6 3334567'),
(12, 10, 'WHATSAPP', '+57 3154443322'),
(13, 11, 'EMAIL', 'support@atlascopco.com'),
(14, 12, 'PHONE', '+57 1 4256789'),
(15, 13, 'PHONE', '+57 5 3852020'),
(16, 14, 'EMAIL', 'info@liebherr.com.co'),
(17, 15, 'PHONE', '+57 1 6124589'),
(18, 16, 'WHATSAPP', '+57 3169998877'),
(19, 17, 'PHONE', '+57 1 2901122'),
(20, 18, 'EMAIL', 'ventas@millercolombia.com');

-- -----------------------------------------------------------------------------
-- 6. PROVIDER COVERAGE ZONES (20 records - 4FN)
-- -----------------------------------------------------------------------------
INSERT INTO `provider_coverage_zones` (`id`, `provider_id`, `state`, `city`) VALUES
(1, 1, 'Cundinamarca', 'Bogota'),
(2, 1, 'Cundinamarca', 'Soacha'),
(3, 2, 'Antioquia', 'Medellin'),
(4, 2, 'Antioquia', 'Bello'),
(5, 3, 'Atlantico', 'Barranquilla'),
(6, 3, 'Atlantico', 'Soledad'),
(7, 4, 'Cundinamarca', 'Bogota'),
(8, 4, 'Cundinamarca', 'Chia'),
(9, 5, 'Valle del Cauca', 'Cali'),
(10, 5, 'Valle del Cauca', 'Yumbo'),
(11, 6, 'Santander', 'Bucaramanga'),
(12, 6, 'Santander', 'Floridablanca'),
(13, 7, 'Cundinamarca', 'Bogota'),
(14, 8, 'Antioquia', 'Itagui'),
(15, 9, 'Risaralda', 'Pereira'),
(16, 10, 'Cundinamarca', 'Cota'),
(17, 11, 'Cundinamarca', 'Mosquera'),
(18, 12, 'Cundinamarca', 'Bogota'),
(19, 13, 'Atlantico', 'Barranquilla'),
(20, 14, 'Cundinamarca', 'Funza');

-- -----------------------------------------------------------------------------
-- 7. TOOL CATEGORIES (20 records)
-- -----------------------------------------------------------------------------
INSERT INTO `tool_categories` (`id`, `name`, `description`, `icon`) VALUES
(1, 'Excavacion y Movimiento de Tierra', 'Retroexcavadoras, miniexcavadoras y cargadores frontales', 'shovel'),
(2, 'Concreto y Mezclado', 'Hormigoneras, vibradores de concreto y allanadoras', 'paint-roller'),
(3, 'Demolicion y Martillos', 'Martillos demoledores, rompepavimentos e hidraulicos', 'hammer'),
(4, 'Corte y Perforacion', 'Cortadoras de pavimento, taladros de corona y sierras circulares', 'disc'),
(5, 'Generacion Electrica y Energia', 'Plantas electricas diesel y generadores portatiles', 'zap'),
(6, 'Compresion de Aire y Neumatica', 'Compresores de tornillo y pistones industriales', 'wind'),
(7, 'Elevacion y Trabajo en Alturas', 'Plataformas tijera, brazos articulados y andamios certificados', 'arrow-up-circle'),
(8, 'Compactacion de Suelos', 'Vibrocompactadores, bailarinas y rodillos de tambor', 'layers'),
(9, 'Bombeo de Agua y Drenaje', 'Motobombas sumergibles y de achique para lodo', 'droplet'),
(10, 'Soldadura y Ensamble', 'Soldadores inverter, microalambre y oxiacetileno', 'flame'),
(11, 'Topografia y Medicion', 'Niveles opticos, estaciones totales y distanciómetros laser', 'crosshair'),
(12, 'Iluminacion de Obras', 'Torres de iluminacion halogena y LED con generador', 'sun'),
(13, 'Manipulacion y Carga', 'Montacargas todoterreno y manipuladores telescopicos', 'truck'),
(14, 'Limpieza y Lavado a Presion', 'Hidrolavadoras industriales agua fria/caliente', 'spray-can'),
(15, 'Fijacion y Clavado', 'Pistolas de fijacion neumatica y polvora de tiro directo', 'target'),
(16, 'Lijado y Pulido de Pisos', 'Desbastadoras de concreto y pulidoras orbitales', 'circle'),
(17, 'Seguridad y Proteccion Colectiva', 'Mallas perimetrales, barandas provisionales y conos viales', 'shield'),
(18, 'Jardineria y Desbroce Industrial', 'Desmalezadoras y cortasetos de alto rendimiento', 'scissors'),
(19, 'Sujecion y Andamiaje', 'Puntales telescopicos de acero y torres multidireccionales', 'grid'),
(20, 'Ventilacion y Extractores de Humo', 'Extractores axiales industriales para tuneles y espacios confinados', 'fan');

-- -----------------------------------------------------------------------------
-- 8. TOOLS (25 records)
-- -----------------------------------------------------------------------------
INSERT INTO `tools` (`id`, `provider_id`, `category_id`, `name`, `brand`, `model`, `daily_price`, `deposit_amount`, `status`) VALUES
(1, 1, 1, 'Miniexcavadora Oruga 303.5', 'Caterpillar', '303.5 CR', 250000.00, 1000000.00, 'AVAILABLE'),
(2, 2, 1, 'Excavadora Hidraulica PC200', 'Komatsu', 'PC200-8M0', 580000.00, 2500000.00, 'AVAILABLE'),
(3, 3, 3, 'Martillo Demoledor Hexagonal 30kg', 'Bosch', 'GSH 27 VC', 65000.00, 300000.00, 'AVAILABLE'),
(4, 4, 3, 'Rompepavimentos TE 3000-AVR', 'Hilti', 'TE 3000-AVR', 85000.00, 400000.00, 'AVAILABLE'),
(5, 5, 2, 'Allanadora de Concreto 36 Pulgadas', 'Makita', 'PT-36PRO', 75000.00, 350000.00, 'AVAILABLE'),
(6, 6, 4, 'Cortadora de Pavimento a Gasolina', 'DeWalt', 'D25980K', 95000.00, 450000.00, 'AVAILABLE'),
(7, 7, 8, 'Vibrocompactador Pata de Elefante (Bailarina)', 'Wacker Neuson', 'BS 50-2plus', 55000.00, 250000.00, 'AVAILABLE'),
(8, 8, 1, 'Retroexcavadora 3CX Eco', 'JCB', '3CX ECO', 420000.00, 1800000.00, 'AVAILABLE'),
(9, 9, 1, 'Minicargador Compacto S550', 'Bobcat', 'S550', 210000.00, 900000.00, 'AVAILABLE'),
(10, 10, 7, 'Plataforma Elevadora Tijera 10m Electrica', 'Genie', 'GS-2646', 160000.00, 700000.00, 'AVAILABLE'),
(11, 11, 6, 'Compresor de Aire Tornillo 185 CFM', 'Atlas Copco', 'XAS 88', 130000.00, 600000.00, 'AVAILABLE'),
(12, 12, 1, 'Excavadora SY215C', 'Sany', 'SY215C', 540000.00, 2200000.00, 'AVAILABLE'),
(13, 13, 13, 'Cargador Frontal L90H', 'Volvo', 'L90H', 490000.00, 2000000.00, 'AVAILABLE'),
(14, 14, 7, 'Grua Autodesplegable Fast-Tower', 'Liebherr', '81 K.1', 850000.00, 4000000.00, 'AVAILABLE'),
(15, 15, 4, 'Cortadora de Concreto Manual K 970', 'Husqvarna', 'K 970 II', 60000.00, 280000.00, 'AVAILABLE'),
(16, 16, 1, 'Miniexcavadora U35-4', 'Kubota', 'U35-4', 240000.00, 950000.00, 'AVAILABLE'),
(17, 17, 4, 'Cortadora de Disco TS 800', 'Stihl', 'TS 800', 580000.00, 260000.00, 'AVAILABLE'),
(18, 18, 10, 'Planta Soldadora Diesel Bobcat 250', 'Miller', 'Bobcat 250', 140000.00, 650000.00, 'AVAILABLE'),
(19, 19, 10, 'Equipo de Soldadura Ranger 305D', 'Lincoln Electric', 'Ranger 305D', 150000.00, 680000.00, 'AVAILABLE'),
(20, 20, 3, 'Trituradora de Escombros Movil', 'Terex', 'Finlay J-1170', 920000.00, 5000000.00, 'AVAILABLE'),
(21, 1, 5, 'Generador Diesel Silencioso 65 kVA', 'Caterpillar', 'DE65 GC', 190000.00, 800000.00, 'AVAILABLE'),
(22, 2, 8, 'Rodillo Compactador Doble Tambor JV40DW', 'Komatsu', 'JV40DW', 230000.00, 1100000.00, 'AVAILABLE'),
(23, 3, 2, 'Vibrador de Aguja para Concreto 45mm', 'Bosch', 'GVC 22 EX', 35000.00, 150000.00, 'AVAILABLE'),
(24, 4, 11, 'Estacion Total Laser Profesional', 'Hilti', 'POS 150', 180000.00, 850000.00, 'AVAILABLE'),
(25, 5, 9, 'Motobomba de Lodos 3 Pulgadas Diesel', 'Makita', 'EW3051H', 50000.00, 200000.00, 'AVAILABLE');

-- -----------------------------------------------------------------------------
-- 9. TOOL IMAGES (25 records - 4FN)
-- -----------------------------------------------------------------------------
INSERT INTO `tool_images` (`id`, `tool_id`, `image_url`, `is_cover`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80', TRUE),
(2, 1, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80', FALSE),
(3, 2, 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80', TRUE),
(4, 3, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', TRUE),
(5, 4, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', TRUE),
(6, 5, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', TRUE),
(7, 6, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', TRUE),
(8, 7, 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80', TRUE),
(9, 8, 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80', TRUE),
(10, 9, 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80', TRUE),
(11, 10, 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80', TRUE),
(12, 11, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80', TRUE),
(13, 12, 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=800&q=80', TRUE),
(14, 13, 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80', TRUE),
(15, 14, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', TRUE),
(16, 15, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', TRUE),
(17, 16, 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80', TRUE),
(18, 17, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', TRUE),
(19, 18, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', TRUE),
(20, 19, 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80', TRUE),
(21, 20, 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80', TRUE),
(22, 21, 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80', TRUE),
(23, 22, 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80', TRUE),
(24, 23, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80', TRUE),
(25, 24, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80', TRUE);

-- -----------------------------------------------------------------------------
-- 10. TOOL SPECIFICATIONS (25 records - 4FN)
-- -----------------------------------------------------------------------------
INSERT INTO `tool_specifications` (`id`, `tool_id`, `spec_key`, `spec_value`) VALUES
(1, 1, 'Potencia de Motor', '24.8 HP Cat C1.7'),
(2, 1, 'Profundidad Max. Excavacion', '3.17 metros'),
(3, 2, 'Capacidad de Cucharón', '1.2 m3'),
(4, 2, 'Peso Operativo', '20.000 kg'),
(5, 3, 'Energia de Impacto', '62 Joules'),
(6, 4, 'Frecuencia de Impacto', '860 golpes/min'),
(7, 5, 'Diametro de Fratacho', '915 mm (36 pulgadas)'),
(8, 6, 'Profundidad de Corte', '125 mm maximo'),
(9, 7, 'Fuerza de Impacto', '16 kN'),
(10, 8, 'Capacidad Pala Frontal', '1.0 m3'),
(11, 9, 'Capacidad de Carga Nominal', '890 kg'),
(12, 10, 'Altura de Plataforma', '7.9 metros (10m trabajo)'),
(13, 11, 'Flujo de Aire Efectivo', '185 CFM a 7 bar'),
(14, 12, 'Alcance Maximo Horizontal', '9.88 metros'),
(15, 13, 'Carga de Volteo en Giro', '11.800 kg'),
(16, 14, 'Capacidad Maxima de Carga', '6.000 kg'),
(17, 15, 'Diametro del Disco', '350 mm (14 pulg)'),
(18, 16, 'Ancho de Oruga', '300 mm de goma'),
(19, 17, 'Cilindrada del Motor', '98.5 cm3'),
(20, 18, 'Salida de Potencia Auxiliar', '11.000 Watts'),
(21, 19, 'Rango de Corriente Soldadura', '40 - 300 Amperios'),
(22, 20, 'Capacidad de Procesamiento', '280 Toneladas/Hora'),
(23, 21, 'Voltaje de Salida', '220V / 440V Trifasico'),
(24, 22, 'Ancho del Tambor', '1.300 mm'),
(25, 23, 'Frecuencia de Vibracion', '20.000 vpm');

-- -----------------------------------------------------------------------------
-- 11. PAYMENT METHODS (Active production payment methods)
-- -----------------------------------------------------------------------------
INSERT INTO `payment_methods` (`id`, `code`, `name`, `is_active`) VALUES
(1, 'CREDIT_CARD_VISA', 'Tarjeta de Credito Visa', TRUE),
(2, 'CREDIT_CARD_MASTERCARD', 'Tarjeta de Credito Mastercard', TRUE),
(3, 'CREDIT_CARD_AMEX', 'Tarjeta American Express', TRUE),
(4, 'PSE_BANCOLOMBIA', 'Transferencia PSE Bancolombia', TRUE),
(5, 'PSE_DAVIVIENDA', 'Transferencia PSE Davivienda', TRUE),
(6, 'PSE_BBVA', 'Transferencia PSE BBVA', TRUE),
(7, 'PSE_BANCO_BOGOTA', 'Transferencia PSE Banco de Bogota', TRUE),
(8, 'NEQUI', 'Billetera Digital Nequi', TRUE),
(9, 'DAVIPLATA', 'Billetera Digital Daviplata', TRUE),
(10, 'DEBIT_CARD', 'Tarjeta Debito Nacional', TRUE),
(11, 'CASH_ON_DELIVERY', 'Efectivo contra entrega', TRUE),
(12, 'BALOTO', 'Corresponsal Baloto Recaudos', TRUE),
(13, 'EFECTY', 'Giro Comercial Efecty', TRUE),
(14, 'WIRE_TRANSFER_ACH', 'Transferencia Interbancaria ACH', TRUE),
(15, 'STRIPE_ONLINE', 'Pasarela Global Stripe', TRUE),
(16, 'PAYPAL', 'Cuenta Digital PayPal', TRUE),
(17, 'MERCADO_PAGO', 'Pasarela Mercado Pago', TRUE),
(18, 'CORPORATE_CREDIT', 'Credito Corporativo 30 dias', TRUE),
(19, 'BANK_CHECK', 'Cheque de Gerencia Certificado', TRUE),
(20, 'LEASING_OPERATIVO', 'Contrato de Leasing Operativo', TRUE);

-- (Rentals, returns, damages, invoices, and payments start completely empty for real live user bookings)

