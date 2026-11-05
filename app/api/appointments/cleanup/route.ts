import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteCalendarEventByReservaId } from '@/lib/googleCalendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    // 1. Verificar sesión de administrador
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    // Umbral de 2 horas (en milisegundos)
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    // 2. Obtener todas las reservas NO completadas
    const activeReservas = await prisma.reserva.findMany({
      where: {
        status: { notIn: ['completada', 'cancelada'] },
        isDeleted: false,
      },
    });

    const toProcess = activeReservas.filter((res) => {
      // Reconstruir objeto fecha con hora
      const [year, month, day] = res.fecha.split('-').map(Number);
      const [hours, minutes] = res.hora.split(':').map(Number);
      const startTime = new Date(year, month - 1, day, hours, minutes);
      
      // Si el inicio + 2 horas es menor que "ahora", está lista para limpieza
      return startTime.getTime() + TWO_HOURS_MS < now.getTime();
    });

    console.log(`🧹 Iniciando limpieza de ${toProcess.length} turnos pasados...`);

    const results: any[] = [];

    for (const res of toProcess) {
      // A. Eliminar de Google Calendar
      await deleteCalendarEventByReservaId(res.id);

      // B. Marcar como completada en la DB
      await prisma.reserva.update({
        where: { id: res.id },
        data: { status: 'completada' }
      });

      results.push({ id: res.id, nombre: res.nombre });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results
    });

  } catch (error: any) {
    console.error('❌ Error en cleanup de citas:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
