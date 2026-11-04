import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string; // HTML or Markdown
  imagen?: string;
  categoria: 'Nutrición' | 'Deporte' | 'Salud' | 'Recetas';
  autor: string;
  tags: string[];
  publicado: boolean;
  fechaLectura?: string; // e.g. "5 min read"
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    resumen: { type: String, required: true },
    contenido: { type: String, required: true },
    imagen: { type: String },
    categoria: { 
      type: String, 
      required: true, 
      enum: ['Nutrición', 'Deporte', 'Salud', 'Recetas'],
      default: 'Nutrición'
    },
    autor: { type: String, default: 'Equipo NutriPro' },
    tags: [{ type: String }],
    publicado: { type: Boolean, default: false },
    fechaLectura: { type: String },
  },
  { timestamps: true }
);

// Middleware to ensure slug is always present if not provided? 
// Usually handled in the API or pre-save.

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
