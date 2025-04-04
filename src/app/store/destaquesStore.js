import { create } from "zustand";
import { getImovelDestacado } from "../services";

const useDestaquesStore = create((set, get) => ({
  imoveisDestaque: [],
  isLoading: false,
  error: null,

  // Busca imóveis em destaque
  fetchImoveisDestaque: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await getImovelDestacado();
      let imoveis = [];

      // Verifica o formato da resposta
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        imoveis = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        imoveis = response.data;
      } else {
        throw new Error("Formato de dados inválido recebido do servidor");
      }

      // Atualiza o store com os novos dados
      set({
        imoveisDestaque: imoveis,
        isLoading: false,
      });

      return imoveis;
    } catch (error) {
      set({
        error: error.message || "Erro ao buscar imóveis em destaque",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useDestaquesStore; 