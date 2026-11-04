import { MercadoPagoConfig } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
  console.warn('MP_ACCESS_TOKEN no encontrada en .env.local. Usando modo simulado.');
}

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-MOCK-TOKEN',
  options: { timeout: 5000 }
});

export default client;
