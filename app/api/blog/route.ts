import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getValidSession } from '@/lib/protectApi';

// GET: Listar posts desde Neon
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Si no es admin, solo mostrar publicados
    const where = isAdmin ? {} : { publicado: true };
    
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Blog GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear post (Admin only) en Neon
export async function POST(req: NextRequest) {
  try {
    const session = await getValidSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Generar slug si no existe
    if (!body.slug) {
      body.slug = body.titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const newPost = await prisma.post.create({
      data: {
        titulo: body.titulo,
        slug: body.slug,
        resumen: body.resumen || '',
        contenido: body.contenido || '',
        imagen: body.imagen,
        categoria: body.categoria || 'Nutrición',
        autor: body.autor || 'Equipo NutriPro',
        tags: body.tags || [],
        publicado: body.publicado || false,
        fechaLectura: body.fechaLectura
      }
    });

    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error('Blog POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
