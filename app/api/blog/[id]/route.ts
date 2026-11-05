import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getValidSession } from '@/lib/protectApi';

// GET: Post por slug desde Neon
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.id }
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Blog Detail GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Editar post (Admin only) en Neon
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getValidSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const post = await prisma.post.update({
      where: { id: params.id },
      data: body
    });
    
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Blog Detail PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Borrar post (Admin only) en Neon
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getValidSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.post.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: 'Post eliminado exitosamente' });
  } catch (error: any) {
    console.error('Blog Detail DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
