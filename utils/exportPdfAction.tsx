import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { GeneradorDietaPDF } from '@/components/GeneradorDietaPDF';
import { GeneradorConsultaPDF } from '@/components/GeneradorConsultaPDF';

export const exportarDietaLazy = async (paciente: any, macros: any, dieta: any, antropometria: any, tablaManual: any[] = [], recomendaciones: string[] = []) => {
  const blob = await pdf(
    <GeneradorDietaPDF 
      paciente={paciente} 
      macros={macros} 
      dieta={dieta} 
      antropometria={antropometria} 
      tablaManual={tablaManual}
      recomendaciones={recomendaciones}
    />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Plan_${paciente?.data?.nombre?.replace(/ /g, '_') ?? 'Paciente'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportarConsultaLazy = async (paciente: any, data: any) => {
  const blob = await pdf(<GeneradorConsultaPDF paciente={paciente} data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sesion_Completa_${paciente?.nombre?.replace(/ /g, '_') ?? 'Paciente'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
