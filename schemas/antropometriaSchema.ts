import { z } from 'zod';

export const antropometriaSchema = z.object({
  pacienteId: z.string().min(1),
  peso: z.number().min(20).max(300),
  altura: z.number().min(50).max(250),
  pliegues: z.object({
    triceps: z.number().min(0).optional(),
    subescapular: z.number().min(0).optional(),
    suprailiaco: z.number().min(0).optional(),
    abdominal: z.number().min(0).optional(),
    muslo: z.number().min(0).optional(),
    pierna: z.number().min(0).optional(),
  }).optional(),
  perimetros: z.object({
    cintura: z.number().min(0).optional(),
    cadera: z.number().min(0).optional(),
  }).optional(),
  resultados: z.object({
    porcentajeGrasa: z.number().optional(),
    imc: z.number().optional(),
    masaGordaKg: z.number().optional(),
    masaMagraKg: z.number().optional(),
  }).optional(),
});

export type AntropometriaInput = z.infer<typeof antropometriaSchema>;
