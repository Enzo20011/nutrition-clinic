'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * PageTransition — wraps page content with a smooth fade+slide entrance.
 * Use this in admin layout to add inter-page transitions.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * StaggerContainer — Wraps children in a staggered reveal animation.
 * Each direct child receives a staggered entrance delay.
 */
export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeInUp — Individual item with fade+slide entrance.
 * Use inside StaggerContainer for stagger, or standalone.
 */
export function FadeInUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn — Pop-in animation for cards and modals.
 */
export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlowCard — Card with hover glow + tilt + lift effect.
 * Drop-in replacement for any card div.
 */
export function GlowCard({
  children,
  className,
  glowColor = 'rgba(47,158,110,0.15)',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: `0 20px 60px ${glowColor}, 0 4px 20px rgba(0,0,0,0.3)`,
        borderColor: 'rgba(255,255,255,0.15)',
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * PulseButton — CTA button with hover glow + click ripple.
 */
export function PulseButton({
  children,
  className,
  onClick,
  disabled,
  glowColor = 'rgba(47,158,110,0.4)',
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  glowColor?: string;
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.04,
              boxShadow: `0 0 30px ${glowColor}, 0 10px 30px rgba(0,0,0,0.3)`,
              transition: { duration: 0.2 },
            }
      }
      whileTap={disabled ? {} : { scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}
