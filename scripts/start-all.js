const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.clear();
console.log('\x1b[38;2;19;46;79m%s\x1b[0m', '╔═════════════════════════════════════════════════════════════════╗');
console.log('\x1b[38;2;19;46;79m%s\x1b[0m', '║               OPUS RENTALS · STACK RUNNER                      ║');
console.log('\x1b[38;2;19;46;79m%s\x1b[0m', '╚═════════════════════════════════════════════════════════════════╝');

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Intentar iniciar Base de Datos MySQL y Backend en Docker si Docker está disponible
console.log('\n\x1b[36m[1/3]\x1b[0m Verificando servicios de Backend y Base de Datos (Docker)...');
let dockerStarted = false;
try {
  execSync('docker compose up -d mysql_db backend', { cwd: rootDir, stdio: 'inherit' });
  dockerStarted = true;
  console.log('\x1b[32m  ✔ Contenedores Docker:\x1b[0m opus_mysql_db (3306) y opus_backend (8080) activos.');
} catch (e1) {
  try {
    execSync('docker-compose up -d mysql_db backend', { cwd: rootDir, stdio: 'inherit' });
    dockerStarted = true;
    console.log('\x1b[32m  ✔ Contenedores Docker (legacy compose):\x1b[0m opus_mysql_db (3306) y opus_backend (8080) activos.');
  } catch (e2) {
    console.log('\x1b[33m  [!] Docker no esta disponible o no esta corriendo en este equipo.\x1b[0m');
    console.log('\x1b[33m      La plataforma continuara en modo autonomo con datos interactivos de demostracion.\x1b[0m');
  }
}

// 2. Verificar e instalar dependencias del Frontend automáticamente en un clon limpio
console.log('\n\x1b[36m[2/3]\x1b[0m Verificando dependencias del Frontend...');
const frontendModules = path.join(frontendDir, 'node_modules');
if (!fs.existsSync(frontendModules)) {
  console.log('\x1b[36m  Instalando dependencias de frontend por primera vez (npm install)...\x1b[0m');
  try {
    execSync(`${npmCmd} install`, { cwd: frontendDir, stdio: 'inherit' });
    console.log('\x1b[32m  ✔ Dependencias instaladas con exito.\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m  ✖ Error al instalar dependencias del frontend:\x1b[0m', err.message);
  }
} else {
  console.log('\x1b[32m  ✔ Dependencias del frontend ya instaladas.\x1b[0m');
}

// 3. Levantar Frontend Web (Vite con Hot-Reload)
console.log('\n\x1b[36m[3/3]\x1b[0m Arrancando Frontend Web...');
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

function printDashboard() {
  console.log('\n');
  console.log('\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════');
  console.log('\x1b[1m\x1b[32m%s\x1b[0m', '        SISTEMA OPUS RENTALS ACTIVO Y LISTO PARA LA DEMO          ');
  console.log('\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════');
  console.log('\x1b[36m%s\x1b[0m', '  Frontend Web:       http://localhost:5173');
  if (dockerStarted) {
    console.log('\x1b[36m%s\x1b[0m', '  Backend API:        http://localhost:8080/api/v1 (Docker)');
    console.log('\x1b[36m%s\x1b[0m', '  Swagger OpenAPI:    http://localhost:8080/swagger-ui.html');
    console.log('\x1b[36m%s\x1b[0m', '  Base de Datos:      MySQL 8.0 en puerto 3306 (Docker)');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '  Modo de Datos:      Modo autonomo de respaldo 100% interactivo');
  }
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('  Credenciales Demo:  password123');
  console.log('  Presiona [Ctrl + C] para detener el servidor de desarrollo.');
  console.log('\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════\n');
}

setTimeout(printDashboard, 2000);

// Manejar cierre con Ctrl+C
const cleanExit = () => {
  console.log('\n\x1b[33mDeteniendo frontend...\x1b[0m');
  try { frontend.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
