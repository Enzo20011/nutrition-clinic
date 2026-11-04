'use client';

/**
 * useScrollReveal — Hook for scroll-triggered entrance animations
 * Wraps IntersectionObserver to apply Framer Motion variants on enter
 */

import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // Only trigger once
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
