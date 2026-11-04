import type { Metadata } from "next";
import SobreMiPageClient from "@/components/SobreMiPageClient";

export const metadata: Metadata = {
  title: "Sobre el Equipo",
  description: "Especialistas en Nutrición Deportiva y Rendimiento. Especializados en composición corporal, bioanálisis y biotipificación individual.",
  alternates: { canonical: "/sobre-mi" },
  openGraph: {
    url: "https://nutripro.app/sobre-mi",
    title: "Sobre el Equipo | NutriPro Nutrición",
    description: "NutriPro. Nutrición deportiva, composición corporal y biotipificación individual de alto rendimiento.",
  },
};

export default function SobreMiPage() {
  return (
    <main className="min-h-screen bg-bg pt-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-border-soft to-transparent -z-10 blur-[120px] pointer-events-none" />
      <SobreMiPageClient />
    </main>
  );
}
