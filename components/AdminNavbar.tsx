"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Users,
  Calendar,
  ClipboardList,
  LogOut,
  DollarSign,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

const TIMES = ["09:00","10:00","11:00","15:00","16:00","17:00","18:00"];
import { signOut } from 'next-auth/react';
import Toast from './Toast';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { icon: Users, label: 'Pacientes', href: '/admin/pacientes' },
  { icon: Calendar, label: 'Agenda', href: '/admin/agenda' },
  { icon: DollarSign, label: 'Finanzas', href: '/admin/finanzas' },
  { icon: ClipboardList, label: 'Consultas', href: '/admin/consulta' },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'info'}|null>(null);
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [turnoForm, setTurnoForm] = useState({ nombre: '', email: '', telefono: '', fecha: format(new Date(), 'yyyy-MM-dd'), hora: '09:00' });
  const [turnoSaving, setTurnoSaving] = useState(false);
  const [turnoError, setTurnoError] = useState<string | null>(null);

  const handleTurnoCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTurnoSaving(true);
    setTurnoError(null);
    try {
      const res = await fetch('/api/appointments/admin-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turnoForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear turno');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowTurnoModal(false);
      setTurnoForm({ nombre: '', email: '', telefono: '', fecha: format(new Date(), 'yyyy-MM-dd'), hora: '09:00' });
      setToast({ msg: 'Turno agendado y sincronizado con Google Calendar', type: 'success' });
    } catch (err: any) {
      setTurnoError(err.message);
    } finally {
      setTurnoSaving(false);
    }
  };

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

  const handleSignOut = () => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
      window.location.href = '/';
      return;
    }
    setToast({ msg: 'Sesión cerrada correctamente', type: 'success' });
    setTimeout(() => {
      setToast(null);
      signOut({ callbackUrl: `${window.location.origin}/login`, redirect: true });
    }, 300);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-surface/95 backdrop-blur-md border-b border-border px-4 md:px-10 py-3 md:py-4 flex items-center justify-between"
        aria-label="Barra de navegación administrativa"
      >
        {/* Branding Area */}
        <div className="flex items-center gap-3 md:gap-6 group/brand overflow-hidden">
          <Link href="/admin" className="flex items-center gap-3 md:gap-4 relative shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-lg md:text-xl font-medium leading-none truncate block text-fg">
                Nutri<span className="text-accent italic">Pro</span>
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-fg-muted mt-1 truncate">Portal admin</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex flex-1 justify-center px-10">
          <ul className="flex gap-4 md:gap-8 lg:gap-10 items-center bg-surface-2 p-1 rounded-full border border-border">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all relative group focus:outline-none ${
                      isActive
                        ? 'text-accent-fg bg-accent'
                        : 'text-fg-dim hover:text-fg hover:bg-surface-3'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowTurnoModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-2 text-accent-fg rounded-full text-[13px] font-medium transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo turno
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-9 h-9 flex items-center justify-center bg-surface-2 hover:bg-surface-3 rounded-full border border-border transition-all outline-none"
          >
            {isDark ? <Sun className="w-4 h-4 text-fg-dim" /> : <Moon className="w-4 h-4 text-fg-dim" />}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-fg-muted hover:text-danger hover:bg-danger-soft border border-border hover:border-danger/30 transition-all text-[13px] font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggleMobileMenu}
            className="p-3 min-w-[44px] min-h-[44px] bg-surface-2 border border-border rounded-full text-fg-dim hover:text-fg transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent outline-none"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[75vw] max-w-[280px] bg-surface border-l border-border z-[80] p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-[11px] font-medium text-accent uppercase tracking-[0.18em]">Navegación</span>
                <button onClick={toggleMobileMenu} className="text-fg-muted hover:text-fg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                        isActive
                          ? 'bg-accent border-accent text-accent-fg'
                          : 'bg-surface-2 border-border text-fg-dim hover:bg-surface-3'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-10 border-t border-border space-y-4">
                <button
                  type="button"
                  onClick={() => { setShowTurnoModal(true); toggleMobileMenu(); }}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-accent hover:bg-accent-2 rounded-xl transition-all text-sm font-medium text-accent-fg"
                >
                  <Plus className="w-4 h-4" /> Nuevo turno
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-surface-2 border border-border rounded-xl hover:bg-surface-3 transition-all text-sm font-medium text-fg-dim hover:text-fg"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Modo claro' : 'Modo oscuro'}
                </button>
                <button
                  onClick={() => { handleSignOut(); toggleMobileMenu(); }}
                  className="w-full flex items-center justify-center gap-4 p-5 bg-danger-soft border border-danger/20 text-danger rounded-xl hover:bg-danger/15 transition-all text-sm font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
                <div className="mt-8 text-center">
                  <p className="text-[10px] font-medium text-fg-muted/60 tracking-[0.18em] uppercase">Elite Clinical System v2.1</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Nuevo Turno */}
      <AnimatePresence>
        {showTurnoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTurnoModal(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent mb-1">Admin</p>
                  <h3 className="text-xl font-heading font-medium text-fg">Nuevo turno</h3>
                </div>
                <button type="button" aria-label="Cerrar" onClick={() => setShowTurnoModal(false)}
                  className="w-9 h-9 flex items-center justify-center bg-surface-2 hover:bg-surface-3 border border-border rounded-full text-fg-dim hover:text-fg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleTurnoCreate} className="space-y-4">
                {[
                  { label: 'Nombre y apellido *', key: 'nombre', type: 'text', required: true },
                  { label: 'Email', key: 'email', type: 'email', required: false },
                  { label: 'Teléfono / WhatsApp', key: 'telefono', type: 'tel', required: false },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label htmlFor={`nav-turno-${field.key}`} className="text-[12px] font-medium text-fg-muted">{field.label}</label>
                    <input
                      id={`nav-turno-${field.key}`}
                      type={field.type}
                      required={field.required}
                      value={turnoForm[field.key as keyof typeof turnoForm]}
                      onChange={e => setTurnoForm({ ...turnoForm, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-2 border border-border focus:border-accent/50 rounded-lg outline-none text-fg text-sm"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="nav-turno-fecha" className="text-[12px] font-medium text-fg-muted">Fecha *</label>
                    <input id="nav-turno-fecha" type="date" required value={turnoForm.fecha}
                      onChange={e => setTurnoForm({ ...turnoForm, fecha: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-2 border border-border focus:border-accent/50 rounded-lg outline-none text-fg text-sm num" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="nav-turno-hora" className="text-[12px] font-medium text-fg-muted">Horario *</label>
                    <select id="nav-turno-hora" required value={turnoForm.hora}
                      onChange={e => setTurnoForm({ ...turnoForm, hora: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-2 border border-border focus:border-accent/50 rounded-lg outline-none text-fg text-sm num">
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {turnoError && <p className="text-danger text-[12px] font-medium">{turnoError}</p>}

                <button type="submit" disabled={turnoSaving}
                  className="w-full py-4 bg-accent hover:bg-accent-2 disabled:opacity-50 text-accent-fg font-medium text-[14px] rounded-lg transition-colors flex items-center justify-center gap-2">
                  {turnoSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Agendar y sincronizar'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
