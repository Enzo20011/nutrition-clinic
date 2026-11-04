import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@/types/finance';
import { sendPaymentConfirmation } from '@/lib/email';
import { syncAppointmentToCalendar } from '@/lib/googleCalendar';

/**
 * REAL MERCADO PAGO CALLBACK
 * Handles redirection after payment (Success, Failure, Pending).
 */
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3005';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Real Mercado Pago Query Params
  const status = searchParams.get('status') || searchParams.get('collection_status');
  const reservaId = searchParams.get('reserva_id') || searchParams.get('external_reference');
  const preferenceId = searchParams.get('preference_id');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');

  if (!reservaId || !status) {
    return NextResponse.redirect(new URL('/?error=missing_payment_data', BASE_URL));
  }

  try {
    if (status === 'approved' || status === 'success') {
      // 1+2. Confirm ingreso and reserva in parallel
      const [, reserva] = await Promise.all([
        prisma.ingreso.updateMany({
          where: {
            OR: [
              { mpPreferenceId: preferenceId ?? undefined },
              { referenciaExterna: reservaId },
            ],
          },
          data: { estado: EstadoPago.PAGADO, turnoId: paymentId || undefined },
        }),
        prisma.reserva.update({
          where: { id: reservaId },
          data: { status: 'confirmada' },
        }),
      ]);

      // 3. Send email and sync calendar async — no bloquea el redirect
      if (reserva) {
        if (reserva.email) {
          sendPaymentConfirmation(reserva.email, 5000).catch(err =>
            console.error('Email error:', err)
          );
        }
        // 4. Sincronizar con Google Calendar (sin bloquear la respuesta)
        syncAppointmentToCalendar({
          id: reservaId,
          nombre: reserva.nombre,
          email: reserva.email,
          telefono: reserva.telefono,
          fecha: reserva.fecha,
          hora: reserva.hora
        }).catch(err => console.error('Silent Calendar Sync Error:', err));
      }

      return NextResponse.redirect(new URL(`/success?booking=confirmed&reserva=${reservaId}`, BASE_URL));
    } else {
      // Payment failed or pending
      console.warn(`Payment not approved. Status: ${status}`);
      return NextResponse.redirect(new URL(`/?error=payment_failed&reserva=${reservaId}`, BASE_URL));
    }
  } catch (error: any) {
    console.error('Error in payment callback:', error);
    return NextResponse.redirect(new URL('/?error=internal_callback_error', BASE_URL));
  }
}
