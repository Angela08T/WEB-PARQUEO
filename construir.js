// Arma panel-admin/index.html a partir de src/ (React + Motion) con Vite, incluyendo logo y
// tipografías para que el panel funcione sin conexión. Uso: node panel-admin/construir.js
const { execSync } = require('child_process'), fs = require('fs'), path = require('path');
const dir = __dirname;
if (!fs.existsSync(path.join(dir, 'node_modules'))) execSync('npm install', { cwd: dir, stdio: 'inherit' });
execSync('npx vite build', { cwd: dir, stdio: 'inherit' });
fs.copyFileSync(path.join(dir, 'dist', 'index.html'), path.join(dir, 'index.html'));
console.log('panel-admin/index.html listo (' + Math.round(fs.statSync(path.join(dir, 'index.html')).size / 1024) + ' KB)');
