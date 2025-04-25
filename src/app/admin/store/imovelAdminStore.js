import { create } from "zustand";

const useImovelAdminStore = create((set, get) => ({
    // Imóvel selecionado na tabela de administração
    imovelSelecionado: null,

    // Histórico de imóveis visualizados
    historicoImoveis: [],

    // Ação para definir o imóvel selecionado
    setImovelSelecionado: (imovel) => {
        if (!imovel) return;

        set((state) => {
            // Adicionar ao histórico se não for o mesmo que o último selecionado
            const novoHistorico = [...state.historicoImoveis];

            // Verificar se o imóvel já está no histórico
            const imovelExistente = novoHistorico.findIndex(item => item.Codigo === imovel.Codigo);

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
                historicoImoveis: historicoLimitado
            };
        });
    },

    // Ação para limpar o imóvel selecionado
    limparImovelSelecionado: () => set({ imovelSelecionado: null }),

    // Obter o imóvel selecionado
    getImovelSelecionado: () => get().imovelSelecionado,

    // Limpar o histórico de imóveis
    limparHistorico: () => set({ historicoImoveis: [] }),
}));

export default useImovelAdminStore; 