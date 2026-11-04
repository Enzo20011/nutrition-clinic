import mongoose, { Schema, Document } from 'mongoose';
import { MetodoPago, EstadoPago, CategoriaPago, IFinanceEntry } from '@/types/finance';

export { MetodoPago, EstadoPago, CategoriaPago };

export interface IIngreso extends Document, Omit<IFinanceEntry, 'pacienteId'> {
  pacienteId?: mongoose.Types.ObjectId;
}

const IngresoSchema: Schema = new Schema(
  {
    pacienteId: { type: Schema.Types.ObjectId, ref: 'Paciente' },
    turnoId: { type: String },
    monto: { type: Number, required: true },
    metodo: { type: String, enum: Object.values(MetodoPago), required: true },
    estado: { type: String, enum: Object.values(EstadoPago), default: EstadoPago.PENDIENTE },
    categoria: { type: String, enum: Object.values(CategoriaPago), default: CategoriaPago.CONSULTA },
    concepto: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    referenciaExterna: { type: String },
    mpPreferenceId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Ingreso || mongoose.model<IIngreso>('Ingreso', IngresoSchema);
