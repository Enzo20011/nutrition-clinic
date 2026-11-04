/**
 * Motor Antropométrico
 * Fórmulas para composición corporal.
 */

/**
 * Calcula el Índice de Masa Corporal (IMC).
 * IMC = peso (kg) / altura^2 (m)
 */
export const calcularIMC = (peso: number, alturaCm: number): number => {
  if (!peso || !alturaCm || alturaCm === 0) return 0;
  const alturaM = alturaCm / 100;
  const result = peso / (alturaM * alturaM);
  return isFinite(result) ? Number(result.toFixed(1)) : 0;
};

/**
 * Calcula el porcentaje de grasa usando la fórmula de Faulkner (4 pliegues).
 * % Grasa = (Tríceps + Subescapular + Suprailíaco + Abdominal) * 0.153 + 5.783
 */
export const calcularGrasaFaulkner = (
  triceps: number,
  subescapular: number,
  suprailiaco: number,
  abdominal: number
): number => {
  const t = triceps || 0;
  const s = subescapular || 0;
  const si = suprailiaco || 0;
  const a = abdominal || 0;
  const sumaPliegues = t + s + si + a;
  const result = sumaPliegues * 0.153 + 5.783;
  return isFinite(result) ? Number(result.toFixed(1)) : 0;
};

/**
 * Calcula Masa Gorda y Masa Magra en kg.
 */
export const calcularComposicionCorporal = (peso: number, porcentajeGrasa: number) => {
  const p = peso || 0;
  const pg = porcentajeGrasa || 0;
  const masaGorda = (p * pg) / 100;
  const masaMagra = p - masaGorda;

  return {
    masaGordaKg: isFinite(masaGorda) ? Number(masaGorda.toFixed(2)) : 0,
    masaMagraKg: isFinite(masaMagra) ? Number(masaMagra.toFixed(2)) : 0,
  };
};

/**
 * Clasificación de IMC según la OMS.
 */
export const clasificarIMC = (imc: number): string => {
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidad I';
  if (imc < 40) return 'Obesidad II';
  return 'Obesidad III';
};
