import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { manualPaymentSchema } from '@/lib/validations/finance';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

export async function GET() {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const ingresos = await prisma.ingreso.findMany({
      where: { fecha: { gte: startOfMonth } },
      include: { paciente: { select: { nombre: true, apellido: true } } },
      orderBy: { fecha: 'desc' }
    });

    const totalMes = ingresos.reduce((acc, curr) => acc + curr.monto, 0);
    const mpTotal = ingresos
      .filter(i => i.metodo.includes('Mercado Pago'))
      .reduce((acc, curr) => acc + curr.monto, 0);
    const efectivoTotal = ingresos
      .filter(i => i.metodo.includes('Efectivo'))
      .reduce((acc, curr) => acc + curr.monto, 0);

    const movimientos = ingresos.map(i => ({
      id: i.id,
      paciente: i.paciente ? `${i.paciente.nombre} ${i.paciente.apellido}` : 'Vaca', // Fallback or generic
      monto: i.monto,
      metodo: i.metodo,
      estado: i.estado,
      fecha: i.fecha.toLocaleDateString(),
      concepto: i.concepto
    }));

    return NextResponse.json({
      totalMes,
      mpTotal,
      efectivoTotal,
      movimientos
    });
  } catch (error: any) {
    console.error('Finanzas GET Error:', error);
    return NextResponse.json({ error: 'Error fetching finance data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validation = manualPaymentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { pacienteId, ...data } = validation.data;

    const nuevoIngreso = await prisma.ingreso.create({
      data: {
        pacienteId: pacienteId || undefined,
        monto: Number(data.monto),
        metodo: data.metodo || 'Manual',
        categoria: data.categoria || 'Consulta',
        concepto: data.concepto || '',
        fecha: new Date(),
        estado: 'Pagado',
      }
    });

    return NextResponse.json({ success: true, data: nuevoIngreso });
  } catch (error: any) {
    console.error('Finanzas POST Error:', error);
    return NextResponse.json({ error: "Error registrando ingreso" }, { status: 500 });
  }
}
