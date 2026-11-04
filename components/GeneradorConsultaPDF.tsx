import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Colores Premium
const PRIMARY = '#1e293b'; // Slate 800
const ACCENT = '#1F4D3D';  // Blue 500
const SECONDARY = '#64748b'; // Slate 500
const BORDER = '#e2e8f0';   // Slate 200
const LIGHT_BG = '#f8fafc'; // Slate 50
const SUCCESS = '#10b981';  // Emerald 500
const DANGER = '#ef4444';   // Red 500

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    color: PRIMARY, 
    backgroundColor: '#ffffff', 
    fontSize: 9,
    lineHeight: 1.5 
  },

  // HEADER SISTEMÁTICO
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25,
    borderBottom: '2pt solid #1e293b',
    paddingBottom: 15
  },
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 35, height: 35 },
  brandTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  brandSubtitle: { fontSize: 7, color: ACCENT, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
  
  headerMeta: { alignItems: 'flex-end' },
  patientName: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  sessionInfo: { fontSize: 7, color: SECONDARY, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  // TITULO DE PÁGINA
  docHeader: {
    backgroundColor: LIGHT_BG,
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
    borderLeft: `4pt solid ${ACCENT}`
  },
  docTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  docSub: { fontSize: 7, color: SECONDARY, marginTop: 5, textTransform: 'uppercase', letterSpacing: 2 },

  // DASHBOARD DE MÉTRICAS (Resumen Ejecutivo)
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: '#ffffff', 
    borderRadius: 4, 
    border: `1pt solid ${BORDER}`,
    alignItems: 'center'
  },
  metricCardDark: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: PRIMARY, 
    borderRadius: 4, 
    alignItems: 'center'
  },
  metricLabel: { fontSize: 6, fontFamily: 'Helvetica-Bold', color: SECONDARY, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  metricLabelWhite: { fontSize: 6, fontFamily: 'Helvetica-Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  metricValue: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  metricValueWhite: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  metricUnit: { fontSize: 8, color: ACCENT },
  
  // BARRA DE COMPOSICIÓN
  compBarContainer: { width: '100%', height: 4, backgroundColor: BORDER, borderRadius: 2, marginTop: 8, overflow: 'hidden', flexDirection: 'row' },
  barFat: { backgroundColor: DANGER, height: '100%' },
  barMuscle: { backgroundColor: SUCCESS, height: '100%' },
  barRemainder: { backgroundColor: '#cbd5e1', height: '100%' },

  // SECCIONES GENERALES
  section: { marginBottom: 20 },
  sectionTitle: { 
    fontSize: 9, 
    fontFamily: 'Helvetica-Bold', 
    backgroundColor: PRIMARY, 
    color: '#ffffff', 
    padding: '6 12', 
    borderRadius: 2, 
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  // GRID DE DATOS (2 Columnas)
  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dataBox: { 
    width: '48%', 
    padding: '8 10', 
    backgroundColor: LIGHT_BG, 
    borderRadius: 2, 
    borderBottom: `1pt solid ${BORDER}` 
  },
  dataLabel: { fontSize: 7, color: SECONDARY, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 2 },
  dataValue: { fontSize: 9, color: PRIMARY },

  // TABLA DE ANTROPOMETRÍA
  bioRow: { flexDirection: 'row', borderBottom: `1pt solid ${LIGHT_BG}`, paddingVertical: 6, paddingHorizontal: 4 },
  bioCol: { flex: 1 },
  bioText: { fontSize: 8 },
  bioLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: SECONDARY },

  // PLAN ALIMENTARIO
  heroTitle: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', color: PRIMARY, marginBottom: 15 },
  heroSubtitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: SECONDARY, marginBottom: 20, letterSpacing: 1 },
  
  tableSimple: { width: '100%', border: `1pt solid ${BORDER}`, borderRadius: 4, overflow: 'hidden' },
  tableSimpleHead: { flexDirection: 'row', backgroundColor: LIGHT_BG, borderBottom: `1pt solid ${BORDER}`, padding: 8 },
  tableSimpleRow: { flexDirection: 'row', borderBottom: `1pt solid #f1f5f9`, padding: 8 },
  tableSimpleCol: { flex: 1, fontSize: 9 },

  // FOOTER
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    borderTop: `1pt solid ${BORDER}`, 
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: SECONDARY,
    fontSize: 7
  },
});

