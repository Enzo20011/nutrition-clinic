import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

// Simple in-memory storage for rate limiting (per instance)
const rateLimit = new Map<string, { count: number; lastReset: number }>();

const authMiddleware = withAuth(
  function middleware(req) {
    const ip = req.ip || "anonymous";
    const now = Date.now();
    const timeframe = 60 * 1000; // 1 minute
    const limit = 5; // 5 requests per minute

    const legacyRoutes = ['/pacientes', '/agenda', '/finanzas', '/consulta', '/blog', '/calculadora'];
    const { pathname } = req.nextUrl;
    
    // Legacy redirect to /admin variants
    const matchingLegacy = legacyRoutes.find(route => pathname === route || pathname.startsWith(`${route}/`));
    
    if (matchingLegacy && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL(`/admin${pathname}`, req.url));
    }

    // Apply rate limit specifically to the checkout API
    if (pathname.startsWith("/api/checkout")) {
      const entry = rateLimit.get(ip) || { count: 0, lastReset: now };
      
      if (now - entry.lastReset > timeframe) {
        entry.count = 0;
        entry.lastReset = now;
      }
      
      entry.count++;
      rateLimit.set(ip, entry);

      if (entry.count > limit) {
        return new NextResponse("Demasiadas solicitudes.", { status: 429 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Require token for ALL /admin routes and legacy routes
        if (pathname.startsWith('/admin') || 
            ['/pacientes', '/agenda', '/finanzas', '/consulta', '/blog', '/calculadora'].some(r => pathname.startsWith(r))) {
          return !!token;
        }
        // Por defecto, permitir (las rutas públicas no están en el matcher o se filtran aquí)
        return true;
      },
    },
    pages: {
      signIn: '/login',
    }
  }
);

const LEGACY = ['/pacientes', '/agenda', '/finanzas', '/consulta'];
const PROTEGIDAS = ['/admin', '/api/checkout', '/pacientes', '/agenda', '/finanzas', '/consulta'];

function nuevoId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // Modo demo: sin login y con un espacio de datos propio para cada visitante.
  if (process.env.DEMO_MODE === '1') {
    if (pathname === '/login') return NextResponse.redirect(new URL('/admin', req.url));
    const legacy = LEGACY.find((r) => pathname === r || pathname.startsWith(`${r}/`));
    if (legacy) return NextResponse.redirect(new URL(`/admin${pathname}`, req.url));
    const actual = req.cookies.get('demo_id')?.value;
    const id = actual && /^[a-z0-9]{12,40}$/.test(actual) ? actual : nuevoId();
    const headers = new Headers(req.headers);
    headers.set('x-demo-id', id);
    const res = NextResponse.next({ request: { headers } });
    if (id !== actual) {
      res.cookies.set('demo_id', id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
    }
    return res;
  }

  // Modo normal: las rutas protegidas exigen sesión.
  if (PROTEGIDAS.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return (authMiddleware as unknown as (r: NextRequest, e: NextFetchEvent) => Response)(req, ev);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|icons|.*\\.(?:png|jpg|jpeg|svg|webp|ico|js|css|woff2?|mp4)$).*)',
  ],
};
