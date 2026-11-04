'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Activity } from 'lucide-react';

const CalculadoraMetabolica = dynamic(() => import('@/components/CalculadoraMetabolica'), { ssr: false });

export default function AdminCalculadoraPage() {
  return (
    <div className="max-w-[1300px] mx-auto px-6 space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-fg-muted/40 font-black uppercase text-[10px] tracking-[0.4em]">
            <Sparkles className="w-4 h-4 opacity-30 text-fg" /> Laboratorio Metabólico_
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-fg uppercase tracking-tighter italic leading-[0.8]">
            Análisis de <br />
            <span className="text-fg-muted/40 not-italic">Gasto Energético_</span>
          </h1>
          <p className="text-fg-muted/20 font-black uppercase text-[10px] tracking-widest mt-6">Protocolos de Precisión Nutricional y Optimización de Macros</p>
        </div>
        
        <div className="flex items-center gap-4 bg-bg/40 p-4 rounded-2xl border border-border-soft backdrop-blur-3xl shadow-2xl">
          <Activity className="w-5 h-5 text-fg opacity-20" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-fg-muted/40 uppercase tracking-widest">Estado del Sistema</span>
            <span className="text-[10px] font-black text-fg uppercase tracking-widest italic">CALIBRACIÓN ACTIVA</span>
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg/40 backdrop-blur-3xl border border-border-soft p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-surface-2/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-30" />
        <CalculadoraMetabolica />
      </motion.div>

      <div className="bg-accent/10 border border-border-soft p-10 rounded-[3rem] flex gap-8 items-center shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
        <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center shrink-0 border border-border-soft group-hover:scale-105 transition-transform duration-500">
          <Zap className="w-10 h-10 text-fg opacity-40" />
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-fg">VALIDACIÓN CLÍNICA PROFESIONAL_</h4>
          <p className="text-[11px] text-fg-muted/30 font-black uppercase tracking-widest leading-relaxed italic">
            ESTE MOTOR UTILIZA ALGORITMOS HARRIS-BENEDICT Y MIFFLIN-ST JEOR. 
            LA INTERPRETACIÓN DE RESULTADOS ES RESPONSABILIDAD EXCLUSIVA DEL PROFESIONAL TRATANTE SEGÚN LA BIOMETRÍA DEL PACIENTE.
          </p>
        </div>
      </div>
    </div>
  );
}

