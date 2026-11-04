import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Cargador manual de .env.local simplificado
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=').map(part => part.trim()))
);

const mongoUri = envVars.MONGODB_URI;
const postgresUri = envVars.DATABASE_URL;

if (!mongoUri || !postgresUri) {
  console.error('Faltan variables de entorno MONGODB_URI o DATABASE_URL');
  process.exit(1);
}

const mongoClient = new MongoClient(mongoUri);
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('--- Iniciando Migración MongoDB -> Neon (PostgreSQL) ---');
    await mongoClient.connect();
    const db = mongoClient.db();

    // 1. Migrar Pacientes
    console.log('Migrando Pacientes...');
    const pacientes = await db.collection('pacientes').find({}).toArray();
    for (const p of pacientes) {
      try {
        await prisma.paciente.upsert({
          where: { id: p._id.toString() },
          update: {},
          create: {
            id: p._id.toString(),
            nombre: p.nombre,
            apellido: p.apellido,
            dni: p.dni || null,
            fechaNacimiento: new Date(p.fechaNacimiento),
            email: p.email || null,
            telefono: p.telefono || null,
            whatsapp: p.whatsapp || null,
            sexo: p.sexo || 'femenino',
            peso: Number(p.peso) || null,
            altura: Number(p.altura) || null,
            objetivo: p.objetivo || null,
            status: p.status || 'Activo',
            isDeleted: p.isDeleted || false,
            createdAt: p.createdAt || new Date(),
            updatedAt: p.updatedAt || new Date(),
          }
        });
      } catch (err) {
        console.warn(`Error pac: ${p.nombre}`, err.message);
      }
    }
    console.log(`✓ ${pacientes.length} Pacientes procesados.`);

    // 2. Migrar Alimentos (Locales)
    console.log('Migrando Alimentos...');
    const alimentos = await db.collection('alimentos').find({ origen: 'CUSTOM' }).toArray();
    for (const a of alimentos) {
      try {
        await prisma.alimento.create({
          data: {
            nombre: a.nombre,
            calorias: Number(a.calorias),
            proteinas: Number(a.proteinas),
            carbohidratos: Number(a.carbohidratos),
            grasas: Number(a.grasas),
            origen: 'CUSTOM',
            categoria: a.categoria || 'General'
          }
        });
      } catch (err) {
         // Probablemente duplicado
      }
    }
    console.log(`✓ ${alimentos.length} Alimentos locales migrados.`);

    // 3. Migrar Reservas
    console.log('Migrando Reservas...');
    const reservas = await db.collection('reservas').find({}).toArray();
    for (const r of reservas) {
      try {
        await prisma.reserva.create({
          data: {
            nombre: r.nombre,
            email: r.email,
            telefono: r.telefono,
            fecha: r.fecha,
            hora: r.hora,
            status: r.status || 'pendiente',
            isDeleted: r.isDeleted || false,
            createdAt: r.createdAt || new Date(),
            updatedAt: r.updatedAt || new Date()
          }
        });
      } catch (err) {
         // skip duplicados
      }
    }
    console.log(`✓ ${reservas.length} Reservas migradas.`);

    console.log('--- Migración Finalizada con Éxito ---');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
  }
}

migrate();
