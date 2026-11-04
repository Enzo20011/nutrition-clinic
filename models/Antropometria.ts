import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// --- ZOD SCHEMA FOR VALIDATION ---
import { antropometriaSchema, type AntropometriaInput } from '@/schemas/antropometriaSchema';
export { antropometriaSchema, type AntropometriaInput };

// --- MONGOOSE MODEL ---
export interface IAntropometria extends Document {
  pacienteId: mongoose.Types.ObjectId;
  peso: number;
  altura: number;
  pliegues: {
    triceps?: number;
    subescapular?: number;
    suprailiaco?: number;
    abdominal?: number;
    muslo?: number;
    pierna?: number;
  };
  perimetros: {
    cintura?: number;
    cadera?: number;
  };
  resultados: {
    porcentajeGrasa?: number;
    imc?: number;
    masaGordaKg?: number;
    masaMagraKg?: number;
  };
  createdAt: Date;
}

const AntropometriaSchema: Schema = new Schema(
  {
    pacienteId: { type: Schema.Types.ObjectId, ref: 'Paciente', required: true },
    peso: { type: Number, required: true },
    altura: { type: Number, required: true },
    pliegues: {
      triceps: Number,
      subescapular: Number,
      suprailiaco: Number,
      abdominal: Number,
      muslo: Number,
      pierna: Number,
    },
    perimetros: {
      cintura: Number,
      cadera: Number,
    },
    resultados: {
      porcentajeGrasa: Number,
      imc: Number,
      masaGordaKg: Number,
      masaMagraKg: Number,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Antropometria || mongoose.model<IAntropometria>('Antropometria', AntropometriaSchema);
