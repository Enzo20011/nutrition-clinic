'use client';

import React from 'react';
import BlogEditor from '@/components/BlogEditor';
import { Sparkles } from 'lucide-react';

export default function NewBlogPage() {
  return (
    <div className="max-w-[1300px] mx-auto px-6 space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-fg-muted/40 font-black uppercase text-[10px] tracking-[0.4em]">
            <Sparkles className="w-4 h-4 opacity-30 text-fg" /> Gestión Editorial Clinical
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-fg uppercase tracking-tighter italic leading-[0.8]">
            Crear <br />
            <span className="text-fg-muted/40 not-italic">Nuevo Artículo_</span>
          </h1>
          <p className="text-fg-muted/20 font-black uppercase text-[10px] tracking-widest mt-6">Arquitectura de Divulgación y Posicionamiento de Autoridad</p>
        </div>
      </header>
      
      <BlogEditor />
    </div>
  );
}
