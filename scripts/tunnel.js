#!/usr/bin/env node
/**
 * Levanta ngrok en el puerto 3005 y actualiza NEXTAUTH_URL en .env.local
 * Uso: node scripts/tunnel.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env.local');
const PORT = 3005;

async function getNgrokUrl() {
  // Espera a que ngrok levante su API local
  for (let i = 0; i < 20; i++) {
    try {
      const res = execSync('curl -s http://127.0.0.1:4040/api/tunnels', { timeout: 3000 }).toString();
      const data = JSON.parse(res);
      const tunnel = data.tunnels?.find(t => t.proto === 'https');
      if (tunnel) return tunnel.public_url;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('No se pudo obtener la URL de ngrok después de 20 intentos.');
}

function updateEnv(url) {
  let content = fs.readFileSync(ENV_PATH, 'utf8');
  content = content.replace(/^NEXTAUTH_URL=.*/m, `NEXTAUTH_URL=${url}`);
  fs.writeFileSync(ENV_PATH, content, 'utf8');
  console.log(`\n✅ NEXTAUTH_URL actualizada a: ${url}\n`);
}

async function main() {
  console.log(`🚇 Iniciando ngrok en puerto ${PORT}...`);

  const ngrok = spawn('ngrok', ['http', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  ngrok.stdout.on('data', d => process.stdout.write(d));
  ngrok.stderr.on('data', d => process.stderr.write(d));
  ngrok.on('error', err => { console.error('Error al iniciar ngrok:', err.message); process.exit(1); });

  // Esperar a que ngrok esté listo
  await new Promise(r => setTimeout(r, 2000));

  try {
    const url = await getNgrokUrl();
    updateEnv(url);
    console.log(`🔗 URL pública: ${url}`);
    console.log(`📦 Ahora levantá el servidor con: npm run dev`);
    console.log(`\n⚠️  Al terminar, restaurá NEXTAUTH_URL en .env.local\n`);
  } catch (err) {
    console.error('❌', err.message);
    ngrok.kill();
    process.exit(1);
  }

  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando ngrok...');
    ngrok.kill();
    process.exit(0);
  });
}

main();
