'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calculator, 
  ClipboardList, 
  Activity, 
  Save, 
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  ArrowDown,
  ArrowUp,
  Equal,
  User,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { anamnesisSchema, draftAnamnesisSchema, type AnamnesisInput } from '@/schemas/anamnesisSchema';
import { 
  calcularGastoEnergetico, 
  calcularMacros, 
  type Sexo, 
  type FactorActividad 
} from '@/utils/calculosNutricionales';

export default function PanelClinico({ 
  pacienteId, 
  onSync,
  pacienteInitialData,
  antropometriaData,
  isActive
}: { 
  pacienteId: string, 
  onSync?: (data: any) => void,
  pacienteInitialData?: any,
  antropometriaData?: any,
  isActive?: boolean
}) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch data from server
  const { data: serverData, isLoading, isFetched: anamnesisF } = useQuery({
    queryKey: ['anamnesis', pacienteId],
    queryFn: async () => {
      const res = await fetch(`/api/anamnesis?pacienteId=${pacienteId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar anamnesis');
      return res.json();
    },
    enabled: !!pacienteId
  });

  // 1.5 Fetch Biometry for Calculator Sync (FALLBACK if no Anamnesis data)
  const { data: antroData } = useQuery({
    queryKey: ['antropometria', pacienteId],
    queryFn: async () => {
      const res = await fetch(`/api/biometria?pacienteId=${pacienteId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    enabled: !!pacienteId && !serverData?.data?.peso // Only if anamnesis doesn't have peso yet
  });

  const { 
    register, 
    handleSubmit, 
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<AnamnesisInput>({
    resolver: zodResolver(anamnesisSchema),
    mode: 'onChange',
    defaultValues: {
      pacienteId: pacienteId,
      motivoConsulta: pacienteInitialData?.objetivo || '',
      alergiasIntolerancias: 'Ninguna',
      nivelActividad: 'Sedentario' as any,
      ritmoIntestinal: 'Normal' as any,
      horasSueno: 8,
      nivelEstres: 5,
      peso: pacienteInitialData?.weight || pacienteInitialData?.peso || 70,
      altura: pacienteInitialData?.height || pacienteInitialData?.altura || 170,
      edad: pacienteInitialData?.fechaNacimiento ? 
            new Date().getFullYear() - new Date(pacienteInitialData.fechaNacimiento).getFullYear() : 30,
      sexo: pacienteInitialData?.sexo || 'masculino',
      tipoObjetivo: 'mantenimiento',
    }
  });

  const watchedFields = watch();

  // Sync server data to form only ONCE per patient load
  const hasLoadedRef = React.useRef(false);
  const [copied, setCopied] = useState(false);

  // RESET ON PATIENT CHANGE (V6 STABILIZATION)
  React.useEffect(() => {
    hasLoadedRef.current = false;
    // Clear form briefly while loading new patient
    reset({
      pacienteId: pacienteId,
      motivoConsulta: '',
      alergiasIntolerancias: 'Ninguna',
      nivelActividad: 'Sedentario',
      ritmoIntestinal: 'Normal',
      horasSueno: 8,
      nivelEstres: 5,
      peso: 70,
      altura: 170,
      sexo: 'masculino',
      tipoObjetivo: 'mantenimiento'
    } as any);
  }, [pacienteId, reset]);

  const handleCopyResults = () => {
    const text = `Resultados Clínicos - ${pacienteInitialData?.nombre || 'Paciente'}\n` +
                 `Peso: ${watchedFields.peso}kg | Altura: ${watchedFields.altura}cm | Edad: ${watchedFields.edad}\n` +
                 `GET: ${resultados.get} kcal\n` +
                 `Proteínas: ${macros.proteinas}g | Carbohidratos: ${macros.carbohidratos}g | Grasas: ${macros.grasas}g`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const lastSyncedPesoRef = React.useRef<number | null>(null);
  const lastSyncedAlturaRef = React.useRef<number | null>(null);
  const isInternalUpdateRef = React.useRef(false);
 

  // Hidratar desde localStorage INMEDIATAMENTE (antes de que responda el servidor)
  React.useEffect(() => {
    if (hasLoadedRef.current) return;
    const cached = localStorage.getItem(`anamnesis-${pacienteId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        reset({ ...parsed, pacienteId });
        hasLoadedRef.current = true;
      } catch {}
    }
  }, [pacienteId]);

  React.useEffect(() => {
    if (serverData?.data && !hasLoadedRef.current) {
      const data = serverData.data;
      if (Object.keys(data).length > 2) {
        reset({ ...watchedFields, ...data, pacienteId });
        if (!macrosLoadedRef.current) {
          if (data.caloriasOffset != null) setCaloriasOffset(data.caloriasOffset);
          if (data.macrosCarbos != null && data.macrosProteinas != null && data.macrosGrasas != null) {
            setMacrosPct({ carbos: data.macrosCarbos, proteinas: data.macrosProteinas, grasas: data.macrosGrasas });
          }
          macrosLoadedRef.current = true;
        }
        hasLoadedRef.current = true;
      }
    } else if (serverData?.data && hasLoadedRef.current) {
      // Ya hidratado desde localStorage, solo restaurar macros si los tiene el servidor
      const data = serverData.data;
      if (!macrosLoadedRef.current && data.macrosCarbos != null) {
        if (data.caloriasOffset != null) setCaloriasOffset(data.caloriasOffset);
        setMacrosPct({ carbos: data.macrosCarbos, proteinas: data.macrosProteinas, grasas: data.macrosGrasas });
        macrosLoadedRef.current = true;
      }
    } else if (pacienteInitialData && !hasLoadedRef.current && anamnesisF && !serverData?.data) {
       const initialValues = {
         ...watchedFields,
         motivoConsulta: pacienteInitialData.objetivo || '',
         peso: pacienteInitialData.peso || 70,
         altura: pacienteInitialData.altura || 170,
         sexo: pacienteInitialData.sexo || 'masculino',
         edad: pacienteInitialData.fechaNacimiento ?
               new Date().getFullYear() - new Date(pacienteInitialData.fechaNacimiento).getFullYear() : 30,
       };
       reset(initialValues);
       hasLoadedRef.current = true;
       saveMutation.mutate({ ...initialValues, isDraft: false });
    }
  }, [serverData, anamnesisF, reset, pacienteId, pacienteInitialData]);

  // Sync latest biometry to form ONLY if form is still at default (new patient session)
  React.useEffect(() => {
     if (antroData?.data?.length > 0 && !serverData?.data?.peso) {
        const latest = antroData.data[antroData.data.length - 1];
        if (latest.peso) reset({ ...watchedFields, peso: latest.peso });
        if (latest.altura) reset({ ...watchedFields, altura: latest.altura });
     }
  }, [antroData]);

  // Reset flag when patient changes
  React.useEffect(() => {
    hasLoadedRef.current = false;
    macrosLoadedRef.current = false;
    setCaloriasOffset(0);
    setMacrosPct({ carbos: 50, proteinas: 20, grasas: 30 });
  }, [pacienteId]);

  // PROACTIVE SYNC: If patient root data changes (e.g. edited in modal), update clinical form
  // ONLY if form is not "locked" or values match previous ones
  React.useEffect(() => {
    if (pacienteInitialData && hasLoadedRef.current) {
        const currentPeso = watchedFields.peso;
        const currentAltura = watchedFields.altura;
        
        // If profile has new data and anamnesis is still at default or matches old profile, update
        const profilePeso = pacienteInitialData.peso;
        const profileAltura = pacienteInitialData.altura;
        
        if (profilePeso && profilePeso !== currentPeso) {
            setValue('peso', profilePeso);
        }
        if (profileAltura && profileAltura !== currentAltura) {
            setValue('altura', profileAltura);
        }
    }
  }, [pacienteInitialData?.peso, pacienteInitialData?.altura, setValue]);

  // REACTIVE SYNC FROM BIOMETRY (ANTROPOMETRIA)
  // If user edits weight in Biometry tab, it should reflect here instantly
  // WE SYNC EVEN IF INACTIVE: This keeps our internal form updated so we don't back-sync OLD data when we become active.
  React.useEffect(() => {
    if (antropometriaData?.mediciones) {
        const clPeso = Number(antropometriaData.mediciones.peso);
        const clAltura = Number(antropometriaData.mediciones.altura);

        // REGRESIÓN DE BUCLE: Solo sincronizar si el usuario NO está editando estos campos aquí
        const isPesoFocused = document.activeElement?.id === 'calc-peso';
        const isAlturaFocused = document.activeElement?.id === 'calc-altura';

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
  }, [antropometriaData?.mediciones?.peso, antropometriaData?.mediciones?.altura, setValue, isActive]);
 
 

  const [macrosPct, setMacrosPct] = useState({ carbos: 50, proteinas: 20, grasas: 30 });
  const [caloriasOffset, setCaloriasOffset] = useState(0);
  const macrosLoadedRef = React.useRef(false);

  const handleMacroPctChange = (changedKey: 'carbos' | 'proteinas' | 'grasas', newVal: number) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    setMacrosPct(prev => ({ ...prev, [changedKey]: clamped }));
  };

  const resultados = React.useMemo(() => calcularGastoEnergetico(
    watchedFields.peso || 70,
    watchedFields.altura || 170,
    watchedFields.edad || 30,
    (watchedFields.sexo as any) || 'masculino',
    (watchedFields.nivelActividad?.toLowerCase() as any) || 'sedentario'
  ), [watchedFields.peso, watchedFields.altura, watchedFields.edad, watchedFields.sexo, watchedFields.nivelActividad]);
  
  const deficit = Math.round(resultados.get - 500);
  const mantenimiento = Math.round(resultados.get);
  const superavit = Math.round(resultados.get + 500);

  const currentTargetKcal = React.useMemo(() => {
    let base = mantenimiento;
    if (watchedFields.tipoObjetivo === 'deficit') base = deficit;
    if (watchedFields.tipoObjetivo === 'superavit') base = superavit;
    return Math.max(0, base + caloriasOffset);
  }, [watchedFields.tipoObjetivo, deficit, mantenimiento, superavit, caloriasOffset]);

  // Sync currentTargetKcal to form field for persistence
  React.useEffect(() => {
    setValue('caloriasObjetivo', currentTargetKcal);
  }, [currentTargetKcal, setValue]);

  // Sync caloriasOffset and macrosPct to form for persistence
  React.useEffect(() => {
    setValue('caloriasOffset' as any, caloriasOffset);
  }, [caloriasOffset, setValue]);
  React.useEffect(() => {
    setValue('macrosCarbos' as any, macrosPct.carbos);
    setValue('macrosProteinas' as any, macrosPct.proteinas);
    setValue('macrosGrasas' as any, macrosPct.grasas);
  }, [macrosPct, setValue]);

  const macros = React.useMemo(() => calcularMacros(
    currentTargetKcal,
    macrosPct.carbos,
    macrosPct.proteinas,
    macrosPct.grasas
  ), [currentTargetKcal, macrosPct]);

  // 2. Mutation for saving
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/anamnesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Error al guardar');
      }
      return res.json();
    },
    onSuccess: (res) => {
      if (!res.data.isDraft) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
      // Uniform structure: always { data: ... }
      queryClient.setQueryData(['anamnesis', pacienteId], { data: res.data });
      // Invalidate evolutionary history to reflect changes in Dashboard
      queryClient.invalidateQueries({ queryKey: ['historial-antropometria', pacienteId] });
      queryClient.invalidateQueries({ queryKey: ['biometria', pacienteId] });
      queryClient.invalidateQueries({ queryKey: ['paciente', pacienteId] });
    },
    onError: (err: any) => {
       setError(err.message);
       setTimeout(() => setError(null), 5000);
    }
  });

  // Sync state to parent for PDF/Preview
  const lastSyncRef = React.useRef<string>('');
  
  React.useEffect(() => {
    if (!isActive) return; // PROCESO DE ESTABILIZACIÓN V4
    if (onSync) {
      if (isInternalUpdateRef.current) return; // Break Loop

      const syncObj = {
        anamnesis: watchedFields,
        resultados,
        macros,
        objetivos: { deficit, mantenimiento, superavit },
        targetKcal: currentTargetKcal,
        tipoObjetivo: watchedFields.tipoObjetivo
      };
      
      const syncStr = JSON.stringify(syncObj);
      if (syncStr !== lastSyncRef.current) {
        lastSyncRef.current = syncStr;
        onSync(syncObj);
      }
    }
  }, [watchedFields, resultados, macros, onSync, deficit, mantenimiento, superavit, currentTargetKcal]);
 

  // Guardar en localStorage en cada cambio (backup instantáneo ante F5)
  React.useEffect(() => {
    if (!hasLoadedRef.current || !pacienteId) return;
    localStorage.setItem(`anamnesis-${pacienteId}`, JSON.stringify(watchedFields));
  }, [watchedFields, pacienteId]);

  // Autosave debounced al servidor (reducido a 800ms)
  const autoSaveRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!watchedFields.pacienteId) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!hasLoadedRef.current) return;
      const validation = draftAnamnesisSchema.safeParse(watchedFields);
      if (validation.success) {
        saveMutation.mutate({ ...watchedFields, isDraft: false });
      }
    }, 800);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [watchedFields]);

  const onSubmit = (data: AnamnesisInput) => {
    saveMutation.mutate({ ...data, isDraft: false });
  };

  const inputStyles = "w-full p-4 bg-surface-2 border border-border focus:border-accent/50 rounded-xl outline-none transition-all text-sm text-fg placeholder:text-fg-muted";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-fg">

      {/* LEFT SECTION: ANAMNESIS FORM */}
      <div className="xl:col-span-7 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center gap-6 bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shrink-0">
             <ClipboardList className="w-7 h-7 text-accent-fg" />
          </div>
           <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
              <h2 className="heading-sm !text-xl">Anamnesis</h2>
              <div className={clsx(
                "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap self-start sm:self-center",
                saveMutation.isPending ? "bg-accent-soft text-accent" : "bg-success-soft text-success"
              )}>
                {saveMutation.isPending ? (
                  <>
                    <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Sincronizado
                  </>
                )}
              </div>
            </div>
            <p className="text-[13px] text-fg-muted mt-1">Análisis de hábitos y antecedentes</p>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-4 sm:p-8 rounded-2xl border border-border shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label htmlFor="motivoConsulta" className="text-[13px] font-medium text-fg-dim">Motivo de consulta</label>
              {/* Persistent Objective Fields */}
              <input type="hidden" {...register('tipoObjetivo')} id="tipoObjetivo-hidden" />
              <input type="hidden" {...register('caloriasObjetivo')} id="caloriasObjetivo-hidden" />
              <input type="hidden" {...register('caloriasOffset' as any)} id="caloriasOffset-hidden" />
              <input type="hidden" {...register('macrosCarbos' as any)} id="macrosCarbos-hidden" />
              <input type="hidden" {...register('macrosProteinas' as any)} id="macrosProteinas-hidden" />
              <input type="hidden" {...register('macrosGrasas' as any)} id="macrosGrasas-hidden" />

              <textarea
                id="motivoConsulta"
                {...register('motivoConsulta')}
                className={clsx(inputStyles, "h-28 resize-none")}
                placeholder="Descripción del cuadro clínico..."
                aria-label="Motivo de la consulta nutricional"
              />
              {errors.motivoConsulta && <p className="text-danger text-[12px] mt-1">{errors.motivoConsulta.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="horariosTrabajo" className="text-[13px] font-medium text-fg-dim">Entorno / laboral</label>
              <textarea
                id="horariosTrabajo"
                {...register('horariosTrabajo')}
                className={clsx(inputStyles, "h-28 resize-none")}
                placeholder="Turnos, horarios, nivel de actividad laboral..."
                aria-label="Descripción del entorno laboral y horarios"
              />
            </div>

            {[
              { label: 'Patologías', key: 'patologias', ph: 'Ninguna', id: 'patologias' },
              { label: 'Alergias', key: 'alergiasIntolerancias', ph: 'Sin alergias reportadas', id: 'alergias' },
              { label: 'Medicación', key: 'medicacionActual', ph: 'Uso de fármacos o suplementos', id: 'medicacion' },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <label htmlFor={f.id} className="text-[13px] font-medium text-fg-dim">{f.label}</label>
                <input
                  id={f.id}
                  {...register(f.key as any)}
                  className={inputStyles}
                  placeholder={f.ph}
                  aria-label={`Ingresar ${f.label}`}
                />
                {(errors as any)[f.key] && <p className="text-danger text-[12px] mt-1">{(errors as any)[f.key].message}</p>}
              </div>
            ))}

            <div className="space-y-2">
              <label htmlFor="nivelActividad" className="text-[13px] font-medium text-fg-dim">Nivel de actividad</label>
              <select
                id="nivelActividad"
                {...register('nivelActividad')}
                className={clsx(inputStyles, "appearance-none")}
                aria-label="Seleccionar nivel de actividad física diaria"
              >
                <option value="Sedentario" className="bg-surface text-fg">Sedentario</option>
                <option value="Ligero" className="bg-surface text-fg">Ligero</option>
                <option value="Moderado" className="bg-surface text-fg">Moderado</option>
                <option value="Intenso" className="bg-surface text-fg">Intenso</option>
                <option value="Atleta" className="bg-surface text-fg">Atleta</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="ritmoIntestinal" className="text-[13px] font-medium text-fg-dim">Ritmo intestinal</label>
              <select
                id="ritmoIntestinal"
                {...register('ritmoIntestinal')}
                className={clsx(inputStyles, "appearance-none")}
                aria-label="Seleccionar ritmo intestinal del paciente"
              >
                <option value="Normal" className="bg-surface text-fg">Normal</option>
                <option value="Estreñimiento" className="bg-surface text-fg">Estreñimiento</option>
                <option value="Diarrea" className="bg-surface text-fg">Diarrea</option>
                <option value="Irregular" className="bg-surface text-fg">Irregular</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="aversionesAlimentarias" className="text-[13px] font-medium text-fg-dim">Aversiones</label>
              <input id="aversionesAlimentarias" {...register('aversionesAlimentarias')} className={inputStyles} placeholder="Alimentos que rechaza" aria-label="Ingresar alimentos que el paciente rechaza" />
            </div>

            <div className="space-y-2">
              <label htmlFor="horasSueno" className="text-[13px] font-medium text-fg-dim">Horas de sueño</label>
              <input id="horasSueno" type="number" {...register('horasSueno', { valueAsNumber: true })} className={`${inputStyles} num`} placeholder="Ej. 8" aria-label="Ingresar horas de sueño por noche" />
            </div>

            <div className="space-y-2">
              <label htmlFor="nivelEstres" className="text-[13px] font-medium text-fg-dim">Nivel de estrés (1-10)</label>
              <input id="nivelEstres" type="number" {...register('nivelEstres', { valueAsNumber: true })} className={`${inputStyles} num`} placeholder="Ej. 5" min={1} max={10} aria-label="Ingresar nivel de estrés percibido del 1 al 10" />
            </div>

          </div>
        </form>
      </div>

      {/* RIGHT SECTION: STRATEGIC CALCULATOR & BIO-ANALYSIS */}
      <div className="xl:col-span-5 space-y-8">
        <header className="flex items-center gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shrink-0">
             <Calculator className="w-7 h-7 text-accent-fg" />
          </div>
          <div>
            <h2 className="heading-sm !text-xl">Cálculos</h2>
            <p className="text-[13px] text-fg-muted mt-1">Gasto energético y macros</p>
          </div>
        </header>

        <section className="bg-surface p-4 sm:p-8 rounded-2xl border border-border shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {[
               { label: 'Sexo', key: 'sexo', icon: User, type: 'select', options: ['masculino', 'femenino'], id: 'calc-sexo' },
               { label: 'Actividad', key: 'nivelActividad', icon: Zap, type: 'select', options: ['Sedentario', 'Ligero', 'Moderado', 'Intenso', 'Atleta'], id: 'calc-actividad' },
               { label: 'Peso (kg)', key: 'peso', icon: Activity, type: 'number', id: 'calc-peso' },
               { label: 'Altura (cm)', key: 'altura', icon: Sparkles, type: 'number', id: 'calc-altura' },
               { label: 'Edad', key: 'edad', icon: Clock, type: 'number', id: 'calc-edad' },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <label htmlFor={item.id} className="text-[13px] font-medium text-fg-dim">{item.label}</label>
                <div className="relative group/input">
                  {item.type === 'select' ? (
                    <select
                      id={item.id}
                      {...register(item.key as any)}
                      className="w-full p-3.5 bg-surface-2 border border-border rounded-xl text-sm text-fg focus:border-accent/50 outline-none appearance-none cursor-pointer"
                      aria-label={`Seleccionar ${item.label.toLowerCase()}`}
                    >
                      {item.options?.map(opt => (
                        <option key={opt} value={item.key === 'sexo' ? opt.toLowerCase() : opt} className="bg-surface text-fg">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={item.id}
                      type="number"
                      step={item.key === 'edad' ? '1' : '0.1'}
                      {...register(item.key as any, { valueAsNumber: true })}
                      className="w-full p-3 sm:p-3.5 pr-10 bg-surface-2 border border-border rounded-xl text-xl sm:text-2xl font-medium text-fg focus:border-accent/50 outline-none transition-all num"
                      aria-label={`Ingresar ${item.label.toLowerCase()}`}
                    />
                  )}
                  <item.icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-transparent group-focus-within/input:text-accent/50 transition-colors duration-150 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
             <div className="relative flex items-center justify-between p-6 sm:p-8 bg-accent text-accent-fg rounded-2xl">
                <div className="flex-1">
                  <p className="text-[12px] text-accent-fg/70 mb-3">Total diario (GET)</p>
                  <p className="text-3xl sm:text-4xl font-medium tracking-tight leading-none num"><AnimatedNumber value={resultados.get} /> <span className="text-lg sm:text-xl text-accent-fg/70 font-normal pr-2">kcal</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyResults}
                  className="p-3 bg-white/15 hover:bg-white/25 rounded-full transition-all group/copy"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-accent-fg/80 group-hover/copy:text-accent-fg" />}
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
              { [
               { id: 'deficit', label: 'Déficit', val: deficit, color: 'text-danger', activeBg: 'bg-danger-soft', icon: ArrowDown },
               { id: 'mantenimiento', label: 'Mantener', val: mantenimiento, color: 'text-fg-dim', activeBg: 'bg-surface-3', icon: Equal },
               { id: 'superavit', label: 'Superávit', val: superavit, color: 'text-success', activeBg: 'bg-success-soft', icon: ArrowUp }
              ].map((opt, i) => (
                 <button
                   key={i}
                   type="button"
                   onClick={() => setValue('tipoObjetivo', opt.id as any)}
                   aria-pressed={watchedFields.tipoObjetivo === opt.id}
                   aria-label={`Establecer objetivo de ${opt.label}: ${opt.val} calorías por día`}
                   className={clsx(
                     "rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-4 transition-all duration-150 border",
                     watchedFields.tipoObjetivo === opt.id
                       ? `${opt.activeBg} border-transparent`
                       : "bg-surface-2 border-border hover:border-accent/20"
                   )}
                 >
                   <opt.icon className={clsx(
                     "w-6 h-6 transition-transform duration-150",
                     watchedFields.tipoObjetivo === opt.id ? opt.color : "text-fg-muted group-hover/opt:scale-110"
                   )} />
                   <div className="space-y-1">
                     <span className={clsx(
                       "text-[12px] font-medium transition-colors",
                       watchedFields.tipoObjetivo === opt.id ? "text-fg" : "text-fg-muted"
                     )}>{opt.label}</span>
                     <div className="text-xl font-medium text-fg tracking-tight num"><AnimatedNumber value={opt.val} /></div>
                     <span className="text-[11px] text-fg-muted leading-none">cal/día</span>
                   </div>
                 </button>
              ))}
          </div>

          {/* #3 — Ajuste manual de calorías */}
          <div className="mb-8 bg-surface-2 border border-border rounded-2xl p-5 space-y-3">
            <p className="text-[13px] font-medium text-fg-dim">Ajuste manual de calorías</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Restar 50 calorías"
                onClick={() => setCaloriasOffset(o => o - 50)}
                className="w-9 h-9 flex items-center justify-center bg-surface-3 hover:bg-border rounded-full text-fg font-medium text-lg transition-colors"
              >−</button>
              <div className="flex-1 text-center">
                <span className={clsx("text-xl font-medium tracking-tight num", caloriasOffset > 0 ? "text-success" : caloriasOffset < 0 ? "text-danger" : "text-fg-muted")}>
                  {caloriasOffset > 0 ? '+' : ''}{caloriasOffset}
                </span>
                <span className="text-[12px] text-fg-muted block">kcal de ajuste</span>
              </div>
              <button
                type="button"
                aria-label="Sumar 50 calorías"
                onClick={() => setCaloriasOffset(o => o + 50)}
                className="w-9 h-9 flex items-center justify-center bg-surface-3 hover:bg-border rounded-full text-fg font-medium text-lg transition-colors"
              >+</button>
            </div>
            {caloriasOffset !== 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[12px] text-fg-muted">Total objetivo</span>
                <span className="text-lg font-medium text-fg num">{currentTargetKcal} <span className="text-sm text-fg-muted font-normal">kcal</span></span>
              </div>
            )}
            {caloriasOffset !== 0 && (
              <button type="button" onClick={() => setCaloriasOffset(0)} className="text-[12px] text-fg-muted hover:text-fg transition-colors">
                Resetear ajuste
              </button>
            )}
          </div>

          <div className="space-y-8">
            <h3 className="eyebrow flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> Macros
            </h3>

            {/* #4 — Macros editables */}
            <div className="space-y-6">
               {([
                 { label: 'Carbohidratos', key: 'carbos' as const, g: macros.carbohidratos, color: 'bg-accent' },
                 { label: 'Proteínas', key: 'proteinas' as const, g: macros.proteinas, color: 'bg-success' },
                 { label: 'Grasas', key: 'grasas' as const, g: macros.grasas, color: 'bg-warning' }
               ]).map((macro) => (
                 <div key={macro.key} className="space-y-3 group">
                   <div className="flex items-center gap-3">
                     <span className="text-[13px] font-medium text-fg-dim flex-1 min-w-0 truncate">{macro.label}</span>
                     <div className="flex items-center gap-1.5 shrink-0">
                       <input
                         type="number"
                         min={0}
                         max={100}
                         value={macrosPct[macro.key]}
                         onChange={e => handleMacroPctChange(macro.key, parseInt(e.target.value) || 0)}
                         aria-label={`Porcentaje de ${macro.label}`}
                         className="w-14 text-center bg-surface-2 border border-border focus:border-accent/50 rounded-lg outline-none text-fg font-medium text-sm py-1.5 px-1 num"
                       />
                       <span className="text-fg-muted font-medium text-sm">%</span>
                     </div>
                     <span className="text-fg text-base tracking-tight font-medium shrink-0 w-16 text-right num">{macro.g}g</span>
                   </div>
                   <div
                    className="w-full h-2 bg-surface-2 rounded-full overflow-hidden relative"
                    role="progressbar"
                    aria-valuenow={macrosPct[macro.key]}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Porcentaje de ${macro.label.toLowerCase()}: ${macrosPct[macro.key]}%`}
                   >
                     <motion.div
                       layout
                       initial={{ width: 0 }}
                       animate={{ width: `${macrosPct[macro.key]}%` }}
                       transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                       className={`h-full ${macro.color} rounded-full`}
                     />
                   </div>
                 </div>
               ))}
            </div>

            {/* Total indicator */}
            {(() => {
              const total = macrosPct.carbos + macrosPct.proteinas + macrosPct.grasas;
              return (
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-full text-[12px] font-medium transition-all duration-150 ${total === 100 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                  <span>Total</span>
                  <span className="num">{total}%{total !== 100 ? ` (faltan ${100 - total}%)` : ' ✓'}</span>
                </div>
              );
            })()}

          </div>
        </section>
      </div>

    </div>
  );
}

// Minimal clsx helper
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
