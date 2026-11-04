import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');

    if (!fecha) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    // 1. Get confirmed appointments from PostgreSQL
    const confirmedAppointments = await prisma.reserva.findMany({
      where: { 
        fecha, 
        status: 'confirmada',
        isDeleted: false 
      },
      select: { hora: true }
    });

    // 2. Get active temporary locks
    const activeLocks = await prisma.slotLock.findMany({
      where: { 
        fecha,
        expiresAt: { gt: new Date() } 
      },
      select: { hora: true }
    });

    const takenSlots = [
      ...confirmedAppointments.map(a => a.hora),
      ...activeLocks.map(l => l.hora)
    ];

    return NextResponse.json({ takenSlots: Array.from(new Set(takenSlots)) });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
