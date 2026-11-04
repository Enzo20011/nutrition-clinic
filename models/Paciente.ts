import mongoose, { Schema, Document } from 'mongoose';

export interface IPaciente extends Document {
  nombre: string;
  apellido: string;
  dni?: string;
  fechaNacimiento: Date;
  email?: string;
  telefono?: string;
  sexo: 'masculino' | 'femenino';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PacienteSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    dni: { type: String, unique: true, sparse: true },
    fechaNacimiento: { type: Date, required: true },
    email: { type: String, lowercase: true },
    telefono: { type: String },
    whatsapp: { type: String },
    sexo: { 
      type: String, 
      enum: ['masculino', 'femenino'], 
      required: true 
    },
    // Clinical fields
    peso: { type: Number },
    altura: { type: Number },
    objetivo: { type: String },
    ultimaConsulta: { type: Date },
    status: { type: String, enum: ['Activo', 'En Pausa', 'Alta'], default: 'Activo' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


// Indexes for high-performance search
PacienteSchema.index({ apellido: 1, nombre: 1 });
PacienteSchema.index({ email: 1 });
PacienteSchema.index({ dni: 1 });
PacienteSchema.index({ isDeleted: 1 });

// Full-text search for the patient searcher
PacienteSchema.index({ nombre: 'text', apellido: 'text' }, { 
  weights: { apellido: 10, nombre: 5 },
  name: "PacienteSearchIndex"
});

export default mongoose.models.Paciente || mongoose.model<IPaciente>('Paciente', PacienteSchema);
