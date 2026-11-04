import mongoose, { Schema, Document } from 'mongoose';

export interface IItemComida {
  alimentoId?: mongoose.Types.ObjectId;
  nombre: string;
  gramos: number;
  kcal: number;
  proteinas: number;
  grasas: number;
  carbos: number;
  origen?: string;
}

export interface IComida {
  id?: string;
  nombre: string;
  items: IItemComida[];
  totalKcal?: number;
  totalProteins?: number;
  totalCarbs?: number;
  totalFats?: number;
}

export interface IPlanAlimentario extends Document {
  pacienteId: mongoose.Types.ObjectId;
  fechaInicio: Date;
  objetivoCalorico: number;
  comidas: IComida[];
  macrosObjetivo: {
    p: number;
    c: number;
    f: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlanAlimentarioSchema: Schema = new Schema(
  {
    pacienteId: { type: Schema.Types.ObjectId, ref: 'Paciente', required: true },
    fechaInicio: { type: Date, default: Date.now },
    objetivoCalorico: { type: Number, required: true },
    comidas: [
      {
        id: String,
        nombre: String,
        items: [
          {
            alimentoId: { type: Schema.Types.ObjectId, ref: 'Alimento' },
            nombre: String,
            gramos: Number,
            kcal: Number,
            proteinas: Number,
            grasas: Number,
            carbos: Number,
            origen: String,
          },
        ],
        totalKcal: Number,
        totalProteins: Number,
        totalCarbs: Number,
        totalFats: Number,
      },
    ],
    macrosObjetivo: {
      p: Number,
      c: Number,
      f: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PlanAlimentario || mongoose.model<IPlanAlimentario>('PlanAlimentario', PlanAlimentarioSchema);

