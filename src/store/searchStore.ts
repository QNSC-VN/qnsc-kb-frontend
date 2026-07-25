import { create } from 'zustand';
export const useSearchStore = create((set) => ({ query: '', setQuery: (query: string) => set({ query }) }));
