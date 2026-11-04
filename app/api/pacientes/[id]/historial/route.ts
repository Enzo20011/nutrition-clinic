import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pacienteId = params.id;

    const [anamnesis, antropometrias, planes] = await Promise.all([
      prisma.anamnesis.findMany({
        where: { pacienteId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, motivoConsulta: true }
      }),
      prisma.antropometria.findMany({
        where: { pacienteId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, peso: true }
      }),
      prisma.planAlimentario.findMany({
        where: { pacienteId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, objetivoCalorico: true }
      })
    ]);

    // Unificar y Tipar para el Frontend
    const historial = [
      ...anamnesis.map(a => ({
        id: a.id,
        tipo: 'CONSULTA',
        titulo: a.motivoConsulta || 'Consulta Nutricional',
        fecha: a.createdAt,
        detalle: 'Registro de Anamnesis'
      })),
      ...antropometrias.map(a => ({
        id: a.id,
        tipo: 'ANTROPOMETRIA',
        titulo: `Control de Peso: ${a.peso}kg`,
        fecha: a.createdAt,
        detalle: 'Mediciones Corporales'
      })),
      ...planes.map(p => ({
        id: p.id,
        tipo: 'PLAN',
        titulo: `Plan Alimentario: ${p.objetivoCalorico} kcal`,
        fecha: p.createdAt,
        detalle: 'Nuevo Plan Nutricional'
      }))
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return NextResponse.json({ data: historial });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: 'Error al cargar el historial' }, { status: 500 });
  }
}
