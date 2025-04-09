import { create } from "zustand";

const useFiltersStore = create((set) => ({
  // Listas de opções disponíveis
  categorias: [],
  cidades: [],
  bairros: [],

  // Valores selecionados pelo usuário
  finalidade: "", // Default value
  categoriaSelecionada: "",
  cidadeSelecionada: "",
  bairrosSelecionados: [],

  // Outros filtros (agora como strings ou null para representar não selecionado)
  quartos: null,
  banheiros: null,
  vagas: null,
  precoMin: null,
  precoMax: null,
  areaMin: 0,
  areaMax: 0,

  // Checkboxes
  abaixoMercado: false,
  proximoMetro: false,

  // Controle de filtros aplicados
  filtrosAplicados: false,

  // Contador para forçar atualização dos filtros
  atualizacoesFiltros: 0,

  // Flag para verificar se os filtros básicos estão preenchidos
  filtrosBasicosPreenchidos: false,

  // Função para atualizar os filtros
  setFilters: (filtros) =>
    set((state) => {
      // Mantém apenas as listas de opções do estado atual
      const currentOptions = {
        categorias: state.categorias || [],
        cidades: state.cidades || [],
        bairros: state.bairros || [],
      };

      // Retorna um novo objeto que combina as listas de opções e os filtros fornecidos
      return {
        // Mantém as listas de opções
        ...currentOptions,

        // Aplica os novos filtros fornecidos pelo usuário
        ...filtros,
      };
    }),

  // Função para aplicar os filtros (ativa a busca)
  aplicarFiltros: () =>
    set((state) => ({
      ...state,
      filtrosAplicados: true,
      atualizacoesFiltros: state.atualizacoesFiltros + 1,
    })),

  // Função para limpar todos os filtros
  limparFiltros: () =>
    set({
      finalidade: "", // Reset to default value
      categoriaSelecionada: "",
      cidadeSelecionada: "",
      bairrosSelecionados: [],
      quartos: null,
      banheiros: null,
      vagas: null,
      precoMin: null,
      precoMax: null,
      areaMin: 0,
      areaMax: 0,
      abaixoMercado: false,
      proximoMetro: false,
      filtrosAplicados: false,
      filtrosBasicosPreenchidos: false,
    }),
}));

export default useFiltersStore;
