"use client";

import { useState, useEffect } from "react";
import { getImovelById } from "@/app/services";
import AuthCheck from "../components/auth-check";
import { useRouter } from "next/navigation";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import useImovelStore from "../store/imovelStore";
import { getImoveisDashboard } from "../services/imoveis";

import FiltersImoveisAdmin from "./components/filters";
import { TrashIcon } from "lucide-react";
import ModalDelete from "../components/modal-delete";

// Função para calcular relevância do resultado
const calculateRelevance = (imovel, searchTerm) => {
  if (!searchTerm || !imovel) return 0;
  
  const term = searchTerm.toLowerCase().trim();
  let score = 0;
  
  // Pontuação para diferentes campos
  const fields = [
    { field: imovel.Codigo?.toString().toLowerCase(), weight: 100 }, // Código tem maior peso
    { field: imovel.Empreendimento?.toLowerCase(), weight: 80 },     // Empreendimento peso alto
    { field: imovel.Endereco?.toLowerCase(), weight: 60 },          // Endereço peso médio
    { field: imovel.Bairro?.toLowerCase(), weight: 40 },            // Bairro peso menor
    { field: imovel.Cidade?.toLowerCase(), weight: 30 },            // Cidade peso menor
  ];
  
  fields.forEach(({ field, weight }) => {
    if (field) {
      // Match exato recebe pontuação máxima
      if (field === term) {
        score += weight * 10;
      }
      // Match no início da string recebe pontuação alta
      else if (field.startsWith(term)) {
        score += weight * 5;
      }
      // Match em qualquer lugar recebe pontuação média
      else if (field.includes(term)) {
        score += weight * 2;
      }
      // Match de palavras individuais
      else {
        const termWords = term.split(' ');
        const fieldWords = field.split(' ');
        
        termWords.forEach(termWord => {
          fieldWords.forEach(fieldWord => {
            if (fieldWord.includes(termWord) && termWord.length > 2) {
              score += weight * 0.5;
            }
          });
        });
      }
    }
  });
  
  return score;
};

// Função para calcular dias desde a última atualização
const calcularDiasDesdeAtualizacao = (dataAtualizacao) => {
  if (!dataAtualizacao) return null;
  
  try {
    const dataAtual = new Date();
    const dataUpdate = new Date(dataAtualizacao);
    
    // Verificar se a data é válida
    if (isNaN(dataUpdate.getTime())) return null;
    
    const diferencaMs = dataAtual - dataUpdate;
    const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
    
    return diferencaDias;
  } catch (error) {
    console.error('Erro ao calcular dias desde atualização:', error);
    return null;
  }
};

// Função para detectar qualquer campo que contenha data
const detectarCampoComData = (imovel) => {
  // Lista completa de possíveis nomes de campos (incluindo português e variações)
  const camposPossiveis = [
    'updatedAt', 'DataAtualizacao', 'DataModificacao', 'DataUltimaAtualizacao',
    'lastModified', 'updated_at', 'data_atualizacao', 'dataAtualizacao',
    'UltimaAtualizacao', 'LastUpdate', 'ModifiedDate', 'UpdatedDate',
    'Data de Atualização', 'Data_de_Atualizacao', 'DataDeAtualizacao',
    'dataModificacao', 'data_modificacao', 'ultimaAtualizacao',
    'dataUltimaModificacao', 'DataUltimaModificacao', 'data_ultima_modificacao',
    'createdAt', 'created_at', 'DataCriacao', 'data_criacao', 'dataCriacao',
    'DataCadastro', 'data_cadastro', 'dataCadastro', 'DataInclusao',
    'ModifiedOn', 'UpdatedOn', 'CreatedOn', 'timestamp', 'Timestamp',
    'date', 'Date', 'datetime', 'DateTime', 'data', 'Data'
  ];

  // Primeiro: verificar campos conhecidos
  for (const campo of camposPossiveis) {
    if (imovel[campo]) {
      const testDate = new Date(imovel[campo]);
      if (!isNaN(testDate.getTime())) {
        console.log(`[DETECTOU DATA] Imóvel ${imovel.Codigo}: Campo "${campo}" = ${imovel[campo]}`);
        return imovel[campo];
      }
    }
  }

  // Segundo: buscar por qualquer campo que contenha uma data válida
  for (const [key, value] of Object.entries(imovel)) {
    if (value && typeof value === 'string') {
      // Verificar se o valor parece ser uma data
      if (value.match(/^\d{4}-\d{2}-\d{2}/) || 
          value.match(/^\d{2}\/\d{2}\/\d{4}/) || 
          value.match(/^\d{4}\/\d{2}\/\d{2}/)) {
        const testDate = new Date(value);
        if (!isNaN(testDate.getTime())) {
          console.log(`[DETECTOU DATA PATTERN] Imóvel ${imovel.Codigo}: Campo "${key}" = ${value}`);
          return value;
        }
      }
    }
  }

  console.log(`[SEM DATA] Imóvel ${imovel.Codigo}: Nenhuma data detectada`);
  return null;
};

