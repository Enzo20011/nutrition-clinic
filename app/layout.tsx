import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/SessionProvider';
import QueryProvider from '@/components/providers/QueryProvider';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: {
    default: 'NutriPro | Plataforma de Nutrición Deportiva y Rendimiento',
    template: '%s | NutriPro Nutrición',
  },
  description: 'Sistemas de alimentación de alto rendimiento basados en ciencia, antropometría y biotipificación individual. Consultas online y presenciales.',
  keywords: ['nutricionista', 'nutrición deportiva', 'nutrición clínica', 'NutriPro', 'plan alimentario', 'composición corporal', 'alto rendimiento'],
  authors: [{ name: 'NutriPro Performance' }],
  creator: 'NutriPro',
  metadataBase: new URL('https://nutripro.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://nutripro.app',
    siteName: 'NutriPro | Nutrición y Alto Rendimiento',
    title: 'NutriPro | Plataforma de Nutrición Deportiva y Rendimiento',
    description: 'Sistemas de alimentación avanzada basados en ciencia, antropometría y biotipificación individual.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'NutriPro - Nutrición Clínica y Deportiva',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriPro | Nutrición Deportiva y Rendimiento',
    description: 'Sistemas de alimentación de alto rendimiento basados en ciencia.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/icon-192x192.png' },
  ],
  themeColor: '#FAF9F5',
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored === 'dark';
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${fraunces.variable} ${inter.variable} font-sans bg-bg text-fg min-h-screen relative`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        {/* Footer y WhatsApp solo en landing/público, no en admin */}
      </body>
    </html>
  );
}
