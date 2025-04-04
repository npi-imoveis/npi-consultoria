"use client";

import { useState, useEffect } from "react";
import { getImoveis } from "@/app/services";
import AuthCheck from "../components/auth-check";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

export default function ImoveisDestacados() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destacados, setDestacados] = useState([]);

  // Carregar todos os imóveis
  useEffect(() => {
    const fetchImoveis = async () => {
      setIsLoading(true);
      try {
        const response = await getImoveis({}, 1, 100); // Buscar uma boa quantidade de imóveis
        if (response && response.imoveis) {
          setImoveis(response.imoveis);

          // Identificar quais são destacados (simulação)
          // Em uma implementação real, você buscaria isso da API
          const destaques = response.imoveis
            .filter((imovel) => imovel.Destaque === "Sim" || Math.random() > 0.7)
            .map((imovel) => imovel.Codigo);

          setDestacados(destaques);
        }
      } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImoveis();
  }, []);

  // Alternar o status de destaque de um imóvel
  const toggleDestaque = (codigo) => {
    setDestacados((prev) => {
      if (prev.includes(codigo)) {
        return prev.filter((id) => id !== codigo);
      } else {
        return [...prev, codigo];
      }
    });

    // Em uma implementação real, você enviaria uma requisição para a API
    console.log(`Alternando destaque do imóvel ${codigo}`);
  };

  // Salvar as alterações
  const salvarDestaques = () => {
    // Em uma implementação real, você enviaria os dados para a API
    alert(`Imóveis destacados salvos: ${destacados.join(", ")}`);
  };

  // Formatar valores monetários
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

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto text-xs">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Imóveis Destacados</h1>
          <p className="text-gray-600 mb-6">
            Selecione os imóveis que deseja destacar na página inicial do site.
          </p>

          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Destaque
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Código
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Título
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Categoria
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {imoveis.map((imovel) => (
                        <tr key={imovel.Codigo} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleDestaque(imovel.Codigo)}
                              className="focus:outline-none"
                              title={
                                destacados.includes(imovel.Codigo)
                                  ? "Remover destaque"
                                  : "Adicionar destaque"
                              }
                            >
                              {destacados.includes(imovel.Codigo) ? (
                                <StarIcon className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <StarOutlineIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {imovel.Codigo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {imovel.TituloSite || imovel.Titulo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {imovel.Categoria || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {formatarValor(
                              imovel.ValorVenda || imovel.ValorAluguelSite || imovel.Valor
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={salvarDestaques}
                  className="inline-flex items-center px-5 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Salvar Destaques
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
