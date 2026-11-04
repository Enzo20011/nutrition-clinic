'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search, X, User, Calendar, DollarSign, ClipboardList,
  BarChart2, ChevronRight, Zap, Settings, Command
} from 'lucide-react';

// ─── COMMAND REGISTRY ─────────────────────────────────────────────────────────
interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

const BADGE_STYLES: Record<string, string> = {
  Paciente: 'bg-accent/20 text-accent border-accent/20',
  Ruta: 'bg-surface-3/10 text-fg-muted/50 border-border',
  Finanzas: 'bg-success/20 text-success border-success/20',
  Agenda: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  Clínico: 'bg-warning/20 text-warning border-warning/20',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  // All available commands
  const [patients, setPatients] = useState<{ id: string; nombre: string; apellido: string; objetivo?: string; status?: string }[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Fetch real patients when palette opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingPatients(true);
    fetch('/api/pacientes')
      .then(r => r.json())
      .then(data => setPatients(Array.isArray(data) ? data.slice(0, 50) : []))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, [isOpen]);

  const staticCommands: CommandItem[] = [
    { id: 'nav-pacientes', title: 'Base de Pacientes', subtitle: 'Gestión de fichas clínicas', icon: <User className="w-5 h-5 text-accent" />, badge: 'Ruta', action: () => navigate('/admin/pacientes') },
    { id: 'nav-agenda', title: 'Agenda / Turnos', subtitle: 'Calendario de consultas', icon: <Calendar className="w-5 h-5 text-purple-400" />, badge: 'Ruta', action: () => navigate('/admin/agenda') },
    { id: 'nav-finanzas', title: 'Gestor Financiero', subtitle: 'Dashboard de ingresos', icon: <DollarSign className="w-5 h-5 text-success" />, badge: 'Finanzas', action: () => navigate('/admin/finanzas') },
    { id: 'nav-dashboard', title: 'Dashboard Principal', subtitle: 'Resumen general', icon: <BarChart2 className="w-5 h-5 text-fg-dim/60" />, badge: 'Ruta', action: () => navigate('/admin') },
    { id: 'nav-anamnesis', title: 'Anamnesis Clínica', subtitle: 'Fichas médicas', icon: <ClipboardList className="w-5 h-5 text-warning" />, badge: 'Clínico', action: () => navigate('/admin/anamnesis') },
    { id: 'action-agenda', title: 'Ver Turnos de Hoy', subtitle: 'Agenda del día', icon: <Zap className="w-5 h-5 text-warning" />, badge: 'Agenda', action: () => navigate('/admin/agenda') },
    { id: 'action-nuevo-pago', title: 'Registrar Cobro Manual', subtitle: 'Efectivo u otro método', icon: <DollarSign className="w-5 h-5 text-success" />, badge: 'Finanzas', action: () => navigate('/admin/finanzas') },
  ];

  const patientCommands: CommandItem[] = patients.map(p => ({
    id: `pac-${p.id}`,
    title: `${p.nombre} ${p.apellido}`,
    subtitle: p.objetivo ? `${p.status || 'Activo'} · ${p.objetivo}` : p.status || 'Paciente',
    icon: <User className="w-5 h-5 text-accent" />,
    badge: 'Paciente',
    action: () => navigate(`/admin/pacientes?id=${p.id}`),
  }));

  const allCommands: CommandItem[] = [...staticCommands, ...patientCommands];

  const filtered = query.trim() === ''
    ? allCommands
    : allCommands.filter(cmd =>
        `${cmd.title} ${cmd.subtitle} ${cmd.badge}`.toLowerCase().includes(query.toLowerCase())
      );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selected]?.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, selected, onClose]);

  // Reset selected when query changes
  useEffect(() => { setSelected(0); }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-darkNavy/90 backdrop-blur-2xl"
          />

          {/* PANEL */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-2xl bg-surface border border-border rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(var(--shadow-color),0.3)] overflow-hidden"
          >
            {/* SEARCH INPUT */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border-soft">
              <Search className="w-5 h-5 text-fg-muted/30 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar paciente, turno, ruta..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-fg text-base font-medium outline-none placeholder:text-fg-muted/20"
              />
              <div className="flex items-center gap-1.5">
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-surface-2/5 border border-border rounded-lg text-[10px] font-black text-fg-muted/30 uppercase tracking-wider">ESC</kbd>
                <button onClick={onClose} className="p-1.5 bg-surface-2/5 hover:bg-surface-3/10 rounded-lg text-fg-muted/30 hover:text-fg transition-colors border border-border">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* RESULTS */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-fg-muted/20 font-bold">
                  <Command className="w-8 h-8 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Sin resultados para "{query}"</p>
                </div>
              ) : (
                <>
                  {/* Group heading for non-search */}
                  {query === '' && (
                    <p className="px-5 pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-fg-muted/20">
                      Acceso Rápido
                    </p>
                  )}
                  {filtered.map((cmd, i) => (
                    <motion.button
                      key={cmd.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelected(i)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all text-left ${
                        selected === i ? 'bg-surface/[0.07]' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-surface-2/5 flex items-center justify-center shrink-0 border border-border-soft">
                        {cmd.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-fg font-bold text-sm truncate">{cmd.title}</p>
                        {cmd.subtitle && (
                          <p className="text-fg-muted/35 text-xs font-medium truncate">{cmd.subtitle}</p>
                        )}
                      </div>

                      {/* Badge */}
                      {cmd.badge && (
                        <span className={`hidden sm:flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${BADGE_STYLES[cmd.badge] || 'bg-surface-2/5 text-fg-muted/40 border-border'}`}>
                          {cmd.badge}
                        </span>
                      )}

                      {/* Enter key indicator on hover */}
                      {selected === i && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="shrink-0"
                        >
                          <ChevronRight className="w-4 h-4 text-fg-muted/30" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-5 py-3 border-t border-border-soft flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-fg-muted/20 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-surface-2/5 border border-border rounded text-[9px]">↑↓</kbd> Navegar</span>
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-surface-2/5 border border-border rounded text-[9px]">↵</kbd> Abrir</span>
              </div>
              <span className="text-[10px] text-fg-muted/15 font-bold">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
