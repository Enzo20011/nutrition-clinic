'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/admin',
        redirect: false
      });

      if (result?.error) {
        setError('Credenciales no autorizadas por el sistema.');
        setLoading(false);
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Fondo propio del login — independiente del layout público */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-3 block">NutriPro</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-fg flex items-center gap-2 justify-center">
              ADMIN <span className="text-accent">PORTAL</span>
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-fg-dim mt-2 opacity-50">SISTEMA INTEGRAL DE GESTIÓN NUTRICIONAL</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-bg/40 backdrop-blur-2xl border border-border-soft p-10 rounded-xl shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-fg-dim uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3 text-accent" /> Identificación Profesional
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-5 py-4 bg-surface/[0.03] border border-border rounded-xl focus:border-accent/50 focus:bg-surface/[0.05] outline-none text-fg font-medium text-base transition-all placeholder:text-fg-muted/10"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-fg-dim uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3 text-accent" /> Clave de Seguridad
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-5 py-4 bg-surface/[0.03] border border-border rounded-xl focus:border-accent/50 focus:bg-surface/[0.05] outline-none text-fg font-medium text-base transition-all placeholder:text-fg-muted/10"
                required
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-danger/5 border border-danger/20 rounded-xl"
              >
                <p className="text-[10px] font-bold text-danger uppercase tracking-widest text-center">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-accent hover:bg-accent-2 text-accent-fg font-bold text-xs uppercase tracking-[0.3em] rounded-xl transition-all shadow-[0_0_30px_rgba(47,158,110,0.15)] flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <Sparkles className="animate-spin w-4 h-4" />
              ) : (
                <>
                  INGRESAR AL SISTEMA
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex items-center justify-center gap-6 opacity-20 group">
          <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.4em] text-fg">
            <ShieldCheck className="w-3 h-3" />
            CONEXIÓN ENCRIPTADA
          </div>
          <div className="w-1 h-1 bg-surface-3/30 rounded-full" />
          <div className="text-[8px] font-bold uppercase tracking-[0.4em] text-fg">
            V 2.1.0
          </div>
        </div>
      </motion.div>
    </div>
  );
}
