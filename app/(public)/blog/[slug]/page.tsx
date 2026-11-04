'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Share2, 
  Twitter, 
  Instagram, 
  ArrowLeft,
  User,
  Tag
} from 'lucide-react';
import Link from 'next/link';

interface Post {
  _id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagen: string;
  categoria: string;
  autor: string;
  createdAt: string;
  fechaLectura?: string;
}

export default function BlogPostView({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/blog/${params.slug}`);
        const data = await res.json();
        setPost(data);

        // Fetch related posts from the same category
        const relRes = await fetch(`/api/blog?limit=3`);
        const relData = await relRes.json();
        setRelated(relData.filter((p: Post) => p.slug !== params.slug));
      } catch (error) {
        console.error('Error loading post');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-navy-dark pt-40 text-center">
      <div className="w-12 h-12 border-4 border-accentBlue border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-navy-dark pt-40 text-center space-y-6">
      <h1 className="text-4xl font-black text-fg italic underline decoration-accentBlue">Post no encontrado</h1>
      <Link href="/blog" className="inline-flex items-center gap-2 text-accentBlue font-bold uppercase tracking-widest text-xs">
        <ArrowLeft className="w-4 h-4" /> Volver al Blog
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-navy-dark pb-24 text-bone">
      {/* HERO / HEADER SECTION */}
      <section className="relative h-[70vh] flex flex-col items-center justify-end pb-20 px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent z-10" />
          <img 
            src={post.imagen || '/assets/placeholder-blog.jpg'} 
            alt={post.titulo}
            className="w-full h-full object-cover blur-[2px] opacity-40 scale-105"
          />
        </div>

        <div className="max-w-4xl mx-auto w-full z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/blog">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2/5 hover:bg-surface-3/10 text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all">
                <ChevronLeft className="w-4 h-4" /> Volver al Blog
              </button>
            </Link>
            <span className="w-px h-6 bg-surface-3/10" />
            <span className="px-4 py-2 rounded-xl bg-accentBlue text-accent-fg text-[10px] font-black uppercase tracking-widest shadow-xl">
              {post.categoria}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-fg leading-tight"
          >
            {post.titulo}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-8 pt-4 border-t border-border-soft"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accentBlue/10 flex items-center justify-center border border-accentBlue/20">
                <User className="w-5 h-5 text-accentBlue" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Autor</p>
                <p className="text-sm font-bold text-fg">{post.autor || 'Equipo NutriPro'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <Calendar className="w-4 h-4 text-accentBlue" />
                  {new Date(post.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <Clock className="w-4 h-4 text-accentBlue" />
                  {post.fechaLectura || '5 min de lectura'}
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ARTICLE CONTENT */}
      <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-cardDark/40 backdrop-blur-3xl border border-border-soft p-8 md:p-16 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        >
          {/* INTRO SUMMARY */}
          <p className="text-xl md:text-2xl font-medium text-slate-200 leading-relaxed border-l-4 border-accentBlue pl-8 mb-16 italic">
            {post.resumen}
          </p>

          {/* MAIN BODY */}
          <div 
            className="prose prose-invert prose-lg max-w-none text-slate-400 font-medium leading-loose space-y-8"
            dangerouslySetInnerHTML={{ __html: post.contenido }}
          />

          {/* FOOTER / SOCIALS */}
          <div className="mt-20 pt-10 border-t border-border-soft flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex flex-wrap gap-2">
                {['Nutrición', 'Ciencia', 'Fitness'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-lg bg-surface-2/5 border border-border text-[9px] font-black uppercase tracking-widest text-slate-500">
                    #{tag}
                  </span>
                ))}
             </div>
             
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Compartir:</span>
                <div className="flex gap-2">
                  {[Share2, Twitter, Instagram].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-xl bg-surface-2/5 hover:bg-accentBlue text-slate-400 hover:text-accent-fg transition-all flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* RELATED POSTS */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mt-32 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-fg tracking-tighter uppercase italic">
              Artículos <span className="text-accentBlue not-italic">Relacionados</span>
            </h2>
            <div className="w-20 h-1 bg-accentBlue/20 rounded-full mx-auto overflow-hidden">
               <div className="w-1/2 h-full bg-accentBlue animate-slide-infinite" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((rp, i) => (
              <motion.div 
                key={rp._id}
                whileHover={{ y: -8 }}
                className="bg-cardDark/40 border border-border-soft rounded-[2rem] overflow-hidden group"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                   <img src={rp.imagen} alt={rp.titulo} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                   <Link href={`/blog/${rp.slug}`} className="absolute inset-0 z-10" />
                </div>
                <div className="p-8 space-y-4">
                   <span className="text-[9px] font-black uppercase tracking-widest text-accentBlue">{rp.categoria}</span>
                   <h3 className="text-lg font-black text-fg italic uppercase tracking-tighter leading-tight group-hover:text-accentBlue transition-colors">{rp.titulo}</h3>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      Continuar leyendo <ChevronRight className="w-3.5 h-3.5" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
