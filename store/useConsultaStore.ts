import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConsultaState {
  anamnesis: any | null;
  antropometria: any | null;
  dieta: any | null;
  setAnamnesis: (data: any) => void;
  setAntropometria: (data: any) => void;
  setDieta: (data: any) => void;
  clearSession: () => void;
}

export const useConsultaStore = create<ConsultaState>()(
  persist(
    (set) => ({
      anamnesis: null,
      antropometria: null,
      dieta: null,
      setAnamnesis: (data) => set({ anamnesis: data }),
      setAntropometria: (data) => set({ antropometria: data }),
      setDieta: (data) => set({ dieta: data }),
      clearSession: () => set({ anamnesis: null, antropometria: null, dieta: null }),
    }),
    {
      name: 'nutripro-consulta-session', // Key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
