'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, User, Activity } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ConsultaIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();

  // Debounce: espera 300ms antes de disparar la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes_lista_maestra', debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/pacientes?page=1&limit=50&search=${debouncedSearch}`);
      if (!res.ok) throw new Error('Error de red');
      return res.json();
    }
  });

  const pacientes = data?.data || [];

  // Prefetch del paciente al hacer hover — cuando el usuario toca el nombre ya está cargado
  const prefetchPaciente = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['paciente', id],
      queryFn: async () => {
        const res = await fetch(`/api/pacientes/${id}`);
        if (!res.ok) throw new Error('Error');
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 text-fg selection:bg-accent/20 pb-20 p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-accent text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-soft)]" /> Consola clínica
          </div>
          <h1 className="heading-md">
            Seleccionar <span className="text-accent italic">paciente</span>
          </h1>
          <p className="text-fg-muted text-[13px] mt-2">Gestión de expedientes y protocolos activos</p>
        </div>

        <div className="flex items-center gap-4 bg-surface p-5 rounded-2xl border border-border shadow-sm">
          <Activity className="w-5 h-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-[12px] text-fg-muted">Registros totales</span>
            <span className="text-sm font-medium text-fg num">{isLoading ? '...' : `${pacientes.length} pacientes`}</span>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre o apellido..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface p-5 pl-16 rounded-full border border-border focus:border-accent/50 outline-none transition-all text-sm text-fg placeholder:text-fg-muted shadow-sm"
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[90px] bg-surface-2 rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && pacientes.length === 0 && (
          <div className="text-center text-fg-muted py-20 text-[13px] font-medium">
            No se encontraron pacientes coincidentes
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pacientes.map((p: any) => (
              <Link
                key={p.id}
                href={`/admin/consulta/${p.id}`}
                onMouseEnter={() => prefetchPaciente(p.id)}
                onTouchStart={() => prefetchPaciente(p.id)}
                className="flex items-center justify-between p-6 bg-surface rounded-2xl border border-border hover:border-accent/30 hover:bg-surface-2 transition-all group shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center gap-6 relative z-10 w-full">
                  <div className="w-14 h-14 bg-accent-soft rounded-full flex items-center justify-center group-hover:bg-accent transition-all duration-200">
                    <User className="w-6 h-6 text-accent group-hover:text-accent-fg transition-colors" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[12px] text-fg-muted">{p.objetivo || 'Sin protocolo'}</p>
                    <h4 className="text-lg font-medium text-fg group-hover:text-accent transition-colors">{p.nombre} {p.apellido}</h4>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-3 text-fg-muted group-hover:bg-accent group-hover:text-accent-fg group-hover:translate-x-1 transition-all relative z-10 shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
