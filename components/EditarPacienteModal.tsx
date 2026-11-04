'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserCog, Phone, Mail, Target } from 'lucide-react';
import { pacienteSchema, PacienteInput } from '@/lib/validations/paciente';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EditarPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: any;
  onSuccess?: () => void;
}

export default function EditarPacienteModal({ isOpen, onClose, paciente, onSuccess }: EditarPacienteModalProps) {
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

  useEffect(() => {
    if (paciente) {
      reset({
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        fechaNacimiento: paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toISOString().split('T')[0] as any : new Date().toISOString().split('T')[0] as any,
        sexo: paciente.sexo || 'masculino',
        email: paciente.email || '',
        whatsapp: paciente.whatsapp || '',
        objetivo: paciente.objetivo || '',
        peso: paciente.peso || undefined,
        altura: paciente.altura || undefined,
        status: paciente.status || 'Activo',
      });
    }
  }, [paciente, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: PacienteInput) => {
      const res = await fetch(`/api/pacientes/${paciente._id || paciente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al actualizar el paciente');
      }
      return res.json();
    },
    onSuccess: () => {
      const pId = paciente.id || paciente._id;
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['paciente', pId] });
      queryClient.invalidateQueries({ queryKey: ['anamnesis', pId] });
      queryClient.invalidateQueries({ queryKey: ['antropometria', pId] });
      queryClient.invalidateQueries({ queryKey: ['biometria', pId] });

      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      setApiError(error.message);
    }
  });

  const onSubmit = (data: PacienteInput) => {
    setApiError(null);
    updateMutation.mutate(data);
  };

  const inputStyles = "w-full p-3.5 bg-surface-2 border border-border rounded-xl focus:border-accent/50 outline-none text-fg transition-all text-sm placeholder:text-fg-muted";
  const labelStyles = "text-[13px] font-medium text-fg-dim block mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl z-[101] flex flex-col custom-scrollbar"
          >
            <div className="sticky top-0 bg-surface/95 backdrop-blur-xl border-b border-border px-8 py-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="heading-sm !text-xl">Editar paciente</h2>
                  <p className="text-[13px] text-fg-muted">Actualizar información base</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-3 transition-colors text-fg-dim hover:text-fg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {apiError && (
                <div className="p-4 rounded-xl bg-danger-soft border border-danger/20 text-danger font-medium text-[13px] text-center">
                  {apiError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelStyles}>Nombre *</label>
                  <input {...register('nombre')} className={inputStyles} placeholder="Ej. Juan" />
                  {errors.nombre && <p className="text-danger text-[12px] mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <label className={labelStyles}>Apellido *</label>
                  <input {...register('apellido')} className={inputStyles} placeholder="Ej. Pérez" />
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

                <div>
                  <label className={labelStyles}>Estado</label>
                  <select {...register('status')} className={inputStyles}>
                    <option value="Activo" className="bg-surface text-success">Activo</option>
                    <option value="En Pausa" className="bg-surface text-warning">En pausa</option>
                    <option value="Alta" className="bg-surface text-accent">Alta clínica</option>
                  </select>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-border">
                  <h3 className="eyebrow">Contacto y medidas (opcional)</h3>
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
                    <label className={labelStyles}>Peso inicial (kg)</label>
                    <input type="number" step="0.1" {...register('peso', { valueAsNumber: true })} className={`${inputStyles} num`} placeholder="Ej. 70.5" />
                  </div>
                  <div>
                    <label className={labelStyles}>Altura (cm)</label>
                    <input type="number" step="1" {...register('altura', { valueAsNumber: true })} className={`${inputStyles} num`} placeholder="Ej. 175" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full font-medium text-[13px] text-fg-muted hover:text-fg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-full font-medium text-[13px] bg-accent text-accent-fg hover:bg-accent-2 transition-all shadow-lg shadow-accent/15 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
