'use client';

import { motion } from 'framer-motion';

const avales = [
  { abbr: 'ISSN', name: 'International Society of Sports Nutrition', desc: 'Referente mundial en nutrición deportiva científica' },
  { abbr: 'ISAK', name: 'International Society for the Advancement of Kinanthropometry', desc: 'Estándar de oro en medición de composición corporal' },
  { abbr: 'GSSI', name: 'Gatorade Sports Science Institute', desc: 'Investigación en hidratación y fisiología atlética' },
  { abbr: 'ADA', name: 'Academy of Nutrition and Dietetics', desc: 'Organización líder en ciencias nutricionales aplicadas' },
];

export default function ScientificAvales() {
  return (
    <section className="bg-surface py-12 px-8">
      <div className="max-w-[1200px] mx-auto px-4 border-t border-border pt-12 pb-16 flex flex-col md:flex-row gap-10 items-start">
          <div className="md:w-1/3">
            <h2 className="heading-md mb-6">
              Avales <span className="text-accent italic">científicos</span>
            </h2>
            <p className="body-sm">
              Metodologías validadas y respaldadas por las instituciones más prestigiosas en nutrición deportiva y ciencias de la salud.
            </p>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {avales.map((aval, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
                className="bg-bg rounded-xl border border-border p-6 group hover:border-accent/30 transition-colors duration-500 relative"
              >
                <p className="text-[12px] font-semibold text-accent tracking-wide mb-3">{aval.abbr}</p>
                <p className="text-[13px] font-medium text-fg mb-1">{aval.name}</p>
                <p className="text-[12px] text-fg-muted leading-relaxed">{aval.desc}</p>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
