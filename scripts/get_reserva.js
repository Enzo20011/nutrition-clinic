const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getReserva(id) {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: id }
    });
    console.log(JSON.stringify(reserva, null, 2));
  } catch (err) {
    console.error('Error fetching reserva:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

const id = process.argv[2] || 'cmn7hrp4h00001xurhlkvsssk';
getReserva(id);
