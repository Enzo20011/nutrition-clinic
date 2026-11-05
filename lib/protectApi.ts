import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";
import { DEMO } from "./demoId";

/**
 * Helper to protect API routes.
 * Returns the session if authenticated, otherwise returns a 401 response.
 */
export async function getValidSession() {
  // En la demo el panel queda abierto, sin contraseña.
  if (DEMO) return { user: { id: 'demo', name: 'Demo', email: 'demo@example.com' }, expires: '' } as any;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }
  
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "No autorizado. Debe iniciar sesión como administrador." },
    { status: 401 }
  );
}
