export default function ResultsInfo({ pagination, isLoading, itemsCount }) {
  if (isLoading) return null;

  // Função para garantir que um valor seja um número válido
  const ensureNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Garantir que temos valores válidos
  const totalItems = ensureNumber(pagination?.totalItems, 0);
  const currentPage = ensureNumber(pagination?.currentPage, 1);
  const itemsPerPage = ensureNumber(pagination?.itemsPerPage || pagination?.limit, 12);
  const totalPages = ensureNumber(pagination?.totalPages, 1);

  // Calcula o intervalo de itens sendo exibidos
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="text-sm text-gray-500 mt-4 flex justify-between items-center">
      <div>
        {totalItems > 0 ? (
          <>
            Mostrando{" "}
            <span className="font-semibold">
              {start}-{end}
            </span>{" "}
            de <span className="font-semibold">{totalItems}</span> imóveis
          </>
        ) : (
          "Nenhum imóvel encontrado"
        )}
      </div>

      {totalPages > 0 && (
        <div>
          Página <span className="font-semibold">{currentPage}</span> de{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
      )}
    </div>
  );
}
