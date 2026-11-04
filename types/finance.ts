export enum MetodoPago {
  MERCADO_PAGO = 'Mercado Pago',
  EFECTIVO = 'Efectivo',
  TRANSFERENCIA = 'Transferencia',
  QR_INTEROPERABLE = 'QR Interoperable',
  DEBITO = 'Débito',
  CREDITO = 'Crédito',
}

export enum EstadoPago {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  REEMBOLSADO = 'Reembolsado',
  CANCELADO = 'Cancelado',
}

export enum CategoriaPago {
  CONSULTA = 'Consulta',
  PLAN_ALIMENTARIO = 'Plan Alimentario',
  SUPLEMENTOS = 'Suplementos',
  OTRO = 'Otro',
}

export interface IFinanceEntry {
  pacienteId?: string;
  turnoId?: string;
  monto: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  categoria: CategoriaPago;
  concepto: string;
  fecha: Date;
  referenciaExterna?: string;
  mpPreferenceId?: string;
}
