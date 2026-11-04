import { motion } from "framer-motion";
import { Instagram, Mail, ArrowRight } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

export default function HomeMiniSobreMi() {
  return (
    <section className="bg-bg py-24 px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">

        {/* Photo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/5] rounded-2xl overflow-hidden group shadow-xl border border-border"
        >
          <Image
            src="/nutripro_specialist.jpg"
            alt="Especialista NutriPro"
            fill
            className="object-cover object-top transition-transform duration-[2s] group-hover:scale-105"
          />
          {/* Scientific Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-bg via-bg/80 to-transparent z-20">
            <p className="eyebrow mb-1">NutriPro elite</p>
            <p className="text-[11px] font-medium text-fg-dim">Especialistas en rendimiento y nutrición deportiva</p>
          </div>
        </motion.div>

        {/* Content Side */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-10 bg-accent/40" />
              <span className="eyebrow">Autoridad</span>
            </div>

            <h2 className="heading-lg">
              Ciencia <span className="text-fg-muted italic">& resultados</span>
            </h2>

            <div className="relative">
              <p className="text-lg text-fg-dim leading-relaxed italic border-l-2 border-accent pl-8 py-2">
                "Nuestro enfoque transgrede la nutrición tradicional, fusionando la bioquímica deportiva con la optimización antropométrica para atletas de alto rendimiento."
              </p>
              {/* Decorative Quote Mark */}
              <span className="absolute -top-4 -left-2 text-6xl font-heading text-accent/15 pointer-events-none">"</span>
            </div>

            <p className="text-sm text-fg-muted leading-relaxed max-w-lg">
              Con años de trayectoria clínica y deportiva, hemos desarrollado un ecosistema de evaluación y seguimiento que elimina las suposiciones y se centra en los datos biológicos reales de cada paciente.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            <Link href="/sobre-mi"
              className="px-8 py-4 bg-surface-2 border border-border rounded-full text-[14px] font-medium text-fg hover:bg-accent hover:text-accent-fg hover:border-accent transition-all duration-500 shadow-sm flex items-center gap-4 group">
              Ver perfil completo <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>

            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-fg-dim hover:text-accent-fg hover:bg-accent hover:border-accent transition-all duration-500">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:contacto@example.com"
                className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-fg-dim hover:text-accent-fg hover:bg-accent hover:border-accent transition-all duration-500">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
