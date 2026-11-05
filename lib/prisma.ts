import { PrismaClient } from '@prisma/client';
import { DEMO, currentDemoId } from './demoId';
import { sembrar, sembrarAlimentos, limpiarVencidos, reiniciar } from './demoSeed';

/** Modelos cuyos datos pertenecen al espacio de cada visitante en el modo demo. */
const SCOPED = new Set([
  'Paciente', 'Reserva', 'SlotLock', 'Anamnesis', 'Antropometria', 'PlanAlimentario', 'Ingreso', 'NotaClinica', 'Post',
]);

const globalForPrisma = globalThis as unknown as { prismaBase?: PrismaClient };
export const prismaBase = globalForPrisma.prismaBase ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaBase = prismaBase;

const espacios = new Map<string, Promise<void>>();

/** Crea (y siembra con datos de ejemplo) el espacio del visitante si todavía no existe. */
export function ensureSpace(id: string): Promise<void> {
  const cached = espacios.get(id);
  if (cached) return cached;
  const promesa = (async () => {
    await sembrarAlimentos(prismaBase);
    const existe = await prismaBase.demoSpace.findUnique({ where: { id }, select: { id: true } });
    if (existe) return;
    await limpiarVencidos(prismaBase);
    try {
      await prismaBase.demoSpace.create({ data: { id } });
    } catch {
      // Otro pedido del mismo visitante ya está sembrando: esperamos un instante.
      await new Promise((r) => setTimeout(r, 1500));
      return;
    }
    await sembrar(prismaBase, id);
  })();
  espacios.set(id, promesa);
  promesa.catch(() => espacios.delete(id));
  return promesa;
}

export async function resetSpace(id: string) {
  espacios.delete(id);
  await reiniciar(prismaBase, id);
  espacios.set(id, Promise.resolve());
}

function conAislamiento(base: PrismaClient): PrismaClient {
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          if (!SCOPED.has(model)) return query(args);
          const demoId = currentDemoId();
          if (!demoId) throw new Error('Sesión de demo no disponible');
          await ensureSpace(demoId);

          const a: any = args ?? {};
          switch (operation) {
            case 'create':
              a.data = { ...a.data, demoId };
              break;
            case 'createMany':
            case 'createManyAndReturn':
              a.data = Array.isArray(a.data) ? a.data.map((d: any) => ({ ...d, demoId })) : { ...a.data, demoId };
              break;
            case 'upsert':
              a.where = { ...a.where, demoId };
              a.create = { ...a.create, demoId };
              break;
            default:
              // find*, update*, delete*, count, aggregate, groupBy: siempre dentro del espacio del visitante
              a.where = { ...a.where, demoId };
          }
          return query(a);
        },
      },
    },
  }) as unknown as PrismaClient;
}

const prisma: PrismaClient = DEMO ? conAislamiento(prismaBase) : prismaBase;

export default prisma;
