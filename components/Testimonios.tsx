'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIOS = [
  {
    nombre: 'Paciente A',
    resultado: 'Cambio de hábitos real',
    disciplina: 'Entrenamiento funcional',
    texto: 'Me cambió la cabeza. Antes probaba dietas de esas "milagrosas" y no bajaba un gramo. Con NutriPro aprendí a comer de verdad y los resultados se notan al toque.',
  },
  {
    nombre: 'Paciente B',
    resultado: 'Mejora en rendimiento',
    disciplina: 'Crossfit & Gym',
    texto: 'Increíble cómo mejoré la potencia entrenando. No perdí ni un poquito de fuerza y me siento mucho más ágil. El plan es a medida, nada de fotocopias genéricas.',
  },
  {
    nombre: 'Paciente C',
    resultado: 'Bienestar general',
    disciplina: 'Vida activa',
    texto: 'Lo mejor es que no es una dieta sufrida. Como rico, entiendo lo que hago y rindo mejor que nunca en el laburo y cuando voy a entrenar. Es otra vida, de verdad.',
  },
];

export default function Testimonios() {
  const [active, setActive] = useState(0);
  const prev = () => setActive(i => (i - 1 + TESTIMONIOS.length) % TESTIMONIOS.length);
  const next = () => setActive(i => (i + 1) % TESTIMONIOS.length);
  const t = TESTIMONIOS[active];

  return (
    <section className="bg-bg py-16 px-8">
      <div className="max-w-[1200px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: heading */}
          <div>
            <p className="eyebrow mb-4">Testimonios</p>
            <h2 className="heading-lg">
              Resultados <span className="text-accent italic">reales</span>
            </h2>
          </div>

          {/* Right: testimonial card */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-surface p-8 md:p-10 relative border border-border rounded-2xl shadow-sm"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-transparent rounded-t-2xl" />

                <Quote className="w-8 h-8 text-accent/25 mb-6" />
                <p className="text-base text-fg leading-relaxed mb-8 italic">
                  "{t.texto}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center">
                    <span className="font-medium text-sm text-accent">
                      {t.nombre.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-fg">{t.nombre}</p>
                    <p className="text-[12px] text-fg-muted">{t.resultado} · {t.disciplina}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6">
              <button onClick={prev} aria-label="Testimonio anterior"
                className="w-10 h-10 bg-surface-2 hover:bg-accent text-fg-dim hover:text-accent-fg rounded-full flex items-center justify-center border border-border transition-all duration-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIOS.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} aria-label={`Ver testimonio ${i + 1}`}
                    className={`h-[3px] rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-accent' : 'w-4 bg-border'}`} />
                ))}
              </div>
              <button onClick={next} aria-label="Testimonio siguiente"
                className="w-10 h-10 bg-surface-2 hover:bg-accent text-fg-dim hover:text-accent-fg rounded-full flex items-center justify-center border border-border transition-all duration-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
