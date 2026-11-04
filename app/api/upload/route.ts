import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';
import prisma from '@/lib/prisma';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const session = await getValidSession();
    if (!session) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pacienteId = formData.get('pacienteId') as string | null;

    if (!file || !pacienteId) {
      return NextResponse.json({ error: 'Falta archivo o pacienteId' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Use PDF, JPG o PNG.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `El archivo supera el límite de ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'bin';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', pacienteId);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    const url = `/uploads/${pacienteId}/${safeName}`;

    // Guardar referencia en la última Antropometria del paciente
    const latest = await prisma.antropometria.findFirst({
      where: { pacienteId: String(pacienteId) },
      orderBy: { createdAt: 'desc' },
    });

    const nuevoArchivo = {
      nombre: file.name,
      url,
      tipo: file.type,
      fecha: new Date().toISOString(),
    };

    if (latest) {
      const archivosActuales = Array.isArray((latest as any).archivos) ? (latest as any).archivos : [];
      await prisma.antropometria.update({
        where: { id: latest.id },
        data: { archivos: [...archivosActuales, nuevoArchivo] } as any,
      });
    }

    return NextResponse.json({ url, archivo: nuevoArchivo });
  } catch (e: any) {
    console.error('Upload Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getValidSession();
    if (!session) return unauthorizedResponse();

    const { pacienteId, url } = await request.json();
    if (!pacienteId || !url) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // Eliminar referencia de la DB
    const records = await prisma.antropometria.findMany({
      where: { pacienteId: String(pacienteId) },
      orderBy: { createdAt: 'desc' },
    });

    for (const rec of records) {
      const archivos = Array.isArray((rec as any).archivos) ? (rec as any).archivos : [];
      const filtered = archivos.filter((a: any) => a.url !== url);
      if (filtered.length !== archivos.length) {
        await prisma.antropometria.update({
          where: { id: rec.id },
          data: { archivos: filtered } as any,
        });
        break;
      }
    }

    // Intentar eliminar el archivo del disco
    try {
      const { unlink } = await import('fs/promises');
      const filePath = path.join(process.cwd(), 'public', url);
      await unlink(filePath);
    } catch {
      // Si no se puede borrar del disco, igual eliminamos la referencia de la DB
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Delete upload Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
