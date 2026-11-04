import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const pacientes = await prisma.paciente.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { apellido: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query, mode: 'insensitive' } }
        ],
        isDeleted: false
      },
      take: 5,
      select: {
        id: true,
        nombre: true,
        apellido: true
      }
    });

    const data = pacientes.map(p => ({
      id: p.id,
      name: `${p.nombre} ${p.apellido}`
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Search Patients Error:', error);
    return NextResponse.json({ error: 'Error al buscar pacientes' }, { status: 500 });
  }
}
