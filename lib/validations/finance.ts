import { z } from 'zod';
import { MetodoPago, CategoriaPago } from '@/types/finance';

export const manualPaymentSchema = z.object({
  monto: z.number({ required_error: 'El monto es requerido' }).positive('El monto debe ser positivo').max(10_000_000, 'Monto demasiado alto'),
  metodo: z.nativeEnum(MetodoPago, { errorMap: () => ({ message: 'Método de pago inválido' }) }),
  concepto: z.string().min(2, 'El concepto debe tener al menos 2 caracteres').max(300, 'Concepto demasiado largo'),
  categoria: z.nativeEnum(CategoriaPago).optional().default(CategoriaPago.CONSULTA),
  fecha: z.string().optional(),
  pacienteId: z.string().optional(),
});

export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>;
