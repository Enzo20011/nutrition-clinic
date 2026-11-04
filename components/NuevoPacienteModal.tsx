'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserPlus, Phone, Mail, Target } from 'lucide-react';
import { pacienteSchema, PacienteInput } from '@/lib/validations/paciente';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NuevoPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id?: string) => void;
}

export default function NuevoPacienteModal({ isOpen, onClose, onSuccess }: NuevoPacienteModalProps) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PacienteInput>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      status: 'Activo',
      sexo: 'masculino',
      fechaNacimiento: new Date().toISOString().split('T')[0] as any
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: PacienteInput) => {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al crear el paciente');
      }
      return res.json();
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      reset();
      if (onSuccess) onSuccess(response?.data?.id);
      onClose();
    },
    onError: (error: Error) => {
      setApiError(error.message);
    }
  });

  const onSubmit = (data: PacienteInput) => {
    setApiError(null);
    createMutation.mutate(data);
  };

  const inputStyles = "w-full p-3.5 bg-surface-2 border border-border rounded-xl focus:border-accent/50 outline-none text-fg transition-all text-sm placeholder:text-fg-muted";
  const labelStyles = "text-[13px] font-medium text-fg-dim block mb-1.5";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl z-[101] flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header - No sticky to avoid issues with parent overflow */}
        <div className="bg-surface border-b border-border px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-accent-fg" />
            </div>
            <div>
              <h2 className="heading-sm !text-xl">Nuevo paciente</h2>
              <p className="text-[13px] text-fg-muted">Alta de expediente clínico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors border border-border"
          >
            <X className="w-5 h-5 text-fg-dim" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <div className="p-4 rounded-xl bg-danger-soft border border-danger/20 text-danger font-medium text-[13px] text-center">
                {apiError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className={labelStyles}>Nombre *</label>
                <input
                  {...register('nombre')}
                  className={inputStyles}
                  placeholder="Ej. Juan"
                />
                {errors.nombre && <p className="text-danger text-[12px] mt-1">{errors.nombre.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelStyles}>Apellido *</label>
                <input
                  {...register('apellido')}
                  className={inputStyles}
                  placeholder="Ej. Pérez"
                />
                {errors.apellido && <p className="text-danger text-[12px] mt-1">{errors.apellido.message}</p>}
              </div>

              <div>
                <label className={labelStyles}>Fecha de nacimiento *</label>
                <input type="date" {...register('fechaNacimiento')} className={`${inputStyles} num`} />
                {errors.fechaNacimiento && <p className="text-danger text-[12px] mt-1">{errors.fechaNacimiento.message}</p>}
              </div>
              <div>
                <label className={labelStyles}>Sexo biológico *</label>
                <select {...register('sexo')} className={inputStyles}>
                  <option value="masculino" className="bg-surface text-fg">Masculino</option>
                  <option value="femenino" className="bg-surface text-fg">Femenino</option>
                </select>
                {errors.sexo && <p className="text-danger text-[12px] mt-1">{errors.sexo.message}</p>}
              </div>

              <div className="md:col-span-2 pt-4 border-t border-border">
                <h3 className="eyebrow">Información adicional</h3>
              </div>

              <div className="relative">
                <label className={labelStyles}>WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                  <input {...register('whatsapp')} className={`${inputStyles} pl-11 num`} placeholder="+54 9 11..." />
                </div>
              </div>
              <div className="relative">
                <label className={labelStyles}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                  <input type="email" {...register('email')} className={`${inputStyles} pl-11`} placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className="relative">
                <label className={labelStyles}>Objetivo principal</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                  <input {...register('objetivo')} className={`${inputStyles} pl-11`} placeholder="Ej. hipertrofia, descenso" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>Peso (kg)</label>
                  <input type="number" step="0.1" {...register('peso', { valueAsNumber: true })} className={`${inputStyles} num`} placeholder="Ej. 70.5" />
                </div>
                <div>
                  <label className={labelStyles}>Altura (cm)</label>
                  <input type="number" step="1" {...register('altura', { valueAsNumber: true })} className={`${inputStyles} num`} placeholder="Ej. 175" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-accent text-accent-fg font-medium text-[15px] rounded-full hover:bg-accent-2 transition-all shadow-lg shadow-accent/15 disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : 'Crear paciente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
