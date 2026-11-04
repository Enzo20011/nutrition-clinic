import { z } from 'zod';

export const itemComidaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, 'Nombre de alimento requerido'),
  gramos: z.number().positive(),
  kcal: z.number().nonnegative(),
  proteinas: z.number().nonnegative(),
  grasas: z.number().nonnegative(),
  carbos: z.number().nonnegative(),
  origen: z.string().optional(),
  cantidadCasera: z.string().optional(),
});

export const comidaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, 'Nombre de comida requerido'),
  items: z.array(itemComidaSchema),
  totalKcal: z.number().optional(),
  totalProteins: z.number().optional(),
  totalCarbs: z.number().optional(),
  totalFats: z.number().optional(),
});

export const dietaSchema = z.object({
  pacienteId: z.string().min(1, 'pacienteId es requerido'),
  objetivoCalorico: z.number().positive('El objetivo calórico debe ser positivo'),
  comidas: z.array(comidaSchema),
  macrosObjetivo: z.object({
    p: z.number().min(0).max(100),
    f: z.number().min(0).max(100),
    c: z.number().min(0).max(100),
  }),
  fechaInicio: z.string().datetime().optional(),
  tablaManual: z.array(z.object({ alimento: z.string(), cantidad: z.string() })).optional(),
  recomendaciones: z.array(z.string()).optional(),
});

export type DietaInput = z.infer<typeof dietaSchema>;
