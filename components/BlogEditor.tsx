'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Type, 
  Image as ImageIcon, 
  Tag, 
  FileText, 
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface BlogEditorProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BlogEditor({ initialData, isEditing = false }: BlogEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    resumen: '',
    contenido: '',
    imagen: '',
    categoria: 'Nutrición',
    publicado: false,
    tags: [] as string[]
  });
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value;
    const slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    setFormData(prev => ({ ...prev, titulo, slug }));
  };

  const handleSave = async () => {
    if (!formData.titulo || !formData.contenido) {
      toast.error('Título y contenido son requeridos');
      return;
    }

    setSaving(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/blog/${initialData.id}` : '/api/blog';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEditing ? 'Articulo actualizado' : 'Artículo creado');
        router.push('/admin/blog');
        router.refresh();
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-bg/40 border border-border-soft rounded-2xl px-6 py-5 text-fg font-black uppercase text-[10px] tracking-widest focus:outline-none focus:border-border focus:bg-surface/[0.05] transition-all placeholder:text-fg-muted/10 shadow-inner";

  return (
    <div className="space-y-12 pb-20">
      {/* TOOLBAR TÁCTICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-bg/60 backdrop-blur-3xl border border-border-soft p-6 rounded-[2.5rem] sticky top-6 z-30 shadow-2xl gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/blog">
            <button className="p-3.5 rounded-xl bg-surface-2/5 hover:bg-surface text-fg-muted/20 hover:text-accent border border-border-soft transition-all shadow-xl group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </Link>
          <div className="h-10 w-px bg-surface-3/10" />
          <div className="flex bg-bg/80 p-1.5 rounded-2xl border border-border-soft shadow-inner">
            <button 
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'bg-surface text-accent shadow-xl italic' : 'text-fg-muted/20 hover:text-fg'}`}
            >
              <Type className="w-4 h-4 opacity-40" /> Editor
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-surface text-accent shadow-xl italic' : 'text-fg-muted/20 hover:text-fg'}`}
            >
              <Eye className="w-4 h-4 opacity-40" /> Vista Previa
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-8">
          <label className="flex items-center gap-4 cursor-pointer group">
            <span className="text-[10px] font-black text-fg-muted/20 uppercase tracking-[0.3em] group-hover:text-fg transition-colors">Visibilidad Pública</span>
            <div 
              onClick={() => setFormData(prev => ({ ...prev, publicado: !prev.publicado }))}
              className={`w-12 h-6 rounded-full relative transition-all border border-border ${formData.publicado ? 'bg-surface' : 'bg-bg/60'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-md ${formData.publicado ? 'right-1 bg-accent' : 'left-1 bg-surface-3/10'}`} />
            </div>
          </label>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-4 px-10 py-4.5 rounded-2xl bg-surface text-accent text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-surface-3/90 active:scale-95 disabled:opacity-50 transition-all"
          >
            {saving ? <div className="w-4 h-4 border-2 border-accent/30 border-t-[#1F4D3D] rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'ACTUALIZAR NÚCLEO' : 'PUBLICAR ARTÍCULO'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* MAIN EDITOR CONSOLE */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-bg/40 border border-border-soft p-12 rounded-[3.5rem] shadow-2xl space-y-10 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-surface-2/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 opacity-20" />
            
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20 ml-2">Título de la Auditoría Educativa</label>
              <input 
                type="text" 
                value={formData.titulo}
                onChange={handleTitleChange}
                placeholder="Escritura de Impacto Clínico..."
                className="w-full bg-transparent border-none p-0 text-5xl font-black text-fg focus:outline-none transition-all placeholder:text-fg-muted/5 italic uppercase tracking-tighter"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20 ml-2">Enlace de Identificación (SLUG)</label>
              <div className="flex items-center bg-bg/60 border border-border-soft rounded-2xl px-6 py-4 shadow-inner">
                <span className="text-[10px] text-fg-muted/20 font-black uppercase tracking-widest shrink-0">clinical/blog/</span>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                  className="flex-1 bg-transparent border-none outline-none text-[10px] font-black tracking-widest text-fg-dim/60 px-2 uppercase"
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-border-soft">
              <div className="flex items-center justify-between px-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20">Cuerpo del Comunicado</label>
                <div className="flex items-center gap-4 text-[9px] font-black text-fg-muted/10 uppercase tracking-[0.4em]">
                  <span>Protocolo: HTML / MARKDOWN</span>
                </div>
              </div>
              
              {activeTab === 'edit' ? (
                <textarea 
                  value={formData.contenido}
                  onChange={e => setFormData(p => ({ ...p, contenido: e.target.value }))}
                  placeholder="Iniciando secuencia de redacción especializada..."
                  className="w-full bg-bg/40 border border-border-soft rounded-[2.5rem] p-10 min-h-[600px] text-lg font-medium text-fg-dim/60 focus:border-border outline-none transition-all placeholder:text-fg-muted/5 font-mono leading-relaxed shadow-inner"
                />
              ) : (
                <div className="w-full bg-surface/[0.02] border border-border-soft rounded-[2.5rem] p-12 min-h-[600px] prose prose-invert max-w-none shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-accent/30" />
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter text-fg mb-12 leading-none">{formData.titulo || 'SIN TÍTULO'}</h1>
                  <div className="text-fg-dim/60 text-xl font-medium leading-relaxed space-y-8 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formData.contenido || '<p class="opacity-20 italic">Sin contenido generado para previsualización.</p>' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR PROTOCOLS */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-bg/40 border border-border-soft p-10 rounded-[3.5rem] shadow-2xl space-y-10 backdrop-blur-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-fg flex items-center gap-3">
              <ImageIcon className="w-4 h-4 opacity-30" /> Segmentación & Multimedia
            </h3>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20 ml-2">Activo Visual de Portada (URL)</label>
              <input 
                type="text" 
                value={formData.imagen}
                onChange={e => setFormData(p => ({ ...p, imagen: e.target.value }))}
                placeholder="ENLACE HTTPS://..."
                className={inputClass}
              />
              {formData.imagen && (
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-border mt-6 group shadow-2xl">
                  <img src={formData.imagen} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent opacity-40" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20 ml-2">Categoría del Segmento</label>
              <div className="relative">
                <select 
                  value={formData.categoria}
                  onChange={e => setFormData(p => ({ ...p, categoria: e.target.value as any }))}
                  className="w-full bg-bg/60 border border-border-soft rounded-2xl px-6 py-4.5 text-[10px] font-black uppercase tracking-[0.3em] text-fg focus:outline-none focus:border-border appearance-none cursor-pointer shadow-inner"
                >
                  <option value="Nutrición" className="bg-bg text-fg">CIENCIA NUTRICIONAL</option>
                  <option value="Deporte" className="bg-bg text-fg">ALTO NIVEL</option>
                  <option value="Salud" className="bg-bg text-fg">PATOLOGÍA CLÍNICA</option>
                  <option value="Recetas" className="bg-bg text-fg">PROTOCOLO CULINARIO</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-soft">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-fg-muted/20 ml-2">Extracto de Auditoría (SEO)</label>
              <textarea 
                value={formData.resumen}
                onChange={e => setFormData(p => ({ ...p, resumen: e.target.value }))}
                placeholder="Sintetiza el valor del artículo para la indexación..."
                className="w-full bg-bg/60 border border-border-soft rounded-2xl p-6 text-[10px] font-black uppercase tracking-[0.2em] text-fg-muted/40 focus:text-fg outline-none min-h-[150px] resize-none shadow-inner transition-colors"
              />
            </div>
          </div>
          
          {/* TIPSBOX */}
          <div className="bg-accent/10 border border-border-soft p-8 rounded-[3rem] flex gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
            <AlertCircle className="w-8 h-8 text-fg-muted/20 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-fg leading-none">Protocolo de Élite_</h4>
              <p className="text-[10px] text-fg-muted/30 font-black uppercase tracking-[0.25em] leading-relaxed italic">Inyecta palabras clave especializadas en el encabezamiento para maximizar la visibilidad orgánica en buscadores.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
