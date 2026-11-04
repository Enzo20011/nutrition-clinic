import mongoose, { Schema, Document } from 'mongoose';

export interface ISlotLock extends Document {
  fecha: string; // YYYY-MM-DD
  hora: string;
  expiresAt: Date;
  sessionId: string;
}

const SlotLockSchema: Schema = new Schema({
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  expiresAt: { 
    type: Date, 
    required: true, 
    index: { expires: 0 } // TTL index: document expires at this specific Date
  },
  sessionId: { type: String, required: true }
});

// Compound index to quickly check for existing locks on a specific slot
SlotLockSchema.index({ fecha: 1, hora: 1 }, { unique: true });

export default mongoose.models.SlotLock || mongoose.model<ISlotLock>('SlotLock', SlotLockSchema);
