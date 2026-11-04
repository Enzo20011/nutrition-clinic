const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

function loadEnv() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();
const CLIENT_EMAIL = env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CALENDAR_ID = env.GOOGLE_CALENDAR_ID;

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

async function reSync(id) {
  try {
    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      console.error('❌ Reserva not found:', id);
      return;
    }

    console.log(`Syncing reserva: ${reserva.nombre} (${reserva.fecha} ${reserva.hora})...`);

    const startTime = new Date(`${reserva.fecha}T${reserva.hora}:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60000);

    const event = {
      summary: `Nutrición: ${reserva.nombre}`,
      description: `Paciente: ${reserva.nombre}\nEmail: ${reserva.email}\nTel: ${reserva.telefono}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      status: 'confirmed',
    };

    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    console.log('✅ Synchronized! Event ID:', res.data.id);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

const id = process.argv[2] || 'cmn7hrp4h00001xurhlkvsssk';
reSync(id);
