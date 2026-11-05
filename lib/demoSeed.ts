import type { PrismaClient } from '@prisma/client';
import alimentosBase from '../data/argenfoods.json';
import { DEMO_TTL_MS } from './demoId';

/** Datos de ejemplo (ficticios) con los que arranca el espacio de cada visitante. */

const hoy = () => new Date();
const haceDias = (n: number) => new Date(Date.now() - n * 86_400_000);
const fechaISO = (offsetDias: number) => {
  const d = new Date(Date.now() + offsetDias * 86_400_000);
  return d.toISOString().slice(0, 10);
};

function comida(nombre: string, items: [string, number, number, number, number, number][]) {
  const lista = items.map(([n, gramos, kcal, proteinas, grasas, carbos]) => ({ nombre: n, gramos, kcal, proteinas, grasas, carbos }));
  const sum = (k: 'kcal' | 'proteinas' | 'grasas' | 'carbos') => lista.reduce((a, i) => a + i[k], 0);
  return { nombre, items: lista, totalKcal: sum('kcal'), totalProteins: sum('proteinas'), totalCarbs: sum('carbos'), totalFats: sum('grasas') };
}

/** Siembra el catálogo de alimentos (compartido por todos) la primera vez. */
export async function sembrarAlimentos(base: PrismaClient) {
  try {
    await base.demoSpace.create({ data: { id: '__alimentos__' } });
  } catch {
    return; // otro pedido ya lo está sembrando o ya existe
  }
  await base.alimento.createMany({
    data: (alimentosBase as any[]).map((a) => ({
      nombre: a.nombre,
      calorias: a.calorias,
      proteinas: a.proteinas,
      carbohidratos: a.carbohidratos,
      grasas: a.grasas,
      origen: a.origen ?? 'ARGENFOODS',
      categoria: a.categoria ?? 'General',
    })),
  });
}

