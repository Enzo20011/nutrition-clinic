const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const huevos = await prisma.alimento.findMany({
    where: { nombre: { contains: 'Huevo', mode: 'insensitive' } },
    take: 5
  });
  console.log('Huevo en DB:', huevos.map(f => f.nombre));
  
  const leches = await prisma.alimento.findMany({
    where: { nombre: { contains: 'Leche', mode: 'insensitive' } },
    take: 5
  });
  console.log('Leche en DB:', leches.map(f => f.nombre));
  
  const total = await prisma.alimento.count();
  console.log('Total en DB:', total);
  process.exit(0);
}

check();
