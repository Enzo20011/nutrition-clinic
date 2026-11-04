'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Utensils, 
  PieChart, 
  Search,
  Zap,
  Sparkles,
  Database,
  CheckCircle2,
  ArrowRight,
  Minus,
  Dna, 
  Flame, 
  Scale, 
  Save, 
  Download, 
  Info,
  ChevronDown,
  X,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportarDietaLazy } from '@/utils/exportPdfAction';
import { useConsultaStore } from '@/store/useConsultaStore';

interface FoodItem {
  id: string;
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  gramos: number;
  origen: 'LOCAL' | 'USDA' | 'CUSTOM';
  idExterno?: string;
}

interface Meal {
  id: string;
  nombre: string;
  items: FoodItem[];
  totalKcal: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  objetivoSugerido?: { p: number, c: number, g: number };
}

const FOOD_DATABASE: Omit<FoodItem, 'gramos' | 'id'>[] = [
  { nombre: 'Pechuga de Pollo (Cruda)', calorias: 165, proteinas: 31, carbohidratos: 0, grasas: 3.6, origen: 'LOCAL' },
  { nombre: 'Arroz Integral Cocido', calorias: 111, proteinas: 2.6, carbohidratos: 23, grasas: 0.9, origen: 'LOCAL' },
  { nombre: 'Palta (Aguacate) Haas', calorias: 160, proteinas: 2, carbohidratos: 8.5, grasas: 14.7, origen: 'LOCAL' },
  { nombre: 'Yogur Ser Vainilla', calorias: 45, proteinas: 3.5, carbohidratos: 7.2, grasas: 0.1, origen: 'LOCAL' },
  { nombre: 'Galletitas Traviata', calorias: 420, proteinas: 10, carbohidratos: 68, grasas: 12, origen: 'LOCAL' },
  { nombre: 'Queso Casancrem Light', calorias: 120, proteinas: 9, carbohidratos: 4.8, grasas: 6.8, origen: 'LOCAL' },
];