export async function sembrar(base: PrismaClient, id: string) {
  const p = (n: number) => `${id}-p${n}`;

  const pacientes = [
    { n: 1, nombre: 'Ana', apellido: 'Pérez', dni: '30123456', nac: '1991-04-12', sexo: 'femenino', peso: 68, altura: 165, objetivo: 'Pérdida de peso' },
    { n: 2, nombre: 'Luis', apellido: 'Gómez', dni: '33456789', nac: '1997-09-03', sexo: 'masculino', peso: 74, altura: 178, objetivo: 'Ganancia muscular' },
    { n: 3, nombre: 'Carla', apellido: 'Díaz', dni: '27654321', nac: '1984-01-25', sexo: 'femenino', peso: 61, altura: 160, objetivo: 'Salud digestiva' },
    { n: 4, nombre: 'Mateo', apellido: 'Silva', dni: '41222333', nac: '2006-11-18', sexo: 'masculino', peso: 70, altura: 175, objetivo: 'Rendimiento deportivo' },
  ];

  await base.paciente.createMany({
    data: pacientes.map((x) => ({
      id: p(x.n),
      demoId: id,
      nombre: x.nombre,
      apellido: x.apellido,
      dni: x.dni,
      fechaNacimiento: new Date(x.nac),
      email: `${x.nombre.toLowerCase()}@example.com`,
      telefono: '3760000000',
      whatsapp: '3760000000',
      sexo: x.sexo,
      peso: x.peso,
      altura: x.altura,
      objetivo: x.objetivo,
      ultimaConsulta: haceDias(x.n * 6),
      status: 'Activo',
    })),
  });

  await base.anamnesis.createMany({
    data: pacientes.map((x) => ({
      demoId: id,
      pacienteId: p(x.n),
      motivoConsulta: x.objetivo,
      ocupacion: ['Docente', 'Estudiante', 'Administrativa', 'Estudiante'][x.n - 1],
      patologias: x.n === 3 ? 'Colon irritable' : 'Ninguna',
      alergiasIntolerancias: x.n === 3 ? 'Lactosa' : 'Ninguna',
      nivelActividad: ['Sedentario', 'Moderado', 'Leve', 'Alto'][x.n - 1],
      horasSueno: 7,
      nivelEstres: 4 + x.n,
      peso: x.peso,
      altura: x.altura,
      sexo: x.sexo,
      caloriasObjetivo: [1650, 2700, 1900, 2900][x.n - 1],
      macrosCarbos: 45,
      macrosProteinas: 25,
      macrosGrasas: 30,
      isDraft: false,
    })),
  });

  // Evolución de peso: 4 mediciones por paciente
  const mediciones: any[] = [];
  for (const x of pacientes) {
    const tendencia = x.n === 1 || x.n === 3 ? -1.2 : x.n === 2 ? 0.9 : 0.4;
    for (let i = 0; i < 4; i++) {
      const peso = Math.round((x.peso - tendencia * (3 - i)) * 10) / 10;
      const imc = Math.round((peso / Math.pow(x.altura / 100, 2)) * 10) / 10;
      mediciones.push({
        demoId: id,
        pacienteId: p(x.n),
        peso,
        altura: x.altura,
        pliegues: { triceps: 14 + i, subescapular: 12 + i, suprailiaco: 15 + i, abdominal: 20 + i },
        perimetros: { cintura: 78 - i, cadera: 99 },
        resultados: { imc, grasa: Math.round((24 - i * 0.6) * 10) / 10 },
        archivos: [],
        createdAt: haceDias((3 - i) * 21 + x.n),
      });
    }
  }
  await base.antropometria.createMany({ data: mediciones });

  await base.planAlimentario.createMany({
    data: [1, 2].map((n) => ({
      demoId: id,
      pacienteId: p(n),
      objetivoCalorico: n === 1 ? 1650 : 2700,
      comidas: [
        comida('Desayuno', [['Avena', 40, 150, 5, 3, 27], ['Leche descremada', 200, 70, 7, 0, 10], ['Banana', 100, 90, 1, 0, 23]]),
        comida('Almuerzo', [['Pollo a la plancha', 150, 240, 45, 5, 0], ['Arroz integral', 120, 150, 3, 1, 31], ['Ensalada mixta', 150, 40, 2, 1, 7]]),
        comida('Merienda', [['Yogur natural', 170, 100, 6, 4, 9], ['Nueces', 20, 130, 3, 13, 3]]),
        comida('Cena', [['Merluza al horno', 180, 170, 34, 3, 0], ['Zapallo asado', 200, 70, 2, 0, 16]]),
      ],
      macrosObjetivo: { p: 25, c: 45, f: 30 },
      recomendaciones: ['Tomar 2 litros de agua por día', 'Priorizar alimentos poco procesados', 'Registrar las comidas durante la semana'],
    })),
  });

  await base.notaClinica.createMany({
    data: [
      { demoId: id, pacienteId: p(1), titulo: 'Primera consulta', contenido: 'Buena adherencia. Se acuerda reducir bebidas azucaradas y sumar caminatas de 30 minutos.' },
      { demoId: id, pacienteId: p(1), titulo: 'Control mensual', contenido: 'Bajó 1,2 kg. Refiere menos ansiedad por las tardes. Se ajusta la merienda.' },
      { demoId: id, pacienteId: p(3), titulo: 'Plan sin lactosa', contenido: 'Se reemplazan los lácteos por alternativas vegetales. Se monitorea la tolerancia.' },
    ],
  });

  const metodos = ['Efectivo', 'Transferencia', 'Mercado Pago', 'Efectivo', 'Transferencia', 'Mercado Pago', 'Efectivo', 'Transferencia'];
  await base.ingreso.createMany({
    data: metodos.map((metodo, i) => {
      const x = pacientes[i % pacientes.length];
      return {
        demoId: id,
        pacienteId: p(x.n),
        monto: 15000 + (i % 3) * 2500,
        metodo,
        estado: 'Pagado',
        categoria: i === 5 ? 'Plan Alimentario' : 'Consulta',
        concepto: `Consulta nutricional - ${x.nombre} ${x.apellido}`,
        fecha: haceDias(i * 9 + 2),
      };
    }),
  });

  await base.reserva.createMany({
    data: [
      { fecha: fechaISO(1), hora: '10:00', nombre: 'Paciente de ejemplo', email: 'paciente@example.com', telefono: '3760000000', status: 'confirmada' },
      { fecha: fechaISO(2), hora: '11:00', nombre: 'Otra persona de ejemplo', email: 'otra@example.com', telefono: '3760000001', status: 'confirmada' },
      { fecha: fechaISO(3), hora: '16:00', nombre: 'Consulta de ejemplo', email: 'consulta@example.com', telefono: '3760000002', status: 'confirmada' },
    ].map((r) => ({ ...r, demoId: id })),
  });

  await base.post.createMany({
    data: [
      {
        titulo: 'Cómo armar un plato equilibrado',
        slug: 'plato-equilibrado',
        resumen: 'Una guía simple para combinar proteínas, verduras y cereales en cada comida.',
        contenido: 'La mitad del plato con verduras, un cuarto con proteínas y un cuarto con cereales integrales. Sumá una fruta y agua como bebida principal.',
        categoria: 'Nutrición',
        tags: ['hábitos', 'plato'],
        publicado: true,
        fechaLectura: '3 min',
      },
      {
        titulo: 'Hidratación y rendimiento',
        slug: 'hidratacion-y-rendimiento',
        resumen: 'Cuánta agua necesitás según tu actividad y cómo notar que te estás deshidratando.',
        contenido: 'La hidratación influye en la energía y la concentración. Tomá agua a lo largo del día y aumentá la cantidad cuando entrenás o hace calor.',
        categoria: 'Deporte',
        tags: ['hidratación', 'deporte'],
        publicado: true,
        fechaLectura: '4 min',
      },
    ].map((x) => ({ ...x, demoId: id })),
  });
}

/** Borra los espacios con más de 2 horas (se ejecuta al crear uno nuevo). */
export async function limpiarVencidos(base: PrismaClient) {
  const corte = new Date(Date.now() - DEMO_TTL_MS);
  const viejos = await base.demoSpace.findMany({ where: { id: { not: '__alimentos__' }, creadoEn: { lt: corte } }, select: { id: true } });
  if (!viejos.length) return;
  const ids = viejos.map((v) => v.id);
  await borrarDatos(base, ids);
  await base.demoSpace.deleteMany({ where: { id: { in: ids } } });
}

async function borrarDatos(base: PrismaClient, ids: string[]) {
  const where = { demoId: { in: ids } };
  await base.ingreso.deleteMany({ where });
  await base.notaClinica.deleteMany({ where });
  await base.planAlimentario.deleteMany({ where });
  await base.antropometria.deleteMany({ where });
  await base.anamnesis.deleteMany({ where });
  await base.paciente.deleteMany({ where });
  await base.reserva.deleteMany({ where });
  await base.slotLock.deleteMany({ where });
  await base.post.deleteMany({ where });
}

/** Deja el espacio del visitante como nuevo: borra todo y lo vuelve a sembrar. */
export async function reiniciar(base: PrismaClient, id: string) {
  await borrarDatos(base, [id]);
  await base.demoSpace.deleteMany({ where: { id } });
  await base.demoSpace.create({ data: { id } });
  await sembrar(base, id);
}

export { hoy };
