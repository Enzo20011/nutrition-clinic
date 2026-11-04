import { z } from 'zod';

// Esquema Zod robusto para el ingreso y sanitización de datos
export const pacienteSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().min(6, 'DNI demasiado corto').optional().or(z.literal('')),
  fechaNacimiento: z.string().or(z.date()).transform((val) => new Date(val)),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  sexo: z.enum(['masculino', 'femenino'], {
    errorMap: () => ({ message: 'Debes seleccionar el sexo biológico' }),
  }),
  peso: z.number().positive('El peso debe ser mayor a 0').optional(),
  altura: z.number().positive('La altura debe ser mayor a 0').optional(),
  objetivo: z.string().trim().optional(),
  status: z.enum(['Activo', 'En Pausa', 'Alta']).default('Activo'),
  ultimaConsulta: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
});

// Tipado derivado estático de TypeScript basado en Zod
export type PacienteInput = z.infer<typeof pacienteSchema>;
