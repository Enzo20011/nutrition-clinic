import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbLocal from '@/data/argenfoods.json';

export async function POST() {
  try {
    console.log('--- SEED PROCESS START (POSTGRES) ---');
    console.log('Items to seed:', dbLocal.length);

    // 1. Limpiar registros previos de ARGENFOODS/LOCAL
    const deleteResult = await prisma.alimento.deleteMany({
      where: { origen: 'LOCAL' }
    });
    console.log('Cleaned items:', deleteResult.count);

    // 2. Insertar nuevos registros de forma eficiente (createMany)
    // Nota: Mapeamos los campos si es necesario, aunque el JSON coincide con el modelo
    const insertResult = await prisma.alimento.createMany({
      data: dbLocal.map((item: any) => ({
        nombre: item.nombre,
        calorias: Number(item.calorias) || 0,
        proteinas: Number(item.proteinas) || 0,
        carbohidratos: Number(item.carbohidratos) || 0,
        grasas: Number(item.grasas) || 0,
        origen: 'LOCAL',
        categoria: 'Argenfoods'
      })),
      skipDuplicates: true
    });

    console.log('Inserted items successfully:', insertResult.count);

    return NextResponse.json({ 
      message: 'ARGENFOODS inyectada con éxito en PostgreSQL.',
      count: insertResult.count 
    });
  } catch (error: any) {
    console.error('--- SEED PROCESS ERROR ---');
    console.error(error);
    return NextResponse.json({ 
      error: 'Error en el volcado a Postgres', 
      details: error.message
    }, { status: 500 });
  }
}
