'use client';

import { motion } from 'framer-motion';

export default function TerminosPage() {
  return (
    <div className="bg-bg min-h-screen text-fg py-32 px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="heading-lg">Términos y condiciones</h1>
          <p className="text-xs text-fg-muted">Última actualización: 23 de marzo, 2026</p>
        </div>

        <div className="max-w-none text-fg-dim space-y-8">
          <section className="space-y-4">
            <h2 className="heading-sm">1. Servicios profesionales</h2>
            <p>
              La plataforma NutriPro ofrece servicios de asesoramiento nutricional personalizado, especializado en nutrición deportiva y clínica. Los planes y recomendaciones se basan en evidencia científica y datos antropométricos del paciente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-sm">2. Responsabilidad del paciente</h2>
            <p>
              El paciente se compromete a proporcionar información veraz sobre su estado de salud, antecedentes médicos y objetivos. La efectividad del tratamiento dependerá de la adherencia a las pautas indicadas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-sm">3. Consultas y turnos</h2>
            <p>
              La reserva de turnos se realiza a través de la plataforma oficial. Cualquier cancelación o reprogramación debe informarse con al menos 24 horas de antelación para asegurar la eficiencia del sistema.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-sm">4. Privacidad y datos</h2>
            <p>
              Toda la información personal y clínica compartida durante las consultas está protegida por el secreto profesional y no será compartida con terceros sin consentimiento previo, cumpliendo con las leyes de protección de datos vigentes.
            </p>
          </section>

          <section className="space-y-4 border-t border-border pt-12">
            <p className="text-sm italic">
              Para cualquier duda o aclaración sobre estos términos, por favor contactar a través de los canales oficiales proporcionados en el sitio.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
