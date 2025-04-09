import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
    isOpen: true,
    isPlaying: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false, isPlaying: false }),
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
}));