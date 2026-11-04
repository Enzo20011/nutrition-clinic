import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pacienteSchema } from '@/lib/validations/paciente';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';
import { apiSuccess, apiError } from '@/lib/api-response';

interface Params {
  params: { id: string };
}

/**
 * GET /api/pacientes/[id]
 * Get a single patient by ID from PostgreSQL.
 */
export async function GET(_req: Request, { params }: Params) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: params.id }
    });
    if (!paciente) return apiError('Paciente no encontrado', 404);
    return apiSuccess(paciente);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

/**
 * PATCH /api/pacientes/[id]
 * Update patient in Neon.
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();

    // 1. Special "restore" action
    if (body.restore === true) {
      const updated = await prisma.paciente.update({
        where: { id: params.id },
        data: { isDeleted: false }
      });
      return apiSuccess(updated, undefined, 200);
    }

    // 2. Regular update with PARTIAL VALIDATION
    const validation = pacienteSchema.partial().safeParse(body);
    if (!validation.success) {
      return apiError('Datos de actualización inválidos', 400, validation.error.flatten().fieldErrors);
    }

    const safeData = validation.data;
    
    // Convert Date if present
    const dataToUpdate: any = { ...safeData };
    if (safeData.fechaNacimiento) {
      dataToUpdate.fechaNacimiento = new Date(safeData.fechaNacimiento);
    }

    const updated = await prisma.paciente.update({
      where: { id: params.id },
      data: dataToUpdate
    });
    
    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Error al actualizar paciente:', error);
    return apiError(error.message, 500);
  }
}

/**
 * DELETE /api/pacientes/[id]
 * SOFT DELETE in PostgreSQL.
 */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const updated = await prisma.paciente.update({
      where: { id: params.id },
      data: { isDeleted: true }
    });

    return apiSuccess({ 
      message: 'Paciente archivado (soft delete). Los datos clínicos se mantienen intactos.',
      id: params.id,
    });
  } catch (error: any) {
    console.error('Error en soft delete de paciente:', error);
    return apiError(error.message, 500);
  }
}
