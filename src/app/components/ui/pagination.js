import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Pagination({ pagination, onPageChange }) {
  // Se não houver dados de paginação ou apenas uma página, não renderiza o componente
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  // Extrair valores da paginação com valores padrão seguros
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;
  const itemsPerPage = pagination?.itemsPerPage || pagination?.limit || 12;

  // Calcula o intervalo de itens sendo exibidos (igual ao ResultsInfo)
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  // Função para gerar os números de página a serem exibidos
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Número máximo de páginas a serem exibidas

    if (totalPages <= maxPagesToShow) {
      // Se o total de páginas for menor ou igual ao máximo, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Caso contrário, mostra um subconjunto com a página atual no centro
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Adiciona "..." se necessário
      if (startPage > 1) {
        pageNumbers.unshift("ellipsis-start");
        pageNumbers.unshift(1);
      }

      if (endPage < totalPages) {
        pageNumbers.push("ellipsis-end");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  // Função para garantir que os valores sejam strings válidas
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0";
    }
    return String(num);
  };

  return (
    <nav className="flex flex-col items-center mt-10 mb-6 border-t border-gray-200 pt-4">
      {/* Informação sobre os resultados */}
      <div className="text-sm text-gray-700 mb-3">
        Mostrando <span className="font-medium">{formatNumber(start)}</span> a{" "}
        <span className="font-medium">{formatNumber(end)}</span> de{" "}
        <span className="font-medium">{formatNumber(totalItems)}</span> resultados
      </div>

      <ul className="flex items-center -space-x-px">
        {/* Botão Anterior */}
        <li>
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`block px-3 py-2 ml-0 leading-tight border rounded-l-lg ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-gray-300"
            }`}
            aria-label="Página anterior"
          >
            <span className="sr-only">Anterior</span>
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        </li>

        {/* Números de página */}
        {pageNumbers.map((page, index) => {
          // Criar uma chave única para cada item
          const pageKey = typeof page === "number" ? `page-${page}` : page;

          return (
            <li key={pageKey}>
              <button
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={
                  page === "ellipsis-start" || page === "ellipsis-end" || page === currentPage
                }
                className={`px-4 py-2 leading-tight border ${
                  page === currentPage
                    ? "bg-black text-white border-black z-10"
                    : page === "ellipsis-start" || page === "ellipsis-end"
                    ? "bg-white text-gray-500 cursor-default border-gray-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-gray-300"
                }`}
              >
                {typeof page === "string" ? "..." : page}
              </button>
            </li>
          );
        })}

        {/* Botão Próximo */}
        <li>
          <button
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`block px-3 py-2 leading-tight border rounded-r-lg ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-gray-300"
            }`}
            aria-label="Próxima página"
          >
            <span className="sr-only">Próximo</span>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