const val = (v: any, unit = '', fallback = '-') =>
    v !== undefined && v !== null && v !== '' ? `${v}${unit}` : fallback;

export const GeneradorConsultaPDF = ({ paciente, data }: any) => {
  // Parsing robusto de datos
  const syncAn = data?.anamnesis || {};
  const syncDieta = data?.dieta || {};
  const anamnesis = syncAn.anamnesis || {};
  const resultadosMetabolicos = syncAn.resultados || {};
  
  const targetKcal = syncAn.targetKcal || syncDieta?.targets?.targetKcal || 0;
  const tipoObjetivo = syncAn.tipoObjetivo || '-';

  const syncAntro = data?.antropometria || {};
  const mediciones = syncAntro.mediciones || {};
  const perimetros = mediciones.perimetros || {};
  const resultadosAntro = syncAntro.resultados || {};
  
  const patientName = `${paciente?.data?.nombre || paciente?.nombre || ''} ${paciente?.data?.apellido || paciente?.apellido || ''} `.trim();
  const fechaStr = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const peso = mediciones.peso || anamnesis.peso || 0;
  const fatPct = resultadosAntro.porcentajeGrasa || 0;
  const muscleKg = resultadosAntro.masaMagraKg || 0;
  const musclePct = peso > 0 ? (muscleKg / peso) * 100 : 0;
  const bonePct = 14; 
  const residualPct = Math.max(0, 100 - (fatPct + musclePct + bonePct));

  return (
    <Document>
      {/* PÁGINA 1: EVALUACIÓN CLÍNICA Y ANTROPOMETRÍA */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View>
              <Text style={styles.brandTitle}>NUTRI<Text style={{ color: ACCENT }}>PRO</Text></Text>
              <Text style={styles.brandSubtitle}>Plataforma de Alto Rendimiento</Text>
            </View>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.sessionInfo}>Fecha: {fechaStr} · Protocolo Clínico</Text>
          </View>
        </View>

        <View style={styles.docHeader}>
          <Text style={styles.docTitle}>Reporte de Evolución Nutricional</Text>
          <Text style={styles.docSub}>Análisis de composición corporal y metabolismo basal</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCardDark}>
            <Text style={styles.metricLabelWhite}>Objetivo Diario</Text>
            <Text style={styles.metricValueWhite}>{Math.round(targetKcal)} <Text style={styles.metricUnit}>KCAL</Text></Text>
            <Text style={{ fontSize: 6, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase' }}>{tipoObjetivo}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Gasto Energético (GET)</Text>
            <Text style={styles.metricValue}>{Math.round(resultadosMetabolicos.get || 0)} <Text style={styles.metricUnit}>KCAL</Text></Text>
            <Text style={{ fontSize: 6, color: SECONDARY, marginTop: 4 }}>TMB: {Math.round(resultadosMetabolicos.tmb || 0)} kcal</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Composición Corporal</Text>
            <Text style={styles.metricValue}>{fatPct > 0 ? fatPct.toFixed(1) : '-'} <Text style={styles.metricUnit}>% GRASA</Text></Text>
            <View style={styles.compBarContainer}>
                 <View style={[styles.barFat, { width: `${fatPct}%` }]} />
                 <View style={[styles.barMuscle, { width: `${musclePct}%` }]} />
                 <View style={[styles.barRemainder, { width: `${residualPct + bonePct}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Perfil Clínico y Hábitos</Text>
          <View style={styles.dataGrid}>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Motivo</Text><Text style={styles.dataValue}>{val(anamnesis.motivoConsulta)}</Text></View>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Actividad</Text><Text style={styles.dataValue}>{val(anamnesis.nivelActividad)}</Text></View>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Sueño/Estrés</Text><Text style={styles.dataValue}>{val(anamnesis.horasSueno, 'h')} / {val(anamnesis.nivelEstres, '/10')}</Text></View>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Patologías</Text><Text style={styles.dataValue}>{val(anamnesis.patologias)}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Antropometría</Text>
          <View style={{ gap: 5 }}>
            <View style={styles.bioRow}><Text style={[styles.bioCol, styles.bioLabel]}>Peso</Text><Text style={styles.bioCol}>{val(peso, ' kg')}</Text></View>
            <View style={styles.bioRow}><Text style={[styles.bioCol, styles.bioLabel]}>Altura</Text><Text style={styles.bioCol}>{val(mediciones.altura || anamnesis.altura, ' cm')}</Text></View>
            <View style={styles.bioRow}><Text style={[styles.bioCol, styles.bioLabel]}>Cintura</Text><Text style={styles.bioCol}>{val(perimetros.cintura, ' cm')}</Text></View>
            <View style={styles.bioRow}><Text style={[styles.bioCol, styles.bioLabel]}>Cadera</Text><Text style={styles.bioCol}>{val(perimetros.cadera, ' cm')}</Text></View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>NutriPro · Ciencia y Resultados</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* PÁGINA 2: PLAN NUTRICIONAL DETALLADO */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
           <View style={styles.logoSection}>
              <View>
                <Text style={styles.brandTitle}>PLAN <Text style={{ color: ACCENT }}>DIETÉTICO</Text></Text>
                <Text style={styles.brandSubtitle}>NUTRIPRO PERFORMANCE</Text>
              </View>
           </View>
           <Text style={styles.sessionInfo}>{patientName} · {fechaStr}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Distribución de Macronutrientes</Text>
          <View style={[styles.dataGrid, { marginBottom: 15 }]}>
             <View style={[styles.dataBox, { backgroundColor: PRIMARY, borderBottom: 'none' }]}><Text style={styles.metricLabelWhite}>Energía Total</Text><Text style={styles.metricValueWhite}>{Math.round(targetKcal)} kcal</Text></View>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Proteínas</Text><Text style={styles.dataValue}>{val(syncDieta?.macros?.p || syncDieta?.totals?.p, 'g')}</Text></View>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Carbohidratos</Text><Text style={styles.dataValue}>{val(syncDieta?.macros?.c || syncDieta?.totals?.c, 'g')}</Text></View>
             <View style={styles.dataBox}><Text style={styles.dataLabel}>Grasas</Text><Text style={styles.dataValue}>{val(syncDieta?.macros?.g || syncDieta?.totals?.g, 'g')}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Momentos del Día y Composición</Text>
          <View style={{ gap: 12 }}>
            {(syncDieta?.meals || []).map((meal: any, mIdx: number) => (
              <View key={mIdx} style={{ marginBottom: 10 }} wrap={false}>
                <View style={{ backgroundColor: LIGHT_BG, padding: '4 10', borderLeft: `2pt solid ${PRIMARY}`, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{meal.nombre}</Text>
                  <Text style={{ fontSize: 7, color: SECONDARY }}>{meal.items?.length || 0} ITEMS</Text>
                </View>
                <View style={{ paddingLeft: 10, marginTop: 5, gap: 3 }}>
                   {meal.items?.map((item: any, iIdx: number) => (
                     <View key={iIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1pt solid #f1f5f9', paddingVertical: 2 }}>
                       <Text style={{ fontSize: 8 }}>{item.nombre}</Text>
                       <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>{item.gramos}g</Text>
                     </View>
                   ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>NutriPro · Reporte Profesional Detallado</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
