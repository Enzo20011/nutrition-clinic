import { NextResponse } from 'next/server';
import { DEMO, currentDemoId } from '@/lib/demoId';
import { resetSpace } from '@/lib/prisma';

export async function POST() {
  if (!DEMO) return NextResponse.json({ error: 'No disponible' }, { status: 404 });
  const id = currentDemoId();
  if (!id) return NextResponse.json({ error: 'Sin sesión de demo' }, { status: 400 });
  await resetSpace(id);
  return NextResponse.json({ ok: true });
}
