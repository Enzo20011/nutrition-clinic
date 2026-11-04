'use client';

import React from 'react';
import { Share2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SharedData {
  paciente: string;
  peso: number;
  grasa: number;
  get: number;
  dietaUrl?: string;
}

export default function BotonCompartir({ data }: { data: SharedData }) {
  const handleWhatsApp = () => {
    const message = `
*RESUMEN DE CONSULTA NUTRICIONAL* 🍎
    
Hola *${data.paciente}*, aquí tienes los puntos clave de nuestra sesión de hoy:
    
📍 *Peso Actual:* ${data.peso} kg
📍 *Grasa Corporal:* ${data.grasa}%
📍 *Gasto Energético (Mantenimiento):* ${data.get} kcal
    
Recuerda seguir las indicaciones del plan alimentario que adjuntamos. ¡Vamos por buen camino! 🚀
    
_Atentamente, Tu Nutricionista._
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="flex gap-4">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleWhatsApp}
        className="flex-1 bg-[#25D366] text-fg px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,211,102,0.15)] hover:shadow-[0_25px_50px_rgba(37,211,102,0.3)] transition-all"
      >
        <MessageCircle className="w-5 h-5" /> Compartir en WhatsApp
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-navy border border-border-soft text-slate-500 p-5 rounded-2xl hover:text-fg hover:bg-navy-light transition-all shadow-xl"
      >
        <Share2 className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
