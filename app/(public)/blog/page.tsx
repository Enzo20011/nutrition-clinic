'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Search, Tag } from 'lucide-react';
import Link from 'next/link';

interface Post {
  _id: string;
  titulo: string;
  slug: string;
  resumen: string;
  imagen: string;
  categoria: string;
  createdAt: string;
  fechaLectura?: string;
}

export default function BlogPublicPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', 'Nutrición', 'Deporte', 'Salud', 'Recetas'];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error('Error loading posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = activeCategory === 'Todos' 
    ? posts 
    : posts.filter(p => p.categoria === activeCategory);

  return (
    <main className="min-h-screen bg-bg pt-40 pb-24 px-6 overflow-hidden relative">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-border-soft to-transparent -z-10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-surface/[0.02] rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-8 relative z-10 pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="text-center space-y-10 max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-surface-2/5 border border-border backdrop-blur-3xl"
          >
            <span className="w-2 h-2 rounded-full bg-surface animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-fg-muted/40">Terminal de Conocimiento_</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-fg leading-[0.85]"
          >
            BIO <span className="text-fg-muted/20 not-italic">INSIGHTS_</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-fg-muted/40 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic border-l-2 border-border-soft pl-8"
          >
            Investigaciones, protocolos y algoritmos nutricionales para optimizar el potencial físico y cognitivo.
          </motion.p>
        </section>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap justify-center gap-4 relative z-20">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-700 border italic",
                activeCategory === cat 
                  ? 'bg-surface text-accent border-border shadow-3xl scale-110' 
                  : 'bg-surface-2/5 text-fg-muted/20 border-border-soft hover:border-border hover:text-fg'
              )}
            >
              {cat}_
            </motion.button>
          ))}
        </div>

        {/* POSTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] bg-bg/40 rounded-[4rem] animate-pulse border border-border-soft" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post, i) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -16 }}
                className="group relative flex flex-col bg-bg/60 backdrop-blur-3xl border border-border-soft rounded-[4.5rem] overflow-hidden shadow-3xl transition-all duration-1000 hover:border-border"
              >
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-20" />
                
                {/* IMAGE WRAPPER */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent z-[1] opacity-60" />
                  <img 
                    src={post.imagen || '/assets/placeholder-blog.jpg'} 
                    alt={post.titulo}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale group-hover:grayscale-0 brightness-75 group-hover:brightness-100"
                  />
                  <div className="absolute top-8 left-8 z-10 px-6 py-2.5 rounded-full bg-surface text-accent text-[9px] font-black uppercase tracking-[0.4em] shadow-3xl italic">
                    {post.categoria}_
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-12 flex-1 flex flex-col space-y-8 relative">
                   {/* Decoration Orb */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-surface-2/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="flex items-center gap-6 text-fg-muted/20">
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] italic">
                      <Calendar className="w-4 h-4 text-fg-muted/40" />
                      {new Date(post.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </div>
                    {post.fechaLectura && (
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] italic">
                        <Clock className="w-4 h-4 text-fg-muted/40" />
                        {post.fechaLectura}
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl font-black text-fg italic uppercase tracking-tighter leading-[0.9] group-hover:text-fg transition-all duration-700 line-clamp-2">
                    {post.titulo}_
                  </h3>
                  
                  <p className="text-fg-muted/30 text-base font-medium leading-relaxed line-clamp-3 italic border-l border-border pl-6 group-hover:border-border transition-colors">
                    {post.resumen}
                  </p>

                  <div className="pt-6 mt-auto">
                    <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-fg-muted/40 transition-all duration-700 group-hover:gap-8 group-hover:text-fg italic">
                      Indexar Artículo_ <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-48 space-y-10 relative">
            <div className="w-32 h-32 bg-surface-2/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-border shadow-inner group/empty">
              <Search className="w-12 h-12 text-fg-muted/10 group-hover/empty:scale-110 transition-transform duration-700" />
            </div>
            <p className="text-fg-muted/20 font-black uppercase tracking-[0.6em] text-[10px] italic">Sin Coincidencias en Terminal_Insights_</p>
          </div>
        )}
      </div>
    </main>
  );
}

// Helper para clases condicionales
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
