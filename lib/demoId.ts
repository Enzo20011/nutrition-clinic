import { cookies, headers } from 'next/headers';

/**
 * Modo demo: cada visitante trabaja sobre su propio espacio de datos (identificado por
 * una cookie), sin contraseña, y los espacios viejos se borran solos.
 * Se activa con DEMO_MODE=1. Sin esa variable, la app funciona normal.
 */
export const DEMO = process.env.DEMO_MODE === '1';
export const DEMO_COOKIE = 'demo_id';
export const DEMO_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas
const ID_VALIDO = /^[a-z0-9]{12,40}$/;

export function currentDemoId(): string {
  if (!DEMO) return '';
  const raw = headers().get('x-demo-id') ?? cookies().get(DEMO_COOKIE)?.value ?? '';
  return ID_VALIDO.test(raw) ? raw : '';
}

/** Nombre de tabla para SQL a mano. Con DB_SCHEMA definido, la tabla va calificada con el esquema. */
export function tabla(nombre: string): string {
  const esquema = process.env.DB_SCHEMA;
  return esquema ? `"${esquema}"."${nombre}"` : `"${nombre}"`;
}
