import { create } from 'zustand'
import { getCondominiosPorImovel } from "@/app/services";

const useCondominioStore = create((set) => ({
    condominioData: null,
    isLoading: false,
    error: null,

    setCondominioData: (data) => set({ condominioData: data }),
    setLoading: (status) => set({ isLoading: status }),
    setError: (error) => set({ error }),

    fetchCondominioData: async (codigo) => {
        try {
            set({ isLoading: true, error: null });
            const response = await getCondominiosPorImovel(codigo);
            set({ condominioData: response, isLoading: false });
            return response;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            console.error('Error fetching condominio data:', error);
        }
    },

    clearCondominioData: () => set({ condominioData: null, error: null }),
}))

export default useCondominioStore; 