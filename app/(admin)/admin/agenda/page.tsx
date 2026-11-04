
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const AgendaViewer = dynamic(() => import('@/components/AgendaViewer'));
import { Sparkles } from 'lucide-react';

export default function AgendaPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20 text-fg px-4 md:px-8 bg-bg">
      <header className="space-y-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-accent text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-soft)]" /> Gestión de consultas
          </div>
          <h1 className="heading-md">
            Control de <span className="text-accent italic">agenda</span>
          </h1>
          <p className="text-fg-muted text-[13px] mt-2">
            Gestión centralizada de sesiones y turnos
          </p>
        </motion.div>
      </header>

      <AgendaViewer />
    </div>
  );
}