export default function PlanAlimentario({ 
  pacienteId, 
  onSync,
  anamnesisData
}: { 
  pacienteId: string, 
  onSync?: (data: any) => void,
  anamnesisData?: any
}) {
  const queryClient = useQueryClient();
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', nombre: 'Desayuno', items: [], totalKcal: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { id: '2', nombre: 'Almuerzo', items: [], totalKcal: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { id: '3', nombre: 'Merienda', items: [], totalKcal: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { id: '4', nombre: 'Cena', items: [], totalKcal: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
  ]);
  const [targetKcal, setTargetKcal] = useState(2000);
  const [targetMacros, setTargetMacros] = useState({ proteinas: 30, carbohidratos: 40, grasas: 30 });
  const [tablaManual, setTablaManual] = useState<{alimento: string, cantidad: string}[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const setStoreDieta = useConsultaStore(state => state.setDieta);
  const storeDieta = useConsultaStore(state => state.dieta);

  // Sync calories from clinical panel (Anamnesis)
  React.useEffect(() => {
    if (anamnesisData?.targetKcal) {
      setTargetKcal(Math.round(anamnesisData.targetKcal));
    } else if (anamnesisData?.resultados?.get) {
      setTargetKcal(Math.round(anamnesisData.resultados.get));
    }
  }, [anamnesisData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<'ALL' | 'USDA' | 'ARGENFOODS'>('ALL');
  const [numComidas, setNumComidas] = useState<number>(4);
  const [isTablaOpen, setIsTablaOpen] = useState(false);
  const [isRecOpen, setIsRecOpen] = useState(false);

  // 1. Fetch initial data
  const { data: serverData } = useQuery({
    queryKey: ['dieta', pacienteId],
    queryFn: async () => {
      const res = await fetch(`/api/dieta?pacienteId=${pacienteId}`);
      if (!res.ok) throw new Error('Error al cargar dieta');
      return res.json();
    },
    enabled: !!pacienteId
  });

  // Sync server data to local state once
  const serverHydratedRef = React.useRef(false);
  React.useEffect(() => {
    if (serverData?.data && !serverHydratedRef.current) {
       const { comidas, objetivoCalorico, macrosObjetivo } = serverData.data;
       if (comidas && comidas.length > 0) {
         const fixedMeals = comidas.map((m: any, i: number) => ({
           ...m,
           id: m.id || (i + 1).toString(),
           items: m.items.map((it: any) => ({ ...it, id: it.id || Math.random().toString() })),
           totalKcal: m.totalKcal || 0,
           totalProteins: m.totalProteins || 0,
           totalCarbs: m.totalCarbs || 0,
           totalFats: m.totalFats || 0,
         }));
         setMeals(fixedMeals);
         setNumComidas(fixedMeals.length);
       }
       // Only hydrate calories if we have no anamnesis data yet
       if (objetivoCalorico && !anamnesisData?.resultados?.get) {
         setTargetKcal(objetivoCalorico);
       }
        if (macrosObjetivo) {
          setTargetMacros({
            proteinas: macrosObjetivo.proteinas || macrosObjetivo.p || 30,
            carbohidratos: macrosObjetivo.carbohidratos || macrosObjetivo.carbos || macrosObjetivo.c || 40,
            grasas: macrosObjetivo.grasas || macrosObjetivo.lipidos || macrosObjetivo.f || macrosObjetivo.g || 30
          });
        }
        if (serverData.data.tablaManual) setTablaManual(serverData.data.tablaManual);
        if (serverData.data.recomendaciones) setRecomendaciones(serverData.data.recomendaciones);
        serverHydratedRef.current = true;
    } else if (storeDieta && !serverHydratedRef.current) {
        if (storeDieta.tablaManual) setTablaManual(storeDieta.tablaManual);
        if (storeDieta.recomendaciones) setRecomendaciones(storeDieta.recomendaciones);
        serverHydratedRef.current = true;
    }
  }, [serverData, anamnesisData, storeDieta]);

  // Dynamic meals handler
  const getMealNames = (num: number) => {
    switch (num) {
      case 1: return ['Dieta Única (OMAD)'];
      case 2: return ['Desayuno', 'Cena'];
      case 3: return ['Desayuno', 'Almuerzo', 'Cena'];
      case 4: return ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];
      case 5: return ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Post-entreno'];
      case 6: return ['Desayuno', 'Colación M. Mañana', 'Almuerzo', 'Merienda', 'Cena', 'Colación Nocturna'];
      case 7: return ['Desayuno', 'Colación M. Mañana', 'Almuerzo', 'Colación M. Tarde', 'Merienda', 'Cena', 'Colación Nocturna'];
      case 8: return ['Desayuno', 'Colación M. Mañana', 'Almuerzo', 'Colación M. Tarde', 'Merienda', 'Cena', 'Pre-entreno', 'Post-entreno'];
      case 9: return ['Desayuno', 'Colación M. Mañana', 'Almuerzo', 'Colación M. Tarde', 'Merienda', 'Cena', 'Colación Nocturna', 'Pre-entreno', 'Post-entreno'];
      default: return Array.from({ length: num }).map((_, i) => `Comida ${i + 1}`);
    }
  };

  const handleNumComidasChange = (num: number) => {
    setNumComidas(num);
    const names = getMealNames(num);
    setMeals(prev => {
      const itemsPerMeal = Math.floor(prev.reduce((acc, m) => acc + m.items.length, 0) / (num || 1));
      return Array.from({ length: num }).map((_, i) => {
        const existingMeal = prev[i];
        return {
          id: (i + 1).toString(),
          nombre: names[i],
          items: existingMeal ? existingMeal.items : [],
          totalKcal: existingMeal ? existingMeal.totalKcal : 0,
          totalProteins: existingMeal ? existingMeal.totalProteins : 0,
          totalCarbs: existingMeal ? existingMeal.totalCarbs : 0,
          totalFats: existingMeal ? existingMeal.totalFats : 0,
        };
      });
    });
  };

  const totals = useMemo(() => {
    return meals.reduce((acc, meal) => {
      (meal.items || []).forEach(item => {
        const cal = item.calorias ?? (item as any).kcal ?? 0;
        const p = item.proteinas ?? 0;
        const c = item.carbohidratos ?? (item as any).carbos ?? 0;
        const g = item.grasas ?? (item as any).lipidos ?? (item as any).f ?? 0;
        const gr = item.gramos ?? 100;

        acc.kcal += (cal * gr) / 100;
        acc.p += (p * gr) / 100;
        acc.c += (c * gr) / 100;
        acc.g += (g * gr) / 100;
      });
      return acc;
    }, { kcal: 0, p: 0, c: 0, g: 0 });
  }, [meals]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/dieta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al guardar dieta');
      return res.json();
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['dieta', pacienteId], res);
    }
  });

  // Auto-sync with parent (PDF/Summary)
  const lastSyncRef = React.useRef<string>('');
  React.useEffect(() => {
    if (onSync) {
      const syncObj = { meals, totals, targets: { targetKcal, targetMacros }, tablaManual, recomendaciones };
      const syncStr = JSON.stringify(syncObj);
      if (syncStr !== lastSyncRef.current) {
        lastSyncRef.current = syncStr;
        onSync(syncObj);
        // Instant sync to session store
        setStoreDieta(syncObj);
      }
    }
  }, [meals, totals, targetKcal, targetMacros, tablaManual, recomendaciones, onSync, setStoreDieta]);

  // Autoguardado debounced
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (pacienteId) {
        saveMutation.mutate({
          pacienteId,
          objetivoCalorico: targetKcal,
          comidas: meals,
          macrosObjetivo: targetMacros,
          tablaManual,
          recomendaciones
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [meals, targetKcal, targetMacros, tablaManual, recomendaciones, pacienteId]);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Debounce logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search API Call
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['alimentos', debouncedSearch, filterSource],
    queryFn: async () => {
      if (debouncedSearch.length < 2) return { data: [] };
      
      const res = await fetch(`/api/alimentos?q=${debouncedSearch}&categoria=${filterSource}`);
      const data = await res.json();
      return { data: data.data || [] };
    },
    enabled: debouncedSearch.length >= 2
  });

  React.useEffect(() => {
    if (searchData?.data) {
      setSearchResults(searchData.data);
    }
  }, [searchData]);

  const addFood = (mealId: string, baseFood: any) => {
    const newFood: FoodItem = {
      ...baseFood,
      id: Math.random().toString(),
      gramos: 100,
      calorias: baseFood.calorias || baseFood.kcal || 0,
      carbohidratos: baseFood.carbohidratos || baseFood.carbos || 0,
      proteinas: baseFood.proteinas || 0,
      grasas: baseFood.grasas || baseFood.lipidos || baseFood.f || 0,
    };
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: [...m.items, newFood] } : m));
    setSearchQuery('');
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: m.items.filter(f => f.id !== foodId) } : m));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-fg">

      {/* ADVISORY BAR */}
      <div className="xl:col-span-12">
        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-5 shadow-sm">
          <div className="w-11 h-11 bg-accent rounded-full flex items-center justify-center text-accent-fg shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-fg leading-none">Gestión de plan alimentario</p>
            <p className="text-[12px] text-fg-muted mt-1.5">Personalización de ingestas y distribución de macronutrientes.</p>
          </div>
        </div>
      </div>

      {/* LEFT SECTION: STRATEGIC SEARCH & ARCHITECTURE */}
      <div className="xl:col-span-8 space-y-8">

        {/* BIO-SEARCH TERMINAL */}
        <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
           <div className="flex items-center gap-3 text-fg-muted">
              <Database className="w-4 h-4" />
              <span className="eyebrow !text-fg-muted">Base de datos nutricional</span>
           </div>

           <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group/search">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within/search:text-accent transition-all duration-150" />
               <input
                 id="food-search"
                 type="text"
                 placeholder="Buscar alimentos..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full bg-surface-2 pl-12 pr-5 py-3.5 rounded-full outline-none border border-border focus:border-accent/50 transition-all text-sm text-fg placeholder:text-fg-muted"
                 aria-label="Buscar alimentos en la base de datos nutricional"
               />
            </div>
            <div className="flex gap-1 bg-surface-2 p-1.5 rounded-full border border-border">
               {['ALL', 'ARGENFOODS', 'USDA'].map(s => (
                 <button
                   key={s}
                   onClick={() => setFilterSource(s as any)}
                   aria-pressed={filterSource === s}
                   aria-label={`Filtrar por fuente: ${s === 'ALL' ? 'Todas' : s}`}
                   className={clsx(
                     "px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-150",
                     filterSource === s ? 'bg-accent text-accent-fg' : 'text-fg-muted hover:text-fg hover:bg-surface-3'
                   )}
                 >
                   {s === 'ALL' ? 'Todos' : s}
                 </button>
               ))}
            </div>
           </div>

          <div className="pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-1">
                 <h3 className="text-sm font-medium text-fg">Número de ingestas</h3>
                 <p className="text-[12px] text-fg-muted">Definir frecuencia diaria</p>
               </div>
               <div className="flex items-center gap-3 bg-surface-2 p-1.5 rounded-full border border-border">
                 <button
                   onClick={() => numComidas > 1 && handleNumComidasChange(numComidas - 1)}
                   disabled={numComidas <= 1}
                   className="w-9 h-9 rounded-full hover:bg-surface-3 transition-all duration-150 flex items-center justify-center text-fg-dim hover:text-fg disabled:opacity-0"
                 >
                   <Minus className="w-4 h-4" />
                 </button>
                 <div className="w-10 text-center">
                   <span className="text-xl font-medium text-fg num">{numComidas}</span>
                 </div>
                 <button
                   onClick={() => numComidas < 9 && handleNumComidasChange(numComidas + 1)}
                   disabled={numComidas >= 9}
                   className="w-9 h-9 rounded-full hover:bg-surface-3 transition-all duration-150 flex items-center justify-center text-fg-dim hover:text-fg disabled:opacity-0"
                 >
                   <Plus className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchQuery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar p-1"
            >
              {isSearchLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 bg-surface-2 rounded-2xl animate-pulse border border-border" />
                ))
              ) : (
                searchResults.map((food, i) => (
                  <button
                    key={food.id || i}
                    disabled={!activeMealId}
                    onClick={() => activeMealId && addFood(activeMealId, food)}
                    className={clsx(
                      "flex flex-col p-5 rounded-2xl border transition-all duration-150 text-left group",
                      activeMealId
                        ? 'bg-surface border-border hover:border-accent/30 shadow-sm'
                        : 'opacity-40 cursor-not-allowed bg-transparent border-transparent'
                    )}
                  >
                     <div className="flex justify-between items-start mb-4 w-full">
                        <div className="flex gap-2">
                           <span className="px-2.5 py-1 bg-surface-2 rounded-full text-[11px] font-medium text-accent">
                             {food.categoria || 'Alimento'}
                           </span>
                           <span className={clsx(
                             "px-2.5 py-1 rounded-full text-[11px] font-medium",
                             food.origen === 'USDA' ? 'bg-warning-soft text-warning' :
                             food.origen === 'ARGENFOODS' ? 'bg-success-soft text-success' :
                             'bg-surface-2 text-fg-muted'
                           )}>
                             {food.origen}
                           </span>
                        </div>
                        <span className="text-[13px] text-fg-muted group-hover:text-fg transition-all duration-150 num">{food.calorias} <span className="text-[11px]">kcal</span></span>
                     </div>
                     <p className="text-fg font-medium text-[15px] mb-3 group-hover:text-accent transition-all duration-150 truncate w-full">{food.nombre}</p>
                      <div className="flex gap-4 text-[12px] text-fg-muted num">
                         <div>P: {food.proteinas}g</div>
                         <div>C: {food.carbohidratos !== undefined ? food.carbohidratos : (food as any).carbos}g</div>
                         <div>G: {food.grasas !== undefined ? food.grasas : (food as any).lipidos}g</div>
                      </div>
                  </button>
                ))
              )}
               {!isSearchLoading && searchResults.length === 0 && (
                 <div className="col-span-1 md:col-span-2 text-center py-16 text-fg-muted">
                    <p className="text-[14px] font-medium">Sin coincidencias</p>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {meals.map(meal => (
             <div
               key={meal.id}
               onClick={() => setActiveMealId(meal.id)}
               role="button"
               tabIndex={0}
               className={clsx(
                 "bg-surface rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden outline-none focus-within:ring-2 focus-within:ring-accent/50",
                 activeMealId === meal.id
                  ? 'border-accent/30 shadow-sm'
                  : 'border-border hover:border-border'
               )}
            >
               <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-2">
                  <div className="flex items-center gap-3">
                     <div className={clsx(
                       "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150",
                       activeMealId === meal.id ? 'bg-accent text-accent-fg' : 'bg-surface-3 text-fg-muted'
                     )}>
                        <Utensils className="w-4 h-4" />
                     </div>
                     <input
                        type="text"
                        value={meal.nombre}
                        onChange={e => setMeals(meals.map(m => m.id === meal.id ? { ...m, nombre: e.target.value } : m))}
                        className="text-[15px] font-medium text-fg bg-transparent outline-none border-b border-transparent focus:border-border w-full min-w-[140px] placeholder:text-fg-muted transition-all duration-150"
                        placeholder="Nombre ingesta"
                      />
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-right shrink-0">
                     <div className="flex items-center gap-2">
                       {activeMealId === meal.id && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                       <span className={clsx(
                         "text-[12px] font-medium leading-none",
                         activeMealId === meal.id ? 'text-accent' : 'text-fg-muted'
                       )}>{meal.items.length} items</span>
                     </div>
                      <p className="text-[11px] text-fg-muted num">
                       Meta: {Math.round(targetKcal / numComidas)} kcal
                     </p>
                  </div>
               </div>

                <div className="p-4 space-y-3">
                   {meal.items.map(item => (
                     <div key={item.id} className="flex flex-col items-start justify-between p-4 bg-surface-2 rounded-2xl group/item transition-all duration-150 hover:bg-surface-3 gap-3">
                        <div className="flex flex-1 items-center gap-3 w-full">
                           <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-fg-muted group-hover/item:text-accent transition-all duration-150" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-medium text-fg text-[14px] truncate">{item.nombre}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                  <input
                                    type="number"
                                    value={item.gramos}
                                    onChange={e => {
                                       const newGrams = +e.target.value;
                                       setMeals(meals.map(m => m.id === meal.id ? { ...m, items: m.items.map(i => i.id === item.id ? { ...i, gramos: newGrams } : i) } : m));
                                    }}
                                    className="w-16 bg-surface border border-border text-[13px] font-medium text-fg outline-none focus:border-accent/50 p-1.5 rounded-lg text-center num"
                                  />
                                 <span className="text-[12px] text-fg-muted">g</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between gap-6 w-full pt-3 border-t border-border">
                           <div className="text-left">
                              <p className="text-base font-medium text-fg leading-none num">{Math.round((item.calorias * item.gramos) / 100)}</p>
                              <p className="text-[11px] text-fg-muted mt-1">kcal</p>
                           </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFood(meal.id, item.id); }}
                              className="p-2.5 bg-surface text-fg-muted hover:bg-danger-soft hover:text-danger rounded-full transition-all duration-150"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                     </div>
                   ))}
                   {meal.items.length === 0 && (
                     <div className="text-center py-12 text-fg-muted">
                        <p className="text-[13px] font-medium">Sin alimentos cargados</p>
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>

        {/* VISTA MÓVIL: BOTONES DE APERTURA DE MODAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
          <button
            type="button"
            onClick={() => setIsTablaOpen(true)}
            className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all outline-none"
          >
            <div className="flex items-center gap-3 text-fg-dim">
               <Sparkles className="w-4 h-4 text-accent" />
               <span className="text-[14px] font-medium text-left">Estrategia — tabla</span>
            </div>
            <Maximize2 className="w-4 h-4 text-fg-muted group-hover:text-accent transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => setIsRecOpen(true)}
            className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all outline-none"
          >
            <div className="flex items-center gap-3 text-fg-dim">
               <Sparkles className="w-4 h-4 text-accent" />
               <span className="text-[14px] font-medium text-left">Recomendaciones</span>
            </div>
            <Maximize2 className="w-4 h-4 text-fg-muted group-hover:text-accent transition-colors" />
          </button>
        </div>

        {/* VISTA DESKTOP (PC): TABLAS SIEMPRE VISIBLES Y APILADAS */}
        <div className="hidden xl:block space-y-8">
           {/* TABLA MANUAL DESKTOP */}
           <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-3 text-fg-dim mb-6">
                 <Sparkles className="w-4 h-4 text-accent" />
                 <span className="eyebrow !text-fg-dim">Tabla del paciente</span>
              </div>

              <div className="border border-border rounded-2xl overflow-hidden bg-surface-2">
                 <div className="grid grid-cols-2 bg-surface-3 border-b border-border py-4 px-6">
                    <div className="text-[12px] font-medium text-fg-muted px-2">Alimento</div>
                    <div className="text-[12px] font-medium text-fg-muted px-2">Cantidad</div>
                 </div>
                 {tablaManual.map((row, i) => (
                    <div key={i} className="grid grid-cols-2 border-b border-border group/row hover:bg-surface-3 transition-colors">
                       <textarea
                          className="bg-transparent py-6 px-6 outline-none text-[15px] leading-relaxed text-fg placeholder:text-fg-muted border-r border-border transition-all focus:bg-accent-soft w-full resize-none min-h-[80px]"
                          placeholder="Ej: Pollo"
                          value={row.alimento}
                          rows={2}
                          onChange={e => { const newTabla = [...tablaManual]; newTabla[i].alimento = e.target.value; setTablaManual(newTabla); }}
                       />
                       <div className="flex items-start w-full relative h-full">
                          <textarea
                             className="flex-1 bg-transparent py-6 pl-6 pr-14 outline-none text-[15px] leading-relaxed text-fg placeholder:text-fg-muted focus:bg-accent-soft w-full resize-none h-full min-h-[80px]"
                             placeholder="Ej: 200g"
                             value={row.cantidad}
                             rows={2}
                             onChange={e => { const newTabla = [...tablaManual]; newTabla[i].cantidad = e.target.value; setTablaManual(newTabla); }}
                          />
                          <button
                            onClick={() => setTablaManual(tablaManual.filter((_, idx) => idx !== i))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-danger opacity-0 group-hover/row:opacity-100 transition-all p-3 hover:bg-danger-soft rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 ))}
                 <button
                    onClick={() => setTablaManual([...tablaManual, { alimento: '', cantidad: '' }])}
                    className="w-full p-6 text-[13px] font-medium text-fg-muted hover:text-accent hover:bg-accent-soft transition-all flex items-center justify-center gap-3"
                 >
                    <Plus className="w-4 h-4" /> Agregar fila
                 </button>
              </div>
           </div>

           {/* RECOMENDACIONES DESKTOP */}
           <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-3 text-fg-dim mb-6">
                 <Sparkles className="w-4 h-4 text-accent" />
                 <span className="eyebrow !text-fg-dim">Recomendaciones</span>
              </div>

              <div className="space-y-4">
                {recomendaciones.map((rec, i) => {
                   const upperRec = rec.toUpperCase();
                   const hasNota = upperRec.indexOf('NOTA:') !== -1;

                   return (
                     <div key={i} className="flex items-center gap-4 group/rec">
                        <div className={clsx(
                          "w-2 h-2 rounded-full shrink-0",
                          hasNota ? "bg-danger scale-125" : "bg-accent/50 group-hover/rec:bg-accent"
                        )} />
                        <div className="flex-1 relative min-h-[60px] flex items-stretch w-full overflow-hidden bg-surface-2 group-hover/rec:bg-surface-3 rounded-2xl transition-colors">
                           <textarea
                              className="w-full h-full min-h-[60px] py-4 pl-5 pr-14 bg-transparent border-none outline-none text-[15px] text-fg resize-none leading-relaxed"
                              placeholder="Escribir recomendación..."
                              value={rec}
                              rows={2}
                              onChange={e => {
                                 const newRecs = [...recomendaciones];
                                 newRecs[i] = e.target.value;
                                 setRecomendaciones(newRecs);
                              }}
                           />
                           <button
                              onClick={() => setRecomendaciones(recomendaciones.filter((_, idx) => idx !== i))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-muted hover:text-danger p-2 transition-all hover:bg-danger-soft rounded-full shrink-0 opacity-0 group-hover/rec:opacity-100"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   );
                })}
                <button
                  onClick={() => setRecomendaciones([...recomendaciones, ''])}
                  className="flex items-center gap-3 px-6 py-4 text-[13px] font-medium text-fg-muted hover:text-accent hover:bg-accent-soft transition-all w-full border border-border border-dashed hover:border-accent/30 justify-center rounded-2xl"
                >
                  <Plus className="w-4 h-4" /> Añadir recomendación
                </button>
              </div>
           </div>
        </div>

        {/* --- MODALES FLOTANTES --- */}
        <AnimatePresence>
          {isTablaOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-black/45 backdrop-blur-sm"
            >
              <div className="bg-surface w-full max-w-4xl max-h-full rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2 shrink-0">
                   <div className="flex items-center gap-3 text-fg-dim">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="eyebrow !text-fg-dim">Tabla del paciente</span>
                   </div>
                   <button onClick={() => setIsTablaOpen(false)} className="p-2 text-fg-muted hover:text-danger transition-colors rounded-full hover:bg-danger-soft">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="p-4 sm:p-8 overflow-y-auto w-full max-h-full">
                  <div className="border border-border rounded-2xl overflow-hidden bg-surface-2">
                     <div className="grid grid-cols-2 bg-surface-3 border-b border-border py-4 px-4 sm:px-6">
                        <div className="text-[12px] font-medium text-fg-muted px-1">Alimento</div>
                        <div className="text-[12px] font-medium text-fg-muted px-1">Cantidad</div>
                     </div>
                     {tablaManual.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 border-b border-border group/row hover:bg-surface-3 transition-colors">
                           <textarea
                              className="bg-transparent py-4 sm:py-6 px-4 sm:px-6 outline-none text-[14px] sm:text-[15px] leading-relaxed text-fg placeholder:text-fg-muted border-r border-border transition-all focus:bg-accent-soft w-full resize-none min-h-[80px]"
                              placeholder="Ej: Pollo"
                              value={row.alimento}
                              rows={2}
                              onChange={e => { const newTabla = [...tablaManual]; newTabla[i].alimento = e.target.value; setTablaManual(newTabla); }}
                           />
                           <div className="flex items-start w-full relative h-full">
                              <textarea
                                 className="flex-1 bg-transparent py-4 sm:py-6 pl-4 sm:pl-6 pr-12 sm:pr-14 outline-none text-[14px] sm:text-[15px] leading-relaxed text-fg placeholder:text-fg-muted focus:bg-accent-soft w-full resize-none h-full min-h-[80px]"
                                 placeholder="Ej: 200g"
                                 value={row.cantidad}
                                 rows={2}
                                 onChange={e => { const newTabla = [...tablaManual]; newTabla[i].cantidad = e.target.value; setTablaManual(newTabla); }}
                              />
                              <button
                                onClick={() => setTablaManual(tablaManual.filter((_, idx) => idx !== i))}
                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-danger opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-all p-2 hover:bg-danger-soft rounded-full"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     ))}
                     <button
                        onClick={() => setTablaManual([...tablaManual, { alimento: '', cantidad: '' }])}
                        className="w-full p-5 sm:p-6 text-[13px] font-medium text-fg-muted hover:text-accent hover:bg-accent-soft transition-all flex items-center justify-center gap-3"
                     >
                        <Plus className="w-4 h-4" /> Agregar fila
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isRecOpen && (
            <motion.div
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-black/45 backdrop-blur-sm"
            >
              <div className="bg-surface w-full max-w-4xl max-h-full rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2 shrink-0">
                   <div className="flex items-center gap-3 text-fg-dim">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="eyebrow !text-fg-dim">Recomendaciones</span>
                   </div>
                   <button onClick={() => setIsRecOpen(false)} className="p-2 text-fg-muted hover:text-danger transition-colors rounded-full hover:bg-danger-soft">
                     <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-4 sm:p-8 overflow-y-auto w-full max-h-full space-y-4">
                  {recomendaciones.map((rec, i) => {
                     const upperRec = rec.toUpperCase();
                     const hasNota = upperRec.indexOf('NOTA:') !== -1;

                     return (
                       <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group/rec">
                          <div className={clsx(
                            "w-2 h-2 rounded-full shrink-0",
                            hasNota ? "bg-danger scale-125" : "bg-accent/50 group-hover/rec:bg-accent"
                          )} />
                          <div className="flex-1 relative min-h-[60px] flex items-stretch w-full overflow-hidden bg-surface-2 group-hover/rec:bg-surface-3 rounded-2xl transition-colors">
                             <textarea
                                className="w-full h-full min-h-[60px] py-4 pl-5 pr-14 bg-transparent border-none outline-none text-[14px] sm:text-[15px] text-fg resize-none leading-relaxed"
                                placeholder="Escribir recomendación..."
                                value={rec}
                                rows={2}
                                onChange={e => {
                                   const newRecs = [...recomendaciones];
                                   newRecs[i] = e.target.value;
                                   setRecomendaciones(newRecs);
                                }}
                             />
                             <button
                                onClick={() => setRecomendaciones(recomendaciones.filter((_, idx) => idx !== i))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-muted hover:text-danger p-2 transition-all hover:bg-danger-soft rounded-full shrink-0 opacity-100 sm:opacity-0 group-hover/rec:opacity-100"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     );
                  })}
                  <button
                    onClick={() => setRecomendaciones([...recomendaciones, ''])}
                    className="flex items-center gap-3 px-6 py-4 text-[13px] font-medium text-fg-muted hover:text-accent hover:bg-accent-soft transition-all w-full border border-border border-dashed hover:border-accent/30 justify-center rounded-2xl"
                  >
                    <Plus className="w-4 h-4" /> Añadir recomendación
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT SECTION: STRATEGIC MACRO CONSOLE */}
      <div className="xl:col-span-4">
        <div className="sticky top-12 space-y-8">
           <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm">
              <header className="flex items-center gap-4 mb-6">
                 <div className="w-11 h-11 bg-accent rounded-full flex items-center justify-center shrink-0">
                    <PieChart className="w-5 h-5 text-accent-fg" />
                 </div>
                 <h3 className="heading-sm !text-lg">Macronutrientes</h3>
              </header>

              <div className="space-y-8">
                 <div className="p-6 bg-surface-2 rounded-2xl text-center space-y-4">
                    <p className="text-[12px] text-fg-muted leading-none">Energía calculada</p>
                    <div className="flex items-baseline justify-center gap-2">
                       <h4 className="stat-val !text-3xl">{Math.round(totals.kcal)}</h4>
                       <span className="text-lg font-medium text-fg-muted num">/{targetKcal}</span>
                    </div>
                     <div
                       className="w-full h-2 bg-surface-3 rounded-full overflow-hidden relative"
                       role="progressbar"
                       aria-valuenow={Math.round((totals.kcal / targetKcal) * 100)}
                       aria-valuemin={0}
                       aria-valuemax={100}
                     >
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((totals.kcal / targetKcal) * 100, 100)}%` }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                         className="h-full bg-accent rounded-full"
                       />
                     </div>
                 </div>

                 <div className="grid grid-cols-1 gap-3">
                    {[
                      { l: 'Proteína', v: totals.p, c: 'bg-accent text-accent-fg', k: 'P' },
                      { l: 'Carbohidratos', v: totals.c, c: 'bg-warning text-accent-fg', k: 'C' },
                      { l: 'Lípidos', v: totals.g, c: 'bg-surface-3 text-fg-dim', k: 'G' }
                    ].map(m => (
                      <div key={m.k} className="p-4 bg-surface-2 rounded-2xl flex items-center justify-between hover:bg-surface-3 transition-all duration-150">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <div className={clsx(
                               "w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-150 shrink-0",
                               m.c
                            )}>
                               {m.k}
                            </div>
                            <span className="text-[13px] font-medium text-fg-dim truncate">{m.l}</span>
                         </div>
                         <div className="text-right shrink-0">
                            <p className="text-lg font-medium text-fg leading-none num">{Math.round(m.v)}<span className="text-xs text-fg-muted ml-1">g</span></p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="mt-8 p-5 bg-accent-soft rounded-2xl space-y-2">
                 <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <p className="text-[13px] font-medium text-accent">Estado del plan</p>
                 </div>
                 <p className="text-[13px] text-fg-dim leading-relaxed">
                    {totals.kcal < targetKcal
                      ? `Delta energético: ${Math.round(targetKcal - totals.kcal)} kcal restantes.`
                      : 'Equilibrio metabólico alcanzado.'}
                 </p>
              </div>

               <div className={clsx(
                  "flex flex-col gap-3 mt-8 transition-all duration-150 text-center",
                  saveMutation.isPending ? "opacity-100" : "opacity-60"
               )}>
                  <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-fg-muted">
                    {saveMutation.isPending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        Sincronizando cambios...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        Plan nutricional asegurado
                      </>
                    )}
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
