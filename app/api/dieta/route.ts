import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dietaSchema } from '@/lib/validations/dieta';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

export async function GET(request: Request) {
  try {
    const session = await getValidSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');
    
    if (!pacienteId) return NextResponse.json({ error: 'Falta pacienteId' }, { status: 400 });

    const plan = await prisma.planAlimentario.findFirst({
      where: { pacienteId: String(pacienteId) },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: plan });
  } catch (e: any) {
    console.error('PlanAlimentario GET Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getValidSession();
    if (!session) return unauthorizedResponse();
    
    const body = await request.json();
    const validation = dietaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validación fallida', 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { pacienteId: rawId, ...data } = validation.data;
    const pId = String(rawId);
    
    // Buscamos si ya existe un plan para actualizarlo o creamos uno nuevo
    const existing = await prisma.planAlimentario.findFirst({
      where: { pacienteId: pId }
    });

    let plan;
    const finalData = {
      objetivoCalorico: Number(data.objetivoCalorico),
      comidas: data.comidas || [],
      macrosObjetivo: data.macrosObjetivo || { p: 0, c: 0, f: 0 },
      tablaManual: data.tablaManual || [],
      recomendaciones: data.recomendaciones || [],
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
    };

    if (existing) {
      plan = await prisma.planAlimentario.update({
        where: { id: existing.id },
        data: finalData
      });
    } else {
      plan = await prisma.planAlimentario.create({
        data: {
          pacienteId: pId,
          ...finalData
        }
      });
    }

    return NextResponse.json({ data: plan });
  } catch (e: any) {
    console.error('PlanAlimentario POST Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
