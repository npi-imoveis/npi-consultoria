"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { getImoveis } from "@/app/services";
import CardImovel from "@/app/components/ui/card-imovel";

export function SimilarProperties({ id, empreendimento, bairro, categoria, cidade, valor, metragem }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const carouselRef = useRef(null);

  // Função para extrair metragem numérica
  const extrairMetragem = (metragemStr) => {
    if (typeof metragemStr === 'number') return metragemStr;
    if (!metragemStr) return 0;
    
    const metragemLimpa = String(metragemStr)
      .replace(/m[²2]?\s*/gi, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^\d.-]/g, '');
    
    return parseFloat(metragemLimpa) || 0;
  };

  useEffect(() => {
    if (!id || !bairro) {
      console.log("[SIMILAR] Sem ID ou bairro, abortando");
      setLoading(false);
      return;
    }

    async function fetchImoveis() {
      try {
        setLoading(true);
        
        // Converter metragem
        const metragemBase = extrairMetragem(metragem);
        const metragemMin = metragemBase * 0.8; // -20%
        const metragemMax = metragemBase * 1.2; // +20%
        
        console.log(`[SIMILAR] ========== BUSCANDO SIMILARES ==========`);
        console.log(`[SIMILAR] ID atual: ${id}`);
        console.log(`[SIMILAR] Excluir empreendimento: ${empreendimento}`);
        console.log(`[SIMILAR] Bairro: ${bairro}`);
        console.log(`[SIMILAR] Categoria: ${categoria}`);
        if (metragemBase > 0) {
          console.log(`[SIMILAR] Metragem: ${metragemBase}m² (${metragemMin.toFixed(0)}-${metragemMax.toFixed(0)}m²)`);
        }
        
        // Buscar imóveis no MESMO BAIRRO e MESMA CATEGORIA
        const params = {
          bairros: bairro,
          categoria: categoria || undefined
        };
        
        const response = await getImoveis(params, 1, 100);
        const imoveisData = response.imoveis || [];
        
        console.log(`[SIMILAR] Encontrados: ${imoveisData.length} imóveis no bairro ${bairro}`);
        
        // APLICAR FILTROS SIMPLES
        const imoveisFiltrados = imoveisData.filter(imovel => {
          // 1. Remover o próprio imóvel
          const imovelId = String(imovel?.Codigo || '');
          if (imovelId === String(id)) {
            return false;
          }
          
          // 2. Remover mesmo empreendimento
          const imovelEmp = (imovel?.Empreendimento || '').toLowerCase().trim();
          const empAtual = (empreendimento || '').toLowerCase().trim();
          if (empAtual && imovelEmp === empAtual) {
            return false;
          }
          
          // 3. Filtrar por metragem ±20% (se disponível)
          if (metragemBase > 0) {
            const metragemImovel = extrairMetragem(
              imovel.MetragemAnt || 
              imovel.Metragem || 
              imovel.AreaTotal || 
              imovel.AreaPrivativa || 
              0
            );
            
            if (metragemImovel > 0) {
              if (metragemImovel < metragemMin || metragemImovel > metragemMax) {
                return false; // Fora do range de metragem
              }
            }
          }
          
          // Passou em todos os filtros
          return true;
        });
        
        console.log(`[SIMILAR] Após filtros: ${imoveisFiltrados.length} imóveis`);
        
        // Limitar a 12 imóveis
        const imoveisFinais = imoveisFiltrados.slice(0, 12);
        
        if (imoveisFinais.length > 0) {
          console.log(`[SIMILAR] Mostrando ${imoveisFinais.length} imóveis similares`);
          imoveisFinais.slice(0, 3).forEach((im, idx) => {
            const met = extrairMetragem(im.MetragemAnt || im.Metragem || 0);
            console.log(`  ${idx + 1}. ${im.Empreendimento} - ${met}m²`);
          });
        }
        
        setImoveis(imoveisFinais);
        
      } catch (err) {
        console.error("[SIMILAR] Erro:", err);
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImoveis();
  }, [id, empreendimento, bairro, categoria, metragem]);

  // Verificar overflow para botões
  useEffect(() => {
    const checkOverflow = () => {
      if (carouselRef.current && !loading) {
        const hasOverflow = carouselRef.current.scrollWidth > carouselRef.current.clientWidth;
        setShowButtons(hasOverflow || imoveis.length >= 3);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [imoveis, loading]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  // Não renderizar APENAS se não tiver ID
  if (!id) {
    return null;
  }

  // SEMPRE renderizar a seção, mesmo vazia
  return (
    <section className="relative bg-white container mx-auto border-t-2 p-10 mt-4">
      <h2 className="text-xl font-bold text-black mb-6">Imóveis Similares{bairro ? ` em ${bairro}` : ''}</h2>
      
      <div className="container mx-auto relative">
        {/* Só mostra botões se tiver imóveis */}
        {showButtons && !loading && imoveis.length > 0 && (
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
          ) : imoveis.length > 0 ? (
            // Renderiza os imóveis se houver
            imoveis.map((imovel, index) => {
              const key = imovel?.Codigo || `similar-${index}`;
              return (
                <div key={key} className="flex-shrink-0 w-[280px]">
                  <CardImovel {...imovel} isLoading={false} />
                </div>
              );
            })
          ) : (
            // Mensagem quando não há imóveis
            <div className="w-full text-center py-8 text-gray-500">
              <p>Nenhum imóvel similar encontrado no momento.</p>
            </div>
          )}
        </div>
        
        {/* Só mostra botões se tiver imóveis */}
        {showButtons && !loading && imoveis.length > 0 && (
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
