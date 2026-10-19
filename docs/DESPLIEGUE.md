# DEPLOYMENT AND ORCHESTRATION GUIDE
## Opus Rentals Platform

This guide outlines deployment options for local development, containerized staging, and production hosting:
1. Containerized deployment via Docker and Docker Compose (Recommended).
2. Native deployment on Apache Tomcat 10.1+ application server.

---

## 1. DOCKER & DOCKER COMPOSE DEPLOYMENT

The orchestration config in `docker-compose.yml` provisions three isolated services:
- `mysql_db`: MySQL 8.0 server with automated schema initialization.
- `backend`: Spring Boot 3 on Eclipse Temurin JRE 21.
- `frontend`: Single Page Application served by Nginx 1.27 Alpine.

### Prerequisites
- Docker Engine 24.0+ or Docker Desktop.
- Docker Compose v2.0+.

### Step 1: Environment Setup
Ensure environment parameters exist in `.env`:
```bash
cp .env.example .env
```

### Step 2: Build and Run Services
From the repository root:
```bash
docker compose up -d --build
```

### Initialization Order & Health Checks
1. `mysql_db` starts on port `3306` and mounts scripts from `database/init/`:
   - `01_schema.sql` (16 normalized tables and constraints).
   - `02_data.sql` (Seed data for categories, roles, and baseline assets).
   - Container health is monitored via `mysqladmin ping`.
2. `backend` starts only after `mysql_db` reports healthy. It compiles the source code via Maven inside a multi-stage Dockerfile and exposes port `8080`.
3. `frontend` builds the client bundle via Vite and deploys static files to Nginx on port `80`.

### Service Verification
```bash
docker compose ps
```
All services should report `Up`:
- `opus_mysql_db` (Up, healthy)
- `opus_backend` (Up)
- `opus_frontend` (Up)

### Inspect Container Logs
```bash
docker compose logs -f backend
```

### Teardown
```bash
docker compose down
```
To purge persistent volume data:
```bash
docker compose down -v
```

---

## 2. NATIVE APACHE TOMCAT 10.1+ DEPLOYMENT

### Step 1: Build the WAR Package
```bash
cd backend
mvn clean package -DskipTests
```
*(On Windows using wrapper: `.\mvnw.cmd clean package -DskipTests`)*

The file `target/opus-rentals.war` is generated.

### Step 2: Deploy to Tomcat
1. Copy `target/opus-rentals.war` to `$CATALINA_HOME/webapps/ROOT.war` (or your chosen context path).
2. Set JVM database and JWT environment variables in `$CATALINA_HOME/bin/setenv.sh` (or `setenv.bat`).
3. Start Tomcat:
   ```bash
   $CATALINA_HOME/bin/startup.sh
   ```

---

## 3. NETWORK TOPOLOGY & PORTS

| Service | Container Internal Port | Host Port | Protocol | Description |
| :--- | :--- | :--- | :--- | :--- |
| MySQL Database | 3306 | 3306 | TCP | Relational database instance |
| Spring Boot Backend | 8080 | 8080 | HTTP | REST API and OpenAPI Swagger |
| Frontend Nginx | 80 | 80 | HTTP | Static asset delivery and SPA routing |
| Frontend Dev Server | 5173 | 5173 | HTTP | Vite development server with HMR |
