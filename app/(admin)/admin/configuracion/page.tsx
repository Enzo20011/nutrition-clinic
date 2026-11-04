'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Check,
  Bell, Shield, Layout, Database, MapPin, ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [saved, setSaved] = useState(false);

  // Simulación de guardado
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20 text-fg px-4 md:px-8 bg-bg">

      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-accent text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-soft)]" /> Configuración general
          </div>
          <h1 className="heading-md">
            Ajustes del <span className="text-accent italic">sistema</span>
          </h1>
          <p className="text-fg-muted text-[13px] mt-2">
            Gestión de perfil y preferencias profesionales
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-surface p-2 border border-border rounded-2xl"
        >
          <div className="px-5 py-3 border-r border-border">
             <p className="text-[12px] text-fg-muted">ID de registro</p>
             <p className="text-sm font-medium text-accent num">NP-2026-PRO</p>
          </div>
          <div className="px-5 py-3">
             <p className="text-[12px] text-fg-muted">Estado</p>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <p className="text-sm font-medium text-fg">Verificado</p>
             </div>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* NAVIGATION SIDEBAR */}
        <aside className="xl:col-span-3 space-y-4">
           <div className="p-1.5 bg-surface border border-border rounded-2xl flex flex-col gap-1 shadow-sm">
            {[
              { id: 'perfil', label: 'Perfil profesional', icon: User },
              { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
              { id: 'privacidad', label: 'Seguridad', icon: Shield },
              { id: 'apariencia', label: 'Interfaz', icon: Layout },
              { id: 'datos', label: 'Almacenamiento', icon: Database },
              { id: 'sucursales', label: 'Consultorios', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[14px] font-medium transition-all text-left group",
                  activeTab === tab.id
                    ? "bg-accent text-accent-fg shadow-md shadow-accent/15"
                    : "text-fg-dim hover:bg-surface-3 hover:text-fg"
                )}
              >
                <tab.icon className={clsx("w-4 h-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-accent-fg" : "text-fg-muted")} />
                {tab.label}
              </button>
            ))}
           </div>

           <div className="p-6 bg-accent-soft border border-accent/15 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                 <Shield className="w-4 h-4 text-accent" />
                 <p className="text-[13px] font-medium text-accent">Acceso protegido</p>
              </div>
              <p className="text-[13px] text-fg-dim leading-relaxed">Tus datos están cifrados bajo estándares profesionales de seguridad.</p>
           </div>
        </aside>

        {/* MAIN CONFIGURATION CONTENT */}
        <main className="xl:col-span-9 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden min-h-[700px]">
          <div className="p-6 md:p-8 border-b border-border bg-surface-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-accent text-accent-fg rounded-full flex items-center justify-center">
                  {(() => {
                    const tabs = [User, Bell, Shield, Layout, Database, MapPin];
                    const ids = ['perfil', 'notificaciones', 'privacidad', 'apariencia', 'datos', 'sucursales'];
                    const CurIcon = tabs[ids.indexOf(activeTab)] || Settings;
                    return <CurIcon className="w-7 h-7" />
                  })()}
               </div>
               <div>
                  <h2 className="heading-sm">
                     {activeTab === 'perfil' && 'Perfil profesional'}
                     {activeTab === 'notificaciones' && 'Notificaciones'}
                     {activeTab === 'privacidad' && 'Seguridad y privacidad'}
                     {activeTab === 'apariencia' && 'Apariencia del sistema'}
                     {activeTab === 'datos' && 'Gestión de datos'}
                     {activeTab === 'sucursales' && 'Sedes y consultorios'}
                  </h2>
                  <p className="text-[13px] text-fg-muted mt-1">Módulo de gestión interactiva</p>
               </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-12">
            {activeTab === 'perfil' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[13px] font-medium text-fg-dim">Nombre público</label>
                        <input type="text" defaultValue="NutriPro Especialista" className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-sm text-fg outline-none focus:border-accent/50 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[13px] font-medium text-fg-dim">Especialidad principal</label>
                        <input type="text" defaultValue="Nutrición deportiva y clínica" className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-sm text-fg outline-none focus:border-accent/50 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[13px] font-medium text-fg-dim">Email profesional</label>
                        <input type="email" defaultValue="contacto@example.com" className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-sm text-fg outline-none focus:border-accent/50 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[13px] font-medium text-fg-dim">Matrícula profesional</label>
                        <input type="text" defaultValue="MP 0000" className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-sm text-fg outline-none focus:border-accent/50 transition-all num" />
                     </div>
                  </div>

                  <div className="p-6 bg-surface-2 border border-border border-dashed rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center text-2xl font-heading font-medium text-accent">NP</div>
                        <div className="space-y-1">
                           <h4 className="heading-sm !text-lg">Avatar profesional</h4>
                           <p className="text-[13px] text-fg-muted">Se muestra en los PDF y carné de pacientes</p>
                        </div>
                     </div>
                     <button className="px-6 py-3 bg-surface-3 text-fg rounded-full text-[13px] font-medium hover:bg-accent hover:text-accent-fg transition-all">Cambiar imagen</button>
                  </div>
               </motion.div>
            )}

            {/* OTHER TABS PLACEHOLDER */}
            {activeTab !== 'perfil' && (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 text-fg-muted">
                <Database className="w-10 h-10" />
                <p className="text-[13px] font-medium">Esta sección está en desarrollo</p>
              </div>
            )}

            <div className="pt-8 border-t border-border flex justify-end gap-4">
               <button className="px-6 py-3 bg-transparent text-fg-dim rounded-full text-[13px] font-medium hover:text-fg transition-all">Cancelar</button>
               <button
                onClick={handleSave}
                className={clsx(
                  "px-8 py-3 rounded-full text-[13px] font-medium shadow-sm transition-all flex items-center gap-3 group",
                  saved ? "bg-success text-accent-fg" : "bg-accent text-accent-fg shadow-accent/15 hover:bg-accent-2"
                )}
               >
                  {saved ? (
                    <><Check className="w-4 h-4" /> Guardado</>
                  ) : (
                    <>Guardar cambios <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
               </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
