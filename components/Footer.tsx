import { Instagram, Phone, MapPin, ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PHONE_DISPLAY } from "@/lib/constants";

interface FooterProps {
  onBookingClick?: () => void;
}

export default function Footer({ onBookingClick = () => {} }: FooterProps) {
  return (
    <footer className="w-full bg-surface-2 border-t border-border pt-16 pb-10 px-8 relative overflow-hidden">
      {/* Subtle dot grid */}
      <div className="dot-grid-overlay opacity-30" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 relative z-10">

        {/* BRAND */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="font-heading text-2xl font-medium mb-1 text-fg">
              Nutri<span className="text-accent italic">Pro</span>
            </p>
            <p className="eyebrow">Nutrición y alto rendimiento</p>
          </div>
          <div className="flex gap-3">
            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 bg-surface text-fg-dim hover:text-accent-fg hover:bg-accent rounded-full flex items-center justify-center transition-all duration-300 border border-border"
              aria-label="Instagram de NutriPro"
            >
              <Instagram className="w-4 h-4" />
            </motion.a>
          </div>
        </div>

        {/* NAV */}
        <div className="lg:col-span-2 space-y-8">
          <h4 className="eyebrow border-b border-border pb-4">
            Navegación
          </h4>
          <nav className="flex flex-col gap-4 text-[14px] font-medium">
            {[
              { href: "/", label: "Inicio" },
              { href: "/servicios", label: "Servicios" },
              { href: "/sobre-mi", label: "Sobre mí" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="group">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-fg-dim hover:text-accent transition-colors duration-300"
                >
                  {label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </Link>
            ))}
            <button onClick={onBookingClick}
              className="flex items-center gap-2 text-accent hover:text-accent-2 transition-colors duration-300 group text-left">
              Consulta <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </nav>
        </div>

        {/* CONTACT */}
        <div className="lg:col-span-3 space-y-8">
          <h4 className="eyebrow border-b border-border pb-4">
            Contacto
          </h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-4 h-4 text-fg-muted flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-fg-dim leading-relaxed">Tu ciudad, País.</p>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-4 h-4 text-fg-muted flex-shrink-0" />
              <p className="text-[13px] text-fg-dim num">{PHONE_DISPLAY}</p>
            </div>
            <div className="flex items-center gap-4 group">
              <Mail className="w-4 h-4 text-fg-muted flex-shrink-0 group-hover:text-accent transition-colors" />
              <a href="mailto:contacto@example.com" className="text-[13px] text-fg-dim hover:text-accent transition-colors">contacto@example.com</a>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[12px] text-fg-muted">
          © {new Date().getFullYear()} NutriPro · Plataforma nutricional de alto rendimiento
        </p>
        <div className="flex gap-8">
          <Link href="/privacidad" className="text-[12px] text-fg-muted hover:text-fg-dim transition-colors">Privacidad</Link>
          <Link href="/terminos" className="text-[12px] text-fg-muted hover:text-fg-dim transition-colors">Términos</Link>
        </div>
      </div>
    </footer>
  );
}
