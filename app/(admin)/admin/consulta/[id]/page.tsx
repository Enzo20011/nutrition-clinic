'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import PanelClinico from '@/components/PanelClinico';
import BlocNotas from '@/components/BlocNotas';

const TabSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-surface-2/5 rounded-xl" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 bg-surface-2/5 rounded-xl border border-border-soft" />
      <div className="h-64 bg-surface-2/5 rounded-xl border border-border-soft" />
    </div>
    <div className="h-48 bg-surface-2/5 rounded-xl border border-border-soft" />
  </div>
);

const PanelAntropometria = dynamic(() => import('@/components/PanelAntropometria'), { loading: () => <TabSkeleton /> });
const PlanAlimentario    = dynamic(() => import('@/components/PlanAlimentario'),    { loading: () => <TabSkeleton /> });
const DashboardEvolucion = dynamic(() => import('@/components/DashboardEvolucion'), { loading: () => <TabSkeleton /> });
import {
  User,
  ClipboardList,
  Ruler,
  ChevronLeft,
  Calendar,
  Utensils,
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import clsx from 'clsx';
import { useConsultaStore } from '@/store/useConsultaStore';

export default function ConsultaPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'anamnesis' | 'antropometria' | 'dieta' | 'evolucion'>('anamnesis');
  const [exportingType, setExportingType] = useState<'sesion' | 'dieta' | null>(null);
  
  const { 
    anamnesis, 
    antropometria, 
    dieta, 
    setAnamnesis, 
    setAntropometria, 
    setDieta,
    clearSession
  } = useConsultaStore();

  // Clear session if ID changes to avoid cross-patient data leaks
  const lastPatientIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (params.id && params.id !== lastPatientIdRef.current) {
       // Solo limpiar al CAMBIAR de paciente, no al recargar la misma página
       if (lastPatientIdRef.current !== null) {
         clearSession();
       }
       lastPatientIdRef.current = params.id;
    }
  }, [params.id, clearSession]);

  const { data: notasData } = useQuery({
    queryKey: ['notas', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/notas?pacienteId=${params.id}`);
      if (!res.ok) throw new Error('Error al cargar notas');
      return res.json();
    },
    enabled: !!params.id,
  });

  const notas = notasData?.data || [];
  const consultaData = { anamnesis, antropometria, dieta, notas };

  const { data: paciente, isLoading } = useQuery({
    queryKey: ['paciente', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/pacientes/${params.id}`);
      if (!res.ok) throw new Error('Error al cargar paciente');
      return res.json();
    }
  });

  if (!paciente && !isLoading) return <div className="p-10 text-center text-fg font-medium text-lg">Paciente no encontrado</div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32 p-6 selection:bg-accent/20">

      {/* PRINT HEADER SYSTEM */}
      <div className="print-header hidden">
        <div className="flex justify-between items-end border-b-4 border-black pb-8 mb-12">
          <div>
            <h1 className="text-4xl font-heading font-black uppercase tracking-tight">Nutri<span className="text-accent">Pro</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fg-dim mt-2">Protocolo de Intervención Clínica y Deportiva</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold uppercase tracking-widest">Expediente: {paciente?.data?.nombre} {paciente?.data?.apellido}</p>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Sincronización: {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* STRATEGIC CONSULTATION HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface p-4 sm:p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 relative z-10">
          <Link href="/admin/pacientes" className="w-11 h-11 min-h-[44px] bg-surface-2 rounded-full flex items-center justify-center text-fg-dim hover:text-fg border border-border transition-all duration-150 group/back shrink-0">
             <ChevronLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-accent rounded-full flex items-center justify-center text-accent-fg shrink-0 relative overflow-hidden">
               <User className="w-7 h-7 sm:w-10 sm:h-10 relative z-10" />
            </div>
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 text-accent text-[12px] font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Sincronización activa
              </div>
              {isLoading ? (
                <div className="h-8 w-48 bg-surface-2 rounded-xl animate-pulse" />
              ) : (
                <h1 className="heading-sm !text-2xl sm:!text-3xl break-words line-clamp-2">{paciente?.data?.nombre} <span className="text-fg-muted not-italic">{paciente?.data?.apellido}</span></h1>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <p className="text-[13px] text-fg-muted flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5" /> {isLoading ? '...' : new Date(paciente?.data?.createdAt || Date.now()).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })} <span className="w-1 h-1 rounded-full bg-border" /> {paciente?.data?.status || 'Activo'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (exportingType) return;
                      setExportingType('sesion');
                      try {
                        const { exportarConsultaLazy } = await import('@/utils/exportPdfAction');
                        await exportarConsultaLazy(paciente, consultaData);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setExportingType(null);
                      }
                    }}
                    disabled={!!exportingType}
                    className={clsx(
                      "bg-surface-2 border border-border px-4 py-2.5 min-h-[44px] rounded-full text-[13px] font-medium text-fg transition-all duration-150 flex items-center gap-2",
                      exportingType === 'sesion' ? "opacity-90" : !!exportingType ? "opacity-50 cursor-not-allowed" : "hover:bg-surface-3"
                    )}
                  >
                    {exportingType === 'sesion' ? (
                      <div className="w-4 h-4 border-2 border-fg-muted/30 border-t-fg rounded-full animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {exportingType === 'sesion' ? "..." : "Sesión"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (exportingType) return;
                      setExportingType('dieta');
                      try {
                        const { exportarDietaLazy } = await import('@/utils/exportPdfAction');

                        const antroFlat = {
                           peso: antropometria?.mediciones?.peso || anamnesis?.peso,
                           altura: antropometria?.mediciones?.altura || anamnesis?.altura,
                           cintura: antropometria?.mediciones?.perimetros?.cintura,
                           cadera: antropometria?.mediciones?.perimetros?.cadera,
                        };

                        await exportarDietaLazy(
                          paciente?.data,
                          dieta?.totals || {},
                          dieta?.meals || [],
                          antroFlat,
                          dieta?.tablaManual || [],
                          dieta?.recomendaciones || []
                        );
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setExportingType(null);
                      }
                    }}
                    disabled={!!exportingType}
                    className={clsx(
                      "bg-accent px-4 py-2.5 min-h-[44px] rounded-full text-[13px] font-medium text-accent-fg transition-all duration-150 flex items-center gap-2",
                      exportingType === 'dieta' ? "opacity-90" : !!exportingType ? "opacity-50 cursor-not-allowed" : "hover:bg-accent-2"
                    )}
                  >
                    {exportingType === 'dieta' ? (
                      <div className="w-4 h-4 border-2 border-accent-fg/30 border-t-accent-fg rounded-full animate-spin" />
                    ) : (
                      <Utensils className="w-4 h-4" />
                    )}
                    {exportingType === 'dieta' ? "..." : "Dieta"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex bg-surface-2 p-1.5 rounded-full border border-border relative z-10 mt-4 lg:mt-0 items-center w-full lg:w-fit max-w-full overflow-x-auto scrollbar-hide shrink-0 gap-0.5">
          {[
            { id: 'anamnesis', label: 'Historial', shortLabel: 'Hist.', icon: ClipboardList, hasData: !!anamnesis },
            { id: 'antropometria', label: 'Antropometría', shortLabel: 'Antro.', icon: Ruler, hasData: !!antropometria },
            { id: 'dieta', label: 'Plan nutricional', shortLabel: 'Plan', icon: Utensils, hasData: !!dieta },
            { id: 'evolucion', label: 'Evolución', shortLabel: 'Evol.', icon: TrendingUp, hasData: true },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex-1 lg:flex-none px-3 sm:px-4 py-2.5 min-h-[44px] rounded-full text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-150 relative group/tab shrink-0",
                activeTab === tab.id
                ? 'bg-accent text-accent-fg shadow-sm'
                : 'text-fg-muted hover:text-fg hover:bg-surface-3'
              )}
            >
              <tab.icon className={clsx("w-3.5 h-3.5 shrink-0 transition-transform duration-150", activeTab === tab.id ? "scale-110" : "opacity-60 group-hover/tab:opacity-100")} />
              <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
              <span className="sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
              {tab.hasData && (
                <div className={clsx(
                  "w-1 h-1 rounded-full shrink-0",
                  activeTab === tab.id ? 'bg-accent-fg' : 'bg-accent'
                )} />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* DYNAMIC PRECISION CONTENT AREA */}
      <main className="relative min-h-[600px]">
        <div className="bg-surface rounded-2xl border border-border p-3 sm:p-6 shadow-sm overflow-hidden min-h-[600px] relative">
           <div className="bg-bg rounded-2xl p-3 sm:p-6 lg:p-10 min-h-[500px] border border-border">

             {/* Todos los paneles se mantienen montados, solo se ocultan con CSS */}
             <div style={{ display: activeTab === 'anamnesis' ? 'block' : 'none' }}>
               <div className="space-y-10">
                 <PanelClinico
                   pacienteId={params.id}
                   onSync={setAnamnesis}
                   pacienteInitialData={paciente?.data}
                   antropometriaData={antropometria}
                   isActive={activeTab === 'anamnesis'}
                 />
                 <BlocNotas pacienteId={params.id} />
               </div>
             </div>

             <div style={{ display: activeTab === 'antropometria' ? 'block' : 'none' }}>
               <PanelAntropometria
                 pacienteId={params.id}
                 onSync={setAntropometria}
                 pacienteInitialData={paciente?.data}
                 anamnesisData={anamnesis}
                 isActive={activeTab === 'antropometria'}
               />
             </div>

             <div style={{ display: activeTab === 'dieta' ? 'block' : 'none' }}>
               <PlanAlimentario
                 pacienteId={params.id}
                 onSync={setDieta}
                 anamnesisData={anamnesis}
               />
             </div>

             <div style={{ display: activeTab === 'evolucion' ? 'block' : 'none' }}>
               <DashboardEvolucion
                 pacienteId={params.id}
                 paciente={paciente || {}}
                 sessionData={consultaData}
               />
             </div>

           </div>
        </div>
      </main>

    </div>
  );
}
