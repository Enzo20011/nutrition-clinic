import React from 'react';
import { Metadata } from 'next';
import PublicClientWrapper from './PublicClientWrapper';

export const metadata: Metadata = {
  title: {
    template: '%s | NutriPro',
    default: 'NutriPro | Nutrición Clínica y Deportiva de Alto Rendimiento',
  },
  description: 'Plataforma de nutrición deportiva y clínica. Planes personalizados, bioanálisis y optimización del rendimiento.',
  keywords: ['nutrición deportiva', 'nutricionista', 'NutriPro', 'dieta personalizada', 'alto rendimiento'],
  authors: [{ name: 'NutriPro Performance' }],
  openGraph: {
    title: 'NutriPro | Nutrición Clínica y Deportiva',
    description: 'Ciencia aplicada al alto rendimiento y salud integral.',
    url: 'https://nutripro.app',
    siteName: 'NutriPro Nutrición',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NutriPro - Nutrición Elite',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriPro | Nutrición Elite',
    description: 'Planes de nutrición basados en ciencia.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicClientWrapper>
      {children}
    </PublicClientWrapper>
  );
}
