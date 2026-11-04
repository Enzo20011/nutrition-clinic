'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIMES = ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00", "18:00"];

export default function TurneroInteractivo() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [errorSlot, setErrorSlot] = useState<string | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [formData, setFormData] = useState({ nombre: '', email: '', whatsapp: '' });
  
  // NAVEGACIÓN DE CALENDARIO
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; 
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayIdx; i++) {
        days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    const now = new Date();
    now.setDate(1);
    now.setHours(0,0,0,0);
    
    if (nextMonth < now) return;
    
    setCurrentMonth(nextMonth);
    setSelectedDate(null);
    setSelectedTime(null);
    setTakenSlots([]);
  };

  const fetchAvailability = useCallback(async (date: string) => {
    try {
      const resp = await fetch(`/api/appointments/availability?fecha=${date}`);
      const data = await resp.json();
      setTakenSlots(data.takenSlots || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  }, []);

  const handleNextStep = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    setErrorSlot(null);

    try {
      const resp = await fetch('/api/appointments/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: selectedDate,
          hora: selectedTime,
          sessionId
        })
      });

      if (resp.status === 409) {
        const data = await resp.json();
        setErrorSlot(data.error);
        fetchAvailability(selectedDate);
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      console.error('Error locking slot:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedTime, sessionId, fetchAvailability]);

  const handleBooking = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const reserveResp = await fetch('/api/appointments/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          phone: formData.whatsapp,
          fecha: selectedDate,
          hora: selectedTime,
          sessionId
        })
      });

      if (!reserveResp.ok) {
        const errorData = await reserveResp.json();
        throw new Error(errorData.error || 'Error al crear la reserva');
      }

      const { reservaId } = await reserveResp.json();

      window.location.href = `/success?booking=confirmed&reserva=${reservaId}`;
    } catch (err: any) {
      console.error('Booking Error:', err);
      alert(err.message || 'Ocurrió un error al procesar tu reserva.');
      setLoading(false);
    }
  }, [selectedDate, selectedTime, formData, sessionId]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">

      <div className="flex-1 px-2">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[12px] font-medium text-accent">Paso 1</span>
                  </div>
                  <h2 className="heading-sm !text-xl">Fecha y hora</h2>
                </div>

                <div className="flex items-center gap-4 bg-surface-2 px-4 py-2 border border-border rounded-full">
                  <button
                    onClick={() => changeMonth(-1)}
                    disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                    aria-label="Mes anterior"
                    className="p-1.5 hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors text-fg-dim hover:text-fg"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-center min-w-[100px]">
                    <p className="text-[10px] text-fg-muted mb-0.5">Mes</p>
                    <p className="text-[13px] font-medium text-fg capitalize">{currentMonth.toLocaleString('es', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button onClick={() => changeMonth(1)} aria-label="Próximo mes" className="p-1.5 hover:bg-surface-3 rounded-full transition-colors text-fg-dim hover:text-fg">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-7 text-center mb-1">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <span key={i} className="text-[11px] font-medium text-fg-muted">{day}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5 relative min-h-[160px]">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentMonth.toISOString()}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="contents" // Use contents to keep grid layout
                    >
                      {calendarDays.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="p-2" />;
                        const dateStr = date.toISOString().split('T')[0];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        const isPassed = date < new Date(new Date().setHours(0,0,0,0));
                        const isSelected = selectedDate === dateStr;

                        return (
                          <motion.button
                            key={dateStr}
                            disabled={isPassed}
                            whileTap={!isPassed ? { scale: 0.95 } : {}}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              fetchAvailability(dateStr);
                              setSelectedTime(null);
                            }}
                            className={`relative p-1.5 rounded-xl flex flex-col items-center justify-center transition-all duration-300 border ${
                              isSelected
                              ? 'bg-accent border-accent text-accent-fg z-10'
                              : isPassed ? 'bg-transparent border-transparent text-fg-muted/30 cursor-not-allowed'
                              : 'bg-surface-2 border-transparent text-fg-dim hover:bg-surface-3'
                            }`}
                          >
                            <span className={`text-[13px] font-medium leading-none ${isToday && !isSelected ? 'text-accent' : ''}`}>
                              {date.getDate()}
                            </span>
                            {isToday && !isSelected && <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-accent rounded-full" />}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-3">
                  <label className="flex items-center gap-2 text-[13px] font-medium text-fg-dim">
                    <Clock className="w-3.5 h-3.5" /> Horarios disponibles
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {TIMES.map((time) => {
                      const isTaken = takenSlots.includes(time);

                      // Validación: No permitir turnos en el pasado si es hoy
                      const isToday = new Date().toISOString().split('T')[0] === selectedDate;
                      let isPastTime = false;

                      if (isToday) {
                        const now = new Date();
                        const [hours, minutes] = time.split(':').map(Number);
                        const slotTime = new Date();
                        slotTime.setHours(hours, minutes, 0, 0);
                        isPastTime = now > slotTime;
                      }

                      const isDisabled = isTaken || isPastTime;

                      return (
                        <motion.button
                          key={time}
                          disabled={isDisabled}
                          onClick={() => setSelectedTime(time)}
                          className={`relative py-2.5 rounded-full font-medium text-[13px] num transition-all duration-300 ${
                            selectedTime === time
                            ? 'bg-accent text-accent-fg'
                            : isDisabled ? 'bg-transparent text-fg-muted/40 cursor-not-allowed line-through'
                            : 'bg-surface-2 text-fg-dim hover:bg-surface-3'
                          }`}
                        >
                          {time}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {errorSlot && (
                <div className="flex items-center gap-3 p-5 bg-danger-soft border border-danger/20 rounded-2xl text-[13px] font-medium text-danger">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {errorSlot}
                </div>
              )}

              <button
                disabled={!selectedDate || !selectedTime || loading}
                onClick={handleNextStep}
                className="w-full mt-4 py-4 bg-accent disabled:bg-surface-3 disabled:text-fg-muted text-accent-fg font-medium rounded-full transition-all shadow-lg shadow-accent/15 text-[15px] flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reservar turno <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[12px] font-medium text-accent">Tus datos</span>
                  </div>
                  <h2 className="heading-sm !text-xl">Datos de contacto</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-[13px] font-medium text-fg-muted hover:text-accent transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { icon: User, placeholder: 'Nombre y apellido', key: 'nombre', type: 'text' },
                  { icon: Mail, placeholder: 'Email de contacto', key: 'email', type: 'email' },
                  { icon: Phone, placeholder: 'WhatsApp / móvil', key: 'whatsapp', type: 'tel' }
                ].map((input) => (
                  <div key={input.key} className="relative group">
                    <input.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within:text-accent transition-all duration-300" />
                    <input
                      required type={input.type} placeholder={input.placeholder}
                      value={formData[input.key as keyof typeof formData]}
                      onChange={e => setFormData({...formData, [input.key]: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-surface-2 rounded-xl outline-none border border-border focus:border-accent/50 transition-all duration-300 text-fg placeholder:text-fg-muted text-sm"
                    />
                  </div>
                ))}
              </div>

              <motion.button
                disabled={!formData.nombre || !formData.email.includes('@') || formData.whatsapp.length < 8}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(3)}
                className="w-full py-4 bg-accent text-accent-fg font-medium rounded-full transition-all shadow-lg shadow-accent/15 text-[15px] flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="space-y-10"
            >
              <div className="bg-surface border border-border rounded-2xl p-8 space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[12px] font-medium text-success">Reserva lista</span>
                  </div>
                  <h2 className="heading-sm !text-xl">Datos de tu turno</h2>
                  <p className="text-fg-muted text-[13px] mt-2">Confirmá los detalles para finalizar el proceso.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 border-y border-border py-6">
                   <div className="space-y-1">
                      <p className="text-[12px] text-fg-muted">Fecha</p>
                      <p className="text-lg font-medium text-fg capitalize">
                        {new Date(selectedDate || '').toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[12px] text-fg-muted">Horario</p>
                      <p className="text-lg font-medium text-fg num">{selectedTime}hs</p>
                   </div>
                   <div className="col-span-full pt-2">
                      <p className="text-[12px] text-fg-muted">Paciente</p>
                      <p className="text-lg font-medium text-fg">{formData.nombre}</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-full border border-border text-fg-muted text-[14px] font-medium hover:text-fg hover:bg-surface-2 transition-all">
                   Corregir
                </button>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="flex-[2] py-4 bg-accent text-accent-fg font-medium rounded-full transition-all shadow-lg shadow-accent/15 hover:bg-accent-2 text-[15px] flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar mi turno"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
