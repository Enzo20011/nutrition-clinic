'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChartProps {
  data: any[];
}

export default function ClinicalCharts({ data }: ChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-surface-2/5 rounded-3xl border border-dashed border-border">
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Sin datos históricos suficientes</p>
      </div>
    );
  }

  // Preparar datos para Recharts
  const formattedData = data.map(record => ({
    fecha: format(new Date(record.createdAt), 'dd MMM', { locale: es }),
    peso: record.peso,
    imc: record.resultados?.imc || 0,
    grasa: record.resultados?.porcentajeGrasa || 0,
    fullDate: format(new Date(record.createdAt), 'PPP', { locale: es })
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkNavy/90 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-accentBlue mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-400">{entry.name}:</span>
              <span className="text-xs font-black text-fg">{entry.value.toFixed(1)}{entry.unit}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* PESO CHART */}
      <div className="bg-surface-2/5 border border-border p-6 rounded-[2rem] space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-accentBlue ml-2">Evolución de Peso (kg)</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="peso" 
                name="Peso" 
                unit="kg" 
                stroke="#1F4D3D" 
                strokeWidth={3} 
                dot={{ fill: '#1F4D3D', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COMPOSICIÓN CHART */}
      <div className="bg-surface-2/5 border border-border p-6 rounded-[2rem] space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-success ml-2">% Grasa e IMC</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="grasa" 
                name="% Grasa" 
                unit="%" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={{ fill: '#10B981', r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="imc" 
                name="IMC" 
                unit="" 
                stroke="#A855F7" 
                strokeWidth={2} 
                dot={{ fill: '#A855F7', r: 3 }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
