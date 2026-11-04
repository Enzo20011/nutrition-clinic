'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { X, ArrowRight, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onBookingClick?: () => void;
  activeTab?: string;
  setActiveTab?: (tab?: string) => void;
}

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Servicios', path: '/servicios' },
  { name: 'Sobre Mí', path: '/sobre-mi' },
];

const Navbar = ({
  onBookingClick = () => {},
  setActiveTab = () => {}
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const dark = localStorage.getItem('theme') === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      if (!isScrolled) setIsScrolled(true);
    } else {
      if (isScrolled) setIsScrolled(false);
    }
  });

  const handleBooking = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onBookingClick();
    setMobileMenuOpen(false);
  }, [onBookingClick]);

  if (pathname === '/login') return null;

  return (
    <>
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <header
        className={`pointer-events-auto transition-all duration-500 ease-[0.16,1,0.3,1] border rounded-full overflow-hidden bg-surface/90 backdrop-blur-md border-border ${
          isScrolled ? 'shadow-[0_8px_32px_rgba(var(--shadow-color),0.14)] px-2 py-1' : 'shadow-[0_2px_16px_rgba(var(--shadow-color),0.06)] px-4 py-2'
        }`}
      >
        <div className="flex items-center gap-4 md:gap-8 h-12 md:h-14 px-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group outline-none focus:ring-0"
            onClick={() => { setActiveTab('/'); setMobileMenuOpen(false); }}
          >
            <div className="flex flex-col">
              <span className="font-heading text-[16px] sm:text-[18px] font-medium leading-none text-fg">
                Nutri<span className="text-accent italic">Pro</span>
              </span>
              <span className="text-[8px] font-medium leading-none mt-1.5 uppercase tracking-[0.18em] text-fg-muted">Nutrición de alto rendimiento</span>
            </div>
          </Link>

          {/* Separator */}
          <div className="h-4 w-[1px] hidden md:block bg-border" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setActiveTab(link.path)}
                  className={`text-[13px] font-medium transition-all duration-300 relative py-2 ${
                    active ? 'text-accent' : 'text-fg-dim hover:text-fg'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Dark/Light Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-surface-2 hover:bg-surface-3 transition-all outline-none"
          >
            {isDark ? <Sun className="w-4 h-4 text-fg-dim" /> : <Moon className="w-4 h-4 text-fg-dim" />}
          </button>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
               className="w-10 h-10 flex flex-col items-center justify-center rounded-full border border-border bg-surface-2 hover:bg-surface-3 transition-all outline-none focus:ring-0"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
               aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-5 h-5 flex flex-col justify-center gap-[6px]">
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 4, width: "100%" } : { rotate: 0, y: 0, width: "100%" }}
                  className="block h-[2px] rounded-full transition-all duration-300 bg-fg"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -4, width: "100%" } : { rotate: 0, y: 0, width: "60%" }}
                  className="block h-[2px] rounded-full transition-all duration-300 self-end bg-fg"
                />
              </div>
            </button>
          </div>
        </div>
      </header>
    </div>

      {/* Mobile Menu — Drawer lateral */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[54] md:hidden bg-black/45 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-[300px] z-[55] md:hidden flex flex-col shadow-2xl bg-surface border-l border-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-border">
                <div>
                  <p className="font-heading text-[18px] font-medium leading-none text-fg">
                    Nutri<span className="text-accent italic">Pro</span>
                  </p>
                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] mt-1.5 text-fg-muted">Nutrición de alto rendimiento</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-fg-dim hover:text-fg hover:bg-surface-2 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
                {navLinks.map((link, i) => {
                  const active = pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.07 }}
                    >
                      <Link
                        href={link.path}
                        onClick={() => { setActiveTab(link.path); setMobileMenuOpen(false); }}
                        className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all group ${
                          active
                            ? 'bg-accent text-accent-fg'
                            : 'text-fg-dim hover:text-fg hover:bg-surface-2'
                        }`}
                      >
                        <span className="text-[15px] font-medium">{link.name}</span>
                        <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${active ? 'opacity-100' : 'opacity-30'}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="px-4 pb-8 pt-4 border-t border-border space-y-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-[13px] font-medium text-fg-dim hover:text-fg hover:bg-surface-2 transition-all"
                >
                  {isDark ? <><Sun className="w-3.5 h-3.5" /> Modo claro</> : <><Moon className="w-3.5 h-3.5" /> Modo oscuro</>}
                </button>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleBooking}
                  className="w-full py-4 bg-accent hover:bg-accent-2 text-accent-fg font-medium text-[14px] rounded-xl shadow-lg shadow-accent/20 active:scale-[0.98] transition-all"
                >
                  Agendar consulta
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
