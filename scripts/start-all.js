const { spawn, execSync } = require('child_process');
const path = require('path');

console.clear();
console.log('\x1b[38;2;19;46;79m%s\x1b[0m', '╔═════════════════════════════════════════════════════════════════╗');
console.log('\x1b[38;2;19;46;79m%s\x1b[0m', '║               ⚡ OPUS RENTALS · STACK RUNNER                   ║');
console.log('\x1b[38;2;19;46;79m%s\x1b[0m', '╚═════════════════════════════════════════════════════════════════╝');

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// 1. Asegurar contenedores de Docker (Base de Datos MySQL + Backend Spring Boot)
console.log('\n\x1b[36m[1/2]\x1b[0m Iniciando Base de Datos MySQL y Backend Spring Boot en Docker...');
try {
  execSync('docker compose up -d mysql_db backend', { cwd: rootDir, stdio: 'inherit' });
  console.log('\x1b[32m  ✔ Docker Containers:\x1b[0m \x1b[1mopus_mysql_db\x1b[0m (3306) y \x1b[1mopus_backend\x1b[0m (8080) listos.');
} catch (err) {
  console.log('\x1b[31m  ✖ Error al conectar con Docker. Asegúrate de tener Docker Desktop abierto.\x1b[0m');
}

// 2. Levantar Frontend Vite con Hot Reload local
console.log('\n\x1b[36m[2/2]\x1b[0m Arrancando Frontend Web (Vite + Tailwind CSS)...');
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

function printDashboard() {
  console.log('\n');
  console.log('\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════');
  console.log('\x1b[1m\x1b[32m%s\x1b[0m', '        🚀  ¡TODO EL SISTEMA OPUS RENTALS ESTÁ ACTIVO!             ');
  console.log('\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════');
  console.log('\x1b[36m%s\x1b[0m', '  🌐  Frontend Web:       \x1b[1m\x1b[34mhttp://localhost:5173\x1b[0m (Hot Reload)');
  console.log('\x1b[36m%s\x1b[0m', '  ⚙️   Backend API:        \x1b[1m\x1b[34mhttp://localhost:8080/api/v1\x1b[0m (Docker)');
  console.log('\x1b[36m%s\x1b[0m', '  📄  Swagger / Docs:     \x1b[1m\x1b[34mhttp://localhost:8080/swagger-ui.html\x1b[0m');
  console.log('\x1b[36m%s\x1b[0m', '  🗄️   Docker Database:    \x1b[1m\x1b[32mopus_mysql_db\x1b[0m (localhost:3306)');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('\x1b[90m%s\x1b[0m', '  Presiona [Ctrl + C] para detener el servidor de desarrollo.');
  console.log('\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════\n');
}

setTimeout(printDashboard, 1500);

// Manejar cierre
const cleanExit = () => {
  console.log('\n\x1b[33mDeteniendo frontend...\x1b[0m');
  try { frontend.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
