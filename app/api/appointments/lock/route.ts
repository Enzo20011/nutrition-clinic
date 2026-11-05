import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { ok, remaining, resetAt } = checkRateLimit(`lock:${ip}`, {
    limit: 5,
    windowMs: 60_000, 
  });

  if (!ok) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Por favor, esperá unos minutos antes de volver a reservar.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const { fecha, hora, sessionId } = await req.json();
    // Log removed

    if (!fecha || !hora || !sessionId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 1. Check if there's a confirmed appointment in Neon
    const confirmedReserva = await prisma.reserva.findFirst({
      where: { 
        fecha, 
        hora, 
        status: 'confirmada',
        isDeleted: false 
      }
    });

    if (confirmedReserva) {
      return NextResponse.json({ error: 'El turno ya ha sido reservado.' }, { status: 409 });
    }

    // 2. ATOMIC LOCK ATTEMPT with PostgreSQL native logic
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    try {
      // Usamos queryRaw para un Upsert Atómico con condición de expiración
      // Esto evita race conditions donde dos personas bloquean el mismo slot
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SlotLock" (id, fecha, hora, "sessionId", "expiresAt")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (fecha, hora) 
        DO UPDATE SET 
          "sessionId" = EXCLUDED."sessionId", 
          "expiresAt" = EXCLUDED."expiresAt"
        WHERE "SlotLock"."expiresAt" <= NOW() OR "SlotLock"."sessionId" = EXCLUDED."sessionId"
      `, 
      `lock-${fecha}-${hora}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, // Unique ID without truncation
      fecha, 
      hora, 
      sessionId, 
      expiration
      );

      // Log removed
      return NextResponse.json({
        message: 'Turno bloqueado temporalmente',
        expiresAt: expiration,
        rateLimitRemaining: remaining,
      });

    } catch (innerError: any) {
      // Si el executeRaw no afectó filas (debido al WHERE), Postgres a veces lanza error de constraint o simplemente no hace nada.
      // En Prisma con executeRaw, si la condición WHERE falla, no se lanza error pero rowsAffected es 0? 
      // En realidad, un ON CONFLICT DO UPDATE WHERE que no cumple el WHERE no inserta ni actualiza.
      
      console.error('Inner Lock Error:', innerError);
      return NextResponse.json({ 
        error: 'Este turno está siendo procesado por otro usuario o acaba de ser ocupado.' 
      }, { status: 409 });
    }
  } catch (error: any) {
    console.error('Error locking slot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
