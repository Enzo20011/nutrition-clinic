import mongoose, { Schema, Document, models } from 'mongoose';

export interface IAlimento extends Document {
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  origen: 'LOCAL' | 'USDA' | 'CUSTOM';
  idExterno?: string;
  categoria?: string; // Mantener opcional para compatibilidad transición
}

const alimentoSchema = new Schema({
  nombre: { type: String, required: true },
  calorias: { type: Number, required: true },
  proteinas: { type: Number, required: true },
  carbohidratos: { type: Number, required: true },
  grasas: { type: Number, required: true },
  origen: { 
    type: String, 
    enum: ['LOCAL', 'USDA', 'CUSTOM'], 
    default: 'CUSTOM',
    index: true
  },
  idExterno: { type: String, required: false },
  categoria: { type: String, required: false, default: 'General' }
});

alimentoSchema.index({ nombre: 'text' });

// Forzar actualización del modelo en el registro de Mongoose (Hot Reload fix)
if (models.Alimento) {
  delete (mongoose as any).models.Alimento;
}

const Alimento = mongoose.model<IAlimento>('Alimento', alimentoSchema);
export default Alimento;
