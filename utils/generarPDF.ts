/**
 * Utilidad para estructuración de Reportes Clínicos.
 * Estos datos se pueden utilizar para alimentar una vista de impresión "Print-Only"
 * o una librería de generación de PDF en el cliente como jspdf.
 */

export interface ReportData {
  paciente: {
    nombre: string;
    edad: number;
  };
  clinico: {
    tmb: number;
    get: number;
    macros: { p: number, c: number, g: number };
  };
  antropometria: {
    peso: number;
    altura: number;
    grasaPct: number;
    imc: number;
    masaMagraKg: number;
  };
  observaciones: string;
}

/**
 * Formatea la fecha para el encabezado del reporte.
 */
export const formatFechaReporte = (fecha: Date = new Date()) => {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(fecha);
};

/**
 * Genera el cuerpo estructural de un reporte profesional (HTML-Draft).
 */
export const generarEstructuraReporte = (data: ReportData) => {
  return `
    REPORTE NUTRICIONAL PROFESIONAL
    Fecha: ${formatFechaReporte()}
    Paciente: ${data.paciente.nombre} (${data.paciente.edad} años)
    
    1. EVALUACIÓN METABÓLICA
    - Tasa Metabólica Basal: ${data.clinico.tmb} kcal
    - Gasto Energético Total: ${data.clinico.get} kcal
    - Objetivo Macros: P:${data.clinico.macros.p}g C:${data.clinico.macros.c}g G:${data.clinico.macros.g}g
    
    2. COMPOSICIÓN CORPORAL
    - IMC: ${data.antropometria.imc} (${data.antropometria.grasaPct}% Grasa)
    - Peso: ${data.antropometria.peso} kg
    - Masa Libre de Grasa: ${data.antropometria.masaMagraKg} kg
    
    OBSERVACIONES:
    ${data.observaciones}
  `.trim();
};
