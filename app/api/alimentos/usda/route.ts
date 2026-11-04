import { NextResponse } from 'next/server';
import { searchUSDA } from '@/lib/usdaApi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) return NextResponse.json({ error: 'Falta búsqueda' }, { status: 400 });

  try {
    const alimentos = await searchUSDA(query);
    return NextResponse.json(alimentos);
  } catch (error: any) {
    console.error('CRITICAL USDA ROUTE ERROR:', error);
    return NextResponse.json({ error: 'Error USDA', details: error.message }, { status: 500 });
  }
}
