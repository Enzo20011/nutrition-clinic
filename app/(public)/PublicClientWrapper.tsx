'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { TurneroProvider, useTurnero } from '@/components/TurneroContext';

const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), { ssr: false });
const ContactoSection = dynamic(() => import('@/components/ContactoSection'));
const TurneroInteractivo = dynamic(() => import('@/components/TurneroInteractivo'), { ssr: false });

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, closeTurnero, openTurnero } = useTurnero();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 420);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[200] origin-left"
      />

      <AnimatedBackground />
      <Navbar onBookingClick={openTurnero} />

      <main className="flex-grow bg-bg text-fg">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <ContactoSection />
      <Footer onBookingClick={openTurnero} />
      <WhatsAppButton raised={showStickyCTA} />

      {/* Sticky mobile CTA */}
      <AnimatePresence>
        {showStickyCTA && !isOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          >
            <div className="px-4 pb-6 pt-12 bg-gradient-to-t from-bg via-bg/90 to-transparent">
              <button
                onClick={openTurnero}
                className="w-full py-4 bg-accent hover:bg-accent-2 active:scale-[0.98] text-accent-fg font-medium text-[14px] rounded-full shadow-lg shadow-accent/25 transition-colors"
              >
                Agendar consulta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL MODAL DEL TURNERO */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTurnero}
              className="absolute inset-0 backdrop-blur-md bg-black/45"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[95vh] rounded-2xl shadow-2xl p-6 md:p-10 overflow-y-auto custom-scrollbar backdrop-blur-3xl bg-surface border border-border"
            >
              <button
                onClick={closeTurnero}
                aria-label="Cerrar modal"
                className="absolute top-4 right-4 p-3 rounded-full transition-all duration-500 border z-50 shadow-lg group bg-surface-2 hover:bg-accent hover:text-accent-fg text-fg-dim border-border"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              </button>

              <div className="mb-6 text-center">
                <h2 className="heading-sm !mb-0">Agendar turno</h2>
              </div>

              <TurneroInteractivo />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PublicClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TurneroProvider>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </TurneroProvider>
  );
}
