# GUÍA MAESTRA DE ESTUDIO Y SUSTENTACIÓN · OPUS RENTALS
## Plataforma B2B de Alquiler de Maquinaria Pesada y Equipos de Construcción
**Stack Tecnológico**: Spring Boot 3.3.4 · Java 21 LTS · Spring Security 6 (JWT) · Spring Data JPA · MySQL 8.0 (4FN) · Vite · Vanilla JS · Tailwind CSS

---

## TABLA DE CONTENIDOS

1. [Ficha Técnica del Proyecto y Contexto de Negocio](#1-ficha-técnica-del-proyecto-y-contexto-de-negocio)
2. [Arquitectura del Sistema: Hexagonal, DDD y Capas](#2-arquitectura-del-sistema-hexagonal-ddd-y-capas)
3. [Estructura y Anatomía de Archivos (Archivo por Archivo)](#3-estructura-y-anatomía-de-archivos)
4. [Conceptos Avanzados de Programación: Dónde están en el Código](#4-conceptos-avanzados-de-programación-dónde-están-en-el-código)
   - 4.1. Constructores e Inyección de Dependencias
   - 4.2. Hilos y Concurrencia (Threads & Concurrency)
   - 4.3. Colas y Buffers (Queues & Buffers)
   - 4.4. Colecciones, Algoritmos y Streams (Java 21)
   - 4.5. Transaccionalidad y Manejo de Excepciones
5. [Seguridad a Fondo: Spring Security 6 y Ciclo de Vida JWT](#5-seguridad-a-fondo-spring-security-6-y-ciclo-de-vida-jwt)
6. [Modelo de Datos y Demostración de Cuarta Forma Normal (4NF)](#6-modelo-de-datos-y-demostración-de-cuarta-forma-normal-4nf)
7. [Algoritmos Críticos de Negocio](#7-algoritmos-críticos-de-negocio)
   - 7.1. Motor Anticolisión de Disponibilidad Multidimensional
   - 7.2. Liquidación Fiscal y Facturación DIAN (19% IVA + 10% Depósito)
8. [Arquitectura del Frontend (Vanilla JS SPA)](#8-arquitectura-del-frontend-vanilla-js-spa)
9. [Guía de Ejecución y Despliegue para la Evaluación](#9-guía-de-ejecución-y-despliegue-para-la-evaluación)

---

## 1. FICHA TÉCNICA DEL PROYECTO Y CONTEXTO DE NEGOCIO

### 1.1. Problema de Negocio
En el sector de la construcción en Colombia e Hispanoamérica, el alquiler de maquinaria pesada (excavadoras, motoniveladoras, retrocargadores, manlifts, generadores) suele ser gestionado de forma informal (hojas de cálculo, chats de mensajería instantánea, contratos en papel sin trazabilidad). Esto genera:
- **Sobreventa (Overbooking)**: Reservar equipos para fechas donde ya están alquilados.
- **Falta de Trazabilidad Financiera**: Cobros sin liquidación formal del impuesto al valor agregado (IVA 19% en Colombia) y sin garantías claras ante daños.
- **Opacidad en Disponibilidad**: Los clientes pierden horas llamando a proveedores para cotizar equipos que ya no están disponibles en patio.

### 1.2. Solución: Opus Rentals
Opus Rentals es una plataforma transaccional multicompañía (B2B Marketplace) que conecta:
1. **Proveedores de Maquinaria**: Dueños de flota que publican sus equipos, configuran inventarios totales por modelo, aprueban solicitudes, registran devoluciones y emiten facturas.
2. **Clientes (Contratistas y Constructoras)**: Buscan maquinaria por categoría, filtran por fechas en un calendario telemático en tiempo real, reservan cupos según disponibilidad de flota y gestionan pagos y garantías.
3. **Administrador de la Plataforma**: Supervisa todos los usuarios, monitorea el valor bruto de mercancías (GMV), la tasa de ocupación de flota y gestiona auditorías.

---

## 2. ARQUITECTURA DEL SISTEMA: HEXAGONAL, DDD Y CAPAS

El backend fue diseñado combinando **Arquitectura Hexagonal (Ports and Adapters)** y **Domain-Driven Design (DDD)** con una arquitectura limpia en capas.

```
       ┌────────────────────────────────────────────────────────┐
       │              ADAPTADORES PRIMARIOS (Driving)           │
       │   Controllers REST / JSON (Spring Web MVC)             │
       │   [AuthController, ToolController, RentalController]   │
       └─────────────────────────┬──────────────────────────────┘
                                 │ Invocan
                                 ▼
       ┌────────────────────────────────────────────────────────┐
       │             PUERTOS DE ENTRADA (Input Ports)           │
       │   Interfaces y Métodos de Casos de Uso del Negocio     │
       │   [RentalService, ToolService, InvoiceService]         │
       └─────────────────────────┬──────────────────────────────┘
                                 │ Coordina
                                 ▼
       ┌────────────────────────────────────────────────────────┐
       │                 NÚCLEO DEL DOMINIO                     │
       │   Entidades de Negocio, Reglas, Validaciones Atómicas  │
       │   [Rental, Tool, Invoice, Payment, User, Role]         │
       └─────────────────────────┬──────────────────────────────┘
                                 │ Utiliza
                                 ▼
       ┌────────────────────────────────────────────────────────┐
       │             PUERTOS DE SALIDA (Output Ports)           │
       │   Interfaces de Persistencia y Comunicación Externa    │
       │   [RentalRepository, ToolRepository, InvoiceRepository]│
       └─────────────────────────┬──────────────────────────────┘
                                 │ Implementados por
                                 ▼
       ┌────────────────────────────────────────────────────────┐
       │             ADAPTADORES SECUNDARIOS (Driven)           │
       │   Spring Data JPA / Hibernate ORM / Driver MySQL 8.0   │
       └────────────────────────────────────────────────────────┘
```

### 2.1. Domain-Driven Design (DDD) y Bounded Contexts
El sistema no es un monolito desordenado; está segmentado en **5 Bounded Contexts (Contextos Delimitados)** independientes ubicados en `com.opusrentals.modules`:

1. **`user` (Contexto de Identidad y Acceso)**:
   - Entidades: `User`, `Role`, `Client`, `Provider`.
   - Responsabilidad: Registro, roles del sistema, perfiles jurídicos (NIT, Razón Social) y clientes naturales.
2. **`tool` (Contexto de Catálogo y Maquinaria)**:
   - Entidades: `Tool`, `Category`, `ToolImage`, `ToolSpecification`.
   - Responsabilidad: Ficha técnica de máquinas, tarifas diarias, valor de reposición, inventario total (`totalQuantity`) y estado de mantenimiento.
3. **`rental` (Contexto de Contratos y Alquileres)**:
   - Entidades: `Rental`, `RentalDamage`.
   - Responsabilidad: Motor de cálculo de disponibilidad de fechas, ciclo de vida del alquiler (`PENDING` -> `APPROVED` -> `IN_PROGRESS` -> `RETURNED`), inspecciones de recepción y reportes de averías.
4. **`billing` (Contexto Fiscal y Pasarela de Pagos)**:
   - Entidades: `Invoice`, `Payment`, `PaymentMethod`.
   - Responsabilidad: Generación de facturas legales con IVA 19% DIAN, comprobantes fiscales, procesamiento simulado de pasarela y auditoría de transacciones.
5. **`report` (Contexto de Analítica Operativa)**:
   - Responsabilidad: Consolidación de ingresos, tasa de utilización de flota, clientes frecuentes y KPIs del Administrador.

---

## 3. ESTRUCTURA Y ANATOMÍA DE ARCHIVOS

### 3.1. Estructura Backend (`/backend`)
```
backend/src/main/java/com/opusrentals/
├── OpusRentalsApplication.java         # Punto de entrada de Spring Boot y ServletInitializer para Tomcat
├── config/                             # Configuraciones de infraestructura
│   ├── CorsConfig.java                 # Filtro global de CORS para permitir Vite (5173), Nginx (80)
│   └── SwaggerConfig.java              # Configuración de OpenAPI 3.0 (Swagger UI) con esquema JWT Bearer
├── security/                           # Capa de Seguridad Transversal
│   ├── SecurityConfig.java             # Cadena de filtros (SecurityFilterChain), reglas de rutas y roles
│   ├── jwt/
│   │   ├── JwtTokenProvider.java       # Generación, firma criptográfica y validación de tokens JWT
│   │   ├── JwtAuthenticationFilter.java# Filtro OncePerRequest que intercepta cabeceras 'Authorization: Bearer'
│   │   └── JwtAuthenticationEntryPoint.java # Manejador de respuestas 401 Unauthorized en formato JSON
│   └── service/
│       └── CustomUserDetailsService.java # Carga de credenciales y authorities desde la base de datos
├── shared/                             # Clases compartidas y transversales
│   ├── dto/ApiResponse.java           # Envoltorio estándar JSON { success, message, data, timestamp }
│   └── exception/
│       ├── GlobalExceptionHandler.java # @RestControllerAdvice para capturar excepciones globalmente
│       ├── ResourceNotFoundException.java (404)
│       ├── BadRequestException.java       (400)
│       ├── ConflictException.java         (409)
│       └── UnauthorizedException.java     (401)
└── modules/
    ├── user/
    │   ├── entity/ [User.java, Role.java, Client.java, Provider.java]
    │   ├── repository/ [UserRepository.java, RoleRepository.java, ClientRepository.java, ProviderRepository.java]
    │   ├── service/ [AuthService.java, UserService.java, ClientService.java, ProviderService.java]
    │   ├── controller/ [AuthController.java, UserController.java, ClientController.java, ProviderController.java]
    │   └── dto/ [LoginRequest, RegisterRequest, AuthResponse, UpdateProviderRequest, etc.]
    ├── tool/
    │   ├── entity/ [Tool.java, Category.java, ToolImage.java, ToolSpecification.java]
    │   ├── repository/ [ToolRepository.java, CategoryRepository.java, ToolImageRepository.java]
    │   ├── service/ [ToolService.java, CategoryService.java]
    │   └── controller/ [ToolController.java, CategoryController.java]
    ├── rental/
    │   ├── entity/ [Rental.java, RentalDamage.java]
    │   ├── repository/ [RentalRepository.java, RentalDamageRepository.java]
    │   ├── service/ [RentalService.java] # Algoritmo anticolisión de disponibilidad
    │   └── controller/ [RentalController.java]
    ├── billing/
    │   ├── entity/ [Invoice.java, Payment.java, PaymentMethod.java]
    │   ├── repository/ [InvoiceRepository.java, PaymentRepository.java, PaymentMethodRepository.java]
    │   ├── service/ [InvoiceService.java, PaymentService.java]
    │   └── controller/ [InvoiceController.java, PaymentController.java]
    └── report/
        ├── service/ [ReportService.java]
        └── controller/ [ReportController.java]
```

### 3.2. Estructura Frontend (`/frontend`)
```
frontend/src/
├── main.js                  # Punto de entrada de la SPA, suscripciones a eventos de logout y enrutamiento
├── router.js                # Router dinámico tipo hash-router (#/tools, #/admin, #/login) sin recarga
├── index.css                # Estilos base con Tailwind CSS
├── api/
│   ├── client.js            # Cliente HTTP (fetch) con unwrap automático de ApiResponse y conmutación a Mock
│   └── mock-store.js        # Almacén de datos simulados para entornos sin base de datos
├── components/
│   ├── navbar.js            # Barra de navegación adaptativa según rol (Admin, Proveedor, Cliente)
│   ├── footer.js            # Pie de página corporativo
│   ├── auth-modal.js        # Modal interactivo de Login y Registro
│   └── custom-date-picker.js# Componente de calendario interactivo con validación de capacidad en rojo
├── utils/
│   ├── icons.js             # Motor de renderizado dinámico de iconos SVG (Lucide)
│   ├── formatters.js        # Formateadores monetarios (COP $) y fechas legibles
│   └── tool-images.js       # Resolución inteligente de fotos de maquinaria y fallback antiroturas
└── views/
    ├── home.js              # Página de inicio con buscador y héroe interactivo
    ├── catalog.js           # Catálogo general con filtros por categoría y disponibilidad
    ├── product-detail.js    # Ficha técnica, selector de fechas y cotizador dinámico
    ├── rental-modal.js      # Flujo de confirmación de reserva y selección de unidades
    ├── client-dashboard.js  # Panel del cliente: alquileres activos, pagos y facturas en PDF
    ├── provider-dashboard.js# Panel del proveedor: inventario, aprobación de alquileres y devoluciones
    └── admin-dashboard.js   # Panel del administrador: métricas de flota, KPIs, usuarios y finanzas
```

---

## 4. CONCEPTOS AVANZADOS DE PROGRAMACIÓN: DÓNDE ESTÁN EN EL CÓDIGO

Si el evaluador te pide que señales conceptos específicos del lenguaje y de la ingeniería de software, aquí está la ubicación exacta:

### 4.1. Constructores e Inyección de Dependencias
- **Inyección de Dependencias por Constructor (Constructor-Based Dependency Injection)**:
  - **Ubicación**: En todos los servicios y controladores, por ejemplo en [RentalService.java](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L35) y [SecurityConfig.java](file:///backend/src/main/java/com/opusrentals/security/SecurityConfig.java#L27).
  - **Cómo funciona**: Mediante la anotación `@RequiredArgsConstructor` de Lombok, el compilador genera un constructor público con todos los atributos declarados como `private final`.
  - **Justificación teórica**: La inyección por constructor es superior a `@Autowired` por campo porque garantiza la inmutabilidad de los servicios dependientes (`final`), previene NullPointerExceptions en tiempo de instanciación y permite pruebas unitarias (JUnit) instanciando el servicio con `new RentalService(mockRepo, ...)` sin necesidad de levantar el contexto pesado de Spring.
- **Constructores por Defecto (JPA No-Args Constructor)**:
  - **Ubicación**: En todas las entidades, por ejemplo [Rental.java](file:///backend/src/main/java/com/opusrentals/modules/rental/entity/Rental.java) con `@NoArgsConstructor`.
  - **Justificación**: El estándar JPA/Hibernate exige obligatoriamente un constructor sin argumentos para poder instanciar las entidades mediante reflexión al recuperar los registros desde JDBC.
- **Patrón Constructor Fluido (Builder Pattern)**:
  - **Ubicación**: [Rental.java](file:///backend/src/main/java/com/opusrentals/modules/rental/entity/Rental.java) y [RentalResponse.java](file:///backend/src/main/java/com/opusrentals/modules/rental/dto/response/RentalResponse.java) con `@Builder`.
  - **Ejemplo en código**:
    ```java
    Rental rental = Rental.builder()
            .client(client)
            .tool(tool)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .totalDays(totalDays)
            .quantity(requestedQty)
            .dailyRate(tool.getDailyPrice())
            .status("PENDING")
            .build();
    ```

### 4.2. Hilos y Concurrencia (Threads & Concurrency)
- **Tomcat NIO Thread Pool (Hilos del Servidor)**:
  - **Ubicación**: Configurado implícitamente por Spring Boot Web en `TomcatWebServer`.
  - **Cómo opera**: Cada solicitud HTTP entrante es procesada en un hilo de trabajo independiente (`http-nio-8080-exec-*`) extraído de un Thread Pool concurrente.
- **Aislamiento por Hilo con `ThreadLocal`**:
  - **Ubicación**: [JwtAuthenticationFilter.java:L43](file:///backend/src/main/java/com/opusrentals/security/jwt/JwtAuthenticationFilter.java#L43).
  - **Código**:
    ```java
    SecurityContextHolder.getContext().setAuthentication(authentication);
    ```
  - **Justificación**: `SecurityContextHolder` utiliza internamente una variable de tipo `ThreadLocal<SecurityContext>`. Esto garantiza que los datos de autenticación del usuario A queden atados al hilo que atiende su petición y sean totalmente invisibles para la petición concurrente del usuario B en otro hilo (Thread Safety).
- **Pool de Hilos de Base de Datos (HikariCP Connection Pool)**:
  - HikariCP mantiene un pool de conexiones concurrentes a MySQL (por defecto 10 hilos de conexión). Cuando un servicio inicia `@Transactional`, el hilo HTTP toma prestada una conexión física y la devuelve al pool al culminar el commit.
- **Control de Condiciones de Carrera (Race Conditions) en Reservas**:
  - **Ubicación**: [RentalService.java:L68-L80](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L68-L80).
  - **Mecanismo**: La anotación `@Transactional` asegura que la consulta de disponibilidad y la inserción del alquiler ocurran dentro de una transacción atómica con aislamiento `READ_COMMITTED`.

### 4.3. Colas y Buffers (Queues & Buffers)
- **Socket Accept Queue en Tomcat**:
  - Cuando los 200 hilos concurrentes de Tomcat están ocupados atendiendo peticiones pesadas, las nuevas conexiones entrantes no son rechazadas de inmediato: se encolan en la cola FIFO del socket del sistema operativo (`accept-count=100`).
- **Colas de Espera en HikariCP**:
  - Si las 10 conexiones del pool están ocupadas, los hilos de Spring se colocan en una cola sincronizada de espera (`FastList` / `SynchronousQueue`) con un tiempo máximo de espera de 30 segundos antes de lanzar un timeout.

### 4.4. Colecciones, Algoritmos y Streams (Java 21)
- **`TreeSet<LocalDate>` para Ordenamiento Natural de Fechas**:
  - **Ubicación**: [RentalService.java:L218](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L218).
  - **Por qué se usa**: `TreeSet` implementa un árbol rojinegro (Red-Black Tree) que garantiza que las fechas añadidas no tengan duplicados y se mantengan estrictamente ordenadas en tiempo cronológico $O(\log n)$.
- **Java 21 Streams y Expresiones Lambda**:
  - **Ubicación**: [RentalService.java:L221-L224](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L221-L224).
  - **Código**:
    ```java
    int rentedOnDay = activeRentals.stream()
            .filter(r -> !cur.isBefore(r.getStartDate()) && !cur.isAfter(r.getEndDate()))
            .mapToInt(r -> r.getQuantity() != null ? r.getQuantity() : 1)
            .sum();
    ```
  - **Justificación**: Programación funcional declarativa que mapea y suma eficientemente las cantidades alquiladas en memoria en vez de ejecutar consultas SQL repetitivas en bucle.
- **`HashMap<String, Object>` para Estructuras Dinámicas**:
  - **Ubicación**: En [RentalService.java:L281](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L281) para devolver el estado telemático de disponibilidad a la API con complejidad de acceso $O(1)$.

### 4.5. Transaccionalidad y Manejo Centralizado de Excepciones
- **`@Transactional`**:
  - **Lectura**: `@Transactional(readOnly = true)` en consultas (`getBookedDateRangesByToolId`, `checkToolAvailability`) para optimizar el rendimiento de Hibernate desactivando el dirty checking (revisión de cambios en objetos sucios).
  - **Escritura**: `@Transactional` en métodos mutables (`createRental`, `updateRentalStatus`) garantizando atomicidad: si falla la inserción de la factura o el cálculo, se realiza un rollback automático de la base de datos.
- **Manejador Global de Excepciones**:
  - **Ubicación**: [GlobalExceptionHandler.java](file:///backend/src/main/java/com/opusrentals/shared/exception/GlobalExceptionHandler.java).
  - **Cómo opera**: Anotado con `@RestControllerAdvice`, intercepta cualquier error del sistema y lo transforma en una respuesta HTTP normalizada `ApiResponse<T>` con su código respectivo (400, 401, 404, 409, 500), evitando fugas de trazas internas del servidor (Stack Traces) al usuario final.

---

## 5. SEGURIDAD A FONDO: SPRING SECURITY 6 Y CICLO DE VIDA JWT

### 5.1. Flujo de Autenticación y Autorización

```
1. Cliente envía POST /api/v1/auth/login { email, password }
   │
   ▼
2. AuthController -> AuthenticationManager -> DaoAuthenticationProvider
   │ (Compara la contraseña en texto plano contra el hash BCrypt de la BD)
   ▼
3. Si es válida -> JwtTokenProvider.generateToken(authentication)
   │ (Firma un token HMAC-SHA256 con Subject, Roles y Expiración en 24h)
   ▼
4. Retorna { token: "eyJhbGciOi...", type: "Bearer" }
   │
   ▼
5. Para peticiones subsecuentes:
   Cliente envía cabecera 'Authorization: Bearer eyJhbGciOi...'
   │
   ▼
6. JwtAuthenticationFilter intercepta la petición (OncePerRequestFilter)
   │ -> Extrae el token
   │ -> Valida firma criptográfica y expiración
   │ -> Extrae el username
   │ -> Carga UserDetails desde CustomUserDetailsService
   │ -> Construye UsernamePasswordAuthenticationToken
   │ -> Lo inyecta en SecurityContextHolder.getContext().setAuthentication(...)
   ▼
7. SecurityFilterChain evalúa las reglas de ruta:
   - /api/v1/admin/**     -> Requiere ROLE_ADMIN
   - /api/v1/providers/** -> Requiere ROLE_PROVIDER o ROLE_ADMIN
   - /api/v1/clients/**   -> Requiere ROLE_CLIENT o ROLE_ADMIN
   - /api/v1/tools/**     -> Acceso público (GET)
```

### 5.2. Puntos Clave para la Sustentación
- **¿Por qué la sesión es STATELESS?**:
  En [SecurityConfig.java:L59](file:///backend/src/main/java/com/opusrentals/security/SecurityConfig.java#L59) se define `SessionCreationPolicy.STATELESS`. El servidor no crea ni almacena objetos `HttpSession` en memoria RAM. Toda la identidad del usuario viaja autocontenida y firmada criptográficamente en el token JWT. Esto permite escalabilidad horizontal (balanceo de carga entre múltiples servidores sin replicación de sesiones).
- **Algoritmo de Hash**:
  Se utiliza `BCryptPasswordEncoder` con factor de coste 10 y salt aleatorio automático, lo cual previene ataques por tablas Rainbow.

---

## 6. MODELO DE DATOS Y DEMOSTRACIÓN DE CUARTA FORMA NORMAL (4NF)

La base de datos consta de **16 tablas relacionales**, diseñada estrictamente bajo principios de normalización hasta 4NF:

```
[users] 1 ──── 1 [clients]
   │ 1
   ├───── 1 [providers] 1 ──── N [tools] 1 ──── N [tool_images]
   │                                   │ 1
   │                                   └──── N [tool_specifications]
   │                                   │ 1
   │                                   └──── N [rentals] 1 ──── N [rental_damages]
   │                                               │ 1
   │                                               ├──── 1 [invoices]
   │                                               │         │ 1
   │                                               │         └──── N [payments]
   │                                               │                    │ N
   │                                               │                    ▼ 1
   │                                               │           [payment_methods]
   └───── N [user_roles] N ───── 1 [roles]
```

### 6.1. Demostración Matemática de 4FN
Una tabla está en Cuarta Forma Normal (4NF) si y solo si:
1. Está en Tercera Forma Normal (3NF / Boyce-Codd BCNF).
2. **No contiene dependencias multivaluadas (MVD - Multi-Valued Dependencies)** independientes.

**Ejemplo de Violación de 4NF (Diseño Erróneo de Novato)**:
Si una tabla tuviera: `(tool_id, image_url, specification_key, specification_value)`.
Una excavadora puede tener 3 imágenes y 5 especificaciones. Al combinar ambas en la misma tabla se produciría un producto cartesiano ($3 \times 5 = 15$ registros redundantes) donde `image_url` y `specifications` son independientes entre sí:
$$tool\_id \twoheadrightarrow image\_url$$
$$tool\_id \twoheadrightarrow (specification\_key, specification\_value)$$

**Solución 4NF en Opus Rentals**:
Se descompuso la entidad en tablas independientes 1 a N:
- `tools`: Datos base del equipo.
- `tool_images`: Almacena exclusivamente imágenes asociadas a la herramienta.
- `tool_specifications`: Almacena pares clave-valor de atributos técnicos (potencia, capacidad de balde, peso operativo).
Ninguna tabla almacena listas multivaluadas ni genera tuplas espurias.

---

## 7. ALGORITMOS CRÍTICOS DE NEGOCIO

### 7.1. Motor Anticolisión de Disponibilidad Multidimensional
- **Ubicación**: [RentalService.java:L204-L265](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L204-L265).
- **Problema Resuelto**: Si un proveedor tiene una flota de 5 miniexcavadoras y un cliente reserva 1 unidad del 21 al 27 de octubre, la máquina **NO debe bloquearse ni mostrarse en rojo**. Todavía quedan 4 unidades disponibles para otros clientes.
- **Lógica del Algoritmo**:
  1. Recupera únicamente alquileres activos (`PENDING`, `APPROVED`, `IN_PROGRESS`), descartando alquileres finalizados (`RETURNED`, `COMPLETED`) o anulados (`CANCELLED`, `REJECTED`).
  2. Determina el rango de análisis entre la fecha mínima y máxima.
  3. Itera día por día calendario:
     $$\text{rentedOnDay}(d) = \sum_{\text{alquileres activos en } d} \text{quantity}$$
  4. Si $\text{rentedOnDay}(d) \ge \text{totalUnits}$, el día se clasifica como `FULLY_BOOKED` (100% agotado).
  5. Agrupa los días consecutivos 100% agotados en rangos continuos para que el frontend pinte en rojo **únicamente** los días sin existencias.
  6. Para cotizaciones de un rango solicitado $[f_{\text{inicio}}, f_{\text{fin}}]$, el cupo disponible se calcula como:
     $$\text{disponibles} = \text{totalUnits} - \max_{d \in [f_{\text{inicio}}, f_{\text{fin}}]} \text{rentedOnDay}(d)$$

### 7.2. Liquidación Fiscal y Facturación DIAN
- **Ubicación**: [RentalService.java:L81-L83](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L81-L83) e [InvoiceService.java](file:///backend/src/main/java/com/opusrentals/modules/billing/service/InvoiceService.java).
- **Subtotal**:
  $$\text{Subtotal} = \text{días} \times \text{precio\_diario} \times \text{cantidad}$$
- **IVA Legal DIAN (19%)**:
  $$\text{IVA} = \text{Subtotal} \times 0.19$$
- **Depósito de Garantía (Póliza de Reposición)**:
  $$\text{Depósito} = (\text{valor\_reposición} \times 0.10) \times \text{cantidad}$$
- **Total a Pagar**:
  $$\text{Total} = \text{Subtotal} + \text{IVA}$$
- Las facturas se generan con numeración secuencial (`OP-INV-XXXX`), código QR y opción de renderizado, impresión y descarga de PDF vectorial.

---

## 8. ARQUITECTURA DEL FRONTEND (VANILLA JS SPA)

### 8.1. Justificación Técnica frente a Frameworks
El frontend fue construido en **JavaScript Puro (Vanilla ES6 Modules)** y estilizado con **Tailwind CSS**.
- **Ventajas**:
  - Tiempo de arranque instantáneo: No requiere hidratación pesada de DOM virtual como React o Angular.
  - Cero dependencias frágiles de librerías externas de UI.
  - Dominio profundo de las APIs estándar de la Web (`CustomEvent`, `fetch`, `history`, `localStorage`).

### 8.2. Componentes Clave
1. **Router SPA ([router.js](file:///frontend/src/router.js))**:
   - Escucha los cambios del hash (`window.addEventListener('hashchange', ...)`) y monta dinámicamente las vistas sin recargar la página web.
2. **Cliente API con Tolerancia a Fallos ([client.js](file:///frontend/src/api/client.js))**:
   - Envía peticiones HTTP al backend de Spring Boot. Si el backend no está disponible (Connection Refused), conmuta de manera transparente al almacén mock (`mock-store.js`) en 10 milisegundos, permitiendo una demostración fluida en cualquier escenario.
3. **Selector de Rango de Fechas Telemático ([custom-date-picker.js](file:///frontend/src/components/custom-date-picker.js))**:
   - Valida en tiempo real la selección de fechas.
   - Pinta en color naranja la selección activa.
   - Pinta en color **rojo vibrante con tachado** los días donde el 100% de la flota está agotada, impidiendo la selección y mostrando alertas explicativas en pantalla.
   - Limita las reservas a un máximo normativo de 30 días (1 mes) por contrato.

---

## 9. GUÍA DE EJECUCIÓN Y DESPLIEGUE PARA LA EVALUACIÓN

### 9.1. El Comando Universal
Para la sustentación ante el jurado, únicamente se requiere clonar y ejecutar un comando:

```bash
git clone https://github.com/DMntill4/opus-rentals.git
cd opus-rentals
npm run dev
```

El script [scripts/start-all.js](file:///scripts/start-all.js):
1. Detecta si Docker está activo e inicia MySQL 8 y Spring Boot 3 (`docker compose up -d mysql_db backend`).
2. Si el computador no tiene Docker, arranca en modo autónomo con el mock interactivo.
3. Instala dependencias si la carpeta `node_modules` no existe.
4. Despliega la aplicación web en `http://localhost:5173`.

### 9.2. Cuentas de Prueba para Demostración en Vivo
Contraseña única para todos los usuarios: `password123`

| Rol | Correo Electrónico | Qué Demostrar |
| :--- | :--- | :--- |
| **Administrador** | `admin@opusrentals.com` | Dashboard de ingresos, lista de usuarios, KPIs globales y auditoría. |
| **Proveedor** | `contacto@caterpillar.com.co` | Publicación de máquinas, control de inventario, aprobación de alquileres y facturación. |
| **Cliente** | `carlos.mendoza@constructoraandina.com` | Búsqueda en catálogo, cotización de fechas con motor anticolisión, checkout y visualización de facturas en PDF. |
