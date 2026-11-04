'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePatientStore } from '@/store/usePatientStore';
import Toast from './Toast';
import Loader from './Loader';
import PapeleraPacientes from './PapeleraPacientes';
import NuevoPacienteModal from './NuevoPacienteModal';
import EditarPacienteModal from './EditarPacienteModal';
import { PatientListSkeleton } from '@/components/ui/Skeletons';
import { 
  Users, Search, Plus, User, Phone, MessageCircle, TrendingUp, 
  ClipboardList, ChevronRight, Calendar, Weight, ArrowUpRight, 
  Sparkles, Trash2, Archive, AlertCircle, RefreshCw, Settings, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  peso?: number;
  objetivo?: string;
  ultimaConsulta?: string;
  status?: string;
  whatsapp?: string;
  email?: string;
  telefono?: string;
}

export default function BasePacientes() {
   const router = useRouter();
   const queryClient = useQueryClient();
   const { selectedPatientId: selectedId, setSelectedPatientId: setSelectedId, searchQuery, setSearchQuery, page, setPage } = usePatientStore();
   
   const [perPage, setPerPage] = useState(5);
   const [statusFilter, setStatusFilter] = useState('');
   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
   const [showPapelera, setShowPapelera] = useState(false);
   const [showNewPatient, setShowNewPatient] = useState(false);
   const [patientToEdit, setPatientToEdit] = useState<Paciente | null>(null);
   const [clinicalHistory, setClinicalHistory] = useState<any[]>([]);
   const [historyLoading, setHistoryLoading] = useState(false);
   const [localSearch, setLocalSearch] = useState(searchQuery);

   // Debounce search query to avoid spamming the API
   useEffect(() => {
     const timer = setTimeout(() => {
       setSearchQuery(localSearch);
       setPage(1);
     }, 400);
     return () => clearTimeout(timer);
   }, [localSearch, setSearchQuery, setPage]);
 

   const searchParams = useSearchParams();
   const action = searchParams?.get('action');
   const queryId = searchParams?.get('id');

   useEffect(() => {
     if (action === 'new') {
       setShowNewPatient(true);
     }
     if (queryId) {
        setSelectedId(queryId);
     }
   }, [action, queryId, setSelectedId]);

   // Fetch clinical history on selection
   useEffect(() => {
     setClinicalHistory([]); // PROCESO DE ESTABILIZACIÓN V6
     if (selectedId) {
        setHistoryLoading(true);
        fetch(`/api/pacientes/${selectedId}/historial`)
          .then(res => res.json())
          .then(data => {
            setClinicalHistory(data.data || []);
            setHistoryLoading(false);
          })
          .catch(err => {
            console.error(err);
            setHistoryLoading(false);
          });
     } else {
        setClinicalHistory([]);
     }
   }, [selectedId]);

   // Real API fetch with React Query & Server pagination
   const { data, isLoading: loading, isError, error, refetch } = useQuery({
     queryKey: ['pacientes', { page, limit: perPage, search: searchQuery }],
     queryFn: async () => {
       const res = await fetch(`/api/pacientes?page=${page}&limit=${perPage}&search=${searchQuery}`);
       if (!res.ok) throw new Error(`Error ${res.status}`);
       return res.json();
     },
   });

   const apiError = isError ? (error as Error).message || 'Error de conexión' : null;

   const deleteMutation = useMutation({
     mutationFn: async (id: string) => {
       const res = await fetch(`/api/pacientes/${id}`, { method: 'DELETE' });
       if (!res.ok) throw new Error('Failed to delete');
       return id;
     },
      onSuccess: (deletedId) => {
        setToast({ message: `Paciente archivado correctamente.`, type: 'info' });
        if (selectedId === deletedId) setSelectedId(null);
        queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      },
      onError: () => setToast({ message: 'Error al desactivar registro', type: 'error' })
   });

   const deleting = deleteMutation.isPending ? deleteMutation.variables : null;

    const handleSoftDelete = (id: string, nombre: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm(`¿Desactivar a ${nombre}? El registro se archivará.`)) return;
      deleteMutation.mutate(id);
    };

   // Datos paginados estandarizados desde la API
   const pacientes: Paciente[] = data?.data || [];
   const totalPages = data?.pagination?.totalPages || 1;
   const totalRecords = data?.pagination?.total || 0;

   // Status filter still local or can be pushed to query (for now local)
   const filteredPacientes = statusFilter ? pacientes.filter(p => p.status === statusFilter) : pacientes;
   const pacientesPage = filteredPacientes;

    const selectedPaciente = pacientes.find(p => p.id === selectedId);

   return (
       <div className="max-w-[1200px] mx-auto space-y-12 text-fg selection:bg-accent/20 p-6 md:p-8 bg-bg min-h-screen">
         {loading && <Loader />}
         {toast && (
           <AnimatePresence>
             <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
           </AnimatePresence>
         )}

         {apiError && (
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex items-center gap-6 p-6 rounded-2xl bg-danger-soft border border-danger/20 text-danger text-[13px] font-medium"
           >
             <AlertCircle className="w-5 h-5 shrink-0" />
             <span>{apiError}</span>
             <button
                onClick={() => refetch()}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface text-fg hover:bg-surface-3 transition-all text-[13px] font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </button>
           </motion.div>
         )}

      {/* STRATEGIC HEADER */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-b border-border pb-10">
          <div className="space-y-2">
            <h1 className="heading-md">
              Gestión de <span className="text-accent italic">pacientes</span>
            </h1>
            <p className="text-fg-muted text-[13px] num">
              Registro activo: {pacientesPage.length} <span className="w-1 h-1 rounded-full bg-accent mx-2 inline-block" /> Total: {totalRecords}
            </p>
          </div>

           <div className="flex flex-wrap gap-4 items-center">
             <button
                onClick={() => setShowPapelera(true)}
                className="flex items-center gap-3 px-6 py-3 rounded-full text-[13px] font-medium bg-surface-2 border border-border text-fg-dim hover:text-fg hover:bg-surface-3 transition-all"
             >
                <Archive className="w-4 h-4" /> Papelera
             </button>
             <button
                onClick={() => setShowNewPatient(true)}
                className="bg-accent text-accent-fg px-6 py-3 rounded-full text-[13px] font-medium flex items-center justify-center gap-3 transition-all shadow-lg shadow-accent/15 hover:bg-accent-2"
             >
                 <Plus className="w-4 h-4" /> Nuevo paciente
             </button>
           </div>
      </header>

      {/* CORE OPERATIONAL GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">

        {/* SIDE BAR LIST */}
        <div className="xl:col-span-4 space-y-8">
                <div className="bg-surface p-6 md:p-8 rounded-[2rem] border border-border shadow-sm space-y-8">
                     <div className="flex flex-col gap-4">
                         <div className="relative group/input">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within/input:text-accent transition-all duration-150" />
                            <input
                               type="text"
                               placeholder="Buscar paciente..."
                               value={localSearch}
                               onChange={e => setLocalSearch(e.target.value)}
                               className="w-full bg-surface-2 pl-12 pr-5 py-4 rounded-full outline-none border border-border focus:border-accent/50 transition-all text-sm text-fg placeholder:text-fg-muted"
                               aria-label="Buscar paciente por nombre o apellido"
                            />
                         </div>
                         <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-3">
                               <span className="text-[12px] text-fg-muted">Estado</span>
                               <select
                                  value={statusFilter}
                                  onChange={e => { setPage(1); setStatusFilter(e.target.value); }}
                                  className="bg-transparent border-none text-[13px] text-fg font-medium focus:ring-0 cursor-pointer outline-none"
                                  aria-label="Filtrar por estado del paciente"
                               >
                                  <option value="" className="bg-surface">Todos</option>
                                  <option value="Activo" className="bg-surface">Activo</option>
                                  <option value="En Pausa" className="bg-surface">Pausa</option>
                               </select>
                            </div>
                         </div>
                      </div>

                     <div className="space-y-3 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                           {loading && pacientes.length === 0 && (
                               <PatientListSkeleton />
                           )}
                           {pacientesPage.length === 0 && !loading && (
                               <div className="text-center py-16 flex flex-col items-center gap-4 text-fg-muted">
                                 <Users className="w-10 h-10" />
                                 <p className="text-[13px] font-medium">Lista vacía</p>
                               </div>
                           )}
                          {pacientesPage.map((p, idx) => (
                              <div
                                key={p.id}
                                className="relative group/card"
                              >
                                <button
                                   onClick={() => setSelectedId(p.id || null)}
                                   className={clsx(
                                      "w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-150 group relative border",
                                      (selectedId === p.id)
                                        ? 'bg-accent border-accent text-accent-fg'
                                        : 'bg-surface-2 border-border hover:border-accent/30 text-fg'
                                   )}
                                >
                                   <div className="flex items-center gap-4 relative z-10">
                                        <div className={clsx(
                                           "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150",
                                           (selectedId === p.id)
                                             ? 'bg-white/15'
                                             : 'bg-accent-soft'
                                        )}>
                                            <User className={clsx("w-5 h-5", (selectedId === p.id) ? 'text-accent-fg' : 'text-accent')} />
                                        </div>
                                        <div className="text-left space-y-1">
                                            <p className="font-medium text-[15px] leading-none">
                                              {p.nombre} <span className={(selectedId === p.id) ? 'text-accent-fg/70' : 'text-fg-muted'}>{p.apellido}</span>
                                            </p>
                                            <span className={clsx(
                                              "text-[11px] font-medium",
                                              (selectedId === p.id) ? "text-accent-fg/70" : "text-fg-muted"
                                            )}>
                                              {p.objetivo || 'Plan nutricional'}
                                            </span>
                                        </div>
                                   </div>
                                   <div className={clsx(
                                      "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 shrink-0",
                                      (selectedId === p.id)
                                        ? 'opacity-100'
                                        : 'opacity-0 -translate-x-2'
                                   )}>
                                        <ChevronRight className="w-4 h-4 text-accent-fg" />
                                   </div>
                                </button>
                                <button
                                  className="absolute top-2 right-2 z-20 text-fg-muted hover:text-danger p-2 rounded-full transition-all hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-danger/50"
                                   disabled={deleting === p.id}
                                   onClick={(e) => handleSoftDelete(p.id, `${p.nombre} ${p.apellido}`, e)}
                                  aria-label={`Archivar paciente ${p.nombre} ${p.apellido}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                               </div>
                          ))}
                     </div>

                     {/* Strategic Pagination */}
                     <div className="flex justify-between items-center pt-6 border-t border-border">
                        <div className="flex gap-2">
                           <button
                             onClick={() => setPage(Math.max(1, page - 1))}
                             disabled={page === 1}
                             className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:bg-surface-3 hover:text-accent transition-all disabled:opacity-30"
                             aria-label="Página anterior"
                           >
                              <ChevronRight className="w-4 h-4 rotate-180" />
                           </button>
                           <button
                             onClick={() => setPage(Math.min(totalPages, page + 1))}
                             disabled={page === totalPages || totalPages === 0}
                             className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:bg-surface-3 hover:text-accent transition-all disabled:opacity-30"
                             aria-label="Página siguiente"
                           >
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="text-right">
                            <p className="text-[12px] text-fg-muted num">Bloque {page} / {totalPages || 1}</p>
                            <div className="flex items-center gap-2 mt-1 justify-end">
                               <label className="text-[12px] text-fg-muted">Filas</label>
                               <select
                                  value={perPage}
                                  onChange={e => { setPage(1); setPerPage(Number(e.target.value)); }}
                                  className="bg-transparent border-none text-[13px] font-medium text-fg-dim outline-none cursor-pointer"
                                  aria-label="Pacientes por página"
                                >
                                  {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
                               </select>
                            </div>
                         </div>
                     </div>
                </div>
        </div>

         {/* DETAIL PANEL */}
         <div className="xl:col-span-8">
            <div className="min-h-full">
              {selectedPaciente ? (
                <div key={selectedPaciente.id} className="space-y-8">
                  {/* PATIENT HEADER */}
                  <div className="sticky top-[80px] md:top-[100px] z-30 flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 md:px-8 bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-sm mb-8 group">
                    <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 md:w-8 md:h-8 text-accent-fg" />
                      </div>
                      <div className="flex-1">
                        <p className="text-fg font-medium text-xl md:text-2xl leading-none">
                          {selectedPaciente.nombre} <span className="text-fg-muted">{selectedPaciente.apellido}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-3 py-1 rounded-full bg-surface-2 border border-border text-[11px] font-medium text-fg-muted num">#{selectedPaciente.id?.substring(0,8) || 'N/A'}</span>
                          <span className="w-1 h-1 rounded-full bg-accent" />
                          <p className="text-fg-muted text-[13px]">{selectedPaciente.objetivo || 'Plan estándar'}</p>
                        </div>
                      </div>
                      {/* Mobile Actions in header */}
                      <div className="flex md:hidden items-center gap-2">
                        {selectedId && (
                          <button
                            onClick={() => setSelectedId(null)}
                            className="p-3 rounded-full bg-surface-2 border border-border text-fg-muted"
                            title="Cerrar detalle"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-6 md:mt-0 relative z-10">
                      <button
                        onClick={() => router.push(`/admin/consulta/${selectedPaciente.id}`)}
                        className="flex-1 md:flex-none px-6 py-3 rounded-full bg-accent text-accent-fg text-[13px] font-medium shadow-lg shadow-accent/15 hover:bg-accent-2 transition-all duration-150 flex items-center justify-center gap-3 group/consult"
                      >
                        Nueva consulta
                        <Sparkles className="w-4 h-4 group-hover/consult:animate-pulse" />
                      </button>
                      <button
                        onClick={() => setPatientToEdit(selectedPaciente)}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-fg-dim hover:text-fg hover:bg-surface-3 transition-all duration-150"
                      >
                        <Settings className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Operational Telemetry Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Estado', value: selectedPaciente.status, icon: TrendingUp, status: true },
                      { label: 'Peso actual', value: `${selectedPaciente.peso || '—'} kg`, icon: Weight },
                      { label: 'Última visita', value: selectedPaciente.ultimaConsulta || 'Sin fecha', icon: Calendar },
                    ].map((card, i) => (
                      <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-accent/30 transition-all duration-150">
                        <div className="flex flex-col gap-6">
                          <div className="w-11 h-11 bg-accent-soft rounded-full flex items-center justify-center">
                            <card.icon className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-[12px] text-fg-muted mb-2">{card.label}</p>
                            {card.status ? (
                              <span className={clsx(
                                "px-4 py-1.5 rounded-full text-[12px] font-medium inline-block",
                                card.value === 'Activo' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                              )}>{card.value || 'N/A'}</span>
                            ) : (
                              <h4 className="stat-val !text-xl">{card.value}</h4>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Professional Modules */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* HISTORIAL */}
                    <div className="lg:col-span-7 bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
                      <h3 className="heading-sm !text-lg flex items-center gap-3">
                        <ClipboardList className="w-5 h-5 text-accent" /> Registros
                      </h3>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {historyLoading ? (
                          <div className="py-10 flex justify-center"><Loader /></div>
                        ) : clinicalHistory.length === 0 ? (
                          <div className="py-10 text-center text-fg-muted text-[13px] font-medium">Sin registros previos</div>
                        ) : (
                          clinicalHistory.map((item, i) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.tipo === 'CONSULTA') router.push(`/admin/consulta/${selectedId}`);
                                if (item.tipo === 'PLAN') router.push(`/admin/pacientes?id=${selectedId}`);
                              }}
                              className="w-full p-5 bg-surface-2 rounded-2xl border border-border flex items-center justify-between group/item hover:border-accent/30 transition-all cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-5 relative z-10 w-full">
                                <div className={clsx(
                                  "w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0",
                                  item.tipo === 'CONSULTA' ? 'bg-accent-soft text-accent' : item.tipo === 'PLAN' ? 'bg-success-soft text-success' : 'bg-surface-3 text-fg-dim',
                                  'group-hover/item:bg-accent group-hover/item:text-accent-fg'
                                )}>
                                  <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-fg text-[15px] leading-none truncate">{item.titulo}</p>
                                  <p className="text-[12px] text-fg-muted mt-2 flex items-center gap-2">
                                    {item.detalle} <span className="w-1 h-1 rounded-full bg-border" /> {new Date(item.fecha).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* CONTACTO */}
                    <div className="lg:col-span-12 xl:col-span-5 bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6 flex flex-col self-start">
                      <h3 className="heading-sm !text-lg">Contacto</h3>
                      <div className="p-8 bg-surface-2 rounded-2xl border border-border flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-accent text-accent-fg rounded-full flex items-center justify-center">
                          <MessageCircle className="w-7 h-7" />
                        </div>
                        <p className="text-lg font-medium text-fg num border-b border-border pb-4 w-full">{selectedPaciente.whatsapp || 'Sin registro'}</p>
                        {selectedPaciente.whatsapp ? (
                        <a
                          href={`https://wa.me/${selectedPaciente.whatsapp.replace('+', '')}`}
                          target="_blank"
                          className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-2 rounded-full font-medium text-[14px] transition-all shadow-lg shadow-accent/15 flex items-center justify-center gap-3 group/wa"
                        >
                          Enviar mensaje
                          <Sparkles className="w-4 h-4 group-hover/wa:animate-pulse" />
                        </a>
                        ) : (
                          <div className="w-full py-4 bg-surface-3 text-fg-muted rounded-full font-medium text-[14px] flex items-center justify-center gap-3 cursor-not-allowed">
                            Sin número registrado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[700px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-8 bg-surface-2/40">
                  <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center border border-border">
                    <Users className="w-10 h-10 text-fg-muted" />
                  </div>
                  <div className="text-center space-y-2 px-10">
                    <p className="heading-sm">Panel en espera</p>
                    <p className="text-fg-muted text-[13px] max-w-sm mx-auto">Seleccioná un paciente para comenzar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

      </div>

      <AnimatePresence>
        {showPapelera && (
          <PapeleraPacientes
            onClose={() => setShowPapelera(false)}
            onRestored={() => setToast({ message: 'Paciente restaurado exitosamente', type: 'success' })}
          />
        )}
      </AnimatePresence>

      <NuevoPacienteModal 
        isOpen={showNewPatient} 
        onClose={() => setShowNewPatient(false)} 
        onSuccess={(newId) => {
          setToast({ message: 'Paciente creado. Abriendo consola clínica...', type: 'success' });
          if (newId) {
              router.push(`/admin/consulta/${newId}`);
          }
        }}
      />

      {patientToEdit && (
        <EditarPacienteModal 
          isOpen={true} 
          paciente={patientToEdit}
          onClose={() => setPatientToEdit(null)} 
          onSuccess={() => setToast({ message: 'Paciente actualizado exitosamente', type: 'success' })}
        />
      )}

    </div>
  );
}

// Minimal clsx helper
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
