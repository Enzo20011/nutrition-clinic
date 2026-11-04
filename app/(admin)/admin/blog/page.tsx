'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  FileText, 
  CheckCircle, 
  Clock, 
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DashboardSkeleton } from '@/components/Skeleton';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  publicado: boolean;
  createdAt: string;
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog?admin=true');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      toast.error('Error al cargar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro que deseas eliminar este artículo?')) return;

    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Post eliminado');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const filteredPosts = posts.filter(p => 
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 bg-navy-dark min-h-screen"><DashboardSkeleton /></div>;

  return (
    <div className="max-w-[1300px] mx-auto space-y-12 pb-20">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-fg-muted/40 font-black uppercase text-[10px] tracking-[0.4em]">
            <Sparkles className="w-4 h-4 opacity-30 text-fg" /> Sistema de Divulgación Digital
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-fg uppercase tracking-tighter italic leading-[0.8]">
            Editor de <br />
            <span className="text-fg-muted/40 not-italic">Contenidos_</span>
          </h1>
          <p className="text-fg-muted/20 font-black uppercase text-[10px] tracking-widest mt-6">Arquitectura de Artículos y Divulgación Educativa Premium</p>
        </div>
        
        <Link href="/admin/blog/nuevo">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 px-10 py-5 rounded-[1.5rem] bg-surface text-accent font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl hover:bg-surface-3/90 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> GENERAR ENTRADA
          </motion.button>
        </Link>
      </div>

      {/* SEARCH CONSOLE */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted/10 group-focus-within:text-fg transition-colors" />
        <input 
          type="text" 
          placeholder="FILTRAR POR AUDITORÍA DE TÍTULOS O SEGMENTOS..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-16 pr-8 py-5 bg-bg/40 border border-border-soft rounded-2xl focus:border-border outline-none w-full text-base md:text-[10px] font-black tracking-[0.2em] text-fg placeholder:text-fg-muted/10 shadow-inner uppercase transition-all"
        />
      </div>

      {/* POSTS DATA GRID */}
      <div className="bg-bg/40 border border-border-soft rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-soft bg-surface/[0.02]">
                <th className="px-10 py-7 text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20">Expediente del Artículo</th>
                <th className="px-10 py-7 text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20">Segmento</th>
                <th className="px-10 py-7 text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20">Protocolo</th>
                <th className="px-10 py-7 text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20">Cronograma</th>
                <th className="px-10 py-7 text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-surface/[0.03] transition-colors group"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-surface-2/5 flex items-center justify-center border border-border group-hover:bg-accent transition-colors shadow-xl">
                          <FileText className="w-6 h-6 text-fg opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-fg uppercase tracking-tighter italic group-hover:text-fg transition-colors">{post.titulo}</p>
                          <p className="text-[9px] text-fg-muted/20 font-black uppercase tracking-widest mt-2">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-2 rounded-xl bg-surface-2/5 border border-border text-[9px] font-black uppercase tracking-widest text-fg-muted/40 group-hover:text-fg transition-colors">
                        {post.categoria}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      {post.publicado ? (
                        <div className="flex items-center gap-3 text-fg-dim/60 text-[9px] font-black uppercase tracking-[0.3em] italic">
                          <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(52,211,153,0.5)]" /> PUBLICADO
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-fg-muted/20 text-[9px] font-black uppercase tracking-[0.3em] italic">
                          <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_10px_rgba(251,191,36,0.3)]" /> BORRADOR
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-[10px] text-fg-muted/20 font-black uppercase tracking-widest">
                      {new Date(post.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <button className="p-3.5 rounded-xl bg-surface-2/5 hover:bg-surface text-fg-muted/20 hover:text-accent border border-border-soft transition-all shadow-xl">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/admin/blog/editar/${post.id}`}>
                          <button className="p-3.5 rounded-xl bg-surface-2/5 hover:bg-surface text-fg-muted/20 hover:text-accent border border-border-soft transition-all shadow-xl">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-3.5 rounded-xl bg-surface-2/5 hover:bg-danger/20 text-fg-muted/20 hover:text-danger border border-border-soft transition-all shadow-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredPosts.length === 0 && (
            <div className="p-32 text-center space-y-8">
              <div className="w-20 h-20 bg-surface-2/5 rounded-3xl flex items-center justify-center mx-auto border border-border shadow-inner">
                <FileText className="w-10 h-10 text-fg-muted/10" />
              </div>
              <p className="text-fg-muted/10 font-black uppercase tracking-[0.5em] text-[10px] italic">Bitácora de Contenidos Vacía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
