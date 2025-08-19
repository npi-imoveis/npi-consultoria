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
    // 🔥 VALIDAÇÃO DO ID
    if (!id) {
      console.log("❌ [SIMILAR-PROPERTIES] ID não fornecido");
      setLoading(false);
      return;
    }

    async function fetchImoveis() {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 [SIMILAR-PROPERTIES] Buscando imóveis similares para ID: ${id}`);
        
        const response = await getImoveisSimilares(id);
        
        console.log("📦 [SIMILAR-PROPERTIES] Resposta da API:", response);
        
        // 🔥 TRATAMENTO ROBUSTO DA RESPOSTA
        let imoveisData = [];
        
        // Caso 1: response.data.data existe e é array
        if (response?.data?.data && Array.isArray(response.data.data)) {
          imoveisData = response.data.data;
          console.log(`✅ [SIMILAR-PROPERTIES] Formato 1: ${imoveisData.length} imóveis encontrados`);
        }
        // Caso 2: response.data é diretamente um array
        else if (response?.data && Array.isArray(response.data)) {
          imoveisData = response.data;
          console.log(`✅ [SIMILAR-PROPERTIES] Formato 2: ${imoveisData.length} imóveis encontrados`);
        }
        // Caso 3: response é diretamente um array (menos comum)
        else if (Array.isArray(response)) {
          imoveisData = response;
          console.log(`✅ [SIMILAR-PROPERTIES] Formato 3: ${imoveisData.length} imóveis encontrados`);
        }
        // Caso 4: response.data existe mas não é array
        else if (response?.data) {
          console.warn("⚠️ [SIMILAR-PROPERTIES] Resposta não é array:", response.data);
          imoveisData = [];
        }
        
        // 🔥 FILTRAR O PRÓPRIO IMÓVEL DA LISTA (se estiver incluído)
        const imoveisFiltrados = imoveisData.filter(imovel => {
          const imovelId = imovel?.Codigo || imovel?._id || imovel?.id;
          return imovelId && String(imovelId) !== String(id);
        });
        
        console.log(`🎯 [SIMILAR-PROPERTIES] ${imoveisFiltrados.length} imóveis após filtro`);
        
        setImoveis(imoveisFiltrados);
        
      } catch (err) {
        console.error("❌ [SIMILAR-PROPERTIES] Erro ao buscar imóveis:", err);
        
        // Tratamento de erro mais específico
        const errorMessage = 
          err?.response?.data?.message || 
          err?.message || 
          "Erro ao buscar imóveis similares";
          
        setError(errorMessage);
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImoveis();
  }, [id]); // 🔥 DEPENDÊNCIA CORRIGIDA

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  // 🔥 NÃO MOSTRAR SEÇÃO SE NÃO HÁ ID
  if (!id) {
    return null;
  }

  // Mostrar erro apenas se for crítico
  if (error && !loading) {
    console.error(`❌ [SIMILAR-PROPERTIES] Erro exibido: ${error}`);
    // Retornar null para não mostrar a seção em caso de erro
    return null;
  }

  // 🔥 NÃO MOSTRAR SEÇÃO SE NÃO HÁ IMÓVEIS E JÁ CARREGOU
  if (!loading && imoveis.length === 0) {
    console.log("ℹ️ [SIMILAR-PROPERTIES] Nenhum imóvel similar encontrado");
    return null;
  }

  return (
    <section className="relative bg-white container mx-auto border-t-2 p-10 mt-4">
      <h2 className="text-xl font-bold text-black mb-6">Imóveis Similares</h2>
      
      <div className="container mx-auto">
        {/* Botão Esquerda - só mostra se há mais de 3 imóveis */}
        {imoveis.length > 3 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-md z-10 hover:bg-gray-800 transition-colors"
            aria-label="Ver imóveis anteriores"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
        
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            // Skeletons durante carregamento
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-shrink-0 w-[280px]">
                <CardImovel isLoading={true} />
              </div>
            ))
          ) : (
            // Renderiza os imóveis
            imoveis.map((imovel, index) => {
              const key = imovel?.Codigo || imovel?._id || `similar-${index}`;
              return (
                <div key={key} className="flex-shrink-0 w-[280px]">
                  <CardImovel {...imovel} isLoading={false} />
                </div>
              );
            })
          )}
        </div>
        
        {/* Botão Direita - só mostra se há mais de 3 imóveis */}
        {imoveis.length > 3 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md z-10 hover:bg-black transition-colors"
            aria-label="Ver próximos imóveis"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
}
