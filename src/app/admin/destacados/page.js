"use client";

import { useState, useEffect } from "react";
import { getImovelDestacado, atualizarImovel, getCondominioDestacado } from "@/app/services";
import AuthCheck from "../components/auth-check";

import { TrashIcon } from "lucide-react";
import { Tab } from "@headlessui/react";

export default function CondominiosDestacados() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destacados, setDestacados] = useState([]);
  const [tab, setTab] = useState("imoveis");
  const [condominios, setCondominios] = useState([]);
  const [isLoadingCondominios, setIsLoadingCondominios] = useState(false);

  useEffect(() => {
    const fetchImoveis = async () => {
      setIsLoading(true);
      try {
        const response = await getImovelDestacado();
        if (response && response.data) {
          setImoveis(response.data);
          // Filtrar apenas ids destacados
          const destaques = response.data
            .filter((item) => item.Destacado === "Sim")
            .map((item) => item._id || item.id || item.Codigo);
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

  useEffect(() => {
    if (tab === "condominios" && condominios.length === 0) {
      const fetchCondominios = async () => {
        setIsLoadingCondominios(true);
        try {
          const response = await getCondominioDestacado();
          if (response && response.data) {
            setCondominios(response.data);
          }
        } catch (error) {
          console.error("Erro ao carregar condomínios:", error);
        } finally {
          setIsLoadingCondominios(false);
        }
      };
      fetchCondominios();
    }
  }, [tab, condominios.length]);

  // Alternar o status de destaque de um imóvel
  const toggleDestaque = async (id) => {
    try {
      const response = await atualizarImovel(id, { Destacado: "Não" });
      if (response && response.success) {
        setDestacados((prev) => prev.filter((itemId) => itemId !== id));
        setImoveis((prev) =>
          prev.filter((item) => {
            const itemId = item._id || item.id || item.Codigo;
            return itemId !== id;
          })
        );
      } else {
        alert("Erro ao remover destaque do imóvel");
      }
    } catch (error) {
      alert("Ocorreu um erro ao processar sua solicitação");
    }
  };

  const removeDestaqueCondominio = async (id) => {
    try {
      const response = await atualizarImovel(id, { CondominioDestaque: "Não" });
      if (response && response.success) {
        setDestacados((prev) => prev.filter((itemId) => itemId !== id));
        setCondominios((prev) =>
          prev.filter((item) => {
            const itemId = item._id || item.id || item.Codigo;
            return itemId !== id;
          })
        );
      }
    } catch (error) {
      console.error(`Erro ao remover destaque do condomínio ${id}:`, error);
    }
  };

  // Filtros para as tabs
  const imoveisDestacados = imoveis.filter((item) => item.Destacado === "Sim");
  const condominiosDestacados = condominios;

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto text-xs">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Imóveis Destacados</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Gerencie os imóveis e condomínios que estão marcados como destacados no site.
          </p>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${
                tab === "imoveis"
                  ? "border-black text-black bg-gray-50"
                  : "border-transparent text-gray-400 bg-gray-100"
              }`}
              onClick={() => setTab("imoveis")}
            >
              Imóveis
            </button>
            <button
              className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${
                tab === "condominios"
                  ? "border-black text-black bg-gray-50 "
                  : "border-transparent text-gray-500 bg-gray-100"
              }`}
              onClick={() => setTab("condominios")}
            >
              Condomínios
            </button>
          </div>

          {tab === "imoveis" && isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            </div>
          ) : tab === "condominios" && isLoadingCondominios ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            </div>
          ) : (
            <>
              {(tab === "imoveis" ? imoveisDestacados : condominiosDestacados).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(tab === "imoveis" ? imoveisDestacados : condominiosDestacados).map(
                    (condominio) => {
                      const id = condominio._id || condominio.id || condominio.Codigo;
                      const isDestacado = destacados.includes(id);
                      return (
                        <div
                          key={id}
                          className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow "
                        >
                          <div className="relative">
                            <div className="h-48 bg-gray-300 flex items-center justify-center">
                              {condominio.Foto && condominio.Foto[0] ? (
                                <img
                                  src={condominio.Foto[0].Foto}
                                  alt={condominio.Empreendimento}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-500">Sem imagem</div>
                              )}
                            </div>
                            {tab === "imoveis" && (
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
                            )}
                            {tab === "condominios" && (
                              <button
                                onClick={() => removeDestaqueCondominio(id)}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md focus:outline-none"
                                title="Remover destaque"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                              </button>
                            )}
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
                    }
                  )}
                </div>
              ) : (
                <div className=" p-8 rounded-lg ">
                  <p className="text-center text-lg text-gray-600">
                    Nenhum {tab === "imoveis" ? "imóvel" : "condomínio"} destacado encontrado.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
