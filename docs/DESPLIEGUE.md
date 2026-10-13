# GUÍA MAESTRA DE DESPLIEGUE
## Plataforma de Renta de Herramientas y Equipos de Construcción (Opus Rentals)

Este documento detalla las dos alternativas oficiales para poner en producción la plataforma:
1. **Opción 1: Despliegue Contenerizado con Docker & Docker-Compose (Recomendado)**.
2. **Opción 2: Despliegue Nativo en Apache Tomcat 10.1+ (Servidor de Aplicaciones)**.

---

## OPCIÓN 1: DESPLIEGUE CON DOCKER & DOCKER-COMPOSE

Esta opción orquesta de manera autónoma tres contenedores: la base de datos MySQL 8.0 pre-poblada con datos 4FN, el backend en Spring Boot 3 y el frontend servido por Nginx como Single Page Application y reverse proxy.

### 1.1. Prerrequisitos
- **Docker Engine**: versión 20.10+ o Docker Desktop.
- **Docker Compose**: versión 2.0+.

### 1.2. Paso 1: Configurar Variables de Entorno
Asegúrese de que el archivo `.env` exista en la raíz del repositorio (`opus-rentals/.env`):
```bash
cp .env.example .env
```

### 1.3. Paso 2: Construcción y Levantamiento
Desde la raíz del proyecto, ejecute:
```bash
docker compose up -d --build
```

### 1.4. Flujo de Inicialización Automática
1. **`mysql_db`**: Se inicia en el puerto `3306`. Ejecuta automáticamente en orden alfabético los scripts montados en `/docker-entrypoint-initdb.d/`:
   - `01_schema.sql` (Crea el esquema con restricciones 4FN).
   - `02_data.sql` (Puebla 20+ registros por entidad).
   - El contenedor pasa a estado `healthy` tras validar la conectividad con `mysqladmin ping`.
2. **`backend`**: Espera a que `mysql_db` esté saludable (`condition: service_healthy`). Construye el artefacto WAR con Java 21 en la etapa de build y lo ejecuta en un contenedor JRE 21 ligero exponiendo el puerto `8080`.
3. **`frontend`**: Compila los activos React con Node 20 y monta el bundle en Nginx Alpine en el puerto `80`.

### 1.5. Verificación de Contenedores en Ejecución
```bash
docker compose ps
```
Debe observar los tres servicios con estado `running`:
- `opus_mysql_db` (Up, healthy)
- `opus_backend` (Up)
- `opus_frontend` (Up)

Para consultar los logs del sistema:
```bash
docker compose logs -f backend
```

### 1.6. Detención del Entorno
```bash
docker compose down
```

---

## OPCIÓN 2: DESPLIEGUE NATIVO EN APACHE TOMCAT 10.1+

Para desplegar el backend directamente en un servidor de aplicaciones Tomcat nativo en Windows o Linux:

### 2.1. Prerrequisitos
- **Apache Tomcat 10.1.x o superior** (Compatible con Jakarta EE 10 / Servlet 6.0).
- **Java 21 JDK** configurado en la variable `JAVA_HOME`.
- **MySQL Server 8.0** activo en `localhost:3306`.

### 2.2. Paso 1: Inicializar la Base de Datos en MySQL
Ejecute los scripts de inicialización en su gestor de MySQL:
```bash
mysql -u root -p < database/init/01_schema.sql
mysql -u root -p < database/init/02_data.sql
```

### 2.3. Paso 2: Generar el archivo WAR
En la carpeta `backend/`:
```bash
mvn clean package -DskipTests
```
Se obtendrá el archivo `backend/target/opus-rentals.war`.

### 2.4. Paso 3: Configuración de Variables en Tomcat
En Tomcat, declare las variables en `bin/setenv.bat` (Windows) o `bin/setenv.sh` (Linux):

**En Windows (`bin/setenv.bat`):**
```cmd
set "SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/opus_rentals_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
set "SPRING_DATASOURCE_USERNAME=opus_user"
set "SPRING_DATASOURCE_PASSWORD=opus_secure_password_2026"
set "JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
set "JWT_EXPIRATION_MS=86400000"
set "JAVA_OPTS=-Xms512m -Xmx1024m"
```

### 2.5. Paso 4: Despliegue del archivo WAR
Copie `backend/target/opus-rentals.war` a la carpeta `webapps/` de su Tomcat:
```bash
cp backend/target/opus-rentals.war $CATALINA_HOME/webapps/
```
Tomcat desplegará el contexto automáticamente en:
```text
http://localhost:8080/opus-rentals/
```

---

## 3. URLs DE ACCESO A LOS SERVICIOS

| Servicio | Entorno Docker | Entorno Tomcat Nativo |
| :--- | :--- | :--- |
| **Frontend Web** | `http://localhost` (Puerto 80) | `http://localhost:5173` (Dev server) |
| **Backend API** | `http://localhost:8080/api/v1` | `http://localhost:8080/opus-rentals/api/v1` |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` | `http://localhost:8080/opus-rentals/swagger-ui.html` |
| **OpenAPI Docs** | `http://localhost:8080/v3/api-docs` | `http://localhost:8080/opus-rentals/v3/api-docs` |
| **MySQL Database** | `localhost:3306` (`opus_rentals_db`) | `localhost:3306` (`opus_rentals_db`) |

---

## 4. CREDENCIALES DE PRUEBA POR ROL

| Rol | Correo Electrónico | Contraseña | Perfil / Capacidades |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@opusrentals.com` | `password123` | Supervisión total, KPIs financieros, auditoría y control de usuarios. |
| **PROVEEDOR** | `provider.caterpillar@opusrentals.com` | `password123` | Gestión de inventario de equipos, aprobación de reservas y actas de daños 4FN. |
| **CLIENTE** | `client.carlos@gmail.com` | `password123` | Catálogo interactivo, creación de reservas, checkout en línea y facturas. |
