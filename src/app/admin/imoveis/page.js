"use client";

import { useState, useEffect } from "react";
import { getImovelById } from "@/app/services";
import AuthCheck from "../components/auth-check";
import Pagination from "@/app/components/ui/pagination";
import { useRouter } from "next/navigation";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import useImovelStore from "../store/imovelStore";
import { getImoveisDashboard } from "../services/imoveis";

import FiltersImoveisAdmin from "./components/filters";
import { TrashIcon } from "lucide-react";
import ModalDelete from "../components/modal-delete";

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
    itemsPerPage: 12,
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
    setIsLoading(true);
    try {
      let responseData;
      let newPaginationData;

      if (search) {
        const response = await fetch(`/api/search/admin?q=${encodeURIComponent(search)}&page=${page}&limit=12`);
        const data = await response.json();

        if (data && data.status === 200 && data.data) {
          responseData = data.data;
          newPaginationData = {
            totalItems: data.data.length,
            totalPages: Math.ceil(data.data.length / 12),
            currentPage: page,
            itemsPerPage: 12,
          };
        } else {
          responseData = [];
          newPaginationData = {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 12,
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

        const response = await getImoveisDashboard(apiFilters, page, 12);
        if (response && response.data) {
          responseData = response.data;
          newPaginationData = {
            ...response.paginacao,
            itemsPerPage: 12,
          };
        } else {
          responseData = [];
          newPaginationData = {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 12,
          };
        }
        // Limpar o estado da busca livre se não for uma busca livre
        clearSearchState();
      }

      setImoveis(responseData);
      setPagination(newPaginationData);

    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      setImoveis([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 12,
      });
    } finally {
      setIsLoading(false);
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
    let initialPagination = { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 12 };

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

  // Função para formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor) return "-";
    const valorNumerico =
      typeof valor === "number"
        ? valor
        : parseFloat(valor.replace(/[^\d.,]/g, "").replace(",", "."));
    if (isNaN(valorNumerico)) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valorNumerico);
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
          <div className="relative overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 bg-gray-50 py-3 text-left text-[10px] font-bold  uppercase tracking-wider"
                  >
                    Código
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold  uppercase tracking-wider"
                  >
                    Ativo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold  uppercase tracking-wider"
                  >
                    Empreendimento
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold  uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold  uppercase tracking-wider"
                  >
                    Valor (ValorAntigo)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-[10px] font-bold  uppercase tracking-wider sticky right-0 bg-gray-50"
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
                        <td colSpan={5} className="w-full px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 bg-gray-50 py-4 whitespace-nowrap text-[10px] text-gray-900 font-bold">
                        {imovel.Codigo || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            imovel.Ativo === "Sim"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {imovel.Ativo || "-"}
                        </span>
                      </td>
                      <td className="px-6 font-bold py-4 whitespace-nowrap text-[10px] text-zinc-700">
                        {imovel.Empreendimento || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] text-zinc-700">
                        {imovel.Categoria || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] text-zinc-700">
                        {formatarValor(imovel.Valor)} ({formatarValor(imovel.ValorAntigo)})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] text-zinc-700 sticky right-0 bg-white">
                        <div className="flex items-center space-x-3">
                          <button
                            className="text-black hover:text-indigo-900 bg-gray-100 p-2 rounded-md"
                            title="Editar"
                            onClick={() => handleEdit(imovel.Codigo)}
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-500 font-bold hover:text-red-400 bg-gray-100 p-2 rounded-md"
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
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nenhum imóvel encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
