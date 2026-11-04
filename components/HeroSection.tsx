"use client";
import React, { MouseEvent, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";

interface HeroSectionProps {
  onBookingClick?: () => void;
}

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0 } },
};

const WORD = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

const DOT_GRID = `radial-gradient(circle, rgba(67,72,78,0.4) 1px, transparent 1px)`;

export default function HeroSection({ onBookingClick = () => {} }: HeroSectionProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  const handleButtonMouse = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.4);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.4);
  };
  const resetButtonMouse = () => { x.set(0); y.set(0); };

  return (
    <section className="relative pt-24 pb-0 px-0 sm:px-8 overflow-hidden">
      <div className="dot-grid-overlay opacity-40" />

      <div className="max-w-[1240px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-0">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-5 sm:px-0">
          {/* Editorial top label */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-px w-6 bg-accent/50" />
            <span className="eyebrow">NutriPro · Especialistas en alto rendimiento</span>
          </motion.div>

          {/* Main title — word-by-word */}
          <motion.h1
            variants={STAGGER}
            initial="hidden"
            animate="visible"
            className="heading-xl mb-6"
          >
            {["Nutrición deportiva"].map((word, i) => (
              <motion.span key={i} variants={WORD} className="block">
                {word}
              </motion.span>
            ))}
            <motion.span variants={WORD} className="block text-accent italic">
              y clínica
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="body-text max-w-md"
          >
            Ciencia aplicada al rendimiento: antropometría, biotipificación y planes de alimentación reales, sin vueltas.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-10"
          >
            <motion.button
              onClick={onBookingClick}
              onMouseMove={handleButtonMouse}
              onMouseLeave={resetButtonMouse}
              aria-label="Agendar consulta nutricional con el especialista"
              style={{ x: mouseXSpring, y: mouseYSpring }}
              whileHover={{ scale: 1.03, filter: "brightness(1.08)" }}
              whileTap={{ scale: 0.97 }}
              className="relative px-10 py-4 bg-accent text-accent-fg font-medium text-[15px] rounded-full overflow-hidden shadow-lg shadow-accent/20 transition-all hidden md:flex items-center"
            >
              Agendar consulta
            </motion.button>
          </motion.div>

        </div>

        {/* NUTRITION PHOTO - Seccionada para Edge-to-Edge en Mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mt-12 lg:mt-0 group w-full px-0"
          onMouseMove={(e) => {
            if (window.innerWidth < 1024) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const xPct = mouseX / rect.width - 0.5;
            const yPct = mouseY / rect.height - 0.5;
            x.set(xPct * 20);
            y.set(yPct * -20);
          }}
          onMouseLeave={() => {
            x.set(0);
            y.set(0);
          }}
          style={{
            rotateX: isDesktop ? mouseYSpring : 0,
            rotateY: isDesktop ? mouseXSpring : 0,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="relative w-full max-w-[260px] sm:max-w-[380px] md:max-w-[480px] mx-auto aspect-square rounded-[2rem] overflow-hidden border border-border transition-all duration-700 group-hover:border-accent/30 shadow-2xl shadow-[rgba(var(--shadow-color),0.15)] bg-surface-2 animate-[levitate_6s_ease-in-out_infinite]"
            style={{ transform: isDesktop ? "translateZ(50px)" : "none" }}
          >
              <Image
                src="/hero_elite_nutrition_macro.png"
                alt="Plato de comida saludable - Nutrición Deportiva"
                fill
                className="object-cover object-center hover:scale-105 transition-all duration-1000"
                priority
                loading="eager"
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 60vw, (max-width: 1200px) 50vw, 600px"
             />
          </div>
        </motion.div>
      </div>

      {/* Separador inferior de sección */}
      <div className="relative mt-10 lg:mt-16 pb-10">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </section>
  );
}
