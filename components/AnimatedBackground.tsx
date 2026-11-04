'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Valores fijos generados una sola vez al cargar el módulo — evita re-renders y mismatch de hidratación
const PARTICLE_DATA = Array.from({ length: 8 }, (_, i) => ({
  size: (i * 1.7 + 1) % 3 + 1,
  initialX: (i * 13.7) % 100,
  initialY: (i * 17.3) % 100,
  duration: 12 + (i % 5) * 2,
  delay: i * 0.9,
}));

const Particle = ({ size, initialX, initialY, duration, delay }: typeof PARTICLE_DATA[0]) => (
  <motion.div
    className="absolute rounded-full bg-surface"
    style={{
      width: size,
      height: size,
      left: `${initialX}%`,
      top: `${initialY}%`,
      opacity: 0.05,
      willChange: 'transform, opacity',
    }}
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      opacity: [0.05, 0.15, 0.05],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
  />
);

const LightOrb = ({ color, size, top, left, delay }: { color: string; size: string; top: string; left: string; delay: number }) => (
  <motion.div
    className={`absolute rounded-full blur-[120px] ${color}`}
    style={{
      width: size,
      height: size,
      top,
      left,
      opacity: 0.07,
      willChange: 'transform, opacity',
    }}
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.05, 0.1, 0.05],
      x: [0, 30, 0],
      y: [0, -20, 0],
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
  />
);

export default function AnimatedBackground() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-bg overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="fixed inset-0 -z-10 bg-bg overflow-hidden pointer-events-none">
      <LightOrb color="bg-accent" size="600px" top="-10%" left="-10%" delay={0} />
      <LightOrb color="bg-accent" size="500px" top="60%" left="70%" delay={5} />

      {PARTICLE_DATA.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Scanline */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
