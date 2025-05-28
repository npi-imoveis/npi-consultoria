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
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  // Função para salvar busca livre
  const saveSearchState = (term, results) => {
    localStorage.setItem("admin_searchTerm", term);
    localStorage.setItem("admin_searchResults", JSON.stringify(results));
  };

  // Função para limpar busca livre
  const clearSearchState = () => {
    localStorage.removeItem("admin_searchTerm");
    localStorage.removeItem("admin_searchResults");
  };

  // Restaurar busca livre ao montar
  useEffect(() => {
    const savedTerm = localStorage.getItem("admin_searchTerm");
    const savedResults = localStorage.getItem("admin_searchResults");
    if (savedTerm && savedResults) {
      setSearchTerm(savedTerm);
      setImoveis(JSON.parse(savedResults));
      setPagination({
        totalItems: JSON.parse(savedResults).length,
        totalPages: Math.ceil(JSON.parse(savedResults).length / 12),
        currentPage: 1,
        itemsPerPage: 12,
      });
      setIsLoading(false);
      return;
    }
    // Só carrega todos se não houver busca livre salva
    loadImoveis(currentPage);
    // eslint-disable-next-line
  }, []);

  const loadImoveis = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      if (search) {
        // Usar o endpoint de busca com Atlas Search
        const response = await fetch(`/api/search/admin?q=${encodeURIComponent(search)}`);
        const data = await response.json();

        if (data && data.status === 200 && data.data) {
          setImoveis(data.data);
          saveSearchState(search, data.data);
          setPagination({
            totalItems: data.data.length,
            totalPages: Math.ceil(data.data.length / 12),
            currentPage: 1,
            itemsPerPage: 12,
          });
        } else {
          setImoveis([]);
          saveSearchState(search, []);
          setPagination({
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 12,
          });
        }
      } else {
        // Construir os parâmetros de filtro para a API
        const apiFilters = { ...filters };

        // Processar filtros de valor
        if (apiFilters.ValorMin) {
          apiFilters.ValorMin = apiFilters.ValorMin.toString();
        }

        if (apiFilters.ValorMax) {
          apiFilters.ValorMax = apiFilters.ValorMax.toString();
        }

        // Se não tiver termo de busca, buscar todos os imóveis normalmente
        const response = await getImoveisDashboard(apiFilters, page, 12);
        if (response && response.data) {
          setImoveis(response.data);
          setPagination({
            ...response.paginacao,
            itemsPerPage: 12,
          });
        } else {
          setImoveis([]);
          setPagination({
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 12,
          });
        }
      }
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

  // Carregar imóveis quando a página mudar ou filtros mudarem, mas só se não houver busca livre salva
  useEffect(() => {
    const savedTerm = localStorage.getItem("admin_searchTerm");
    if (!savedTerm) {
      loadImoveis(currentPage);
    }
  }, [currentPage, filters]);

  // Função para lidar com a mudança de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para lidar com a busca
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Resetar para a primeira página ao realizar nova busca
    loadImoveis(1, searchTerm);
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    loadImoveis(1, "");
    clearSearchState();
  };

  // Handler para os filtros
  const handleFilterApply = (newFilters) => {
    // Transformar filtros para o formato esperado pela API
    const processedFilters = { ...newFilters };

    // Limpar filtros vazios
    Object.keys(processedFilters).forEach((key) => {
      // Remover arrays vazios
      if (Array.isArray(processedFilters[key]) && processedFilters[key].length === 0) {
        delete processedFilters[key];
      }
      // Remover strings vazias
      else if (processedFilters[key] === "") {
        delete processedFilters[key];
      }
      // Remover null ou undefined
      else if (processedFilters[key] === null || processedFilters[key] === undefined) {
        delete processedFilters[key];
      }
    });

    setFilters(processedFilters);
    setCurrentPage(1);
    loadImoveis(1);
  };

  // Função para navegar para a página de edição
  const handleEdit = async (imovelCodigo) => {
    setIsLoading(true);
    try {
      // Get the imovel data by ID
      const response = await getImovelById(imovelCodigo);

      if (response && response.data) {
        // Access the store's setImovelSelecionado function
        const setImovelSelecionado = useImovelStore.getState().setImovelSelecionado;

        // Add the Automacao property to the imovel data
        const imovelWithAutomacao = {
          ...response.data,
          Automacao: false,
        };

        // Set the imovel in the store
        setImovelSelecionado(imovelWithAutomacao);

        // Redirect to the gerenciar page instead of the editar page
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

    // Verificar se o valor já é um número ou precisa ser convertido
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
    loadImoveis(currentPage, searchTerm);
  };

  const handleCadastrarNovoImovel = () => {
    // Limpa o imóvel selecionado e define o modo para criação
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
                    Valor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold  uppercase tracking-wider sticky right-0 bg-gray-50"
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
                        {formatarValor(
                          imovel.ValorVenda || imovel.ValorAluguelSite || imovel.Valor
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                        <div className="flex items-center space-x-3">
                          <a
                            href={`/imovel-${imovel.Codigo}/${imovel.Slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:text-gray-700 bg-gray-100 p-2 rounded-md"
                            title="Ver no site"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                          <button
                            className="text-black hover:text-gray-700 bg-gray-100 p-2 rounded-md"
                            title="Editar"
                            onClick={() => handleEdit(imovel.Codigo)}
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-500 font-bold hover:text-red-400 bg-gray-100 p-2 rounded-md"
                            title="Deletar Imóvel"
                            onClick={() => handleDelete(imovel.Codigo)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Nenhum resultado
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-[10px] text-gray-500">
                      Nenhum imóvel encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé da tabela com paginação */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
