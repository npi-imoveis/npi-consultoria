import { create } from "zustand";

const useFavoritosStore = create((set, get) => ({
  favoritos: [],

  // Adicionar um imóvel aos favoritos
  adicionarFavorito: (imovel) => {
    const { favoritos } = get();
    // Verificar se o imóvel já está nos favoritos
    if (!favoritos.some((fav) => fav.Codigo === imovel.Codigo)) {
      set({ favoritos: [...favoritos, imovel] });
    }
  },

  // Remover um imóvel dos favoritos
  removerFavorito: (codigo) => {
    const { favoritos } = get();
    set({ favoritos: favoritos.filter((imovel) => imovel.Codigo !== codigo) });
  },

  // Verificar se um imóvel está nos favoritos
  isFavorito: (codigo) => {
    const { favoritos } = get();
    return favoritos.some((imovel) => imovel.Codigo === codigo);
  },

  // Obter todos os favoritos
  getFavoritos: () => get().favoritos,

  // Obter a quantidade de favoritos
  getQuantidadeFavoritos: () => get().favoritos.length,
}));

export default useFavoritosStore;
