# GUÍA DE COMPILACIÓN Y CONSTRUCCIÓN
## Plataforma de Renta de Herramientas y Equipos de Construcción (Opus Rentals)

Este documento detalla el procedimiento exhaustivo para compilar, probar y empaquetar tanto el backend en **Spring Boot 3 (Java 21)** como el frontend en **React (Vite + Tailwind CSS)**.

---

## 1. Prerrequisitos de Software

Para compilar el proyecto en una máquina de desarrollo local se requiere:

| Componente | Versión Mínima Requerida | Comando de Verificación |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | OpenJDK 17 o 21 (Recomendado JDK 21 LTS) | `java -version` |
| **Apache Maven** | 3.8.x o superior (o usar Maven Wrapper `mvnw`) | `mvn -v` o `./mvnw -v` |
| **Node.js** | v18.x o v20.x LTS | `node -v` |
| **NPM** | v9.x o v10.x | `npm -v` |
| **MySQL Server** | MySQL 8.0+ (o mediante Docker) | `mysql --version` |

---

## 2. Variables de Entorno y Configuración

Antes de compilar, configure el archivo `.env` en la raíz del repositorio o cree las variables de entorno del sistema.

### Plantilla de Variables:
```ini
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=opus_rentals_db
DB_USER=opus_user
DB_PASSWORD=opus_secure_password_2026

# Backend
SERVER_PORT=8080
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:80

# Frontend
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 3. Compilación del Backend (Spring Boot 3)

Ubicación del código fuente: `./backend/`

### 3.1. Limpieza de artefactos previos
```bash
cd backend
mvn clean
```
*(O si utiliza Maven Wrapper en Windows: `.\mvnw.cmd clean`)*

### 3.2. Compilación del código fuente
```bash
mvn compile
```

### 3.3. Ejecución de pruebas unitarias y de integración
Para ejecutar la suite de pruebas automatizadas:
```bash
mvn test
```

### 3.4. Empaquetado del Artefacto (WAR ejecutable y desplegable)
El archivo `backend/pom.xml` está configurado con `<packaging>war</packaging>` y la dependencia de Tomcat como provista para permitir tanto la ejecución independiente como el despliegue nativo en un contenedor de servlets externo:

- **Empaquetado saltando tests:**
  ```bash
  mvn clean package -DskipTests
  ```

- **Empaquetado validando tests:**
  ```bash
  mvn clean package
  ```

El artefacto compilado se generará en la ruta:
```text
backend/target/opus-rentals.war
```

### 3.5. Ejecución local del Backend en modo desarrollo
Para levantar el servidor embebido durante el desarrollo:
```bash
mvn spring-boot:run
```
El servidor responderá en `http://localhost:8080/`.

---

## 4. Compilación del Frontend (React + Vite)

Ubicación del código fuente: `./frontend/`

### 4.1. Instalación de dependencias de Node
```bash
cd frontend
npm install
```

### 4.2. Ejecución en modo desarrollo (Hot-Reload)
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173/`.

### 4.3. Generación del Bundle de Producción
Para compilar y minificar los activos estáticos para despliegue en servidor web (Nginx o Apache):
```bash
npm run build
```
Los archivos optimizados para producción se generarán en la carpeta:
```text
frontend/dist/
```

### 4.4. Previsualización del Build de Producción localmente
```bash
npm run preview
```

---

## 5. Verificación de Artefactos de Salida

Tras completar la compilación de ambos proyectos, verifique la existencia de los siguientes entregables:

1. **Backend**: `backend/target/opus-rentals.war` (Tamaño aproximado: ~45MB - 55MB con todas las librerías necesarias).
2. **Frontend**: `frontend/dist/index.html` y la carpeta `frontend/dist/assets/` con los archivos JavaScript y CSS minificados.
