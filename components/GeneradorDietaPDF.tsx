import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const PRIMARY  = '#0f172a';
const ACCENT   = '#1d4ed8';
const GRAY     = '#64748b';
const BORDER   = '#e2e8f0';

const styles = StyleSheet.create({
  page: { padding: '44 48 60 48', fontFamily: 'Helvetica', color: PRIMARY, fontSize: 9, backgroundColor: '#ffffff' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 14, marginBottom: 22,
    borderBottomWidth: 2, borderBottomColor: PRIMARY,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 34, height: 34 },
  brandName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: PRIMARY, letterSpacing: 0.3 },
  brandSub: { fontSize: 6.5, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 3 },
  patientCol: { alignItems: 'flex-end' },
  patientName: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: PRIMARY },
  patientDate: { fontSize: 7, color: GRAY, marginTop: 3, letterSpacing: 0.5 },

  // Títulos
  mainTitle: {
    fontSize: 20, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase',
    textAlign: 'center', color: PRIMARY, letterSpacing: 1, marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 8.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase',
    textAlign: 'center', color: GRAY, letterSpacing: 2, marginBottom: 18,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER,
  },

  // Tabla
  table: { width: '100%', borderWidth: 1, borderColor: BORDER },
  tableHead: { flexDirection: 'row', backgroundColor: PRIMARY },
  thA: {
    width: '45%', padding: '7 10', fontSize: 9, fontFamily: 'Helvetica-Bold',
    color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  thC: {
    flex: 1, padding: '7 10', fontSize: 9, fontFamily: 'Helvetica-Bold',
    color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  itemRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  itemRowZebra: { backgroundColor: '#f8fafc' },
  tdA: { width: '45%', padding: '7 10', fontSize: 11, color: PRIMARY, borderRightWidth: 1, borderRightColor: BORDER, lineHeight: 1.2 },
  tdC: { flex: 1, padding: '7 10', fontSize: 11, color: PRIMARY, fontFamily: 'Helvetica-Bold', lineHeight: 1.2 },

  // Recomendaciones
  recsSection: { marginTop: 22 },
  recsTitle: {
    fontSize: 13, fontFamily: 'Helvetica-Bold', color: PRIMARY,
    marginBottom: 10, marginTop: 15,
    paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  recRow: { flexDirection: 'row', marginBottom: 8, paddingLeft: 4 },
  recBullet: { fontSize: 11, color: ACCENT, marginRight: 8, marginTop: 2 },
  recText: { fontSize: 11, color: PRIMARY, flex: 1, lineHeight: 1.5 },
  recNota: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 2,
    borderLeftColor: '#ef4444',
    paddingVertical: 4, 
    paddingHorizontal: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  recNotaText: { fontSize: 9, color: '#b91c1c', flex: 1, lineHeight: 1.5, fontFamily: 'Helvetica-Bold' },

  // Footer
  footer: {
    position: 'absolute', bottom: 24, left: 48, right: 48,
    borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerL: { fontSize: 7, color: GRAY },
  footerR: { fontSize: 7, color: GRAY },
});

interface Props {
  paciente: { nombre: string; apellido?: string; edad?: number };
  antropometria?: { peso?: number; altura?: number; cintura?: number; cadera?: number };
  macros?: { kcal: number; p: number; c: number; g: number };
  dieta?: any[];
  tablaManual?: { alimento: string; cantidad: string }[];
  recomendaciones?: string[];
}

export const GeneradorDietaPDF = ({
  paciente,
  antropometria,
  macros,
  dieta = [],
  tablaManual = [],
  recomendaciones = [],
}: Props) => {
  const recsFiltered = recomendaciones.filter(Boolean);
  const tablaFiltered = tablaManual.filter(f => f.alimento || f.cantidad);
  const fechaStr = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header} fixed>
          <View style={styles.logoRow}>
            <View>
              <Text style={styles.brandName}>NutriPro</Text>
              <Text style={styles.brandSub}>Plan Nutricional Personalizado</Text>
            </View>
          </View>
          <View style={styles.patientCol}>
            <Text style={styles.patientName}>{paciente.nombre} {paciente.apellido || ''}</Text>
            <Text style={styles.patientDate}>{fechaStr}</Text>
          </View>
        </View>

        {/* TÍTULOS */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.mainTitle}>Plan Alimentario</Text>
          <Text style={styles.mainSubtitle}>Información para el paciente</Text>
        </View>

        {/* TABLA DEL PACIENTE */}
        {tablaFiltered.length > 0 && (
          <View style={{ marginTop: 10 }}>
             <View style={styles.table}>
               <View style={styles.tableHead}>
                 <Text style={styles.thA}>Alimento / Opción</Text>
                 <Text style={styles.thC}>Cantidad Sugerida</Text>
               </View>
               {tablaFiltered.map((fila, idx) => (
                 <View key={idx} style={[styles.itemRow, idx % 2 !== 0 ? styles.itemRowZebra : {}]} wrap={false}>
                   <Text style={styles.tdA}>{fila.alimento}</Text>
                   <Text style={styles.tdC}>{fila.cantidad}</Text>
                 </View>
               ))}
             </View>
          </View>
        )}

        {/* RECOMENDACIONES */}
        {recsFiltered.length > 0 && (
          <View style={styles.recsSection}>
            <Text style={styles.recsTitle}>Recomendaciones:</Text>
            {recsFiltered.map((rec: string, idx: number) => {
              const match = rec.match(/nota:/i);
              const notaIndex = match ? match.index : -1;
              
              if (notaIndex !== -1 && notaIndex !== undefined) {
                const part1 = rec.substring(0, notaIndex).trim();
                const part2 = rec.substring(notaIndex).trim();
                
                return (
                  <React.Fragment key={idx}>
                    {/* Only show part1 as regular if it contains text */}
                    {part1.length > 0 && (
                      <View style={styles.recRow}>
                        <Text style={{ fontSize: 10, color: ACCENT, marginRight: 8 }}>•</Text>
                        <Text style={styles.recText}>{part1}</Text>
                      </View>
                    )}
                    {/* Always show nota: part as highlighted block */}
                    <View style={styles.recNota}>
                      <Text style={{ color: '#b91c1c', fontFamily: 'Helvetica-Bold', fontSize: 10, lineHeight: 1.4 }}>{part2}</Text>
                    </View>
                  </React.Fragment>
                );
              }

              return (
                <View key={idx} style={styles.recRow}>
                  <Text style={{ fontSize: 10, color: ACCENT, marginRight: 8 }}>•</Text>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerL}>NutriPro · Nutrición Deportiva y Clínica de Precisión</Text>
          <Text style={styles.footerR} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
};
