'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  raised?: boolean;
}

export default function WhatsAppButton({
  phoneNumber = "5491100000000",
  message = "Hola! Quisiera realizar una consulta sobre nutrición deportiva con NutriPro.",
  raised = false,
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.55, type: "spring", stiffness: 260, damping: 16 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed right-6 z-[45] flex items-center justify-center group outline-none transition-[bottom] duration-300 ${raised ? 'bottom-24 md:bottom-6' : 'bottom-6'}`}
      aria-label="Contactar por WhatsApp"
    >
      {/* Background Pulse Aura */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-[#25D366]/20 blur-3xl"
      />

      {/* Official WhatsApp SVG Icon Container */}
      <div className="relative z-10 w-14 h-14 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_rgba(37,211,102,0.4)] group-hover:shadow-[0_20px_60px_rgba(37,211,102,0.6)] transition-all duration-500 border-2 border-border-soft">
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 fill-current drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>

      {/* Premium Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-6 bg-fg text-bg px-5 py-2.5 rounded-full text-[13px] font-medium pointer-events-none whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 border-l-4 border-l-[#25D366]"
      >
        Línea directa profesional
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-4 h-4 bg-fg rotate-45" />
      </motion.div>
    </motion.a>
  );
}
