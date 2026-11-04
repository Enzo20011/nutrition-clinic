'use client';

import { motion } from 'framer-motion';
import { Instagram, Linkedin, ArrowUpRight, Award, Users, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import TiltCard from './TiltCard';

const DOT_GRID = `radial-gradient(circle, rgba(67,72,78,0.4) 1px, transparent 1px)`;

export default function SobreMiSection({ onBookingClick = () => {} }: { onBookingClick?: () => void }) {
  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="relative py-16 px-8 overflow-hidden">
        <div className="dot-grid-overlay opacity-10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(47,158,110,0.1) 0%, transparent 70%)" }} />

        <div className="max-w-[1200px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >

              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-fg mb-4">
                EQUIPO<br />
                <span className="text-accent">NUTRIPRO</span>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fg-dim/60 mb-8">
                ESPECIALISTAS EN NUTRICIÓN DEPORTIVA Y ALTO RENDIMIENTO
              </p>

              <div className="border-l border-accent/30 pl-5 mb-8 space-y-4">
                <p className="text-sm text-fg-dim leading-relaxed">
                  En NutriPro desarrollamos programas de nutrición avanzada y rendimiento deportivo respaldados por la evidencia científica más actual, adaptados de forma precisa a las demandas y objetivos de cada atleta y persona activa.
                </p>
                <p className="text-sm text-fg-dim leading-relaxed">
                  Combinamos antropometría de alta precisión, bioanálisis metabólico y periodización nutricional con un enfoque realista y sostenible a largo plazo.
                </p>
                <p className="text-sm text-fg-dim leading-relaxed">
                  Nuestra metodología elimina las suposiciones y las dietas genéricas, brindándote herramientas prácticas para optimizar tu composición corporal, tu energía y tu salud integral.
                </p>
                <p className="text-sm text-fg font-bold italic pt-2">
                  "Pequeños cambios respaldados por la ciencia generan transformaciones definitivas en el rendimiento y la salud."
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(47,158,110,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBookingClick}
                  aria-label="Agendar consulta nutricional ahora"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent-fg hover:bg-accent hover:text-accent-fg transition-all duration-300 bg-surface-3 border border-border px-6 py-3 rounded-xl shadow-xl">
                  AGENDAR CONSULTA <ArrowUpRight className="w-4 h-4" />
                </motion.button>
                <motion.a 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(193, 53, 132, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  aria-label="Seguir a NutriPro en Instagram"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-fg-dim hover:text-fg transition-all duration-300 bg-transparent border border-border px-6 py-3 rounded-xl">
                  <Instagram className="w-4 h-4" /> Instagram
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative group pr-4"
            >
              <TiltCard>
                <div className="relative aspect-square md:aspect-video rounded-xl overflow-hidden w-full max-w-3xl mx-auto border border-border transition-all duration-700 group-hover:border-accent/50 shadow-2xl"
                  style={{ boxShadow: "0 0 80px rgba(47,158,110,0.08)" }}>
                  
                  <Image 
                    src="/nutripro_specialist.jpg"
                    alt="NutriPro - Especialistas en Nutrición Deportiva y Clínica"
                    fill
                    className="object-cover object-center transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60 z-10" />
                  
                  {/* Neon corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-accent/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-accent/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </TiltCard>
            </motion.div>
        </div>
      </section>

    </div>
  );
}
