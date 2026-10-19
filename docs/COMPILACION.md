# COMPILATION AND PACKAGING MANUAL
## Opus Rentals Platform

This document outlines the detailed procedure for compiling, validating, and building the backend (Spring Boot 3 / Java 21) and frontend (Vite / Vanilla JS / Tailwind CSS).

---

## 1. SOFTWARE PREREQUISITES

| Component | Minimum Version | Verification Command |
| :--- | :--- | :--- |
| Java Development Kit (JDK) | OpenJDK 21 LTS | `java -version` |
| Apache Maven | 3.8.x or Maven Wrapper (`mvnw`) | `mvn -v` or `./mvnw -v` |
| Node.js | v18.x or v20.x LTS | `node -v` |
| NPM | v9.x or v10.x | `npm -v` |
| MySQL Server | 8.0+ (Local or Docker) | `mysql --version` |

---

## 2. CONFIGURATION & ENVIRONMENT PROPERTIES

Configure `.env` in the root folder or supply the values directly as system environment variables:

```ini
# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=opus_rentals_db
DB_USER=opus_user
DB_PASSWORD=opus_secure_password_2026

# Backend Application
SERVER_PORT=8080
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:80

# Frontend Client
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 3. BACKEND BUILD PROCEDURE (SPRING BOOT 3)

Source directory: `./backend`

### Clean Artifacts
```bash
cd backend
mvn clean
```
*(On Windows using wrapper: `.\mvnw.cmd clean`)*

### Compile Code
```bash
mvn compile
```

### Run Unit and Integration Tests
```bash
mvn test
```

### Package Executable Artifact
```bash
mvn package -DskipTests
```
*(On Windows using wrapper: `.\mvnw.cmd package -DskipTests`)*

This generates the packaged artifact in the `backend/target/` directory:
- Executable artifact: `backend/target/opus-rentals.war`
- Dual deployment: Configured via Spring Boot 3 `SpringBootServletInitializer` for standalone execution via `java -jar opus-rentals.war` or deployment in Apache Tomcat 10.1+.

---

## 4. FRONTEND BUILD PROCEDURE (VITE)

Source directory: `./frontend`

### Install Dependencies
```bash
cd frontend
npm install
```

### Build Production Bundle
```bash
npm run build
```
This processes and bundles all assets into the `./frontend/dist/` directory, including:
- Minified JavaScript modules.
- Compiled and purged Tailwind CSS stylesheets.
- Public images, fonts, and assets.

---

## 5. REPOSITORY CLEANLINESS & ARTIFACT MANAGEMENT

Ensure build artifacts are never checked into version control:
- Backend: `backend/target/`
- Frontend: `frontend/dist/`, `frontend/node_modules/`
