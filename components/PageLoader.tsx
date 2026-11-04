'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          className="fixed inset-0 z-[999] bg-bg flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Decorative Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] animate-pulse" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Wrapper */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative w-20 h-20 mb-8 flex items-center justify-center bg-surface border border-accent/40 rounded-2xl shadow-[0_0_50px_rgba(47,158,110,0.2)] overflow-hidden"
            >
              <span className="font-black text-2xl tracking-tighter text-fg">
                N<span className="text-accent">P</span>
              </span>
              
              {/* Scanline line */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_15px_#1F4D3D] z-20"
              />
            </motion.div>

            {/* Texto de Carga */}
            <div className="text-center space-y-4">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-label text-[10px] font-black uppercase tracking-[0.5em] text-accent"
              >
                Iniciando Protocolo de Precisión_
              </motion.p>
              
              <div className="w-64 h-[2px] bg-surface-2/5 relative overflow-hidden rounded-full">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                  style={{ boxShadow: "0 0 10px #1F4D3D" }}
                />
              </div>
              
              <p className="font-label text-[8px] uppercase tracking-[0.3em] text-fg-muted">
                Sincronizando Motores Biométricos {Math.round(progress)}%
              </p>
            </div>
          </div>

          {/* Background Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #1F4D3D 1px, transparent 1px)', 
              backgroundSize: '30px 30px' 
            }} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
