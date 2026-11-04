'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Ruler, 
  Scale, 
  TrendingDown,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  FileText,
  Trash2,
  Paperclip,
  UploadCloud,
  Plus
} from 'lucide-react';
import { 
  calcularIMC, 
  calcularGrasaFaulkner, 
  calcularComposicionCorporal,
  clasificarIMC 
} from '@/utils/calculosAntropometricos';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { antropometriaSchema } from '@/schemas/antropometriaSchema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConsultaStore } from '@/store/useConsultaStore';


export default function PanelAntropometria({ 
  pacienteId, 
  onSync,
  pacienteInitialData,
  anamnesisData,
  isActive
}: { 
  pacienteId: string, 
  onSync?: (data: any) => void,
  pacienteInitialData?: any,
  anamnesisData?: any,
  isActive?: boolean
}) {
  const queryClient = useQueryClient();
  const setStoreAntro = useConsultaStore(state => state.setAntropometria);
  const storeAntro = useConsultaStore(state => state.antropometria);

  const { register, watch, reset, setValue, formState: { isValid } } = useForm({
    resolver: zodResolver(antropometriaSchema),
    mode: 'onChange',
    defaultValues: {
      pacienteId: pacienteId,
      peso: pacienteInitialData?.peso || 70,
      altura: pacienteInitialData?.altura || 170,
      pliegues: { triceps: 10, subescapular: 12, suprailiaco: 15, abdominal: 18, muslo: 15 },
      perimetros: { cintura: 80, cadera: 95 }
    }
  });

  // 1. Fetch History
  const { data: serverData } = useQuery({
    queryKey: ['antropometria', pacienteId],
    queryFn: async () => {
      const res = await fetch(`/api/biometria?pacienteId=${pacienteId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar antropometría');
      return res.json();
    },
    enabled: !!pacienteId
  });

  const { data: anamnesisRaw } = useQuery({
    queryKey: ['anamnesis', pacienteId],
    queryFn: async () => {
      const res = await fetch(`/api/anamnesis?pacienteId=${pacienteId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    enabled: !!pacienteId && (!serverData?.data || serverData.data.length === 0)
  });

  const hasLoadedRef = React.useRef(false);
  const isInternalUpdateRef = React.useRef(false);
  const lastSyncedPesoRef = React.useRef<number | null>(null);
  const lastSyncedAlturaRef = React.useRef<number | null>(null);
 
  // RESET ON PATIENT CHANGE (V6 STABILIZATION)
  React.useEffect(() => {
    hasLoadedRef.current = false;
    reset({
      pacienteId: pacienteId,
      peso: 70,
      altura: 170,
      pliegues: { triceps: 10, subescapular: 12, suprailiaco: 15, abdominal: 18, muslo: 15 },
      perimetros: { cintura: 80, cadera: 95 }
    });
  }, [pacienteId, reset]);

  React.useEffect(() => {
    // Session fallback (Instant restoration before server responds)
    if (storeAntro && !hasLoadedRef.current) {
        reset({
            pacienteId,
            ...storeAntro.mediciones,
            pliegues: storeAntro.mediciones?.pliegues || { triceps: 10, subescapular: 12, suprailiaco: 15, abdominal: 18, muslo: 15 },
            perimetros: storeAntro.mediciones?.perimetros || { cintura: 80, cadera: 95 }
        });
        hasLoadedRef.current = true;
    }
    
    // Server data secondary hydration
    if (serverData?.data && serverData.data.length > 0 && !hasLoadedRef.current) {
      const latest = serverData.data[serverData.data.length - 1];
      reset({ 
        pacienteId: pacienteId,
        peso: latest.peso || 70, 
        altura: latest.altura || 170, 
        pliegues: latest.pliegues || { triceps: 10, subescapular: 12, suprailiaco: 15, abdominal: 18, muslo: 15 },
        perimetros: latest.perimetros || { cintura: 80, cadera: 95 }
      });
      hasLoadedRef.current = true;
      return;
    }

    if (anamnesisRaw?.data && !hasLoadedRef.current) {
      reset({
        pacienteId: pacienteId,
        peso: anamnesisRaw.data.peso || 70,
        altura: anamnesisRaw.data.altura || 170,
        pliegues: { triceps: 10, subescapular: 12, suprailiaco: 15, abdominal: 18, muslo: 15 },
        perimetros: { cintura: 80, cadera: 95 }
      });
      hasLoadedRef.current = true;
      return;
    }
  }, [serverData, anamnesisRaw, reset, pacienteId, storeAntro]);

  // Reactive sync from clinical panel (anamnesisData prop)
  // WE SYNC EVEN IF INACTIVE: This keeps our internal form updated so we don't back-sync OLD data when we become active.
  React.useEffect(() => {
    if (anamnesisData?.anamnesis && hasLoadedRef.current) {
        const clPeso = Number(anamnesisData.anamnesis.peso);
        const clAltura = Number(anamnesisData.anamnesis.altura);
        
        // REGRESIÓN DE BUCLE: Si el usuario tiene el foco aquí, ignorar señal externa
        const isPesoFocused = (document.activeElement?.id === 'peso');
        const isAlturaFocused = (document.activeElement?.id === 'altura');

        // Threshold comparison to break floating point loops + Focus lock
        if (clPeso && !isPesoFocused && Math.abs(clPeso - (lastSyncedPesoRef.current || 0)) > 0.01) {
            isInternalUpdateRef.current = true;
            setValue('peso', clPeso, { shouldDirty: false });
            lastSyncedPesoRef.current = clPeso;
            setTimeout(() => { isInternalUpdateRef.current = false; }, 100);
        }
        if (clAltura && !isAlturaFocused && Math.abs(clAltura - (lastSyncedAlturaRef.current || 0)) > 0.01) {
            isInternalUpdateRef.current = true;
            setValue('altura', clAltura, { shouldDirty: false });
            lastSyncedAlturaRef.current = clAltura;
            setTimeout(() => { isInternalUpdateRef.current = false; }, 100);
        }
    }
  }, [anamnesisData?.anamnesis?.peso, anamnesisData?.anamnesis?.altura, isActive]);
 

  React.useEffect(() => { hasLoadedRef.current = false; }, [pacienteId]);

  const peso = watch('peso');
  const altura = watch('altura');
  const pliegues = watch('pliegues');
  const perimetros = watch('perimetros');
  
  const imc = React.useMemo(() => calcularIMC(peso, altura), [peso, altura]);
  const grasaPct = React.useMemo(() => calcularGrasaFaulkner(
    pliegues?.triceps || 0, 
    pliegues?.subescapular || 0, 
    pliegues?.suprailiaco || 0, 
    pliegues?.abdominal || 0
  ), [pliegues]);
  const comp = React.useMemo(() => calcularComposicionCorporal(peso, grasaPct), [peso, grasaPct]);
  
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/biometria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al guardar');
      return res.json();
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['antropometria', pacienteId], (old: any) => {
        const newData = Array.isArray(old?.data) ? [...old.data] : [];
        const latestIdx = newData.findIndex((d: any) => new Date(d.createdAt).toDateString() === new Date().toDateString());
        if (latestIdx > -1) newData[latestIdx] = res.data;
        else newData.push(res.data);
        return { data: newData };
      });
      queryClient.invalidateQueries({ queryKey: ['paciente', pacienteId] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pacienteId', pacienteId);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Error al subir');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antropometria', pacienteId] });
    }
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (url: string) => {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, url }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antropometria', pacienteId] });
    }
  });

  const lastSyncRef = React.useRef<string>('');
  React.useEffect(() => {
    if (!isActive) return; // PROCESO DE ESTABILIZACIÓN V4
    const activeValues = { peso, altura, pliegues, perimetros };
    if (onSync) {
      if (isInternalUpdateRef.current) return; // Break Loop

      const syncObj = {
        mediciones: activeValues,
        resultados: { imc, clasificacionIMC: clasificarIMC(imc), porcentajeGrasa: grasaPct, masaMagraKg: comp.masaMagraKg, masaGordaKg: comp.masaGordaKg }
      };
      const syncStr = JSON.stringify(syncObj);
      if (syncStr !== lastSyncRef.current) {
        lastSyncRef.current = syncStr;
        onSync(syncObj);
        // Instant sync to session store
        setStoreAntro(syncObj);
        // Keep track of our own synced values to avoid loops
        lastSyncedPesoRef.current = Number(peso);
        lastSyncedAlturaRef.current = Number(altura);
      }
    }
 
    const timer = setTimeout(() => {
      if (isValid && pacienteId) {
        saveMutation.mutate({ pacienteId, peso, altura, pliegues, perimetros, resultados: { porcentajeGrasa: grasaPct, imc, masaGordaKg: comp.masaGordaKg, masaMagraKg: comp.masaMagraKg } });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [peso, altura, pliegues, perimetros, imc, grasaPct, comp, isValid, pacienteId, onSync, setStoreAntro]);
 

  const inputStyles = "w-full p-4 bg-surface-2 border border-border focus:border-accent/50 rounded-xl outline-none transition-all text-sm text-fg placeholder:text-fg-muted num";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-fg">
      <div className="xl:col-span-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shrink-0">
             <Ruler className="w-7 h-7 text-accent-fg" />
          </div>
           <div className="flex-1 w-full">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
               <h2 className="heading-sm !text-xl">Antropometría</h2>
               <div className={clsx(
                 "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap self-start sm:self-center",
                 saveMutation.isPending ? "bg-accent-soft text-accent" : "bg-success-soft text-success"
               )}>
                 {saveMutation.isPending ? "Sincronizando..." : "Sincronizado"}
               </div>
             </div>
             <p className="text-[13px] text-fg-muted mt-1">Mediciones y composición corporal</p>
           </div>
         </header>

        <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-full pb-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="eyebrow">Métricas fundamentales</h3>
              <div className="bg-surface-2 px-5 py-2 rounded-full flex items-center gap-3">
                <span className="text-[12px] text-fg-muted">Status:</span>
                <span className="text-sm font-medium text-fg">{clasificarIMC(imc)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="peso" className="text-[13px] font-medium text-fg-dim">Peso (kg)</label>
              <input id="peso" type="number" {...register('peso', { valueAsNumber: true })} className={inputStyles} />
            </div>
            <div className="space-y-2">
              <label htmlFor="altura" className="text-[13px] font-medium text-fg-dim">Estatura (cm)</label>
              <input id="altura" type="number" {...register('altura', { valueAsNumber: true })} className={inputStyles} />
            </div>
            <div className="space-y-1 bg-accent-soft p-5 rounded-2xl text-center flex flex-col justify-center">
               <span className="text-[12px] text-accent">IMC</span>
               <span className="stat-val !text-3xl">{imc}</span>
            </div>

            {/* SECCIÓN RESTAURADA: PERÍMETROS */}
            <div className="col-span-full pt-6 pb-2 border-b border-border">
              <h3 className="eyebrow">Cintura y cadera (cm)</h3>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-fg-dim">Cintura</label>
              <input type="number" step="0.1" {...register('perimetros.cintura', { valueAsNumber: true })} className={inputStyles} />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-fg-dim">Cadera</label>
              <input type="number" step="0.1" {...register('perimetros.cadera', { valueAsNumber: true })} className={inputStyles} />
            </div>

            {/* RESTORED FILE UPLOAD SECTION */}
            <div className="col-span-full pt-6 pb-4 border-b border-border flex items-center justify-between">
              <h3 className="eyebrow">Archivos / adjuntos</h3>
              <label className="cursor-pointer bg-accent hover:bg-accent-2 text-accent-fg px-5 py-2.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {uploadMutation.isPending ? 'Subiendo...' : 'Subir archivo'}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => { const file = e.target.files?.[0]; if(file) uploadMutation.mutate(file); }} />
              </label>
            </div>

            <div className="col-span-full">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serverData?.data && serverData.data.length > 0 &&
                    serverData.data.flatMap((d: any) => d.archivos || []).map((file: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-2 border border-border rounded-2xl hover:border-accent/25 transition-all duration-300">
                       <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-surface-3 rounded-full flex items-center justify-center shrink-0">
                             {file.tipo?.includes('image') ? <Sparkles className="w-5 h-5 text-accent" /> : <FileText className="w-5 h-5 text-success" />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-[13px] font-medium text-fg truncate">{file.nombre}</p>
                             <p className="text-[11px] text-fg-muted mt-0.5">{new Date(file.fecha).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 shrink-0 text-fg-muted">
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-accent transition-colors"><CheckCircle2 className="w-4 h-4" /></a>
                          <button onClick={() => deleteFileMutation.mutate(file.url)} className="p-2 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                  ))}
                  {(!serverData?.data || serverData.data.flatMap((d: any) => d.archivos || []).length === 0) && (
                     <div className="col-span-full py-10 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 text-fg-muted">
                        <Paperclip className="w-7 h-7" />
                        <p className="text-[13px] font-medium">Sin archivos adjuntos</p>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:col-span-4 space-y-8">
        <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm h-full">
          <h3 className="heading-sm !text-lg mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center"><TrendingDown className="w-5 h-5 text-accent-fg" /></div>Resultados
          </h3>
          <div className="bg-accent-soft p-6 rounded-2xl text-fg-dim flex items-start gap-4">
            <Info className="w-6 h-6 shrink-0 text-accent" />
            <p className="text-[13px] leading-relaxed">Los datos antropométricos se registran correctamente. Para análisis de composición corporal consultá con el profesional.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes: any[]) { return classes.filter(Boolean).join(' '); }
