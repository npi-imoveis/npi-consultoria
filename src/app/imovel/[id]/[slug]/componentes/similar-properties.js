// src/app/imovel/[id]/[slug]/componentes/similar-properties.js

"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { getImoveisSimilares } from "@/app/services";
import CardImovel from "@/app/components/ui/card-imovel";

export function SimilarProperties({ id, empreendimento, endereco, bairro }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
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
        
        console.log(`🔍 [SIMILAR-PROPERTIES] ========== INICIANDO BUSCA ==========`);
        console.log(`🔍 [SIMILAR-PROPERTIES] ID do imóvel atual: ${id}`);
        console.log(`🔍 [SIMILAR-PROPERTIES] Empreendimento atual: "${empreendimento}"`);
        console.log(`🔍 [SIMILAR-PROPERTIES] Endereço atual: "${endereco}"`);
        console.log(`🔍 [SIMILAR-PROPERTIES] Bairro atual: "${bairro}"`);
        
        const response = await getImoveisSimilares(id);
        
        console.log("📦 [SIMILAR-PROPERTIES] Resposta completa da API:", JSON.stringify(response, null, 2));
        
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
        // Caso 3: response é diretamente um array
        else if (Array.isArray(response)) {
          imoveisData = response;
          console.log(`✅ [SIMILAR-PROPERTIES] Formato 3: ${imoveisData.length} imóveis encontrados`);
        }
        // Caso 4: response.data existe mas não é array
        else if (response?.data) {
          console.warn("⚠️ [SIMILAR-PROPERTIES] Resposta não é array:", response.data);
          imoveisData = [];
        }
        
        // 🔥🔥🔥 DEBUG COMPLETO - VAMOS VER O QUE A API ESTÁ RETORNANDO
        console.log(`📊 [SIMILAR-PROPERTIES] ========== ANÁLISE DOS ${imoveisData.length} IMÓVEIS RETORNADOS ==========`);
        imoveisData.forEach((imovel, index) => {
          console.log(`📍 [${index + 1}] Imóvel ID: ${imovel.Codigo}`);
          console.log(`    - Empreendimento: "${imovel.Empreendimento}"`);
          console.log(`    - Endereço: "${imovel.Endereco}"`);
          console.log(`    - Número: "${imovel.Numero}"`);
          console.log(`    - Bairro: "${imovel.BairroComercial}"`);
          console.log(`    - Cidade: "${imovel.Cidade}"`);
          console.log(`    - Tipo: "${imovel.Tipo}"`);
          console.log(`    ---`);
        });
        
        // 🔥🔥🔥 FUNÇÃO DE NORMALIZAÇÃO ULTRA-ROBUSTA
        const normalizar = (str) => {
          if (!str) return '';
          return str
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
        };
        
        // Normalizar dados do imóvel atual
        const empreendimentoNorm = normalizar(empreendimento);
        const enderecoNorm = normalizar(endereco);
        const bairroNorm = normalizar(bairro);
        
        console.log(`🎯 [SIMILAR-PROPERTIES] ========== FILTROS NORMALIZADOS ==========`);
        console.log(`🎯 Empreendimento: "${empreendimentoNorm}"`);
        console.log(`🎯 Endereço: "${enderecoNorm}"`);
        console.log(`🎯 Bairro: "${bairroNorm}"`);
        
        // 🔥🔥🔥 FILTRO MÚLTIPLO E DETALHADO
        const imoveisFiltrados = imoveisData.filter((imovel, index) => {
          const imovelId = String(imovel?.Codigo || imovel?._id || imovel?.id);
          const imovelEmpreendimentoNorm = normalizar(imovel?.Empreendimento);
          const imovelEnderecoNorm = normalizar(imovel?.Endereco);
          const imovelBairroNorm = normalizar(imovel?.BairroComercial);
          
          // Verificações individuais
          const mesmoId = imovelId === String(id);
          const mesmoEmpreendimento = empreendimentoNorm && imovelEmpreendimentoNorm === empreendimentoNorm;
          const mesmoEndereco = enderecoNorm && imovelEnderecoNorm === enderecoNorm;
          const mesmoBairro = bairroNorm && imovelBairroNorm === bairroNorm;
          
          // Log detalhado para cada imóvel
          console.log(`🔍 [${index + 1}] Analisando ID ${imovelId}:`);
          console.log(`    - Mesmo ID? ${mesmoId}`);
          console.log(`    - Mesmo Empreendimento? ${mesmoEmpreendimento} ("${imovelEmpreendimentoNorm}" vs "${empreendimentoNorm}")`);
          console.log(`    - Mesmo Endereço? ${mesmoEndereco} ("${imovelEnderecoNorm}" vs "${enderecoNorm}")`);
          console.log(`    - Mesmo Bairro? ${mesmoBairro} ("${imovelBairroNorm}" vs "${bairroNorm}")`);
          
          // REGRA DE EXCLUSÃO: Remove se for o mesmo ID OU mesmo empreendimento OU mesmo endereço
          const deveExcluir = mesmoId || mesmoEmpreendimento || (mesmoEndereco && mesmoEmpreendimento);
          
          if (deveExcluir) {
            console.log(`    ❌ EXCLUÍDO: ${mesmoId ? 'Mesmo ID' : mesmoEmpreendimento ? 'Mesmo Empreendimento' : 'Mesmo Endereço'}`);
          } else {
            console.log(`    ✅ MANTIDO: Imóvel diferente`);
          }
          
          return !deveExcluir;
        });
        
        console.log(`📊 [SIMILAR-PROPERTIES] ========== RESULTADO FINAL ==========`);
        console.log(`📊 Total original: ${imoveisData.length} imóveis`);
        console.log(`📊 Total filtrado: ${imoveisFiltrados.length} imóveis`);
        console.log(`📊 Removidos: ${imoveisData.length - imoveisFiltrados.length} imóveis`);
        
        // Log dos imóveis mantidos
        if (imoveisFiltrados.length > 0) {
          console.log("✅ [SIMILAR-PROPERTIES] Imóveis MANTIDOS após filtro:");
          imoveisFiltrados.forEach((imovel, index) => {
            console.log(`  ${index + 1}. ${imovel.Empreendimento} - ${imovel.Endereco} (ID: ${imovel.Codigo})`);
          });
        } else {
          console.log("⚠️ [SIMILAR-PROPERTIES] Nenhum imóvel passou pelo filtro!");
        }
        
        setImoveis(imoveisFiltrados);
        
      } catch (err) {
        console.error("❌ [SIMILAR-PROPERTIES] Erro ao buscar imóveis:", err);
        console.error("❌ [SIMILAR-PROPERTIES] Stack trace:", err.stack);
        
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
  }, [id, empreendimento, endereco, bairro]);

  // 🔥 VERIFICAR SE PRECISA DE SCROLL
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

  // 🔥 NÃO MOSTRAR SEÇÃO SE NÃO HÁ ID
  if (!id) {
    return null;
  }

  // Mostrar erro apenas se for crítico
  if (error && !loading) {
    console.error(`❌ [SIMILAR-PROPERTIES] Erro exibido: ${error}`);
    return null;
  }

  // 🔥 NÃO MOSTRAR SEÇÃO SE NÃO HÁ IMÓVEIS E JÁ CARREGOU
  if (!loading && imoveis.length === 0) {
    console.log("ℹ️ [SIMILAR-PROPERTIES] Nenhum imóvel similar encontrado após aplicar todos os filtros");
    return null;
  }

  return (
    <section className="relative bg-white container mx-auto border-t-2 p-10 mt-4">
      <h2 className="text-xl font-bold text-black mb-6">Imóveis Similares</h2>
      
      <div className="container mx-auto relative">
        {/* 🔥 BOTÕES APARECEM QUANDO HÁ 3+ IMÓVEIS OU OVERFLOW */}
        {showButtons && (
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
        
        {/* 🔥 BOTÕES APARECEM QUANDO HÁ 3+ IMÓVEIS OU OVERFLOW */}
        {showButtons && (
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
