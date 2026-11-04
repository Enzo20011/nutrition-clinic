'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, MapPin, Mail } from 'lucide-react';
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from '@/lib/constants';

export default function ContactoSection() {
  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState('Nutrición Deportiva');
  const [mensaje, setMensaje] = useState('');

  const handleWhatsAppSend = () => {
    if (!nombre.trim() || !mensaje.trim()) return;
    const text = `Hola! Mi nombre es ${nombre}. Mi objetivo es: ${objetivo}. %0A%0A${mensaje}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <section id="contacto" className="py-24 px-8 bg-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="h-px w-10 bg-accent/40" />
                <span className="eyebrow">Conectemos</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="heading-lg"
              >
                ¿Listo para <br />
                <span className="text-accent italic">empezar?</span>
              </motion.h2>
            </div>

            <div className="space-y-8">
              {[
                { icon: MessageSquare, label: "WhatsApp directo", val: PHONE_DISPLAY, href: `https://wa.me/${WHATSAPP_NUMBER}` },
                { icon: Mail, label: "Email profesional", val: "contacto@example.com", href: "mailto:contacto@example.com" },
                { icon: MapPin, label: "Ubicación clínica", val: "Tu ciudad, País", href: null },
              ].map((item, i) => {
                const inner = (
                  <>
                    <div className="w-12 h-12 bg-accent-soft rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-accent">
                      <item.icon className="w-5 h-5 text-accent group-hover:text-accent-fg transition-colors" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-fg-muted mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-fg group-hover:text-accent transition-colors num">{item.val}</p>
                    </div>
                  </>
                );
                return item.href ? (
                  <motion.a
                    key={i}
                    href={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-6 group hover:translate-x-2 transition-transform duration-500"
                  >
                    {inner}
                  </motion.a>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-6 group"
                  >
                    {inner}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-surface border border-border p-8 md:p-12 rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full" />

            <form className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); handleWhatsAppSend(); }}>
              <div className="space-y-2">
                <label htmlFor="contacto-nombre" className="text-[13px] font-medium text-fg-dim">Tu nombre</label>
                <input
                  id="contacto-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan P."
                  className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-fg text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-fg-muted"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contacto-objetivo" className="text-[13px] font-medium text-fg-dim">Objetivo</label>
                <select
                  id="contacto-objetivo"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-fg text-sm focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                >
                  <option className="bg-surface">Nutrición deportiva</option>
                  <option className="bg-surface">Descenso de grasa</option>
                  <option className="bg-surface">Aumento de masa muscular</option>
                  <option className="bg-surface">Salud integral</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contacto-mensaje" className="text-[13px] font-medium text-fg-dim">Mensaje adicional</label>
                <textarea
                  id="contacto-mensaje"
                  rows={4}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Cuéntame más sobre tu meta..."
                  required
                  className="w-full bg-surface-2 border border-border rounded-xl px-5 py-3.5 text-fg text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-fg-muted resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-accent hover:bg-accent-2 rounded-full text-[15px] font-medium text-accent-fg flex items-center justify-center gap-3 shadow-lg shadow-accent/15 transition-all"
                type="submit"
              >
                Enviar a WhatsApp <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
