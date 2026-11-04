import type { NextApiRequest, NextApiResponse } from 'next';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { GeneradorDietaPDF } from '@/components/GeneradorDietaPDF';

const TABLA_TEST = [
  { alimento: 'Avena', cantidad: '80g' },
  { alimento: 'Leche descremada', cantidad: '250ml' },
  { alimento: 'Banana', cantidad: '1 unidad mediana' },
  { alimento: 'Pechuga de pollo', cantidad: '150g' },
  { alimento: 'Arroz integral', cantidad: '100g (cocido)' },
  { alimento: 'Brócoli', cantidad: '200g' },
  { alimento: 'Aceite de oliva', cantidad: '1 cda (10ml)' },
  { alimento: 'Huevo entero', cantidad: '2 unidades' },
  { alimento: 'Papa', cantidad: '150g' },
  { alimento: 'Yogur griego natural', cantidad: '150g' },
  { alimento: 'Almendras', cantidad: '25g' },
  { alimento: 'Lomo vacuno', cantidad: '120g' },
  { alimento: 'Batata', cantidad: '130g' },
  { alimento: 'Espinaca', cantidad: '100g' },
  { alimento: 'Queso cottage', cantidad: '80g' },
];

const RECS_TEST = [
  'Tomar al menos 2.5 litros de agua por día.',
  'Distribuir las comidas cada 3-4 horas para mantener el metabolismo activo.',
  'Evitar el consumo de alimentos ultraprocesados y bebidas azucaradas.',
  'Realizar actividad física al menos 4 veces por semana.',
  'NOTA: En caso de molestias digestivas, consultar antes de continuar con el plan.',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const blob = await pdf(
      <GeneradorDietaPDF
        paciente={{ nombre: 'Juan', apellido: 'Pérez' }}
        tablaManual={TABLA_TEST}
        recomendaciones={RECS_TEST}
      />
    ).toBlob();

    const buffer = Buffer.from(await blob.arrayBuffer());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-dieta.pdf"');
    res.send(buffer);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
