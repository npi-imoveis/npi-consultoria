"use client";

import { useState, useEffect } from "react";
import AuthCheck from "../components/auth-check";
import Pagination from "@/app/components/ui/pagination";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getImoveisAutomacao, getImovelByIdAutomacao } from "../services";
import useImovelStore from "../store/imovelStore";
import { TrashIcon } from "lucide-react";
import ModalDelete from "../components/modal-delete";

export default function AdminImoveis() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [codigoImovel, setCodigoImovel] = useState(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 20,
  });

  // Acesso ao store de imóveis admin
  const setImovelSelecionado = useImovelStore((state) => state.setImovelSelecionado);

  const loadImoveis = async (page = 1, codigo = "") => {
    setIsLoading(true);
    setError(null);

    try {
      if (codigo) {
        // Se tiver um termo de busca, buscar pelo ID específico
        const response = await getImovelByIdAutomacao(codigo);
        if (response && response.data) {
          setImoveis([response.data]); // Coloca o único imóvel em um array
          setPagination({
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 20,
          });
        } else {
          setImoveis([]);
          if (response.error) {
            setError(response.error);
          } else {
            setError("Imóvel não encontrado");
          }
          setPagination({
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 20,
          });
        }
      } else {
        // Se não tiver termo de busca, buscar todos os imóveis normalmente
        const response = await getImoveisAutomacao({}, page, 20);
        if (response && response.imoveis) {
          setImoveis(response.imoveis);
          setPagination({
            ...response.pagination,
            itemsPerPage: 20,
          });

          if (response.error) {
            setError(response.error);
          }
        } else {
          setImoveis([]);
          setError("Não foi possível carregar os imóveis");
          setPagination({
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 20,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      setImoveis([]);
      setError(error.message || "Erro ao carregar os imóveis. Tente novamente mais tarde.");
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 20,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar imóveis quando a página mudar ou quando realizar busca
  useEffect(() => {
    if (!searchTerm) {
      loadImoveis(currentPage);
    }
  }, [currentPage]);

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
  };

  // Função para recarregar os dados
  const handleReload = () => {
    setError(null);
    loadImoveis(currentPage, searchTerm);
  };

  // Função para navegar para a página de edição
  const handleEdit = (imovelCodigo) => {
    if (!imovelCodigo) {
      console.error("Código do imóvel não encontrado");
      return;
    }

    // Encontrar o imóvel selecionado pelo código
    const imovelSelecionado = imoveis.find((imovel) => imovel.Codigo === imovelCodigo);

    // Salvar o imóvel selecionado no store
    if (imovelSelecionado) {
      // Adicionar flag Automacao: true antes de salvar no store
      const imovelComAutomacao = {
        ...imovelSelecionado,
        Automacao: true,
      };

      setImovelSelecionado(imovelComAutomacao);
      router.push("/admin/imoveis/gerenciar");
    } else {
      console.error("Imóvel não encontrado na lista");
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

  return (
    <AuthCheck>
      {isModalOpen && (
        <ModalDelete
          id={codigoImovel}
          title="Deletar Imóvel"
          description={`O imovél Codigo: ${codigoImovel} será deletado da lista de automação. Tem certeza que deseja continuar?`}
          buttonText="Deletar"
          link="/admin/automacao"
          onClose={handleCloseModal}
          type="automacao"
        />
      )}
      <div className="">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Automação de Imóveis</h1>

          {/* Barra de pesquisa */}
          <div className="bg-white p-4 rounded-lg mb-6">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por ID do imóvel..."
                  className="border-2 px-5 py-2 text-zinc-700 pl-10 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Buscar
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Limpar
                </button>
              )}
              <button
                type="button"
                onClick={handleReload}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                title="Recarregar dados"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <div className="mt-2">
                    <button
                      onClick={handleReload}
                      className="text-sm font-medium text-red-700 hover:text-red-600"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de imóveis */}
          <div className="relative overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] font-bold  uppercase tracking-wider"
                  >
                    ID
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
                        <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse flex space-x-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : imoveis.length > 0 ? (
                  // Dados dos imóveis
                  imoveis.map((imovel) => (
                    <tr key={imovel.Codigo || imovel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] text-gray-900 font-bold">
                        {imovel.Codigo || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700">
                        {imovel.Empreendimento || "Não Informado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700">
                        {imovel.Categoria || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700">
                        {formatarValor(
                          imovel.ValorAntigo || imovel.ValorAluguelSite || imovel.Valor
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                        <div className="flex items-center space-x-3">
                          <button
                            className="text-black font-bold hover:text-gray-700 bg-gray-100 p-2 rounded-md"
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
                    <td colSpan={5} className="px-6 py-4 text-center text-xs text-gray-500">
                      {error ? "Erro ao carregar dados" : "Nenhum imóvel encontrado"}
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
