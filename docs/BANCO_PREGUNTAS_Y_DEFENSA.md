# BANCO DE PREGUNTAS TRAMPA Y DEFENSA ANTE EL JURADO
## Opus Rentals · Simulación de Sustentación de Proyecto de Software

Este documento contiene las 15 preguntas más difíciles y comunes que suelen hacer los profesores y jurados evaluadores de desarrollo de software, junto con la respuesta técnica exacta, el vocabulario formal que debes usar y el archivo con los números de línea precisos que debes abrir en pantalla.

---

### PREGUNTA 1: "¿Muéstreme en el código dónde está la inyección de dependencias y por qué no usó `@Autowired` sobre los atributos?"

- **Archivo a mostrar**: [RentalService.java](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L28-L40) o [SecurityConfig.java](file:///backend/src/main/java/com/opusrentals/security/SecurityConfig.java#L27-L34).
- **Líneas exactas**:
  ```java
  @Service
  @RequiredArgsConstructor
  public class RentalService {
      private final RentalRepository rentalRepository;
      private final ToolRepository toolRepository;
      private final UserRepository userRepository;
      private final ClientRepository clientRepository;
      private final ProviderRepository providerRepository;
      private final InvoiceService invoiceService;
  ```
- **Qué debes responder**:
  > *"Profesor, en todo el proyecto utilizamos **Inyección de Dependencias por Constructor** asistida por la anotación `@RequiredArgsConstructor` de Lombok, la cual genera el constructor público que inyecta todos los campos declarados como `private final`. No utilizamos `@Autowired` por campo (Field Injection) porque está desaconsejado por las buenas prácticas de Spring: la inyección por campo permite estados mutables no deseados, puede generar `NullPointerExceptions` si el contenedor no está activo y dificulta las pruebas unitarias. Con la inyección por constructor, las dependencias son inmutables (`final`) y podemos instanciar el servicio en tests unitarios usando `new RentalService(...)` pasando mocks sin necesidad de levantar el contexto pesado de Spring."*

---

### PREGUNTA 2: "¿Dónde se manejan los hilos y la concurrencia en este proyecto?"

- **Archivo a mostrar**: [JwtAuthenticationFilter.java:L43](file:///backend/src/main/java/com/opusrentals/security/jwt/JwtAuthenticationFilter.java#L43) y [RentalService.java:L42](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L42).
- **Líneas exactas**:
  ```java
  SecurityContextHolder.getContext().setAuthentication(authentication);
  ```
- **Qué debes responder**:
  > *"Profesor, la concurrencia y el manejo de hilos se evidencia en cuatro niveles arquitectónicos:*
  > 1. *Pool de hilos de Tomcat (NIO Thread Pool): Cada petición HTTP que llega al puerto 8080 es atendida por un hilo independiente de ejecución (`http-nio-8080-exec-*`).*
  > 2. *Aislamiento seguro con `ThreadLocal`: En el filtro JWT (`JwtAuthenticationFilter`), la llamada a `SecurityContextHolder.getContext().setAuthentication(auth)` almacena el contexto de seguridad en una variable `ThreadLocal`. Esto garantiza que los datos de un usuario autenticado queden confinados a su propio hilo y nunca se crucen con peticiones concurrentes de otros usuarios.*
  > 3. *Pool de conexiones HikariCP: Gestiona un grupo concurrente de hilos de conexión hacia MySQL para que los hilos HTTP no abran conexiones costosas de socket en cada consulta.*
  > 4. *Transaccionalidad concurrente: En `RentalService.createRental`, el método está anotado con `@Transactional` con nivel de aislamiento `READ_COMMITTED` para garantizar que la consulta de disponibilidad y el guardado del alquiler sean atómicos y no generen condiciones de carrera."*

---

### PREGUNTA 3: "¿Dónde están los constructores en su código y qué tipos implementó?"

- **Archivo a mostrar**: [Rental.java](file:///backend/src/main/java/com/opusrentals/modules/rental/entity/Rental.java) y [RentalResponse.java](file:///backend/src/main/java/com/opusrentals/modules/rental/dto/response/RentalResponse.java).
- **Qué debes responder**:
  > *"Manejamos tres tipos fundamentales de constructores:*
  > 1. *Constructor por defecto (No-Args): Generado con `@NoArgsConstructor` en todas las entidades JPA. Es un requerimiento del estándar JPA/Hibernate para poder instanciar las entidades por reflexión al leer los registros de la base de datos.*
  > 2. *Constructor completo (All-Args): Generado con `@AllArgsConstructor` para alimentar el patrón Builder.*
  > 3. *Constructor de inyección de dependencias: Generado por `@RequiredArgsConstructor` en servicios y controladores para recibir los beans de Spring.*
  > 4. *Además, implementamos el patrón de diseño Builder mediante `@Builder`, que proporciona un constructor fluido e inmutable para mapear DTOs y entidades sin constructores telescópicos propensos a errores de orden de parámetros."*

---

### PREGUNTA 4: "¿Dónde se usan colas (queues) y buffers en la aplicación?"

- **Archivo a mostrar**: [application.properties](file:///backend/src/main/resources/application.properties) y arquitectura interna de Spring Boot.
- **Qué debes responder**:
  > *"Las colas y buffers intervienen en el flujo de entrada y salida de datos:*
  > 1. *Socket Accept Queue de Tomcat: Cuando el pool de 200 hilos de Tomcat está al máximo de su capacidad, las conexiones TCP entrantes se almacenan en una cola de espera FIFO a nivel de sistema operativo (`accept-count`).*
  > 2. *Connection Wait Queue de HikariCP: Si las conexiones simultáneas de base de datos están ocupadas por transacciones activas, los hilos de Spring que solicitan conexión se forman en una cola concurrente (`SynchronousQueue`) antes de arrojar un timeout.*
  > 3. *Buffers de I/O en la exportación: En la generación de respuestas de archivos y en la comunicación HTTP, los flujos utilizan buffers de memoria (`BufferedOutputStream` / `FilterChain`) para evitar escribir byte por byte en la red, optimizando el ancho de banda."*

---

### PREGUNTA 5: "Si dos usuarios intentan alquilar la misma última máquina al mismo milisegundo, ¿qué ocurre? ¿Cómo evita la sobreventa?"

- **Archivo a mostrar**: [RentalService.java](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L42-L78).
- **Líneas exactas**:
  ```java
  @Transactional
  public RentalResponse createRental(String userEmail, CreateRentalRequest request) {
      ...
      List<Rental> activeRentals = rentalRepository.findActiveRentalsByToolId(tool.getId());
      int maxRentedInPeriod = 0;
      for (LocalDate d = request.getStartDate(); !d.isAfter(request.getEndDate()); d = d.plusDays(1)) {
          ...
      }
      if (maxRentedInPeriod + requestedQty > totalUnits) {
          int availableUnits = Math.max(0, totalUnits - maxRentedInPeriod);
          throw new ConflictException("Solo hay " + availableUnits + " unidades disponibles...");
      }
  ```
- **Qué debes responder**:
  > *"Profesor, la protección contra condiciones de carrera (Race Conditions) y sobreventa (Overbooking) se fundamenta en tres pilares:*
  > 1. *Transaccionalidad ACID con `@Transactional`: Todo el método de creación de reserva se ejecuta dentro de una transacción de base de datos. Si dos hilos entran concurrentemente, la base de datos gestiona el bloqueo a nivel de fila durante la inserción.*
  > 2. *Validación atómica en memoria de la flota real: Se calculan las unidades ocupadas día a día contra el inventario total (`totalUnits`).*
  > 3. *Lanzamiento de excepción `ConflictException (HTTP 409)`: Si un usuario gana la carrera por milisegundos y toma la última unidad disponible, el segundo hilo recalcula la disponibilidad, detecta que `maxRentedInPeriod + requestedQty > totalUnits` y rechaza la operación de forma limpia con un mensaje explicativo y rollback automático."*

---

### PREGUNTA 6: "Explíqueme el flujo completo de Spring Security y JWT. ¿Qué hace el filtro y por qué la sesión es STATELESS?"

- **Archivo a mostrar**: [SecurityConfig.java](file:///backend/src/main/java/com/opusrentals/security/SecurityConfig.java#L54-L86) y [JwtAuthenticationFilter.java](file:///backend/src/main/java/com/opusrentals/security/jwt/JwtAuthenticationFilter.java#L28-L50).
- **Qué debes responder**:
  > *"La arquitectura de seguridad es completamente desacoplada y sin estado:*
  > 1. *`SessionCreationPolicy.STATELESS`: En `SecurityConfig`, le indicamos a Spring que no guarde sesiones `HttpSession` en la memoria del servidor. Esto hace al sistema escalable y ligero.*
  > 2. *Filtro `JwtAuthenticationFilter`: Hereda de `OncePerRequestFilter`, garantizando que se ejecute exactamente una sola vez por cada petición HTTP.*
  > 3. *Extracción y Validación: Intercepta la cabecera `Authorization: Bearer <token>`. Valida la firma HMAC-SHA256 con nuestra clave secreta y corrobora que no haya expirado.*
  > 4. *Inyección de Autorizaciones: Extrae el email del usuario, carga sus roles (`ROLE_CLIENT`, `ROLE_PROVIDER`, `ROLE_ADMIN`) y crea un objeto `UsernamePasswordAuthenticationToken` que inyecta en el `SecurityContextHolder`.*
  > 5. *Evaluación de permisos: El `SecurityFilterChain` verifica si la ruta solicitada exige un rol específico (`hasAuthority('ROLE_ADMIN')`) o si es pública (`permitAll()`). Si no cumple, el `JwtAuthenticationEntryPoint` retorna un error 401 en formato JSON uniforme."*

---

### PREGUNTA 7: "Demuéstreme por qué la base de datos está en Cuarta Forma Normal (4NF) y no solo en 3NF."

- **Archivo a mostrar**: [01_schema.sql](file:///database/init/01_schema.sql) y [ARQUITECTURA_4FN.md](file:///docs/ARQUITECTURA_4FN.md).
- **Qué debes responder**:
  > *"Una tabla está en 4NF si está en BCNF/3NF y no posee dependencias multivaluadas (MVD) independientes.*
  > *En nuestro sistema, una herramienta (`tools`) tiene múltiples imágenes (`tool_images`) y múltiples especificaciones técnicas (`tool_specifications`). Ambas listas son completamente independientes entre sí:*
  > - *La imagen de la máquina no determina su potencia de motor ni su capacidad de balde.*
  > *Si hubiéramos colocado imágenes y especificaciones en la misma tabla de herramientas, tendríamos una dependencia multivaluada $tool\_id \twoheadrightarrow image\_url$ y $tool\_id \twoheadrightarrow (spec\_key, spec\_value)$, lo que provocaría un producto cartesiano con tuplas espurias y repetición masiva de datos.*
  > *En Opus Rentals separamos `tool_images` y `tool_specifications` en tablas relacionales 1 a N con clave foránea propia hacia `tools`, eliminando por completo cualquier dependencia multivaluada y cumpliendo rigurosamente la 4NF."*

---

### PREGUNTA 8: "¿Cómo implementaron la Arquitectura Hexagonal en este código? Muéstreme un puerto y un adaptador."

- **Archivo a mostrar**:
  - Puerto de Entrada: Métodos públicos de [RentalService.java](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java).
  - Adaptador Primario: [RentalController.java](file:///backend/src/main/java/com/opusrentals/modules/rental/controller/RentalController.java).
  - Puerto de Salida: [RentalRepository.java](file:///backend/src/main/java/com/opusrentals/modules/rental/repository/RentalRepository.java).
  - Adaptador Secundario: Implementación proxy de Spring Data JPA con Hibernate y driver MySQL.
- **Qué debes responder**:
  > *"En la Arquitectura Hexagonal, el Dominio y las reglas de negocio están en el centro y no dependen de librerías externas:*
  > - *Adaptador Primario (Manejador de entrada): `RentalController` recibe el protocolo HTTP/REST, valida los DTOs y llama al caso de uso.*
  > - *Puerto de Entrada: El contrato de métodos del servicio (`createRental`, `checkToolAvailability`).*
  > - *Núcleo del Dominio: La entidad `Rental` y las reglas de validación de fechas y costos.*
  > - *Puerto de Salida: La interfaz `RentalRepository` define qué métodos de persistencia necesita el dominio sin saber qué base de datos existe.*
  > - *Adaptador Secundario: Spring Data JPA y el motor MySQL 8 implementan la persistencia real detrás del puerto de salida.*
  > *Esto nos permite cambiar la base de datos o el protocolo de comunicación sin tocar una sola línea de la lógica de negocio."*

---

### PREGUNTA 9: "Si ocurre un error inesperado o el usuario envía un dato inválido, ¿qué ve el cliente? ¿Se cae el servidor?"

- **Archivo a mostrar**: [GlobalExceptionHandler.java](file:///backend/src/main/java/com/opusrentals/shared/exception/GlobalExceptionHandler.java) y [ApiResponse.java](file:///backend/src/main/java/com/opusrentals/shared/dto/ApiResponse.java).
- **Qué debes responder**:
  > *"El servidor nunca se cae ni muestra errores crudos de Java (Stack Traces). Todo el sistema está blindado por un manejador global centralizado con la anotación `@RestControllerAdvice` en `GlobalExceptionHandler`:*
  > - *Si el recurso no existe: Lanza `ResourceNotFoundException` y retorna HTTP 404.*
  > - *Si hay conflicto de inventario o fechas ocupadas: Lanza `ConflictException` y retorna HTTP 409.*
  > - *Si faltan campos obligatorios: Intercepta `MethodArgumentNotValidException` y retorna un HTTP 400 con los errores de validación de cada campo.*
  > - *Cualquier error se empaqueta en la clase genérica `ApiResponse<T>`, garantizando que el frontend siempre reciba un contrato JSON predecible con los atributos `success`, `message`, `data` y `timestamp`."*

---

### PREGUNTA 10: "Explíqueme cómo calcula el sistema si una herramienta está disponible cuando hay 5 unidades y sólo 1 está alquilada."

- **Archivo a mostrar**: [RentalService.java:L204-L265](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L204-L265).
- **Qué debes responder**:
  > *"Profesor, diseñamos un algoritmo de disponibilidad multidimensional día a día:*
  > 1. *Filtramos sólo alquileres activos (`PENDING`, `APPROVED`, `IN_PROGRESS`), descartando devueltos o cancelados.*
  > 2. *Iteramos día por día calendario sobre el horizonte de tiempo usando Java 21 Streams:*
  >    ```java
  >    int rentedOnDay = activeRentals.stream()
  >        .filter(r -> !cur.isBefore(r.getStartDate()) && !cur.isAfter(r.getEndDate()))
  >        .mapToInt(r -> r.getQuantity() != null ? r.getQuantity() : 1)
  >        .sum();
  >    ```
  > 3. *Si en un día específico la cantidad alquilada es menor que el total de la flota (`rentedOnDay < totalUnits`, por ejemplo 1 < 5), el día permanece 100% disponible.*
  > 4. *Únicamente cuando `rentedOnDay >= totalUnits` (5 de 5 ocupadas), el día se agrega a un `TreeSet<LocalDate>` y se marca como `FULLY_BOOKED`.*
  > 5. *Luego, el método agrupa los días contiguos completamente agotados y se los entrega al frontend para que el calendario pinte en rojo tachado única y exclusivamente los días donde la flota está al 100% de capacidad."*

---

### PREGUNTA 11: "¿Cómo funciona la facturación y qué impuestos aplican?"

- **Archivo a mostrar**: [RentalService.java:L81-L83](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L81-L83) e [InvoiceService.java](file:///backend/src/main/java/com/opusrentals/modules/billing/service/InvoiceService.java).
- **Qué debes responder**:
  > *"La plataforma implementa la normativa fiscal comercial colombiana:*
  > 1. *Subtotal: Multiplica la tarifa diaria por la duración en días y la cantidad de unidades alquiladas.*
  > 2. *IVA del 19%: Liquidado sobre el subtotal con redondeo bancario (`RoundingMode.HALF_UP`).*
  > 3. *Depósito de Garantía: Se liquida un 10% sobre el valor de reposición del equipo por cada unidad alquilada. Este depósito no constituye ingreso gravable y queda en custodia hasta la devolución del equipo sin daños.*
  > 4. *Generación de Factura: Al crearse la reserva se emite una factura con identificador único legal `OP-INV-XXXX`, código QR de verificación fiscal y estado inicial `PENDING`, la cual se actualiza a `PAID` cuando el cliente realiza el pago en línea."*

---

### PREGUNTA 12: "¿Qué pasa si en el computador de la sustentación no hay Docker ni MySQL instalado?"

- **Archivo a mostrar**: [client.js](file:///frontend/src/api/client.js#L87-L96) y [package.json](file:///package.json#L7).
- **Qué debes responder**:
  > *"La arquitectura fue blindada con un mecanismo de alta disponibilidad y tolerancia a fallos:*
  > 1. *Comando único: Al ejecutar `npm run dev`, el script `start-all.js` intenta levantar Docker si está presente.*
  > 2. *Failover transparente en el frontend: Si el entorno no cuenta con Docker o el backend está apagado, la clase `ApiClient` captura el error de conexión (`Connection Refused`) en 10 milisegundos y conmuta de manera totalmente transparente al almacén mock autónomo (`mock-store.js`).*
  > 3. *Toda la interfaz gráfica, el catálogo, las cotizaciones en tiempo real, el calendario con alertas en rojo, la generación de PDFs y los dashboards de los tres roles funcionan al 100% sin depender de un servidor externo."*

---

### PREGUNTA 13: "¿Dónde se evidencia el uso de Java 21 moderno?"

- **Archivo a mostrar**: [pom.xml:L17](file:///backend/pom.xml#L17) y [RentalService.java:L221-L224](file:///backend/src/main/java/com/opusrentals/modules/rental/service/RentalService.java#L221-L224).
- **Qué debes responder**:
  > *"Aprovechamos las características modernas de Java 21 LTS:*
  > 1. *Compilación con Java 21 en `pom.xml` (`<java.version>21</java.version>`).*
  > 2. *Streams y Lambdas avanzadas para manipulación de colecciones y acumuladores en memoria.*
  > 3. *API de Fechas `java.time` (JSR-310): Uso de `LocalDate`, `ChronoUnit.DAYS` y parsing estricto ISO-8601, eliminando la antigua y vulnerable clase `java.util.Date`.*
  > 4. *Compatibilidad nativa con Virtual Threads (Project Loom) en el runtime de Tomcat para escalabilidad masiva."*

---

### PREGUNTA 14: "¿Cómo está estructurado el Frontend y por qué no usaron React o Angular?"

- **Archivo a mostrar**: [router.js](file:///frontend/src/router.js) y [client.js](file:///frontend/src/api/client.js).
- **Qué debes responder**:
  > *"El proyecto cumple el requerimiento del enunciado de construir una interfaz reactiva basada en HTML, CSS y JavaScript Puro (Vanilla JS ES6 Modules) con Tailwind CSS:*
  > - *Diseñamos una arquitectura Single Page Application (SPA) desde cero con un enrutador hash modular en `router.js`.*
  > - *Demuestra un dominio real de las APIs nativas del navegador (`CustomEvent`, `History API`, `Fetch`, `LocalStorage`, `DOM Manipulation`) sin ocultar la lógica detrás de librerías de terceros.*
  > - *El resultado es una aplicación que pesa menos de 1 MB, arranca instantáneamente y no sufre de sobrecarga de renderizado de Virtual DOM."*

---

### PREGUNTA 15: "¿Cuáles son las credenciales de acceso para probar los tres roles en vivo?"

- **Qué debes responder de memoria**:
  > *"Profesor, todas las cuentas de prueba comparten la contraseña unificada: `password123`:*
  > - *Rol Administrador: `admin@opusrentals.com`*
  > - *Rol Proveedor de Maquinaria: `contacto@caterpillar.com.co`*
  > - *Rol Cliente / Contratista: `carlos.mendoza@constructoraandina.com`"*
