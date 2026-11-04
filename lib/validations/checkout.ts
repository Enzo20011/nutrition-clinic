import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto'),
  email: z.string().email('Email inválido'),
  date: z.string().min(1, 'Fecha requerida'),
  reservaId: z.string().min(1, 'Reserva requerida'),
  monto: z.number().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
