import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

export async function GET(request: Request) {
  try {
    const session = await getValidSession();
    if (!session) return unauthorizedResponse();
    
    const { searchParams } = new URL(request.url);
    const pId = searchParams.get('pacienteId');
    if (!pId) return NextResponse.json({ error: 'pacienteId requerido' }, { status: 400 });

    const data = await prisma.antropometria.findMany({
      where: { pacienteId: String(pId) },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ data });
  } catch(e: any) {
    console.error('Biometria GET Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getValidSession();
    if (!session) return unauthorizedResponse();
    
    const body = await request.json();
    const { antropometriaSchema } = await import('@/schemas/antropometriaSchema');
    const validation = antropometriaSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validación fallida', 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { pacienteId: rawId, ...data } = validation.data;
    const pId = String(rawId);
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.antropometria.findFirst({
      where: {
        pacienteId: pId,
        createdAt: { gte: startOfDay }
      }
    });

    const finalData = {
      peso: Number(data.peso),
      altura: Number(data.altura),
      pliegues: data.pliegues || {},
      perimetros: data.perimetros || {},
      resultados: data.resultados || {},
    };

    let doc: any;

    if (existing) {
      doc = await prisma.antropometria.update({
        where: { id: existing.id },
        data: finalData
      });
    } else {
      doc = await prisma.antropometria.create({
        data: {
          pacienteId: pId,
          ...finalData
        }
      });
    }

    // ACTUALIZAR REGISTRO RAÍZ DEL PACIENTE
    if (finalData.peso && finalData.altura) {
      try {
        await prisma.paciente.update({
          where: { id: pId },
          data: {
            peso: Number(finalData.peso),
            altura: Number(finalData.altura)
          }
        });
      } catch (e) {
        console.error('Error actualizando paciente desde biometria:', e);
      }
    }

    return NextResponse.json({ data: doc });
  } catch(e: any) {
    console.error('Biometria POST Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
