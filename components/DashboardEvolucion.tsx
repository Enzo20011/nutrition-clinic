'use client';

import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Target, 
  ArrowUpRight,
  History,
  Sparkles,
  Zap,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export default function DashboardEvolucion({ 
  pacienteId, 
  paciente, 
  sessionData 
}: { 
  pacienteId: string, 
  paciente: any, 
  sessionData: any 
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Query DB History
  const { data: historialDb, isLoading } = useQuery({
    queryKey: ['historial-antropometria', pacienteId],
    queryFn: async () => {
      const res = await fetch(`/api/biometria?pacienteId=${pacienteId}`);
      const json = await res.json();
      return json.data || [];
    }
  });

  const historial = (historialDb && historialDb.length > 0) 
    ? historialDb.map((entry: any) => ({
        fecha: new Date(entry.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        peso: entry.peso || 0,
        grasa: entry.resultados?.porcentajeGrasa || 0,
        masaMagra: entry.resultados?.masaMagraKg || 0
      }))
    : [{ fecha: 'Sin Datos', peso: 0, grasa: 0, masaMagra: 0 }];

  const actual = historial[historial.length - 1];
  const anterior = historial.length > 1 ? historial[historial.length - 2] : actual;

  const deltaPeso = actual.peso > 0 ? (actual.peso - anterior.peso).toFixed(1) : '-';
  const deltaGrasa = actual.grasa > 0 ? (actual.grasa - anterior.grasa).toFixed(1) : '-';
  const magraActual = actual.masaMagra > 0 ? actual.masaMagra.toFixed(1) : '-';
  const deltaMagra = actual.masaMagra > 0 ? (actual.masaMagra - anterior.masaMagra).toFixed(1) : '-';

  // Extract GEB/Maintenance from sessionData (PanelClinico results)
  const getCalculated = sessionData?.anamnesis?.targetKcal || sessionData?.anamnesis?.resultados?.mantenimiento || 2000;



  return (
    <div className="space-y-10 pb-20 text-fg selection:bg-accent/20">

      {/* HEADER DASHBOARD */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-accent text-accent-fg rounded-full flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
          <div>
             <div className="flex items-center gap-2 text-accent text-[12px] font-medium mb-1">
               <Sparkles className="w-4 h-4" /> Reporte de evolución
             </div>
             <h2 className="heading-sm !text-xl">Historial de <span className="text-fg-muted italic">progreso</span></h2>
             <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[13px] font-medium text-success">Estado actual: en proceso</span>
             </div>
          </div>
        </div>
      </header>

      {/* METRICS GRID - HIGH IMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Peso corporal', val: actual.peso || '-', unit: 'kg', delta: Number(deltaPeso) > 0 ? `+${deltaPeso}` : deltaPeso, icon: Scale, trend: Number(deltaPeso) <= 0 ? 'down' : 'up', color: 'success' },
          { label: 'Grasa adiposa', val: actual.grasa?.toFixed(1) || '-', unit: '%', delta: Number(deltaGrasa) > 0 ? `+${deltaGrasa}` : deltaGrasa, icon: Zap, trend: Number(deltaGrasa) <= 0 ? 'down' : 'up', color: 'success' },
          { label: 'Masa magra', val: magraActual, unit: 'kg', delta: Number(deltaMagra) > 0 ? `+${deltaMagra}` : deltaMagra, icon: ArrowUpRight, trend: Number(deltaMagra) >= 0 ? 'up' : 'down', color: 'accent' },
          { label: 'Ingesta sugerida', val: Math.round(getCalculated), unit: 'kcal', delta: 'Objetivo OK', icon: Target, trend: 'stable', color: 'muted' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={clsx(
              "p-6 rounded-2xl border shadow-sm transition-all duration-300",
              stat.color === 'accent' ? 'bg-accent-soft border-accent/25' : 'bg-surface border-border hover:border-accent/25'
            )}
          >
             <p className="text-[12px] text-fg-muted mb-3">{stat.label}</p>
             <h4 className="stat-val !text-2xl mb-4">{stat.val} <span className="text-sm text-fg-muted font-normal ml-1">{stat.unit}</span></h4>
             <div className={clsx(
               "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium inline-flex",
               stat.color === 'success' ? 'bg-success-soft text-success' :
               stat.color === 'accent' ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-fg-muted'
             )}>
                {stat.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                <span className="num">{stat.delta}</span> {stat.unit === 'kcal' ? '' : 'vs ant.'}
             </div>
          </motion.div>
        ))}
      </div>

      {/* CHART SECTION - VISUAL PERFORMANCE */}
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="heading-sm !text-lg flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            Tendencia de evolución
          </h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3FA672' }} />
                <span className="text-[12px] text-fg-muted">Peso (kg)</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#C9A24B' }} />
                <span className="text-[12px] text-fg-muted">Grasa (%)</span>
             </div>
          </div>
        </div>

        <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
          {mounted && historial.length > 1 && historial[0].fecha !== 'Sin Datos' ? (
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <LineChart data={historial}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  stroke="#8A928C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#8A928C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#8A928C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 40]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1F1D', border: 'none', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500, color: '#F3F1EA' }}
                  labelStyle={{ color: '#A8AFA3' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="peso"
                  stroke="#3FA672"
                  strokeWidth={3}
                  dot={{ fill: '#3FA672', strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="grasa"
                  stroke="#C9A24B"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#C9A24B', strokeWidth: 0, r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="masaMagra"
                  stroke="#6B8CAE"
                  strokeWidth={2}
                  dot={{ fill: '#6B8CAE', r: 4 }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
              </LineChart>
            </ResponsiveContainer>
          ) : !mounted ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-center px-8">
               <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center">
                 <History className="w-7 h-7 text-accent" />
               </div>
               <div className="space-y-1">
                 <p className="text-[15px] font-medium text-fg">
                   Necesitás mínimo 2 controles
                 </p>
                 <p className="text-[13px] text-fg-muted max-w-xs">
                   Registrá una segunda medición en la pestaña <span className="text-accent font-medium">Medidas</span> para visualizar la progresión.
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* METABOLIC HISTORY - NEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-accent flex items-center gap-2">
                 <Zap className="w-4 h-4" /> Evolución del gasto energético
              </h3>
              <span className="text-[12px] text-fg-muted">Mantenimiento vs. base</span>
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-2 p-4 rounded-2xl flex flex-col items-center gap-1">
                 <span className="text-[12px] text-fg-muted">Inicial</span>
                 <span className="text-lg font-medium text-fg num">{historial[0]?.peso || 0} <span className="text-[12px] text-fg-muted font-normal">kg</span></span>
              </div>
              <div className="bg-accent-soft p-4 rounded-2xl flex flex-col items-center gap-1">
                 <span className="text-[12px] text-accent">Actual</span>
                 <span className="text-lg font-medium text-fg num">{actual.peso} <span className="text-[12px] text-fg-muted font-normal">kg</span></span>
              </div>
              <div className="bg-success-soft p-4 rounded-2xl flex flex-col items-center gap-1">
                 <span className="text-[12px] text-success">Cambio</span>
                 <span className="text-lg font-medium text-fg num">{((actual.peso - (historial[0]?.peso || actual.peso))).toFixed(1)} <span className="text-[12px] text-fg-muted font-normal">kg</span></span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-accent p-6 rounded-2xl flex flex-col justify-center space-y-3">
           <p className="text-[12px] text-accent-fg/70">Objetivo performance</p>
           <h4 className="heading-sm !text-xl" style={{ color: 'var(--accent-fg)' }}>Carga progresiva</h4>
           <p className="text-[13px] text-accent-fg/80 leading-relaxed">
             El balance sugiere una optimización positiva en la síntesis proteica y composición corporal.
           </p>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="heading-sm !text-lg flex items-center gap-3">
             <div className="w-11 h-11 bg-accent-soft rounded-full flex items-center justify-center">
                <History className="w-5 h-5 text-accent" />
             </div>
             Historial de mediciones
          </h3>
          <button className="text-[13px] font-medium text-fg-muted hover:text-fg transition-colors">Digitalizar historial</button>
        </div>

        <div className="overflow-x-auto px-4 pb-4 md:px-6 md:pb-6">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[12px] font-medium text-fg-muted">
                <th className="px-4 py-3">Fecha control</th>
                <th className="px-4 py-3">Masa (kg)</th>
                <th className="px-4 py-3">Grasa (%)</th>
                <th className="px-4 py-3">Magro (kg)</th>
                <th className="px-4 py-3 text-right">Estatus clínico</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((entry, i) => (
                <tr key={i} className="hover:bg-surface-2 transition-all group">
                  <td className="px-4 py-4 text-sm text-fg-dim num border-y border-l border-border rounded-l-2xl">{entry.fecha}</td>
                  <td className="px-4 py-4 border-y border-border">
                     <span className="text-base font-medium text-fg num group-hover:text-accent transition-colors">{entry.peso}</span>
                  </td>
                  <td className="px-4 py-4 border-y border-border">
                     <span className="text-base font-medium text-fg num">{entry.grasa ? entry.grasa.toFixed(1) : '-'}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-fg-muted num border-y border-border">{entry.masaMagra ? entry.masaMagra.toFixed(1) : '-'}</td>
                  <td className="px-4 py-4 text-right border-y border-r border-border rounded-r-2xl">
                    <span className="px-3 py-1 bg-success-soft text-success text-[12px] font-medium rounded-full">Estable</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Minimal clsx helper
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
