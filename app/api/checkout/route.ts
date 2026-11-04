import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { checkoutSchema } from '@/lib/validations/checkout';
import prisma from '@/lib/prisma';
import { MetodoPago, EstadoPago, CategoriaPago } from '@/types/finance';
import client from '@/lib/mercadoPago';
import { Preference } from 'mercadopago';

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { ok, resetAt } = checkRateLimit(`checkout:${ip}`, {
    limit: 10, // Relaxed slightly for real payments
    windowMs: 5 * 60_000,
  });

  if (!ok) {
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Demasiados intentos. Por favor, esperá ${retryAfterSeconds} segundos.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, date, reservaId, monto = 5000 } = validation.data;

    // 1. Create real preference in Mercado Pago
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: reservaId,
            title: `Consulta Nutricional - ${name}`,
            quantity: 1,
            unit_price: monto,
            currency_id: 'ARS',
          }
        ],
        payer: {
          name,
          email,
        },
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/api/checkout/callback?status=success&reserva_id=${reservaId}`,
          failure: `${process.env.NEXTAUTH_URL}/api/checkout/callback?status=failure&reserva_id=${reservaId}`,
          pending: `${process.env.NEXTAUTH_URL}/api/checkout/callback?status=pending&reserva_id=${reservaId}`,
        },
        external_reference: reservaId,
      }
    });

    const mpPreferenceId = response.id;
    const initPoint = response.init_point;

    // 2. Create a PENDING Ingreso in the Finance system
    await prisma.ingreso.create({
      data: {
        concepto: `Reserva de Turno: ${name} (${date})`,
        monto,
        metodo: MetodoPago.MERCADO_PAGO,
        estado: EstadoPago.PENDIENTE,
        categoria: CategoriaPago.CONSULTA,
        referenciaExterna: reservaId,
        mpPreferenceId,
      },
    });

    return NextResponse.json({
      url: initPoint,
      prefId: mpPreferenceId,
      status: 'awaiting_payment'
    });
  } catch (error: any) {
    console.error('CRITICAL: Mercado Pago preference error:', error);
    return NextResponse.json({ error: 'Error al procesar el pago. Por favor intente más tarde.' }, { status: 500 });
  }
}
