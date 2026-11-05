import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

/**
 * Helper to protect API routes.
 * Returns the session if authenticated, otherwise returns a 401 response.
 */
export async function getValidSession() {
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
