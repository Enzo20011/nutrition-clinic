import { create } from 'zustand';

interface PatientStore {
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  page: number;
  setPage: (page: number) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  page: 1,
  setPage: (page) => set({ page }),
}));
