import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get('pacienteId');
  if (!pacienteId) return NextResponse.json({ error: 'pacienteId requerido' }, { status: 400 });

  const notas = await prisma.notaClinica.findMany({
    where: { pacienteId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: notas });
}

export async function POST(req: Request) {
  try {
    const { pacienteId, id, titulo, contenido } = await req.json();
    if (!pacienteId) return NextResponse.json({ error: 'pacienteId requerido' }, { status: 400 });

    let nota;
    if (id) {
      nota = await prisma.notaClinica.update({
        where: { id },
        data: { titulo: titulo ?? '', contenido: contenido ?? '' },
      });
    } else {
      nota = await prisma.notaClinica.create({
        data: { pacienteId, titulo: titulo ?? '', contenido: contenido ?? '' },
      });
    }

    return NextResponse.json({ data: nota });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    await prisma.notaClinica.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