// Função para obter badge usando detecção inteligente de data
const getStatusBadge = (imovel) => {
  const dataAtualizacao = detectarCampoComData(imovel);
  const diasDesdeAtualizacao = calcularDiasDesdeAtualizacao(dataAtualizacao);
  
  if (diasDesdeAtualizacao === null) {
    // Debug detalhado para imóveis sem data
    console.log(`[DEBUG SEM DATA] Imóvel ${imovel.Codigo}:`);
    console.log('- Todos os campos:', Object.keys(imovel));
    console.log('- Campos com string:', Object.entries(imovel).filter(([k,v]) => typeof v === 'string').map(([k,v]) => `${k}: ${v}`));
    
    return {
      color: 'bg-gray-400',
      text: '?',
      title: 'Data de atualização não disponível'
    };
  }
  
  // Sistema de cores com nova cor preta
  if (diasDesdeAtualizacao >= 120) {
    return {
      color: 'bg-black',
      text: '120+',
      title: `Atualizado há ${diasDesdeAtualizacao} dias (mais de 120 dias)`
    };
  } else if (diasDesdeAtualizacao >= 90) {
    return {
      color: 'bg-purple-500',
      text: '90+',
      title: `Atualizado há ${diasDesdeAtualizacao} dias (mais de 90 dias)`
    };
  } else if (diasDesdeAtualizacao >= 70) {
    return {
      color: 'bg-red-500',
      text: '70+',
      title: `Atualizado há ${diasDesdeAtualizacao} dias (mais de 70 dias)`
    };
  } else if (diasDesdeAtualizacao >= 50) {
    return {
      color: 'bg-yellow-500',
      text: '50+',
      title: `Atualizado há ${diasDesdeAtualizacao} dias (mais de 50 dias)`
    };
  } else {
    return {
      color: 'bg-green-500',
      text: 'OK',
      title: `Atualizado há ${diasDesdeAtualizacao} dias (recente)`
    };
  }
};

// Função para obter texto do status usando detecção inteligente
const getStatusAtualizacao = (imovel) => {
  const dataAtualizacao = detectarCampoComData(imovel);
  const diasDesdeAtualizacao = calcularDiasDesdeAtualizacao(dataAtualizacao);
  
  if (diasDesdeAtualizacao === null) return 'Data não disponível';
  
  if (diasDesdeAtualizacao === 0) return 'Atualizado hoje';
  if (diasDesdeAtualizacao === 1) return 'Atualizado ontem';
  if (diasDesdeAtualizacao <= 7) return `${diasDesdeAtualizacao} dias atrás`;
  if (diasDesdeAtualizacao <= 30) return `${diasDesdeAtualizacao} dias atrás`;
  if (diasDesdeAtualizacao <= 60) return `${Math.floor(diasDesdeAtualizacao / 7)} semanas atrás`;
  return `${Math.floor(diasDesdeAtualizacao / 30)} meses atrás`;
};

