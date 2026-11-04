import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncAppointmentToCalendar } from '@/lib/googleCalendar';

export async function POST(req: Request) {
  try {
    const { name, email, phone, fecha, hora, sessionId } = await req.json();
    // Log removed

    if (!name || !email || !phone || !fecha || !hora || !sessionId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 1. Verify the lock belongs to this session and is still valid
    const lock = await prisma.slotLock.findFirst({
      where: { fecha, hora, sessionId, expiresAt: { gt: new Date() } }
    });
    
    if (!lock) {
      // Log removed
      return NextResponse.json({ error: 'La sesión de reserva ha expirado. Intente nuevamente.' }, { status: 410 });
    }
    // Log removed

    // 2. Upsert the Reserva — reutiliza si ya existe una pendiente para ese slot
    const nuevaReserva = await prisma.reserva.upsert({
      where: { fecha_hora_unique: { fecha, hora } },
      update: { nombre: name, email, telefono: phone, status: 'confirmada', isDeleted: false },
      create: { nombre: name, email, telefono: phone, fecha, hora, status: 'confirmada', isDeleted: false },
    });

    // 3. Delete lock + sync calendar in parallel (don't block response)
    prisma.slotLock.delete({ where: { id: lock.id } }).catch(() => {});
    syncAppointmentToCalendar({ 
      id: nuevaReserva.id, 
      nombre: name, 
      email, 
      telefono: phone, 
      fecha, 
      hora 
    }).catch(err => console.error('Silent Calendar Sync Error:', err));

    return NextResponse.json({ 
      message: 'Reserva creada con éxito', 
      reservaId: nuevaReserva.id 
    });

  } catch (error: any) {
    console.error('Error creating reserva:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
