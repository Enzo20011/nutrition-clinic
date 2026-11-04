'use client';

import React, { useEffect, useState } from 'react';

const TABLA_TEST = [
  { alimento: 'Leche o yogur descremado', cantidad: '1 taza en el desayuno y 1 en la merienda' },
  { alimento: 'Claras de huevo', cantidad: '3 claras en el desayuno' },
  { alimento: 'Huevo entero', cantidad: '1 unidad' },
  { alimento: 'Avena', cantidad: '5 cucharadas soperas' },
  { alimento: 'Pan integral', cantidad: '2 rebanadas' },
  { alimento: 'Pechuga de pollo o pescado', cantidad: '1 presa mediana por comida (almuerzo y cena)' },
  { alimento: 'Carne vacuna magra (lomo, cuadril)', cantidad: '1 filete del tamaño de la palma, 2 veces por semana' },
  { alimento: 'Legumbres (lentejas, garbanzos, porotos)', cantidad: 'En reemplazo de una porción de carne, ½ plato' },
  { alimento: 'Arroz, fideos o papa', cantidad: '½ plato cocido en almuerzo o cena' },
  { alimento: 'Batata', cantidad: '1 unidad chica en almuerzo o cena' },
  { alimento: 'Vegetales A y B (zapallito, brócoli, zanahoria)', cantidad: '½ plato cocido + ½ plato crudo distribuidos en el día' },
  { alimento: 'Frutas', cantidad: '2 frutas medianas y 1 chica por día' },
  { alimento: 'Almendras o nueces', cantidad: '1 puñado pequeño (20-25g) como colación' },
  { alimento: 'Aceite de oliva', cantidad: '2 cucharadas tipo té repartidas en el día' },
  { alimento: 'Barrita de cereal sin azúcar', cantidad: '1 unidad como colación' },
];

const RECS_TEST = [
  'Realizar las 4 comidas principales: desayuno, almuerzo, merienda y cena. No saltear ninguna.',
  'Hidratación: tomar al menos 2 litros de agua por día, especialmente antes y durante los entrenamientos.',
  'Evitar frituras, comidas con exceso de grasa y productos ultraprocesados.',
  'Preparar las comidas con anticipación para facilitar el cumplimiento del plan durante la semana.',
  'Al momento de hacer las compras, tener en cuenta las comidas que se van a preparar los días siguientes.',
  'NOTA: En los días con mayor actividad física, agregar 1 colación extra a media tarde: fruta + almendras, o yogur con avena.',
];

const PACIENTE_TEST = { data: { nombre: 'Juan', apellido: 'Pérez' } };

export default function TestPdfPage() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const { exportarDietaLazy } = await import('@/utils/exportPdfAction');
        await exportarDietaLazy(PACIENTE_TEST, {}, [], {}, TABLA_TEST, RECS_TEST);
        setStatus('done');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    })();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-fg text-sm font-bold uppercase tracking-widest">
      {status === 'loading' && 'Generando PDF...'}
      {status === 'done' && 'PDF descargado'}
      {status === 'error' && 'Error al generar PDF'}
    </div>
  );
}
