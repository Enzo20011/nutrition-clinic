'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Plus,
  TrendingUp,
  Search,
  FileText,
  Play,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { DashboardSkeleton } from '@/components/Skeleton';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFormattedDate(new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch('/api/admin/dashboard/stats');
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Búsqueda real de pacientes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length > 1) {
        try {
          const res = await fetch(`/api/admin/pacientes/search?q=${search}`);
          const { data } = await res.json();
          setSuggestions(data || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) return (
    <div className="p-8 bg-bg min-h-screen">
      <DashboardSkeleton />
    </div>
  );

  if (error || !stats) return (
    <div className="p-8 bg-bg min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-danger font-medium text-sm">Error al cargar el panel</p>
        <p className="text-fg-muted text-[13px]">No se pudieron obtener las estadísticas</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-accent text-accent-fg rounded-full text-[13px] font-medium hover:bg-accent-2 transition-all"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20 text-fg px-4 md:px-8">

      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-accent text-[12px] font-medium">
             <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> {mounted ? formattedDate : ''}
          </div>
          <h1 className="heading-md">
            Resumen de <span className="text-accent italic">actividad</span>
          </h1>
          <p className="text-fg-muted text-[13px] flex items-center gap-2">
            Próximo paciente: {stats?.proximoTurno ? `${stats.proximoTurno.hora}hs · ${stats.proximoTurno.nombre}` : 'Sin turnos hoy'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto"
        >
          <div className="relative group flex-1 lg:w-[320px] lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(search.length > 1)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="pl-11 pr-4 py-3 bg-surface border border-border rounded-full focus:border-accent/50 outline-none w-full transition-all text-sm text-fg placeholder:text-fg-muted"
              aria-label="Buscar paciente"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden">
                {suggestions.map((s: any, i) => (
                  <Link
                    key={i}
                    href={`/admin/pacientes?id=${s.id}`}
                    className="w-full px-6 py-4 text-left text-fg-dim hover:text-fg hover:bg-accent-soft transition-all border-b border-border last:border-none flex items-center gap-4 group"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <User className="w-4 h-4 text-fg-muted group-hover:text-accent" />
                    <span className="text-sm font-medium">{s.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pacientes?action=new"
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 min-h-[44px] rounded-full bg-accent text-accent-fg text-[13px] font-medium shadow-lg shadow-accent/15 hover:bg-accent-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Nuevo registro
            </Link>
          </div>
        </motion.div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { label: 'Agenda de hoy', value: stats?.agendaHoy || 0, sub: stats?.proximoTurno ? `Próximo: ${stats.proximoTurno.hora}hs` : 'Sin turnos hoy', icon: Calendar, accent: true, href: '/admin/agenda' },
          { label: 'Pacientes totales', value: stats?.totalPacientes || 0, sub: 'Registrados', icon: Users, accent: false, href: '/admin/pacientes' },
          { label: 'Ingresos del mes', value: `$${stats?.montoMensual?.toLocaleString('es-AR') || 0}`, sub: 'Confirmados', icon: TrendingUp, accent: false, href: '/admin/finanzas' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            className={clsx(
              "rounded-2xl border p-5 md:p-6 transition-all duration-150 relative overflow-hidden group h-full flex flex-col justify-between",
              stat.accent
                ? "bg-accent border-accent text-accent-fg"
                : "bg-surface border-border text-fg hover:border-accent/30"
            )}
          >
            <Link href={stat.href} className="flex flex-col h-full gap-6">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                stat.accent ? "bg-surface-3/15 text-accent-fg" : "bg-accent-soft text-accent"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <p className={clsx(
                  "text-[12px] font-medium",
                  stat.accent ? "text-accent-fg/70" : "text-fg-muted"
                )}>{stat.label}</p>
                <h3 className="stat-val" style={stat.accent ? { color: 'var(--accent-fg)' } : undefined}>{stat.value}</h3>
              </div>

              <p className={clsx(
                "text-[12px] font-medium",
                stat.accent ? "text-accent-fg/70" : "text-fg-muted"
              )}>
                {stat.sub}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* RECENT SESIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-6 md:p-10 rounded-2xl border border-border space-y-8"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="heading-sm">
                Próximas <span className="text-accent italic">sesiones</span>
              </h2>
            </div>
            <Link href="/admin/agenda" className="text-[13px] font-medium text-fg-muted hover:text-accent transition-all border-b border-border pb-1">Ver calendario</Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(stats?.proximasSesiones || []).length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <Calendar className="w-10 h-10 text-fg-muted" />
                <p className="text-[13px] font-medium text-fg-muted">No hay turnos próximos</p>
              </div>
            )}
            {(stats?.proximasSesiones || []).map((session: any, i: number) => (
                <motion.div
                  key={i}
                  className="p-6 bg-surface-2 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-accent/25 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-accent-soft text-accent rounded-full flex items-center justify-center font-heading font-medium text-lg group-hover:bg-accent group-hover:text-accent-fg transition-all duration-300">
                      {session.nombre.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[12px] text-fg-muted mb-1 num">{session.hora}hs · Turno sincronizado</p>
                      <h4 className="text-lg font-heading font-medium text-fg">{session.nombre}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.pacienteId ? (
                      <Link
                        href={`/admin/pacientes?id=${session.pacienteId}`}
                        className="flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-full border border-border text-[13px] font-medium text-fg-dim hover:text-fg hover:bg-surface-3 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ficha
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-full border border-border text-[13px] font-medium text-fg-muted cursor-not-allowed">
                        <FileText className="w-3.5 h-3.5" /> Ficha
                      </span>
                    )}
                    {session.pacienteId ? (
                      <Link
                        href={`/admin/consulta/${session.pacienteId}`}
                        className="px-6 py-3 min-h-[44px] rounded-full bg-accent text-accent-fg hover:bg-accent-2 shadow-lg shadow-accent/15 text-[13px] font-medium transition-all flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5" /> Iniciar sesión
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/pacientes?action=new&nombre=${encodeURIComponent(session.nombre)}&email=${encodeURIComponent(session.email)}`}
                        className="px-6 py-3 min-h-[44px] rounded-full bg-accent-soft text-accent border border-accent/20 hover:bg-accent hover:text-accent-fg text-[13px] font-medium transition-all flex items-center gap-2"
                        title="Paciente sin ficha registrada — crear ahora"
                      >
                        <Plus className="w-3.5 h-3.5" /> Crear ficha
                      </Link>
                    )}
                  </div>
                </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

    </div>
  );
}
