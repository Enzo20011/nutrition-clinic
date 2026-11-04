'use client';

import { useState, useEffect } from 'react';
import BlogEditor from '@/components/BlogEditor';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?admin=true`);
        const data = await res.json();
        const found = data.find((p: any) => p.id === params.id);
        
        if (found) {
          setPost(found);
        } else {
          toast.error('Artículo no encontrado');
        }
      } catch (error) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) return <div className="p-8 bg-bg min-h-screen text-fg-muted/20 uppercase font-black text-[10px] tracking-[0.5em] flex items-center justify-center">Iniciando Protocolo de Carga...</div>;

  return (
    <div className="max-w-[1300px] mx-auto px-6 space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-fg-muted/40 font-black uppercase text-[10px] tracking-[0.4em]">
            <Sparkles className="w-4 h-4 opacity-30 text-fg" /> Refinamiento de Protocolos Digitales
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-fg uppercase tracking-tighter italic leading-[0.8]">
            Auditoría <br />
            <span className="text-fg-muted/40 not-italic">Editorial_</span>
          </h1>
          <p className="text-fg-muted/20 font-black uppercase text-[10px] tracking-widest mt-6">Optimización de Contenidos y Autoridad Especializada</p>
        </div>
      </header>
      
      <BlogEditor initialData={post} isEditing={true} />
    </div>
  );
}
