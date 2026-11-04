import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoPago } from '@/types/finance';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

export async function GET(req: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get('periodo') || 'mes';

    const now = new Date();
    let fechaFilter: any = {};

    if (periodo === 'mes') {
      fechaFilter = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (periodo === 'mes_anterior') {
      fechaFilter = {
        gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        lte: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    } else if (periodo === 'anio') {
      fechaFilter = { gte: new Date(now.getFullYear(), 0, 1) };
    }

    const ingresos = await prisma.ingreso.findMany({
      where: {
        estado: EstadoPago.PAGADO,
        ...(Object.keys(fechaFilter).length > 0 ? { fecha: fechaFilter } : {}),
      },
      orderBy: { fecha: 'desc' },
    });

    const totalHistorico = ingresos.reduce((acc, curr) => acc + curr.monto, 0);

    const porCategoria = ingresos.reduce((acc: any, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.monto;
      return acc;
    }, {});

    const porMetodo = ingresos.reduce((acc: any, curr) => {
      acc[curr.metodo] = (acc[curr.metodo] || 0) + curr.monto;
      return acc;
    }, {});

    const recientes = ingresos.slice(0, 10);

    return NextResponse.json({
      stats: { totalHistorico, porCategoria, porMetodo, count: ingresos.length },
      recientes,
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas financieras:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
