import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de redirección para proteger el admin (alternativa a middleware si es simple)
  // Pero usaremos el middleware de NextAuth para mayor seguridad real.
};

export default withPWA(nextConfig);
