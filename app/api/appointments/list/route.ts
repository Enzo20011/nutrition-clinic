import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

export async function GET(request: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start'); // YYYY-MM-DD
  const end = searchParams.get('end');     // YYYY-MM-DD

  try {
    const where: any = { isDeleted: false };
    
    if (start && end) {
      where.fecha = { gte: start, lte: end };
    } else if (start) {
      where.fecha = { gte: start };
    }

    const appointments = await prisma.reserva.findMany({
      where,
      orderBy: [
        { fecha: 'asc' },
        { hora: 'asc' }
      ]
    });
    
    return NextResponse.json({ 
      data: appointments,
      count: appointments.length 
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
