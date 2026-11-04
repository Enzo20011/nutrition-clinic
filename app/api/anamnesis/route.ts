import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { anamnesisSchema, draftAnamnesisSchema } from '@/schemas/anamnesisSchema';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

export async function GET(request: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');

    if (!pacienteId) return NextResponse.json({ error: 'pacienteId requerido' }, { status: 400 });

    const anamnesis = await prisma.anamnesis.findFirst({
      where: { pacienteId: String(pacienteId), isDeleted: false },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ data: anamnesis || null });
  } catch (error: any) {
    console.error('Anamnesis GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const isDraft = body.isDraft === true;
    
    const schema = isDraft ? draftAnamnesisSchema : anamnesisSchema;
    const validation = schema.safeParse(body);

    if (!validation.success && !isDraft) {
      return NextResponse.json({ 
        message: 'Error de validación', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const dataToSave = validation.success ? validation.data : body;
    const targetId = String(dataToSave.pacienteId || body.pacienteId).trim();

    if (!targetId) {
      return NextResponse.json({ message: 'pacienteId es requerido' }, { status: 400 });
    }

    // 5. Mapear explícitamente los campos para evitar ValidationError de Prisma
    const finalData: any = {
      pacienteId: targetId,
      isDraft,
      isDeleted: false,
      motivoConsulta: dataToSave.motivoConsulta,
      ocupacion: dataToSave.ocupacion,
      patologias: dataToSave.patologias,
      alergiasIntolerancias: dataToSave.alergiasIntolerancias,
      medicacionActual: dataToSave.medicacionActual,
      nivelActividad: dataToSave.nivelActividad,
      horasSueno: dataToSave.horasSueno ? Number(dataToSave.horasSueno) : null,
      nivelEstres: dataToSave.nivelEstres ? Number(dataToSave.nivelEstres) : null,
      aversionesAlimentarias: dataToSave.aversionesAlimentarias,
      ritmoIntestinal: dataToSave.ritmoIntestinal,
      peso: dataToSave.peso ? Number(dataToSave.peso) : null,
      altura: dataToSave.altura ? Number(dataToSave.altura) : null,
      edad: dataToSave.edad ? Number(dataToSave.edad) : null,
      sexo: dataToSave.sexo,
      caloriasObjetivo: dataToSave.caloriasObjetivo != null ? Number(dataToSave.caloriasObjetivo) : null,
      caloriasOffset: dataToSave.caloriasOffset != null ? Number(dataToSave.caloriasOffset) : null,
      macrosCarbos: dataToSave.macrosCarbos != null ? Number(dataToSave.macrosCarbos) : null,
      macrosProteinas: dataToSave.macrosProteinas != null ? Number(dataToSave.macrosProteinas) : null,
      macrosGrasas: dataToSave.macrosGrasas != null ? Number(dataToSave.macrosGrasas) : null,
    };

    // Buscar registro existente para hacer upsert
    const existing = await prisma.anamnesis.findFirst({
      where: { pacienteId: targetId, isDeleted: false }
    });
    let doc: any;

    if (existing) {
      doc = await prisma.anamnesis.update({
        where: { id: existing.id },
        data: finalData
      });
    } else {
      doc = await prisma.anamnesis.create({
        data: finalData
      });
    }

    // ACTUALIZAR REGISTRO RAÍZ DEL PACIENTE
    // Solo si no es un borrador y tenemos los datos esenciales
    if (!isDraft && finalData.peso && finalData.altura) {
      try {
        await prisma.paciente.update({
          where: { id: targetId },
          data: {
            peso: Number(finalData.peso),
            altura: Number(finalData.altura)
          }
        });
      } catch (e) {
        console.error('Error actualizando paciente desde anamnesis:', e);
      }
    }

    return NextResponse.json({ 
      message: isDraft ? 'Borrador guardado' : 'Guardado finalizado', 
      data: doc 
    });
  } catch (error: any) {
    console.error('Anamnesis POST Error:', error);
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}
