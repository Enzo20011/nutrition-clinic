import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncAppointmentToCalendar } from '@/lib/googleCalendar';

export async function POST(req: Request) {
  try {
    const { nombre, email, telefono, fecha, hora } = await req.json();

    if (!nombre || !fecha || !hora) {
      return NextResponse.json({ error: 'Nombre, fecha y hora son obligatorios' }, { status: 400 });
    }

    const reserva = await prisma.reserva.upsert({
      where: { fecha_hora_unique: { fecha, hora } },
      update: { nombre, email: email || '', telefono: telefono || '', status: 'confirmada', isDeleted: false },
      create: { nombre, email: email || '', telefono: telefono || '', fecha, hora, status: 'confirmada', isDeleted: false },
    });

    syncAppointmentToCalendar({
      id: reserva.id,
      nombre,
      email: email || '',
      telefono: telefono || '',
      fecha,
      hora,
    }).catch(err => console.error('Calendar sync error:', err));

    return NextResponse.json({ message: 'Turno creado', data: reserva });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un turno en ese horario' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
