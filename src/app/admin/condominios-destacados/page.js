"use client";

import { useState, useEffect } from "react";
import { getCondominios } from "@/app/services";
import AuthCheck from "../components/auth-check";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

export default function CondominiosDestacados() {
  const [condominios, setCondominios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destacados, setDestacados] = useState([]);

  // Carregar todos os condominios
  useEffect(() => {
    const fetchCondominios = async () => {
      setIsLoading(true);
      try {
        const response = await getCondominios();
        if (response && response.data) {
          setCondominios(response.data);

          // Identificar quais são destacados (simulação)
          // Em uma implementação real, você buscaria isso da API
          const destaques = response.data
            .filter((condominio, index) => index % 3 === 0) // Simular destaque de alguns condomínios
            .map((condominio) => condominio._id || condominio.id || condominio.Codigo);

          setDestacados(destaques);
        }
      } catch (error) {
        console.error("Erro ao carregar condomínios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCondominios();
  }, []);

  // Alternar o status de destaque de um condomínio
  const toggleDestaque = (id) => {
    setDestacados((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });

    // Em uma implementação real, você enviaria uma requisição para a API
    console.log(`Alternando destaque do condomínio ${id}`);
  };

  // Salvar as alterações
  const salvarDestaques = () => {
    // Em uma implementação real, você enviaria os dados para a API
    alert(`Condomínios destacados salvos: ${destacados.join(", ")}`);
  };

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto text-xs">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Condomínios Destacados</h1>
          <p className="text-gray-600 mb-6">
            Selecione os condomínios que deseja destacar na página de condomínios do site.
          </p>

          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            </div>
          ) : (
            <>
              {condominios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {condominios.map((condominio) => {
                    const id = condominio._id || condominio.id || condominio.Codigo;
                    const isDestacado = destacados.includes(id);

                    return (
                      <div
                        key={id}
                        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                          isDestacado ? "ring-2 ring-yellow-400" : ""
                        }`}
                      >
                        <div className="relative">
                          {/* Imagem do condominio (placeholder se não existir) */}
                          <div className="h-48 bg-gray-300 flex items-center justify-center">
                            {condominio.FotoDestaque ? (
                              <img
                                src={condominio.FotoDestaque}
                                alt={condominio.Nome || condominio.Titulo || "Condomínio"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-gray-500">Sem imagem</div>
                            )}
                          </div>

                          {/* Botão de destaque */}
                          <button
                            onClick={() => toggleDestaque(id)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md focus:outline-none"
                            title={isDestacado ? "Remover destaque" : "Adicionar destaque"}
                          >
                            {isDestacado ? (
                              <StarIcon className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <StarOutlineIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                            )}
                          </button>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {condominio.Nome || condominio.Titulo || "Condomínio"}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {condominio.Cidade ||
                              condominio.Localizacao ||
                              "Localização não informada"}
                          </p>
                          <p className="text-gray-500 line-clamp-2">
                            {condominio.Descricao ||
                              condominio.Detalhes ||
                              "Sem descrição disponível"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <p className="text-center text-gray-600">Nenhum condomínio encontrado.</p>
                </div>
              )}

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
