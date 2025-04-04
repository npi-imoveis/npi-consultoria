import { create } from "zustand";

const useImovelStore = create((set, get) => ({
  id: null,
  slug: null,
  // Armazenar imóveis completos carregados
  imoveisCache: {},
  imovelAtual: null,

  // Ação para definir o id e slug do imóvel
  setImovelSelecionado: (id, slug) => set({ id, slug }),

  // Ação para limpar os dados do imóvel selecionado
  limparImovelSelecionado: () => set({ id: null, slug: null }),

  // Ação para armazenar os dados completos de um imóvel no cache
  adicionarImovelCache: (id, dadosImovel) => {
    set((state) => ({
      imoveisCache: {
        ...state.imoveisCache,
        [id]: dadosImovel,
      },
    }));
  },

  // Ação para obter os dados de um imóvel do cache
  getImovelDoCache: (id) => {
    const state = get();
    return state.imoveisCache[id] || null;
  },

  // Ação para definir o imóvel atual que está sendo visualizado
  setImovelAtual: (imovel) => set({ imovelAtual: imovel }),

  // Ação para armazenar múltiplos imóveis no cache de uma vez (útil para resultados de busca)
  adicionarVariosImoveisCache: (imoveis) => {
    if (!imoveis || !Array.isArray(imoveis)) return;

    const novosImoveisCache = {};
    imoveis.forEach((imovel) => {
      if (imovel && imovel.Codigo) {
        novosImoveisCache[imovel.Codigo] = imovel;
      }
    });

    set((state) => ({
      imoveisCache: {
        ...state.imoveisCache,
        ...novosImoveisCache,
      },
    }));
  },
}));

export default useImovelStore;
