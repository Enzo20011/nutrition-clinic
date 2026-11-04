import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pacienteSchema } from '@/lib/validations/paciente';
import { apiSuccess, apiError } from '@/lib/api-response';
import { ZodError } from 'zod';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';

/**
 * GET /api/pacientes
 * Retrieves paginated list of patients from Neon/Prisma.
 */
export async function GET(req: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const url = new URL(req.url);
    const includeDeleted = url.searchParams.get('includeDeleted') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const search = url.searchParams.get('search') || '';

    const where: any = includeDeleted ? {} : { isDeleted: false };
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' }
        ],
        skip,
        take: limit,
      }),
      prisma.paciente.count({ where })
    ]);

    return apiSuccess(pacientes, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error: any) {
    console.error('Error al obtener pacientes:', error);
    return apiError(error.message, 500);
  }
}

/**
 * POST /api/pacientes
 * Create a new patient in PostgreSQL.
 */
export async function POST(req: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();

    // 1. Zod runtime validation
    const validatedData = pacienteSchema.parse(body);

    // 2. Database Insert
    const nuevoPaciente = await prisma.paciente.create({
      data: {
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        dni: validatedData.dni,
        fechaNacimiento: validatedData.fechaNacimiento, // Ya es Date por el transform de Zod
        email: validatedData.email,
        telefono: validatedData.telefono,
        whatsapp: validatedData.whatsapp,
        sexo: validatedData.sexo,
        peso: validatedData.peso,
        altura: validatedData.altura,
        objetivo: validatedData.objetivo,
        status: validatedData.status || 'Activo',
        isDeleted: false,
      }
    });
    
    return apiSuccess(nuevoPaciente, undefined, 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return apiError('Datos de paciente inválidos', 400, error.errors);
    }
    console.error('Error al crear paciente:', error);
    return apiError(error.message, 500);
  }
}
