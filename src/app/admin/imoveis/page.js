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

// Função para ordenar resultados por relevância
const sortByRelevance = (imoveis, searchTerm) => {
  if (!searchTerm || !Array.isArray(imoveis)) return imoveis;
  
  return [...imoveis].sort((a, b) => {
    const scoreA = calculateRelevance(a, searchTerm);
    const scoreB = calculateRelevance(b, searchTerm);
    
    // Ordenação decrescente por relevância
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // Em caso de empate, manter ordem por código
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

  // loadImoveis function is already well-defined to handle search and filters
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
          console.log("📊 Paginação da API de busca livre (newPaginationData):", newPaginationData);
          
          // 🔥 MODIFICAÇÃO: Aplicar ordenação por relevância apenas na primeira página
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

        // Salvar o estado da busca livre APÓS a requisição da API
        saveSearchState(search, responseData, newPaginationData);

      } else {
        const filtersToUse = customFilters || filters;
        const apiFilters = { ...filtersToUse };

        if (apiFilters.ValorMin) {
          apiFilters.ValorMin = apiFilters.ValorMin.toString();
        }
        if (apiFilters.ValorMax) {
          apiFilters.ValorMax = apiFilters.ValorMax.toString();
        }

        const response = await getImoveisDashboard(apiFilters, page, 30);
        if (response && response.data) {
          responseData = response.data;
          newPaginationData = {
            ...response.paginacao,
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
        // Limpar o estado da busca livre se não for uma busca livre
        clearSearchState();
      }

      setImoveis(responseData);
      setPagination(newPaginationData);
      console.log("✅ Estado de imóveis e paginação atualizado. Imóveis count:", responseData.length, "Paginação atual:", newPaginationData);

    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      setImoveis([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 30,
      });
    } finally {
      setIsLoading(false);
      console.log("⏳ Carregamento finalizado.");
    }
  };

  // Initial load useEffect - Modificado para restaurar e depois revalidar
  useEffect(() => {
    const savedTerm = localStorage.getItem("admin_searchTerm");
    const savedResults = localStorage.getItem("admin_searchResults");
    const savedPagination = localStorage.getItem("admin_searchPagination");
    
    let initialPage = 1;
    let initialSearchTerm = "";
    let initialImoveis = [];
    let initialPagination = { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 30 };

    if (savedTerm && savedResults && savedPagination) {
      initialSearchTerm = savedTerm;
      initialImoveis = JSON.parse(savedResults);
      initialPagination = JSON.parse(savedPagination);
      initialPage = initialPagination.currentPage || 1;

      // Exibe os dados do cache imediatamente para uma UX mais rápida
      setSearchTerm(initialSearchTerm);
      setImoveis(initialImoveis);
      setPagination(initialPagination);
      setIsLoading(true); // Mantém o loading para a requisição da API
    }
    
    // Sempre chama loadImoveis para buscar dados frescos,
    // seja com o termo salvo ou para carregar todos os imóveis
    loadImoveis(initialPage, initialSearchTerm);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependência vazia para rodar apenas na montagem

  // useEffect for handling page changes or filter changes
  useEffect(() => {
    // This useEffect now handles subsequent changes to currentPage or filters
    // The initial load is handled by the first useEffect
    if (isFilteringManually) { // Se for filtro manual, já foi tratado no handleFilterApply
      setIsFilteringManually(false);
      return;
    }
    // Se houver searchTerm, recarrega a busca livre para a página atual
    // Se não houver searchTerm, carrega com filtros
    loadImoveis(currentPage, searchTerm, filters);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, searchTerm]); // Adicione 'searchTerm' como dependência aqui

  // Função para lidar com a mudança de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para lidar com a busca
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Resetar para a primeira página ao realizar nova busca
    loadImoveis(1, searchTerm); // Trigger search with current term
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setFilters({}); // Limpar filtros também
    clearSearchState(); // Limpar estado salvo
    loadImoveis(1, ""); // Carregar todos os imóveis sem busca ou filtro
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

    loadImoveis(1, "", processedFilters);
  };

  // Função para navegar para a página de edição
  const handleEdit = async (imovelCodigo) => {
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
    // Verificar se tem valor válido
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
    
    // Se tem valor válido e o campo Ativo não é explicitamente "Não", considera ativo
    const ativoExplicito = imovel.Ativo?.toString().toLowerCase();
    const estaAtivo = temValor && ativoExplicito !== "não" && ativoExplicito !== "nao";
    
    return {
      ativo: estaAtivo,
      texto: estaAtivo ? "Sim" : "Não"
    };
  };

  // Função para formatar valores monetários - CORRIGIDA PARA FORMATO BRASILEIRO
  const formatarValor = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "-";
    }

    let valorNumerico;
    if (typeof valor === "number") {
      valorNumerico = valor;
    } else if (typeof valor === "string") {
      // CORREÇÃO CRÍTICA: Para formato brasileiro, remove TODOS os pontos primeiro
      // e depois substitui vírgula por ponto para conversão
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
      // Remove caracteres não numéricos exceto vírgula e ponto
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
    // After closing modal, re-load current page with current search/filters
    loadImoveis(currentPage, searchTerm, filters);
  };

  const handleCadastrarNovoImovel = () => {
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
      // Se há 7 páginas ou menos, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com reticências
      if (currentPage <= 4) {
        // Início: 1, 2, 3, 4, 5, ..., última
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Final: 1, ..., antepenúltima, penúltima, última
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., atual-1, atual, atual+1, ..., última
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
          <div className="bg-white p-4 rounded-lg  mb-6">
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

          {/* Tabela de imóveis */}
          <div className="relative overflow-x-auto shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 bg-gray-50 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  >
                    Código
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  >
                    Ativo
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  >
                    Empreendimento
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  >
                    Área Privativa
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider min-w-[130px]"
                  >
                    Valor (ValorAntigo)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider sticky right-0 bg-gray-50 min-w-[120px]"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Linha de carregamento
                  Array(10)
                    .fill(null)
                    .map((_, index) => (
                      <tr key={`loading-${index}`}>
                        <td colSpan={7} className="w-full px-4 py-4 whitespace-nowrap">
                          <div className="w-full animate-pulse flex space-x-4">
                            <div className="h-4 w-full bg-gray-200 rounded "></div>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : imoveis.length > 0 ? (
                  // Dados dos imóveis
                  imoveis.map((imovel) => (
                    <tr key={imovel.Codigo || imovel._id} className="hover:bg-gray-50">
                      <td className="px-4 bg-gray-50 py-4 whitespace-nowrap text-[10px] text-gray-900 font-bold">
                        {imovel.Codigo || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const statusImovel = verificarImovelAtivo(imovel);
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
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
                      <td className="px-4 font-bold py-4 whitespace-nowrap text-[10px] text-zinc-700">
                        {imovel.Empreendimento || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[10px] text-zinc-700">
                        {imovel.Categoria || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[10px] text-zinc-700">
                        {formatarArea(imovel.AreaPrivativa)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[10px] text-zinc-700 min-w-[130px]">
                        {formatarValor(imovel.ValorAntigo)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[10px] text-zinc-700 sticky right-0 bg-white min-w-[120px]">
                        <div className="flex items-center space-x-1">
                          <a
                            href={`/imovel-${imovel.Codigo}/${imovel.Slug || 'detalhes'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 bg-gray-100 p-1.5 rounded-md"
                            title="Ver no site"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </a>
                          <button
                            className="text-black hover:text-indigo-900 bg-gray-100 p-1.5 rounded-md"
                            title="Editar"
                            onClick={() => handleEdit(imovel.Codigo)}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-500 font-bold hover:text-red-400 bg-gray-100 p-1.5 rounded-md"
                            title="Deletar"
                            onClick={() => handleDelete(imovel.Codigo)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Nenhum resultado encontrado
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                      Nenhum imóvel encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Inline Simples */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                {/* Mobile: Apenas Anterior/Próximo */}
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
                    {/* Botão Anterior */}
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

                    {/* Números das páginas */}
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

                    {/* Botão Próximo */}
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
