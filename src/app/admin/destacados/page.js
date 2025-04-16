"use client";

import { useState, useEffect } from "react";
import { getImovelDestacado, atualizarImovel } from "@/app/services";
import AuthCheck from "../components/auth-check";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";

export default function CondominiosDestacados() {
  const [condominios, setCondominios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destacados, setDestacados] = useState([]);

  // Carregar todos os condominios
  useEffect(() => {
    const fetchCondominios = async () => {
      setIsLoading(true);
      try {
        const response = await getImovelDestacado();
        if (response && response.data) {
          setCondominios(response.data);

          // Filtrar apenas os condominios com Destacado = "Sim"
          const destaques = response.data
            .filter(condominio => condominio.Destacado === "Sim")
            .map(condominio => condominio._id || condominio.id || condominio.Codigo);

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
  const toggleDestaque = async (id) => {
    try {
      // Atualizar o imóvel no banco de dados para Destacado = "Não"
      const response = await atualizarImovel(id, { Destacado: "Não" });

      if (response && response.success) {
        // Se a atualização foi bem-sucedida, remover da lista de destacados
        setDestacados((prev) => prev.filter((itemId) => itemId !== id));

        // Remover o imóvel da lista de exibição
        setCondominios((prev) => prev.filter((item) => {
          const itemId = item._id || item.id || item.Codigo;
          return itemId !== id;
        }));

        console.log(`Destaque do imóvel ${id} removido com sucesso`);
      } else {
        console.error("Erro ao remover destaque:", response?.message);
        alert("Erro ao remover destaque do imóvel");
      }
    } catch (error) {
      console.error(`Erro ao alternar destaque do imóvel ${id}:`, error);
      alert("Ocorreu um erro ao processar sua solicitação");
    }
  };



  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto text-xs">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Imóveis e Condomínios Destacados</h1>
          <p className="text-gray-600 mb-6">
            Gerencie os imóveis e condomínios que estão marcados como destacados no site.
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
                        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${isDestacado ? "ring-2 ring-yellow-400" : ""
                          }`}
                      >
                        <div className="relative">
                          {/* Imagem do condominio (placeholder se não existir) */}
                          <div className="h-48 bg-gray-300 flex items-center justify-center">
                            {condominio.Foto[0] ? (
                              <img
                                src={condominio.Foto[0].Foto}
                                alt={condominio.Empreendimento}
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
                              <TrashIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <TrashIcon className="h-5 w-5 text-gray-300 hover:text-yellow-500" />
                            )}
                          </button>
                        </div>

                        <div className="p-4">
                          <span>Codigo: {condominio.Codigo}</span>
                          <h3 className="font-semibold text-sm mb-1">
                            {condominio.Empreendimento || "Condomínio"}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {condominio.BairroComercial}, {condominio.Cidade}
                          </p>
                          <span className="text-lg  font-bold text-black line-clamp-2">
                            {condominio.ValorAntigo}
                          </span>
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


            </>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