// Função para ordenar usando detecção inteligente de data
const sortByRelevance = (imoveis, searchTerm) => {
  if (!Array.isArray(imoveis)) return imoveis;
  
  return [...imoveis].sort((a, b) => {
    // Se há termo de busca, priorizar relevância
    if (searchTerm) {
      const scoreA = calculateRelevance(a, searchTerm);
      const scoreB = calculateRelevance(b, searchTerm);
      
      // Ordenação decrescente por relevância
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
    }
    
    // Ordenação por data de atualização
    const dataA = detectarCampoComData(a);
    const dataB = detectarCampoComData(b);
    
    if (dataA && dataB) {
      const dateA = new Date(dataA);
      const dateB = new Date(dataB);
      
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        // Mais recente primeiro (dateB - dateA = decrescente)
        return dateB - dateA;
      }
    }
    
    // Se apenas um tem data, priorizar o que tem data
    if (dataA && !dataB) return -1;
    if (!dataA && dataB) return 1;
    
    // Fallback: ordenar por código
    const codigoA = parseInt(a.Codigo) || 0;
    const codigoB = parseInt(b.Codigo) || 0;
    return codigoA - codigoB;
  });
};

export default function AdminImoveis() {
  const router = useRouter();
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codigoImovel, setCodigoImovel] = useState(null);
  const [isFilteringManually, setIsFilteringManually] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 30,
  });

  // CACHE FUNCTIONS - Sistema aprimorado de cache
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  // Função para salvar estado completo
  const saveCompleteState = () => {
    const completeState = {
      searchTerm,
      currentPage,
      filters,
      imoveis,
      pagination,
      timestamp: new Date().getTime(),
      url: typeof window !== 'undefined' ? window.location.pathname : null
    };

    try {
      localStorage.setItem("admin_completeState", JSON.stringify(completeState));
      console.log("✅ Estado completo salvo no cache:", {
        searchTerm,
        currentPage,
        hasFilters: Object.keys(filters).length > 0,
        imoveisCount: imoveis.length,
        totalItems: pagination.totalItems
      });
    } catch (error) {
      console.error("❌ Erro ao salvar estado completo:", error);
    }
  };

  // Função para restaurar estado completo
  const restoreCompleteState = () => {
    try {
      const savedState = localStorage.getItem("admin_completeState");
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Verificar se o cache não é muito antigo
        const isRecent = (new Date().getTime() - parsedState.timestamp) < CACHE_DURATION;
        
        if (isRecent && parsedState.imoveis && parsedState.pagination) {
          console.log("🔄 Restaurando estado completo do cache...");
          
          // Restaurar todos os estados
          setSearchTerm(parsedState.searchTerm || "");
          setCurrentPage(parsedState.currentPage || 1);
          setFilters(parsedState.filters || {});
          setImoveis(parsedState.imoveis || []);
          setPagination(parsedState.pagination || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 30,
          });
          
          console.log("✅ Estado completo restaurado:", {
            searchTerm: parsedState.searchTerm,
            currentPage: parsedState.currentPage,
            hasFilters: Object.keys(parsedState.filters || {}).length > 0,
            imoveisCount: parsedState.imoveis?.length || 0,
            totalItems: parsedState.pagination?.totalItems || 0
          });
          
          setIsLoading(false);
          return true; // Estado restaurado com sucesso
        } else {
          console.log("⚠️ Cache expirado ou inválido, limpando...");
          clearCompleteState();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao restaurar estado completo:", error);
      clearCompleteState();
    }
    
    return false; // Estado não foi restaurado
  };

  // Função para limpar estado completo
  const clearCompleteState = () => {
    try {
      localStorage.removeItem("admin_completeState");
      localStorage.removeItem("admin_searchTerm");
      localStorage.removeItem("admin_searchResults");
      localStorage.removeItem("admin_searchPagination");
      localStorage.removeItem("admin_appliedFilters");
      localStorage.removeItem("admin_filterResults");
      localStorage.removeItem("admin_filterPagination");
      console.log("🧹 Cache completo limpo");
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);
    }
  };

  // Função para salvar busca livre
  const saveSearchState = (term, results, paginationData) => {
    localStorage.setItem("admin_searchTerm", term);
    localStorage.setItem("admin_searchResults", JSON.stringify(results));
    localStorage.setItem("admin_searchPagination", JSON.stringify(paginationData));
  };

  // Função para limpar busca livre
  const clearSearchState = () => {
    localStorage.removeItem("admin_searchTerm");
    localStorage.removeItem("admin_searchResults");
    localStorage.removeItem("admin_searchPagination");
  };

  // Funções de cache para filtros
  const saveFiltersState = (appliedFilters, results, paginationData) => {
    localStorage.setItem("admin_appliedFilters", JSON.stringify(appliedFilters));
    localStorage.setItem("admin_filterResults", JSON.stringify(results));
    localStorage.setItem("admin_filterPagination", JSON.stringify(paginationData));
  };

  const clearFiltersState = () => {
    localStorage.removeItem("admin_appliedFilters");
    localStorage.removeItem("admin_filterResults");
    localStorage.removeItem("admin_filterPagination");
  };

  const getFiltersState = () => {
    const savedFilters = localStorage.getItem("admin_appliedFilters");
    const savedResults = localStorage.getItem("admin_filterResults");
    const savedPagination = localStorage.getItem("admin_filterPagination");
    
    if (savedFilters && savedResults && savedPagination) {
      return {
        filters: JSON.parse(savedFilters),
        results: JSON.parse(savedResults),
        pagination: JSON.parse(savedPagination)
      };
    }
    return null;
  };

  // LOAD IMOVEIS - Função principal para carregar dados
  const loadImoveis = async (page = 1, search = "", customFilters = null) => {
    console.log("🔍 loadImoveis chamado. Página:", page, "Busca:", search, "Filtros:", customFilters);
    setIsLoading(true);
    try {
      let responseData;
      let newPaginationData;

      if (search) {
        const response = await fetch(`/api/search/admin?q=${encodeURIComponent(search)}&page=${page}&limit=30`);
        const data = await response.json();

        if (data && data.status === 200 && data.data) {
          responseData = data.data;
          newPaginationData = data.pagination;
          console.log("📥 Dados da API de busca livre recebidos:", data);
          
          // Aplicar ordenação por relevância apenas na primeira página
          if (page === 1 && responseData.length > 1) {
            responseData = sortByRelevance(responseData, search);
            console.log("✨ Resultados ordenados por relevância para:", search);
          }
          
        } else {
          responseData = [];
          newPaginationData = {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 30,
          };
        }

        // Salvar o estado da busca livre
        saveSearchState(search, responseData, newPaginationData);
        clearFiltersState();

      } else {
        const filtersToUse = customFilters || filters;
        const apiFilters = { ...filtersToUse };

        // Conversão de valores para strings se necessário
        if (apiFilters.ValorMin) {
          apiFilters.ValorMin = apiFilters.ValorMin.toString();
        }
        if (apiFilters.ValorMax) {
          apiFilters.ValorMax = apiFilters.ValorMax.toString();
        }

        console.log('🚨 [DEBUG FINAL] Filtros que serão enviados para getImoveisDashboard:', apiFilters);

        const response = await getImoveisDashboard(apiFilters, page, 30);
        
        console.log('📥 [DEBUG] Resposta da API getImoveisDashboard:', response);
        
        if (response && response.data) {
          responseData = response.data;
          
          // Garantir que a paginação tenha todos os campos necessários
          const paginacaoAPI = response.paginacao || {};
          newPaginationData = {
            totalItems: paginacaoAPI.totalItems || paginacaoAPI.total || responseData.length || 0,
            totalPages: paginacaoAPI.totalPages || Math.ceil((paginacaoAPI.totalItems || paginacaoAPI.total || responseData.length || 0) / 30),
            currentPage: page,
            itemsPerPage: 30,
          };
        } else {
          responseData = [];
          newPaginationData = {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 30,
          };
        }

        // Aplicar ordenação por data para filtros
        if (responseData.length > 1) {
          responseData = sortByRelevance(responseData, "");
          console.log("📅 Resultados dos filtros ordenados por data de atualização");
        }

        // Salvar cache de filtros
        if (Object.keys(apiFilters).length > 0) {
          saveFiltersState(filtersToUse, responseData, newPaginationData);
        }

        clearSearchState();
      }

      setImoveis(responseData);
      setPagination(newPaginationData);
      
      // Debug para identificar campos de data
      if (responseData.length > 0) {
        const exemploImovel = responseData[0];
        console.log("🔍 [DEBUG DATA] Exemplo de imóvel:", exemploImovel.Codigo, Object.keys(exemploImovel));
      }
      
      // Salvar estado completo após carregar
      setTimeout(() => {
        saveCompleteState();
      }, 100);
      
      console.log("✅ Estado atualizado. Imóveis:", responseData.length, "Total:", newPaginationData.totalItems);

    } catch (error) {
      console.error("❌ Erro ao carregar imóveis:", error);
      setImoveis([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 30,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // EFFECTS - Gerenciamento de carregamento e estado
  
  // Initial load useEffect com cache completo
  useEffect(() => {
    console.log("🚀 Componente AdminImoveis montado, verificando cache...");
    
    // Tentar restaurar estado completo primeiro
    const stateRestored = restoreCompleteState();
    
    if (!stateRestored) {
      // Se não conseguiu restaurar estado completo, tentar métodos antigos
      const savedTerm = localStorage.getItem("admin_searchTerm");
      const savedResults = localStorage.getItem("admin_searchResults");
      const savedPagination = localStorage.getItem("admin_searchPagination");
      
      const savedFiltersState = getFiltersState();
      
      let initialPage = 1;
      let initialSearchTerm = "";
      let initialImoveis = [];
      let initialPagination = { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 30 };

      // Prioridade 1: Busca livre
      if (savedTerm && savedResults && savedPagination) {
        initialSearchTerm = savedTerm;
        initialImoveis = JSON.parse(savedResults);
        initialPagination = JSON.parse(savedPagination);
        initialPage = initialPagination.currentPage || 1;

        setSearchTerm(initialSearchTerm);
        setImoveis(initialImoveis);
        setPagination(initialPagination);
        setIsLoading(true);
      }
      // Prioridade 2: Filtros
      else if (savedFiltersState) {
        const initialFilters = savedFiltersState.filters;
        initialImoveis = savedFiltersState.results;
        initialPagination = savedFiltersState.pagination;
        initialPage = initialPagination.currentPage || 1;

        setFilters(initialFilters);
        setImoveis(initialImoveis);
        setPagination(initialPagination);
        setIsLoading(true);
      }
      
      // Carregar dados frescos
      loadImoveis(initialPage, initialSearchTerm);
    }

    // Event listener para salvar estado antes de sair da página
    const handleBeforeUnload = () => {
      saveCompleteState();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveCompleteState();
      }
    };

    // Adicionar listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      saveCompleteState(); // Salvar ao desmontar componente
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect para mudanças de página ou filtros
  useEffect(() => {
    if (isFilteringManually) {
      setIsFilteringManually(false);
      return;
    }
    
    // Não recarregar se acabou de restaurar do cache
    const savedState = localStorage.getItem("admin_completeState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      const isRecent = (new Date().getTime() - parsedState.timestamp) < 5000; // 5 segundos
      
      if (isRecent) {
        console.log("⏭️ Pulando reload - estado recém restaurado");
        return;
      }
    }
    
    loadImoveis(currentPage, searchTerm, filters);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, searchTerm]);

  // HANDLERS - Funções de manipulação de eventos
  
  // Função para lidar com a mudança de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para lidar com a busca
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadImoveis(1, searchTerm);
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setFilters({});
    clearCompleteState();
    loadImoveis(1, "");
  };

  // Handler para os filtros
  const handleFilterApply = (newFilters) => {
    const processedFilters = { ...newFilters };

    Object.keys(processedFilters).forEach((key) => {
      if (Array.isArray(processedFilters[key]) && processedFilters[key].length === 0) {
        delete processedFilters[key];
      } else if (processedFilters[key] === "") {
        delete processedFilters[key];
      } else if (processedFilters[key] === null || processedFilters[key] === undefined) {
        delete processedFilters[key];
      }
    });

    setIsFilteringManually(true);
    setFilters(processedFilters);
    setCurrentPage(1);

    setSearchTerm("");
    clearSearchState();

    loadImoveis(1, "", processedFilters);
  };

  // UTILITY FUNCTIONS - Funções utilitárias
  
  // Função para navegar para a página de edição
  const handleEdit = async (imovelCodigo) => {
    // Salvar estado antes de navegar
    saveCompleteState();
    
    setIsLoading(true);
    try {
      const response = await getImovelById(imovelCodigo);

      if (response && response.data) {
        const setImovelSelecionado = useImovelStore.getState().setImovelSelecionado;
        const imovelWithAutomacao = {
          ...response.data,
          Automacao: false,
        };
        setImovelSelecionado(imovelWithAutomacao);
        router.push("/admin/imoveis/gerenciar");
      } else {
        console.error("Erro ao buscar imóvel:", response?.error || "Imóvel não encontrado");
        alert("Erro ao buscar dados do imóvel. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao editar imóvel:", error);
      alert("Ocorreu um erro ao buscar os dados do imóvel.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar se imóvel está ativo
  const verificarImovelAtivo = (imovel) => {
    const valor = imovel.ValorAntigo;
    let temValor = false;
    
    if (valor !== null && valor !== undefined && valor !== "") {
      if (typeof valor === "number") {
        temValor = valor > 0;
      } else if (typeof valor === "string") {
        const cleanedValue = valor.replace(/\./g, '').replace(',', '.');
        const valorNumerico = parseFloat(cleanedValue);
        temValor = !isNaN(valorNumerico) && valorNumerico > 0;
      }
    }
    
    const ativoExplicito = imovel.Ativo?.toString().toLowerCase();
    const estaAtivo = temValor && ativoExplicito !== "não" && ativoExplicito !== "nao";
    
    return {
      ativo: estaAtivo,
      texto: estaAtivo ? "Sim" : "Não"
    };
  };

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "-";
    }

    let valorNumerico;
    if (typeof valor === "number") {
      valorNumerico = valor;
    } else if (typeof valor === "string") {
      const cleanedValue = valor.replace(/\./g, '').replace(',', '.');
      valorNumerico = parseFloat(cleanedValue);
    } else {
      return "-";
    }

    if (isNaN(valorNumerico)) {
      return "-";
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valorNumerico);
  };

  // Função para formatar área privativa
  const formatarArea = (area) => {
    if (area === null || area === undefined || area === "") {
      return "-";
    }

    let areaNumerico;
    if (typeof area === "number") {
      areaNumerico = area;
    } else if (typeof area === "string") {
      const cleanedValue = area.replace(/[^\d.,]/g, '').replace(',', '.');
      areaNumerico = parseFloat(cleanedValue);
    } else {
      return "-";
    }

    if (isNaN(areaNumerico)) {
      return "-";
    }

    return `${Math.round(areaNumerico)} m²`;
  };

  const handleDelete = async (codigo) => {
    setCodigoImovel(codigo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    loadImoveis(currentPage, searchTerm, filters);
  };

  const handleCadastrarNovoImovel = () => {
    saveCompleteState(); // Salvar estado antes de navegar
    const limparImovelSelecionado = useImovelStore.getState().limparImovelSelecionado;
    limparImovelSelecionado();
    router.push("/admin/imoveis/gerenciar");
  };

  // Função para gerar números das páginas a serem exibidas
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <AuthCheck>
      {/* CSS para ocultar player de música no admin */}
      <style jsx global>{`
        [class*="music"], [class*="play"], [class*="audio"], [class*="player"],
        [class*="sound"], [class*="media"], [class*="track"],
        button[style*="position: fixed"], 
        div[style*="position: fixed"][style*="bottom"], 
        div[style*="position: fixed"][style*="right"],
        .fixed.bottom-0, .fixed.bottom-1, .fixed.bottom-2, .fixed.bottom-3,
        .fixed.bottom-4, .fixed.bottom-5, .fixed.bottom-6, .fixed.bottom-8,
        .fixed.right-0, .fixed.right-1, .fixed.right-2, .fixed.right-3,
        .fixed.right-4, .fixed.right-5, .fixed.right-6, .fixed.right-8,
        button.fixed, div.fixed.right-4, div.fixed.bottom-4,
        [style*="z-index: 40"], [style*="z-index: 50"], [style*="z-index: 100"],
        [style*="z-index: 999"], [style*="z-index: 9999"],
        button[style*="border-radius"][style*="position: fixed"],
        div[style*="border-radius"][style*="position: fixed"],
        button[style*="border-radius: 50%"], div[style*="border-radius: 50%"],
        button[style*="rounded"], div[style*="rounded"],
        [style*="box-shadow"][style*="position: fixed"],
        [style*="shadow"][style*="position: fixed"],
        div[style*="shadow-lg"], button[style*="shadow-lg"],
        div[style*="shadow-xl"], button[style*="shadow-xl"],
        *[style*="position: fixed"][style*="right: 16px"],
        *[style*="position: fixed"][style*="right: 20px"],
        *[style*="position: fixed"][style*="right: 24px"],
        *[style*="position: fixed"][style*="bottom: 16px"],
        *[style*="position: fixed"][style*="bottom: 20px"],
        *[style*="position: fixed"][style*="bottom: 24px"],
        *[style*="position: fixed"][style*="z-index"],
        #music-player, #audio-player, #media-player,
        .music-player, .audio-player, .media-player,
        .floating-player, .sticky-player {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        audio, video[style*="display: none"] + *, 
        [data-testid*="player"], [data-testid*="music"], [data-testid*="audio"] {
          display: none !important;
        }
      `}</style>
      
      {isModalOpen && (
        <ModalDelete
          id={codigoImovel}
          title="Deletar Imóvel"
          description={`O imóvel com Código: ${codigoImovel} será deletado. Tem certeza que deseja continuar?`}
          buttonText="Deletar"
          link="/admin/imoveis"
          onClose={handleCloseModal}
          type="imovel"
        />
      )}
      
      <div className="">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Imóveis</h1>
            <button
              onClick={handleCadastrarNovoImovel}
              className="inline-flex items-center px-5 py-2 border border-transparent text-xs font-bold rounded-md shadow-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Cadastrar Novo Imóvel
            </button>
          </div>

          {/* Barra de pesquisa */}
          <div className="bg-white p-4 rounded-lg mb-6">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex w-full items-center justify-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por código, endereço, cidade ou condomínio..."
                  className="w-full text-xs rounded-md border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="submit"
                  className="min-w-[200px] px-5 py-2 border border-transparent text-[10px] font-bold rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Busca Livre
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="min-w-[200px] px-5 py-2 border border-transparent text-[10px] font-bold rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <FiltersImoveisAdmin onFilter={handleFilterApply} />
          </div>

          {/* Indicador de resultados filtrados */}
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-900">
                      {pagination.totalItems || imoveis.length} {(pagination.totalItems || imoveis.length) === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                    </span>
                  </div>
                  
                  {/* Badges de filtros ativos */}
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Busca: "{searchTerm}"
                      </span>
                    )}
                    {filters.Categoria && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {Array.isArray(filters.Categoria) ? `${filters.Categoria.length} categorias` : filters.Categoria}
                      </span>
                    )}
                    {filters.Status && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {Array.isArray(filters.Status) ? `${filters.Status.length} status` : filters.Status}
                      </span>
                    )}
                    {Array.isArray(filters.Situacao) && filters.Situacao.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {filters.Situacao.length === 1 ? filters.Situacao[0] : `${filters.Situacao.length} situações`}
                      </span>
                    )}
                    {Array.isArray(filters.Construtora) && filters.Construtora.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {filters.Construtora.length === 1 ? filters.Construtora[0] : `${filters.Construtora.length} construtoras`}
                      </span>
                    )}
                    {filters.Cidade && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {filters.Cidade}
                      </span>
                    )}
                    {filters.bairros && Array.isArray(filters.bairros) && filters.bairros.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {filters.bairros.length} {filters.bairros.length === 1 ? 'bairro' : 'bairros'}
                      </span>
                    )}
                    {(filters.ValorMin || filters.ValorMax) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Valor: {filters.ValorMin ? `R$ ${filters.ValorMin.toLocaleString()}` : '0'} - {filters.ValorMax ? `R$ ${filters.ValorMax.toLocaleString()}` : '∞'}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (searchTerm) {
                      clearSearch();
                    } else {
                      setFilters({});
                      setCurrentPage(1);
                      clearCompleteState();
                      loadImoveis(1, "");
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Limpar {searchTerm ? 'busca' : 'filtros'}
                </button>
              </div>
            </div>
          )}

          {/* Legenda de status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-700">Status de Atualização (badge ao lado do código):</span>
              </div>
              
              <div className="flex items-center space-x-3 text-[10px]">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">OK</span>
                  </div>
                  <span className="text-gray-600">Recente</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-4 bg-yellow-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">50+</span>
                  </div>
                  <span className="text-gray-600">50+ dias</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">70+</span>
                  </div>
                  <span className="text-gray-600">70+ dias</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-4 bg-purple-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">90+</span>
                  </div>
                  <span className="text-gray-600">90+ dias</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-4 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">120+</span>
                  </div>
                  <span className="text-gray-600">120+ dias</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">?</span>
                  </div>
                  <span className="text-gray-600">Sem data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de imóveis */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="w-20 px-3 py-2.5 text-left text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Código
                      </th>
                      <th scope="col" className="w-14 px-2 py-2.5 text-left text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Ativo
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Empreendimento
                      </th>
                      <th scope="col" className="w-28 px-2 py-2.5 text-left text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Categoria
                      </th>
                      <th scope="col" className="w-20 px-2 py-2.5 text-left text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Área
                      </th>
                      <th scope="col" className="w-32 px-2 py-2.5 text-left text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Valor
                      </th>
                      <th scope="col" className="w-24 px-2 py-2.5 text-center text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {isLoading ? (
                      Array(10)
                        .fill(null)
                        .map((_, index) => (
                          <tr key={`loading-${index}`}>
                            <td colSpan={7} className="px-3 py-3 whitespace-nowrap">
                              <div className="animate-pulse flex space-x-2">
                                <div className="h-3 bg-gray-200 rounded flex-1"></div>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : imoveis.length > 0 ? (
                      imoveis.map((imovel) => {
                        const statusBadge = getStatusBadge(imovel);
                        
                        return (
                          <tr key={imovel.Codigo || imovel._id} className="hover:bg-gray-50">
                            <td className="w-20 px-3 py-3 text-[10px] font-bold text-gray-900 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span>{imovel.Codigo || "-"}</span>
                                <div 
                                  className={`w-6 h-4 ${statusBadge.color} rounded-sm flex items-center justify-center`}
                                  title={statusBadge.title}
                                >
                                  <span className="text-white text-[8px] font-bold">
                                    {statusBadge.text}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="w-14 px-2 py-3 text-[9px] text-gray-500 whitespace-nowrap">
                              {(() => {
                                const statusImovel = verificarImovelAtivo(imovel);
                                return (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-[9px] font-medium ${
                                      statusImovel.ativo
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {statusImovel.texto}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-3 py-3 text-[10px] font-medium text-gray-900">
                              <div className="truncate">
                                {imovel.Empreendimento || "-"}
                              </div>
                            </td>
                            <td className="w-28 px-2 py-3 text-[10px] text-gray-600 whitespace-nowrap">
                              <div className="truncate">
                                {imovel.Categoria || "-"}
                              </div>
                            </td>
                            <td className="w-20 px-2 py-3 text-[10px] text-gray-600 whitespace-nowrap">
                              {formatarArea(imovel.AreaPrivativa)}
                            </td>
                            <td className="w-32 px-2 py-3 text-[10px] text-gray-600 whitespace-nowrap">
                              <div className="truncate">
                                {formatarValor(imovel.ValorAntigo)}
                              </div>
                            </td>
                            <td className="w-24 px-2 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <a
                                  href={`/imovel-${imovel.Codigo}/${imovel.Slug || 'detalhes'}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-100"
                                  title="Ver no site"
                                >
                                  <EyeIcon className="h-3.5 w-3.5" />
                                </a>
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-gray-100"
                                  title="Editar"
                                  onClick={() => handleEdit(imovel.Codigo)}
                                >
                                  <PencilSquareIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-gray-100"
                                  title="Deletar"
                                  onClick={() => handleDelete(imovel.Codigo)}
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-xs text-gray-500">
                          Nenhum imóvel encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                    pagination.currentPage === 1
                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                    pagination.currentPage === pagination.totalPages
                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Próximo
                </button>
              </div>
              
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                    </span>{' '}
                    até{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.totalItems}</span> resultados
                  </p>
                </div>
                
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.currentPage === 1 ? 'cursor-not-allowed' : 'hover:text-gray-600'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {getPageNumbers().map((pageNumber, index) => (
                      pageNumber === '...' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
                              : 'text-gray-900'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.currentPage === pagination.totalPages ? 'cursor-not-allowed' : 'hover:text-gray-600'
                      }`}
                    >
                      <span className="sr-only">Próximo</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
