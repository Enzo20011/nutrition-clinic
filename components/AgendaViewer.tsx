'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Clock3,
  Phone,
  Calendar as CalendarIcon,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

export default function AgendaViewer() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { data: appointmentsRes, isLoading, refetch } = useQuery({
    queryKey: ['appointments', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd');
      const end = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd');
      const res = await fetch(`/api/appointments/list?start=${start}&end=${end}`);
      if (!res.ok) throw new Error('Error al cargar agenda');
      return res.json();
    }
  });

  // Limpieza automática al montar el componente
  React.useEffect(() => {
    const runCleanup = async () => {
      try {
        const res = await fetch('/api/appointments/cleanup', { method: 'POST' });
        const data = await res.json();
        if (data.processed > 0) {
          console.log(`🧹 Limpieza automática completada: ${data.processed} turnos procesados.`);
          refetch(); // Refrescar la lista de turnos si hubo cambios
        }
      } catch (err) {
        console.error('Error en cleanup automático:', err);
      }
    };
    runCleanup();
  }, [refetch]);

  // Filtrar para NO mostrar 'completada' o 'cancelada' en la vista principal
  const appointments = useMemo(() => {
    return (appointmentsRes?.data || []).filter((app: any) => 
      app.status !== 'completada' && app.status !== 'cancelada'
    );
  }, [appointmentsRes]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const selectedDayAppointments = useMemo(() => {
    return appointments.filter((app: any) => app.fecha === format(selectedDay, 'yyyy-MM-dd'));
  }, [appointments, selectedDay]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start p-4 md:p-8">

      {/* STRATEGIC CALENDAR CORE */}
      <div className="xl:col-span-8 bg-surface rounded-2xl border border-border overflow-hidden shadow-sm relative">
        <header className="p-4 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 bg-surface-2 relative z-10">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-accent text-accent-fg rounded-full flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="heading-sm !text-xl md:!text-2xl capitalize">
                {format(currentDate, 'MMMM', { locale: es })} <span className="text-accent italic">{format(currentDate, 'yyyy')}</span>
              </h3>
              <p className="text-[13px] text-fg-muted mt-1">Gestión de turnos</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center md:justify-end flex-wrap">
            <button type="button" aria-label="Mes anterior" onClick={prevMonth} className="w-9 h-9 md:w-10 md:h-10 bg-surface-3 hover:bg-accent text-fg-dim hover:text-accent-fg rounded-full transition-all flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button type="button" onClick={() => setCurrentDate(new Date())} className="flex-1 md:flex-none px-4 md:px-6 h-9 md:h-10 bg-accent text-accent-fg rounded-full text-[13px] font-medium hover:bg-accent-2 transition-all shadow-sm">
              Hoy
            </button>
            <button type="button" aria-label="Mes siguiente" onClick={nextMonth} className="w-9 h-9 md:w-10 md:h-10 bg-surface-3 hover:bg-accent text-fg-dim hover:text-accent-fg rounded-full transition-all flex items-center justify-center">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </header>

        <div className="p-3 md:p-6">
          {/* Days Operational Header */}
          <div className="grid grid-cols-7 mb-4 md:mb-6">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-fg-muted">{day}</div>
            ))}
          </div>

          {/* Precision Grid Days */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((day, i) => {
              const confirmedCount = appointments.filter((a: any) => a.fecha === format(day, 'yyyy-MM-dd') && a.status === 'confirmada').length;
              const isSelected = isSameDay(day, selectedDay);
              const isCurrMonth = isSameMonth(day, monthStart);
              const isTodayDay = isToday(day);

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={clsx(
                    "relative aspect-square rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 md:gap-2 group/day",
                    isCurrMonth ? "cursor-pointer" : "opacity-20 pointer-events-none",
                    isSelected
                      ? "bg-accent border-accent shadow-sm"
                      : "bg-transparent border-transparent hover:border-accent/30",
                    isTodayDay && !isSelected && "bg-accent-soft border-accent/30"
                  )}
                >
                  <span className={clsx(
                    "text-sm md:text-lg font-heading font-medium leading-none",
                    isSelected ? "text-accent-fg" : isTodayDay ? "text-accent" : "text-fg"
                  )}>{format(day, 'd')}</span>

                  {confirmedCount > 0 && (
                    <div className="flex gap-0.5 md:gap-1">
                      {Array.from({ length: Math.min(confirmedCount, 3) }).map((_, dotIdx) => (
                        <div key={dotIdx} className={clsx("w-1 h-1 rounded-full", isSelected ? "bg-accent-fg" : "bg-accent")} />
                      ))}
                    </div>
                  )}

                  {isTodayDay && !isSelected && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TACTICAL SIDEBAR: CHRONOGRAM */}
      <div className="xl:col-span-4 space-y-8">
        <motion.div
          key={selectedDay.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm space-y-8"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent text-[12px] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Cronograma diario
            </div>
            <h4 className="heading-sm !text-xl border-b border-border pb-5 capitalize">
              {format(selectedDay, "eeee d", { locale: es })} <br />
              <span className="text-fg-muted text-base font-normal not-italic">{format(selectedDay, "MMMM", { locale: es })}</span>
            </h4>
          </div>

          <div className="space-y-3">
            {selectedDayAppointments.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 text-fg-muted">
                <Clock3 className="w-10 h-10" />
                <p className="text-[13px] font-medium">No hay citas registradas</p>
              </div>
            ) : (
              selectedDayAppointments.map((app: any, idx: number) => (
                <div key={idx} className="group relative p-5 bg-surface-2 border border-border rounded-2xl hover:border-accent/25 transition-all duration-300">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-surface-3 rounded-full flex items-center justify-center group-hover:bg-accent transition-all duration-300">
                        <User className="w-5 h-5 text-fg-dim group-hover:text-accent-fg" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[15px] font-medium text-fg leading-none">{app.nombre}</p>
                        <span className={clsx(
                          "text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-block",
                          app.status === 'confirmada' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                        )}>
                          {app.status === 'confirmada' ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-accent text-accent-fg rounded-full text-[13px] font-medium num">
                      {app.hora}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 text-[13px] text-fg-dim num">
                      <Phone className="w-3.5 h-3.5" /> {app.telefono}
                    </div>
                    <Link href={`/admin/pacientes?buscar=${encodeURIComponent(app.nombre)}`} className="w-9 h-9 bg-surface-3 hover:bg-accent text-fg-dim hover:text-accent-fg rounded-full transition-all flex items-center justify-center" title="Buscar paciente">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* MISSION CRITICAL RECAP */}
        <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border">
          <div className="space-y-6">
            <p className="eyebrow">Métricas mensuales</p>
            <div className="space-y-1">
              <p className="stat-val">
                {appointments.filter((a: any) => a.status === 'confirmada').length}
              </p>
              <p className="text-[12px] text-fg-muted">Sesiones verificadas</p>
            </div>
            <Link href="/admin/finanzas" className="w-full py-4 bg-accent text-accent-fg rounded-full font-medium text-[14px] shadow-lg shadow-accent/15 hover:bg-accent-2 transition-all flex items-center justify-center gap-3 group/btn">
              Gestionar finanzas <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
