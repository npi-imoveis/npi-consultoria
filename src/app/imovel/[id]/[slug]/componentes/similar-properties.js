"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { useEffect, useRef, useState } from "react";

import { getImoveisSimilares } from "@/app/services";
import CardImovel from "@/app/components/ui/card-imovel";

export function SimilarProperties({ id }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchImoveis() {
      try {
        const response = await getImoveisSimilares(id);


        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setImoveis(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setImoveis(response.data);
        } else {

          setImoveis([]);
          setError("Formato de dados inválido recebido do servidor");
        }
      } catch (err) {

        setError(err.response?.data?.message || "Erro ao buscar imóveis.");
      } finally {
        setLoading(false);
      }
    }

    fetchImoveis();
  }, []);



  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300; // Ajuste conforme necessário
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  if (error) {
    return <p className="text-red-500 text-center py-10">Erro: {error}</p>;
  }

  return (
    <section className="relative bg-white container mx-auto border-t-2 p-10 mt-4 ">
      <h2 className="text-xl font-bold text-black mb-6">Imóveis Similares</h2>
      <div className="container mx-auto">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-md z-10"
          aria-label="Ver imóveis anteriores"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar pb-4 "
        >
          {loading ? (
            // Renderiza skeletons durante o carregamento
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-1 min-w-[250px]">
                <CardImovel isLoading={true} />
              </div>
            ))
          ) : imoveis.length > 0 ? (
            // Renderiza os imóveis quando disponíveis
            imoveis.map((imovel) => (
              <div key={imovel.Codigo || imovel._id || `imovel-${Math.random()}`} className="flex-1 min-w-[250px]">
                <CardImovel {...imovel} isLoading={false} />
              </div>
            ))
          ) : (
            // Mensagem quando não há imóveis
            <p className="text-center w-full py-8">Nenhum imóvel em destaque encontrado.</p>
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md z-10"
          aria-label="Ver próximos imóveis"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
