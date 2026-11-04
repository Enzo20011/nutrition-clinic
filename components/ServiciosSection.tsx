'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell, BarChart3, Stethoscope, Zap, Video } from 'lucide-react';
import Image from 'next/image';
import TiltCard from './TiltCard';

const services = [
  {
    icon: BarChart3,
    title: 'Plan alimentario personalizado',
    description: 'Nutrición de precisión ajustada a tus requerimientos específicos. Periodización nutricional adaptada a tu carga de entrenamiento.',
    tag: 'Más solicitado',
    image: '/precision_nutrition_lab.png'
  },
  {
    icon: Dumbbell,
    title: 'Evaluación antropométrica ISAK',
    description: 'Perfilado corporal de nivel olímpico. Método ISAK de máxima precisión para el mapeo graso y muscular.',
    tag: 'Próximamente',
    image: '/scientific_metabolic_tracking.png',
    disabled: true
  },
  {
    icon: Stethoscope,
    title: 'Nutrición clínica',
    description: 'Gestión de patologías metabólicas y salud integral. Abordaje multidisciplinario respaldado en evidencia científica.',
    tag: 'Clínico',
    image: '/precision_nutrition_lab.png'
  },
  {
    icon: Zap,
    title: 'Seguimiento y monitoreo',
    description: 'Soporte continuo y ajuste de planes en tiempo real. Métricas de progreso y análisis de adherencia.',
    tag: 'Continuo',
    image: '/scientific_metabolic_tracking.png'
  },
  {
    icon: Video,
    title: 'Consulta online',
    description: 'Acceso a ciencia nutricional avanzada desde cualquier lugar. Sesiones de consultoría profesional vía videoconferencia.',
    tag: 'Online',
    image: '/pro_nutrition_ingredients.png'
  },
];

type Service = { icon: any; title: string; description: string; tag: string; image: string; disabled?: boolean };

export default function ServiciosSection({ onBookingClick = () => {} }: { onBookingClick?: () => void }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-bg py-16 px-8 overflow-hidden">
        <div className="dot-grid-overlay opacity-30" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow mb-4">Nuestros servicios</p>
            <h2 className="heading-lg mb-6">
              Servicios de <span className="text-accent italic">alto nivel</span>
            </h2>
            <p className="body-text max-w-xl">
              Ciencia aplicada a cada objetivo. Planes diseñados con precisión profesional para resultados medibles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-surface py-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services as Service[]).map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative group h-full"
                >
                  <TiltCard className="h-full">
                    <div
                      onClick={service.disabled ? undefined : onBookingClick}
                      className={`relative rounded-2xl bg-surface p-8 h-full group transition-all duration-700 overflow-hidden border border-border ${service.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-surface-2 group-hover:border-accent/30 cursor-pointer'}`}
                    >
                      {/* Background Image */}
                      {!service.disabled && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] scale-110 group-hover:scale-100 transition-all duration-1000">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Top accent on hover */}
                      {!service.disabled && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                      )}

                      <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-8">
                          <motion.div
                            whileHover={service.disabled ? {} : { scale: 1.1, rotate: 5 }}
                            className="w-12 h-12 bg-accent-soft rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-500"
                          >
                            <Icon className={`w-5 h-5 transition-colors ${service.disabled ? 'text-fg-muted' : 'text-accent group-hover:text-accent-fg'}`} />
                          </motion.div>
                          <span className={`text-[11px] font-medium border px-3 py-1 rounded-full transition-colors ${service.disabled ? 'text-fg-dim border-accent/30 bg-accent-soft' : 'text-fg-dim border-border group-hover:border-accent/30'}`}>
                            {service.tag}
                          </span>
                        </div>

                        <h3 className="heading-sm !text-lg mb-4">
                          {service.title}
                        </h3>
                        <p className="text-sm text-fg-dim leading-relaxed mb-8 flex-grow">
                          {service.description}
                        </p>

                        {!service.disabled && (
                          <button
                            onClick={onBookingClick}
                            className="flex items-center gap-2 font-medium text-[14px] text-accent group/btn hover:text-accent-2 transition-all duration-500"
                          >
                            Saber más <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
