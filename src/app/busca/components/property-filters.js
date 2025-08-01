"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { getImoveisSimilares } from "@/app/services";
import CardImovel from "@/app/components/ui/card-imovel";

// ✅ CORREÇÃO: Mudar para default export
export default function PropertyFilters({ id }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchImoveis() {
      // ✅ VALIDAÇÃO: Não fazer nada se não tiver ID
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // ✅ LOGS: Adicionar logs para debug (mantendo console.log simples)
        console.log(`🔄 Buscando imóveis similares para ID: ${id}`);
        
        const response = await getImoveisSimilares(id);
        
        console.log(`📊 Resposta recebida:`, {
          hasData: !!response?.data,
          isArray: Array.isArray(response?.data?.data || response?.data)
        });

        // ✅ MANTER: Tratamento original da resposta (sem mudanças)
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setImoveis(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setImoveis(response.data);
        } else {
          setImoveis([]);
          setError("Formato de dados inválido recebido do servidor");
        }
        
        console.log(`✅ Imóveis processados: ${imoveis.length || 0}`);
        
      } catch (err) {
        console.error(`❌ Erro ao buscar imóveis similares:`, err);
        setError(err.response?.data?.message || "Erro ao buscar imóveis.");
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImoveis();
  }, [id]); // ✅ CORREÇÃO PRINCIPAL: Adicionar dependência do ID

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  // ✅ MANTER: Estados originais sem mudanças
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
            // ✅ MANTER: Loading original
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-1 min-w-[250px]">
                <CardImovel isLoading={true} />
              </div>
            ))
          ) : imoveis.length > 0 ? (
            // ✅ CORREÇÃO: Key mais estável (sem Math.random)
            imoveis.map((imovel, index) => (
              <div 
                key={
                  // ✅ MELHORIA: Key estável sem quebrar compatibilidade
                  imovel.Codigo || 
                  imovel._id || 
                  imovel.id || 
                  `imovel-${index}-${id}` // Usar índice + ID como fallback
                } 
                className="flex-1 min-w-[250px]"
              >
                <CardImovel {...imovel} isLoading={false} />
              </div>
            ))
          ) : (
            // ✅ MANTER: Mensagem original
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
