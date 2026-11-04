const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCleanupLogic() {
  const now = new Date();
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  
  console.log('--- TEST CLEANUP LOGIC ---');
  console.log('Current Time:', now.toString());
  console.log('Threshold (now - 2h):', new Date(now.getTime() - TWO_HOURS_MS).toString());

  const activeReservas = await prisma.reserva.findMany({
    where: {
      status: { notIn: ['completada', 'cancelada'] },
      isDeleted: false,
    },
  });

  console.log(`Total active reservoirs found: ${activeReservas.length}`);

  const toProcess = activeReservas.filter((res) => {
    const [year, month, day] = res.fecha.split('-').map(Number);
    const [hours, minutes] = res.hora.split(':').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes);
    
    const isPast = startTime.getTime() + TWO_HOURS_MS < now.getTime();
    
    console.log(`- [${isPast ? 'CLEANUP' : 'KEEP'}] ${res.nombre}: ${res.fecha} ${res.hora} (Start: ${startTime.toString()})`);
    return isPast;
  });

  console.log(`\nItems to be cleaned up: ${toProcess.length}`);
  process.exit(0);
}

testCleanupLogic();
