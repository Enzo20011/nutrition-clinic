'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Users,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ModalRegistroPago = dynamic(() => import('../../../../components/ModalRegistroPago'), { ssr: false });

export default function FinanzasPage() {
  const [stats, setStats] = useState<any>(null);
  const [recientes, setRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [periodo, setPeriodo] = useState<'mes' | 'mes_anterior' | 'anio'>('mes');

  const PERIODOS = [
    { id: 'mes', label: 'Este mes' },
    { id: 'mes_anterior', label: 'Mes anterior' },
    { id: 'anio', label: 'Este año' },
  ] as const;

  const fetchStats = async (p = periodo) => {
    try {
      const res = await fetch(`/api/finance/stats?periodo=${p}`);
      const data = await res.json();
      setStats(data?.stats || null);
      setRecientes(data?.recientes || []);
    } catch (err) {
      setStats(null);
      setRecientes([]);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats('mes');
  }, []);

  const handlePeriodo = (p: typeof periodo) => {
    setPeriodo(p);
    setLoading(true);
    fetchStats(p);
  };

  // No loading spinner as per user request (no animaciones de carga en admin)

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20 text-fg px-4 md:px-8 bg-bg">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-accent text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Gestión financiera
          </div>
          <h1 className="heading-md">
            Reporte de <span className="text-accent italic">rendimiento</span>
          </h1>
          <p className="text-fg-muted text-[13px] mt-2">
            Análisis detallado de ingresos y facturación
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 w-full lg:w-auto"
        >
          <div className="relative group flex-1 lg:w-72 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Filtrar reporte..."
              className="pl-11 pr-4 py-3 bg-surface border border-border rounded-full focus:border-accent/50 outline-none w-full transition-all text-sm text-fg placeholder:text-fg-muted"
            />
          </div>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 flex items-center gap-3 px-6 py-3 rounded-full bg-accent text-accent-fg text-[13px] font-medium shadow-lg shadow-accent/15 hover:bg-accent-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo registro
          </motion.button>
        </motion.div>
      </header>

      {/* OPERATIONAL RANGE SELECTOR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-full shadow-inner">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriodo(p.id)}
              className={clsx(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300",
                periodo === p.id
                  ? 'bg-accent text-accent-fg shadow-md shadow-accent/15'
                  : 'text-fg-dim hover:text-fg hover:bg-surface-3'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-fg-muted text-[13px]">
          <Calendar className="w-4 h-4" />
          <span>Periodo: <span className="text-fg font-medium">{PERIODOS.find(p => p.id === periodo)?.label}</span></span>
        </div>
      </div>

      {/* CORE TELEMETRY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: 'Ingresos Totales', value: `$${(stats?.totalHistorico || 0).toLocaleString()}`, growth: '+15.2%', icon: TrendingUp, accent: true, trend: 'En aumento' },
          { label: 'Sesiones Totales', value: stats?.count || 0, growth: '+8.1%', icon: CreditCard, accent: false, trend: 'Sostenido' },
          { label: 'Ticket Promedio', value: `$${Math.round((stats?.totalHistorico || 0) / (stats?.count || 1)).toLocaleString()}`, growth: '+2.4%', icon: DollarSign, accent: false, trend: 'Estable' },
          { label: 'Cumplimiento', value: '100.0%', growth: '+1.2%', icon: Users, accent: false, trend: 'Alta' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={clsx(
              "p-5 md:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group h-full flex flex-col justify-between",
              stat.accent
                ? "bg-accent border-accent text-accent-fg shadow-lg shadow-accent/15"
                : "bg-surface border-border text-fg hover:border-accent/30"
            )}
          >
            <div className="flex flex-col gap-8 h-full">
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center",
                stat.accent ? "bg-white/15 text-accent-fg" : "bg-accent-soft text-accent"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className={clsx(
                  "text-[12px] font-medium",
                  stat.accent ? "text-accent-fg/70" : "text-fg-muted"
                )}>{stat.label}</p>
                <h3 className="stat-val" style={stat.accent ? { color: 'var(--accent-fg)' } : undefined}>{stat.value || '0'}</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className={clsx(
                  "px-3 py-1 rounded-full text-[11px] font-medium num",
                  stat.accent ? "bg-white/15 text-accent-fg" : "bg-accent-soft text-accent"
                )}>
                  {stat.growth}
                </span>
                <span className={clsx("text-[11px] font-medium", stat.accent ? "text-accent-fg/70" : "text-fg-muted")}>
                   {stat.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-surface p-6 md:p-10 rounded-2xl border border-border shadow-sm space-y-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
               <h2 className="heading-sm">Historial de <span className="text-accent italic">ingresos</span></h2>
            </div>
          </div>
          <div className="h-[400px] w-full bg-surface-2 rounded-2xl border border-border border-dashed flex flex-col items-center justify-center relative overflow-hidden">
             <div className="flex flex-col items-center gap-4 text-fg-muted">
                <PieChartIcon className="w-10 h-10" />
                <p className="text-[13px] font-medium text-center">Los gráficos de rendimiento están en desarrollo</p>
             </div>
          </div>
        </motion.div>

        {/* SIDEBAR: RECENT MOVEMENTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-8"
        >
          <h2 className="heading-sm">Últimos <span className="text-accent italic">movimientos</span></h2>

          <div className="space-y-4">
            {recientes?.map((move, i) => (
              <div key={i} className="group p-5 bg-surface-2 border border-border rounded-2xl hover:border-accent/25 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-fg">{move.concepto}</h4>
                  <span className="text-sm font-medium text-accent num">+${move.monto.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-fg-muted num">{new Date(move.fecha).toLocaleDateString()}</p>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-accent-soft text-accent">{move.metodo}</span>
                </div>
              </div>
            ))}
            {recientes.length === 0 && (
              <div className="text-center py-16 text-fg-muted text-[13px] font-medium">No hay movimientos registrados</div>
            )}
          </div>
        </motion.div>
      </div>

      {showModal && (
        <ModalRegistroPago 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            fetchStats();
          }} 
        />
      )}
    </div>
  );
}
