import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Administrador",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Las credenciales salen siempre de variables de entorno (ver .env.example).
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;

        if (
          credentials?.email?.toLowerCase() === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return { id: "admin", name: "Administrador", email: adminEmail, role: "admin" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
