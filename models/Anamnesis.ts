import mongoose, { Schema, Document } from 'mongoose';

export interface IAnamnesis extends Document {
  pacienteId: mongoose.Types.ObjectId;
  motivoConsulta: string;
  ocupacion?: string;
  patologias?: string;
  alergiasIntolerancias: string;
  medicacionActual?: string;
  nivelActividad: string;
  horasSueno: number;
  nivelEstres: number;
  aversionesAlimentarias?: string;
  ritmoIntestinal: string;
  peso?: number;
  altura?: number;
  edad?: number;
  sexo?: 'masculino' | 'femenino';
  isDraft: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnamnesisSchema: Schema = new Schema(
  {
    pacienteId: { type: Schema.Types.ObjectId, ref: 'Paciente', required: true },
    motivoConsulta: { 
      type: String, 
      required: function(this: any) { return !this.isDraft; } 
    },
    ocupacion: { type: String },
    patologias: { type: String },
    alergiasIntolerancias: { 
      type: String, 
      required: function(this: any) { return !this.isDraft; } 
    },
    medicacionActual: { type: String },
    nivelActividad: { 
      type: String, 
      enum: ['Sedentario', 'Ligero', 'Moderado', 'Intenso', 'Atleta'],
      required: function(this: any) { return !this.isDraft; } 
    },
    horasSueno: { 
      type: Number, 
      required: function(this: any) { return !this.isDraft; } 
    },
    nivelEstres: { 
      type: Number, 
      min: 1, 
      max: 10, 
      required: function(this: any) { return !this.isDraft; } 
    },
    aversionesAlimentarias: { type: String },
    ritmoIntestinal: { 
      type: String, 
      enum: ['Estreñimiento', 'Normal', 'Diarrea', 'Irregular'],
      required: function(this: any) { return !this.isDraft; } 
    },
    peso: { type: Number },
    altura: { type: Number },
    edad: { type: Number },
    sexo: { type: String, enum: ['masculino', 'femenino'] },
    isDraft: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for high-performance clinical associations
AnamnesisSchema.index({ pacienteId: 1 });
AnamnesisSchema.index({ isDeleted: 1 });
AnamnesisSchema.index({ createdAt: -1 });

export default mongoose.models.Anamnesis || mongoose.model<IAnamnesis>('Anamnesis', AnamnesisSchema);
