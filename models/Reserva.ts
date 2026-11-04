import mongoose, { Schema, Document } from 'mongoose';

export interface IReserva extends Document {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  status: 'pendiente' | 'confirmada' | 'cancelada';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReservaSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    telefono: { type: String, required: true },
    fecha: { type: String, required: true }, // Format YYYY-MM-DD
    hora: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pendiente', 'confirmada', 'cancelada'], 
      default: 'pendiente' 
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for scheduling and search
// CRITICAL: Partial unique index to prevent double-booking of slots
ReservaSchema.index(
  { fecha: 1, hora: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { status: 'confirmada', isDeleted: false } 
  }
);
ReservaSchema.index({ email: 1 });
ReservaSchema.index({ fecha: 1 });
ReservaSchema.index({ isDeleted: 1 });

export default mongoose.models.Reserva || mongoose.model<IReserva>('Reserva', ReservaSchema);
