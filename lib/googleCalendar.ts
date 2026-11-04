import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: SCOPES,
});

const calendarClient = google.calendar({ version: 'v3', auth });

/**
 * Sincroniza una reserva con Google Calendar.
 * Si las credenciales no están configuradas, lo registra en consola (Modo Dev).
 */
export async function syncAppointmentToCalendar(reserva: {
  id?: string; // ID de la reserva en Prisma para evitar duplicados
  nombre: string;
  email: string;
  telefono: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  duracion?: number; // minutos
}) {
  if (!CLIENT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
    console.warn('⚠️ Google Calendar no configurado. Omite sincronización real.');
    return { mock: true, success: true };
  }

  try {
    const startTime = new Date(`${reserva.fecha}T${reserva.hora}:00`);
    const endTime = new Date(startTime.getTime() + (reserva.duracion || 60) * 60000);

    const eventData = {
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
      extendedProperties: {
        private: {
          reservaId: reserva.id || '',
        },
      },
    };

    // 1. Verificar si ya existe un evento para esta reserva
    let existingEventId: string | null | undefined = null;
    if (reserva.id) {
      const existing = await calendarClient.events.list({
        calendarId: CALENDAR_ID,
        privateExtendedProperty: [`reservaId=${reserva.id}`],
      });
      if (existing.data.items && existing.data.items.length > 0) {
        existingEventId = existing.data.items[0].id;
      }
    }

    let response;
    if (existingEventId) {
      console.log(`🔄 Actualizando evento existente en Calendar: ${existingEventId}`);
      response = await calendarClient.events.update({
        calendarId: CALENDAR_ID,
        eventId: existingEventId,
        requestBody: eventData,
      });
    } else {
      console.log(`🆕 Creando nuevo evento en Calendar...`);
      response = await calendarClient.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: eventData,
      });
    }

    console.log(`✅ Sincronización exitosa: ${response.data.id}`);
    return { success: true, googleEventId: response.data.id };
  } catch (error: any) {
    console.error('❌ Error sincronizando con Google Calendar:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los eventos del día para verificar disponibilidad real.
 */
export async function getCalendarEventsForDay(dateStr: string) {
  if (!CLIENT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) {
    return [];
  }

  try {
    const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();

    const response = await calendarClient.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return [];
  }
}

/**
 * Elimina un evento de Google Calendar buscando por el ID de la reserva.
 */
export async function deleteCalendarEventByReservaId(reservaId: string) {
  if (!CLIENT_EMAIL || !PRIVATE_KEY || !CALENDAR_ID) return { success: false };

  try {
    // 1. Buscar el evento que tenga esta reservaId
    const response = await calendarClient.events.list({
      calendarId: CALENDAR_ID,
      privateExtendedProperty: [`reservaId=${reservaId}`],
    });

    const items = response.data.items || [];
    if (items.length === 0) {
      console.log(`ℹ️ No se encontró evento en Calendar para reserva: ${reservaId}`);
      return { success: true, notFound: true };
    }

    // 2. Eliminar cada evento encontrado (usualmente uno)
    for (const event of items) {
      if (event.id) {
        console.log(`🗑️ Eliminando evento de Calendar: ${event.id}`);
        await calendarClient.events.delete({
          calendarId: CALENDAR_ID,
          eventId: event.id,
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error eliminando evento de Calendar:', error.message);
    return { success: false, error: error.message };
  }
}
