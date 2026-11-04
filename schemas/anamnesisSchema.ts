import { z } from 'zod';

export const anamnesisSchema = z.object({
  pacienteId: z.string().min(1, 'El ID del paciente es requerido'),
  motivoConsulta: z.string().min(3, 'El motivo de consulta es requerido'),
  ocupacion: z.string().optional(),
  horariosTrabajo: z.string().optional(),
  patologias: z.string().optional(),
  alergiasIntolerancias: z.string().min(1, 'Debes especificar alergias o intolerancias (o colocar "Ninguna")'),
  medicacionActual: z.string().optional(),
  nivelActividad: z.enum(['Sedentario', 'Ligero', 'Moderado', 'Intenso', 'Atleta']),
  horasSueno: z.number().min(0).max(24),
  nivelEstres: z.number().min(1).max(10),
  aversionesAlimentarias: z.string().optional(),
  ritmoIntestinal: z.enum(['Estreñimiento', 'Normal', 'Diarrea', 'Irregular']).optional(),
  peso: z.number().min(20).max(300).optional(),
  altura: z.number().min(50).max(250).optional(),
  edad: z.number().min(1).max(120).optional(),
  sexo: z.enum(['masculino', 'femenino']).optional(),
  caloriasObjetivo: z.number().optional(),
  caloriasOffset: z.number().optional(),
  macrosCarbos: z.number().optional(),
  macrosProteinas: z.number().optional(),
  macrosGrasas: z.number().optional(),
  tipoObjetivo: z.enum(['deficit', 'mantenimiento', 'superavit']).optional(),
  isDraft: z.boolean().optional(),
});

export const draftAnamnesisSchema = anamnesisSchema.partial().extend({
  pacienteId: z.string().min(1)
});

export type AnamnesisInput = z.infer<typeof anamnesisSchema>;
