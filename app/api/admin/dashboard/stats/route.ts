import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, startOfToday, format } from 'date-fns';

export async function GET() {
  try {
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const monthStart = startOfMonth(new Date());

    // 1. Total Pacientes
    const totalPacientes = await prisma.paciente.count({
      where: { isDeleted: false }
    });

    // 2. Agenda de Hoy
    const agendaHoy = await prisma.reserva.count({
      where: { 
        fecha: today,
        isDeleted: false 
      }
    });

    // 3. Próximas Sesiones (Próximas 5 del día)
    const reservasHoy = await prisma.reserva.findMany({
      where: {
        fecha: today,
        isDeleted: false
      },
      orderBy: {
        hora: 'asc'
      },
      take: 5
    });

    // Resolver pacienteId para cada reserva buscando por email
    const proximasSesiones = await Promise.all(
      reservasHoy.map(async (reserva) => {
        const paciente = await prisma.paciente.findFirst({
          where: { email: reserva.email, isDeleted: false },
          select: { id: true }
        });
        return { ...reserva, pacienteId: paciente?.id ?? null };
      })
    );

    // 4. Ingresos del Mes (Sumatoria de Ingresos Confirmados)
    const ingresos = await prisma.ingreso.aggregate({
      where: {
        fecha: { gte: monthStart },
        estado: 'Pagado'
      },
      _sum: {
        monto: true
      }
    });

    // 5. Crecimiento (Simulado o real si tuviéramos datos de meses anteriores)
    // Por ahora devolvemos el monto total del mes como valor de referencia
    const montoMensual = ingresos._sum.monto || 0;

    return NextResponse.json({
      totalPacientes,
      agendaHoy,
      proximasSesiones,
      montoMensual,
      proximoTurno: proximasSesiones[0] || null
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ error: 'Error al cargar estadísticas' }, { status: 500 });
  }
}
