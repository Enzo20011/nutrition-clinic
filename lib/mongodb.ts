import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor, define la variable de entorno MONGODB_URI en .env.local');
}

/**
 * Global es usado aquí para mantener una conexión en caché a través de las recargas hot en desarrollo.
 * Esto previene que las conexiones crezcan exponencialmente durante el desarrollo de Next.js.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? (global.mongoose = { conn: null, promise: null });

async function dbConnect() {
  // 1. Si ya tenemos una conexión establecida, la devolvemos
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Si no hay una promesa de conexión en curso, la creamos
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('=> Nueva conexión MongoDB establecida');
      return mongooseInstance;
    });
  }

  // 3. Esperamos a que la promesa se resuelva
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Si falla, reseteamos la promesa para permitir reintentos
    cached.promise = null;
    console.error('=> Error conectando a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
