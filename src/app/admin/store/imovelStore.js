import { create } from "zustand";
import { persist } from "zustand/middleware";

const useImovelStore = create(
  persist(
    (set, get) => ({
      // Imóvel selecionado na tabela de administração
      imovelSelecionado: null,

      // Modo de operação (criar ou editar)
      mode: "create",

      // Histórico de imóveis visualizados
      historicoImoveis: [],

      // Ação para definir o imóvel selecionado
      setImovelSelecionado: (imovel) => {
        if (!imovel) return;

        set((state) => {
          // Adicionar ao histórico se não for o mesmo que o último selecionado
          const novoHistorico = [...state.historicoImoveis];

          // Verificar se o imóvel já está no histórico
          const imovelExistente = novoHistorico.findIndex((item) => item.Codigo === imovel.Codigo);

          // Se existir, remover para adicionar na frente (mais recente)
          if (imovelExistente !== -1) {
            novoHistorico.splice(imovelExistente, 1);
          }

          // Adicionar o imóvel no início do histórico
          novoHistorico.unshift(imovel);

          // Manter apenas os últimos 10 imóveis no histórico
          const historicoLimitado = novoHistorico.slice(0, 10);

          return {
            imovelSelecionado: imovel,
            historicoImoveis: historicoLimitado,
            mode: "edit", // Alterando o modo para edição
          };
        });
      },

      // Ação para limpar o imóvel selecionado e o histórico
      // Esta função limpa completamente o estado do store ao cancelar uma edição
      limparImovelSelecionado: () =>
        set({
          imovelSelecionado: null,
          mode: "create", // Alterando o modo para criação
          historicoImoveis: [], // Limpar também o histórico de imóveis
        }),

      // Obter o imóvel selecionado
      getImovelSelecionado: () => get().imovelSelecionado,

      // Obter o modo atual (create ou edit)
      getMode: () => get().mode,

      // Definir o modo manualmente
      setMode: (mode) => set({ mode }),

      // Limpar o histórico de imóveis
      limparHistorico: () => set({ historicoImoveis: [] }),
    }),
    {
      name: "imovel-storage", // nome único para o armazenamento
      partialize: (state) => ({
        imovelSelecionado: state.imovelSelecionado,
        mode: state.mode,
      }), // armazenar apenas o imóvel selecionado e o modo
    }
  )
);

export default useImovelStore;
