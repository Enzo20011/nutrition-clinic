/**
 * Motor Matemático Nutricional
 * Basado en la fórmula de Harris-Benedict revisada por Roza y Shizgal (1984).
 */

export type Sexo = 'masculino' | 'femenino';

export type FactorActividad = 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'atleta';

const MULTIPLICADORES_ACTIVIDAD: Record<FactorActividad, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  atleta: 1.9,
};

interface ResultadosEnergeticos {
  tmb: number;
  get: number;
}

/**
 * Calcula el Gasto Energético Basal (TMB) y el Gasto Energético Total (GET).
 * 
 * TMB Hombres: 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad)
 * TMB Mujeres: 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad)
 */
export const calcularGastoEnergetico = (
  peso: number,
  altura: number,
  edad: number,
  sexo: Sexo,
  factorActividad: FactorActividad
): ResultadosEnergeticos => {
  let tmb: number;

  if (sexo === 'masculino') {
    tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
  } else {
    tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
  }

  const multiplicador = MULTIPLICADORES_ACTIVIDAD[factorActividad];
  const get = tmb * multiplicador;

  return {
    tmb: Math.round(tmb),
    get: Math.round(get),
  };
};

interface Macronutrientes {
  carbohidratos: number;
  proteinas: number;
  grasas: number;
}

/**
 * Convierte porcentajes de distribución calórica a gramos exactos.
 * Carbohidratos: 4 kcal/g
 * Proteínas: 4 kcal/g
 * Grasas: 9 kcal/g
 */
export const calcularMacros = (
  caloriasTotales: number,
  pctCarbos: number,
  pctProteinas: number,
  pctGrasas: number
): Macronutrientes => {
  // Asegurar que los porcentajes sumen 100 o similar antes de calcular, 
  // pero aquí simplemente calculamos basado en lo recibido.
  
  const carbohidratos = (caloriasTotales * (pctCarbos / 100)) / 4;
  const proteinas = (caloriasTotales * (pctProteinas / 100)) / 4;
  const grasas = (caloriasTotales * (pctGrasas / 100)) / 9;

  return {
    carbohidratos: Number(carbohidratos.toFixed(1)),
    proteinas: Number(proteinas.toFixed(1)),
    grasas: Number(grasas.toFixed(1)),
  };
};
