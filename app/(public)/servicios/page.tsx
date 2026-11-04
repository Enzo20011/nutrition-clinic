import type { Metadata } from "next";
import ServiciosPageClient from "@/components/ServiciosPageClient";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Planes de nutrición deportiva y clínica personalizados. Evaluación antropométrica ISAK, seguimiento continuo y consultas presenciales u online.",
  alternates: { canonical: "/servicios" },
  openGraph: {
    url: "https://nutripro.app/servicios",
    title: "Servicios | NutriPro Nutrición",
    description: "Planes de nutrición deportiva y clínica personalizados. Evaluación antropométrica ISAK, seguimiento continuo y consultas de alto rendimiento.",
  },
};

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-bg pt-20">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-border-soft to-transparent -z-10 blur-[120px] pointer-events-none" />
      <ServiciosPageClient />
    </main>
  );
}
