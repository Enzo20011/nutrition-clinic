'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Archive, RotateCcw, X, AlertTriangle, Search, UserX } from 'lucide-react';

interface PacienteArchivado {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  updatedAt: string;
}

interface Props {
  onClose: () => void;
  onRestored: () => void;
}

export default function PapeleraPacientes({ onClose, onRestored }: Props) {
  const [archivados, setArchivados] = useState<PacienteArchivado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivados();
  }, []);

  const fetchArchivados = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pacientes?includeDeleted=true&limit=1000');
      const json = await res.json();
      const arrayData: PacienteArchivado[] = Array.isArray(json) ? json : (json.data || []);
      // Only show the deleted ones
      setArchivados(arrayData.filter((p: any) => p.isDeleted === true));
    } catch (err) {
      console.error('Error fetching archivados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoring(id);
    try {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true }),
      });
      if (res.ok) {
        setArchivados(prev => prev.filter(p => p.id !== id));
        onRestored();
      }
    } catch (err) {
      console.error('Error restaurando paciente:', err);
    } finally {
      setRestoring(null);
    }
  };

  const filtrados = archivados.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-2xl bg-surface border border-border rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-8 border-b border-border flex items-center justify-between bg-warning-soft">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/15 rounded-2xl">
              <Archive className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h2 className="heading-sm !text-2xl">
                Pacientes <span className="text-warning italic">archivados</span>
              </h2>
              <p className="text-fg-muted text-[13px] mt-1">
                Historial clínico preservado por ley — recuperación disponible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-surface-2 hover:bg-surface-3 text-fg-dim hover:text-fg rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LEGAL NOTICE */}
        <div className="mx-8 mt-6 p-4 bg-warning-soft border border-warning/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <p className="text-fg-dim text-[13px] leading-relaxed">
            Los pacientes archivados <span className="text-warning font-medium">no se eliminan de la base de datos</span>.
            Sus historias clínicas, dietas y consultas permanecen intactas por cumplimiento legal.
          </p>
        </div>

        {/* SEARCH */}
        <div className="px-8 mt-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
            <input
              type="text"
              placeholder="Buscar en archivados..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-full py-3.5 pl-12 pr-5 text-sm text-fg focus:border-warning/40 outline-none transition-all"
            />
          </div>
        </div>

        {/* LIST */}
        <div className="p-8 space-y-3 max-h-[40vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-warning/30 border-t-warning rounded-full animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12 text-fg-muted">
              <UserX className="w-10 h-10 mx-auto mb-3" />
              <p className="text-[13px] font-medium">
                {archivados.length === 0 ? 'No hay pacientes archivados' : 'Sin resultados para tu búsqueda'}
              </p>
            </div>
          ) : (
            filtrados.map(p => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between p-5 bg-surface-2 rounded-2xl border border-border hover:border-warning/30 transition-all"
              >
                <div>
                  <div className="text-fg font-medium">
                    {p.apellido}, {p.nombre}
                  </div>
                  <div className="text-fg-muted text-[12px] mt-1">
                    {p.email || 'Sin email'} · Archivado el {new Date(p.updatedAt).toLocaleDateString('es-AR')}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(p.id)}
                  disabled={restoring === p.id}
                  className="flex items-center gap-2 px-5 py-2.5 bg-warning/10 hover:bg-warning/20 border border-warning/20 hover:border-warning/40 text-warning rounded-full font-medium text-[13px] transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${restoring === p.id ? 'animate-spin' : ''}`} />
                  {restoring === p.id ? 'Restaurando...' : 'Restaurar'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
