// src/app/imovel/[id]/[slug]/componentes/similar-properties.js

"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { getImoveisSimilares } from "@/app/services";
import CardImovel from "@/app/components/ui/card-imovel";

export function SimilarProperties({ id, endereco, bairro, categoria, metragem }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!id) {
      console.log("❌ [SIMILAR-PROPERTIES] ID não fornecido");
      setLoading(false);
      return;
    }

    async function fetchImoveis() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 [SIMILAR-PROPERTIES] Buscando imóveis similares");
        console.log("📊 Critérios:", { id, endereco, bairro, categoria, metragem });
        
        const response = await getImoveisSimilares(id);
        
        // Extrair dados da resposta
        let imoveisData = [];
        if (response?.data?.data && Array.isArray(response.data.data)) {
          imoveisData = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          imoveisData = response.data;
        } else if (Array.isArray(response)) {
          imoveisData = response;
        }
        
        console.log(`📦 Total de imóveis recebidos: ${imoveisData.length}`);
        
        // 🔥 FUNÇÃO SIMPLES PARA COMPARAR ENDEREÇOS
        const enderecosSaoIguais = (end1, end2) => {
          if (!end1 || !end2) return false;
          
          // Extrai apenas o nome da rua e número de cada endereço
          const extrairRuaNumero = (endereco) => {
            // Remove tudo após a primeira vírgula ou hífen
            let base = endereco.split(',')[0].split(' - ')[0];
            
            // Remove prefixos comuns e normaliza
            base = base
              .toLowerCase()
              .replace(/rua|r\.|av\.|avenida|alameda|al\./gi, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            return base;
          };
          
          const base1 = extrairRuaNumero(end1);
          const base2 = extrairRuaNumero(end2);
          
          console.log(`   Comparando: "${base1}" com "${base2}"`);
          
          return base1 === base2;
        };
        
        // 🔥 APLICAR FILTROS
        const imoveisFiltrados = imoveisData.filter(imovel => {
          const imovelId = imovel?.Codigo || imovel?._id || imovel?.id;
          
          // 1️⃣ EXCLUIR O PRÓPRIO IMÓVEL
          if (imovelId && String(imovelId) === String(id)) {
            console.log(`❌ Excluindo próprio imóvel: ${imovelId}`);
            return false;
          }
          
          // 2️⃣ EXCLUIR IMÓVEIS DO MESMO ENDEREÇO
          if (endereco && imovel?.Endereco) {
            if (enderecosSaoIguais(endereco, imovel.Endereco)) {
              console.log(`❌ Excluindo mesmo endereço: ${imovel.Endereco}`);
              return false;
            }
          }
          
          // 3️⃣ FILTRAR POR BAIRRO (deve ser o mesmo)
          if (bairro && imovel?.Bairro) {
            const bairroNormalizado = bairro.toLowerCase().trim();
            const bairroImovel = imovel.Bairro.toLowerCase().trim();
            
            if (bairroNormalizado !== bairroImovel) {
              console.log(`❌ Bairro diferente: ${imovel.Bairro} ≠ ${bairro}`);
              return false;
            }
          }
          
          // 4️⃣ FILTRAR POR CATEGORIA (deve ser a mesma)
          if (categoria && imovel?.Categoria) {
            const categoriaNormalizada = categoria.toLowerCase().trim();
            const categoriaImovel = imovel.Categoria.toLowerCase().trim();
            
            if (categoriaNormalizada !== categoriaImovel) {
              console.log(`❌ Categoria diferente: ${imovel.Categoria} ≠ ${categoria}`);
              return false;
            }
          }
          // Também verificar campo "Tipo" se não tiver "Categoria"
          else if (categoria && imovel?.Tipo) {
            const categoriaNormalizada = categoria.toLowerCase().trim();
            const tipoImovel = imovel.Tipo.toLowerCase().trim();
            
            if (categoriaNormalizada !== tipoImovel) {
              console.log(`❌ Tipo diferente: ${imovel.Tipo} ≠ ${categoria}`);
              return false;
            }
          }
          
          // 5️⃣ FILTRAR POR METRAGEM (±20%)
          if (metragem && imovel?.AreaUtil) {
            const metragemNum = parseFloat(metragem);
            const metragemImovel = parseFloat(imovel.AreaUtil);
            
            const limiteInferior = metragemNum * 0.8;  // -20%
            const limiteSuperior = metragemNum * 1.2;  // +20%
            
            if (metragemImovel < limiteInferior || metragemImovel > limiteSuperior) {
              console.log(`❌ Metragem fora do range: ${imovel.AreaUtil}m² (range: ${limiteInferior.toFixed(0)}-${limiteSuperior.toFixed(0)}m²)`);
              return false;
            }
          }
          // Também verificar campo "Metragem" se não tiver "AreaUtil"
          else if (metragem && imovel?.Metragem) {
            const metragemNum = parseFloat(metragem);
            const metragemImovel = parseFloat(imovel.Metragem);
            
            const limiteInferior = metragemNum * 0.8;
            const limiteSuperior = metragemNum * 1.2;
            
            if (metragemImovel < limiteInferior || metragemImovel > limiteSuperior) {
              console.log(`❌ Metragem fora do range: ${imovel.Metragem}m²`);
              return false;
            }
          }
          
          // ✅ IMÓVEL PASSOU EM TODOS OS FILTROS
          console.log(`✅ Imóvel aprovado: ${imovel.Endereco || 'Sem endereço'}`);
          return true;
        });
        
        console.log(`📊 RESULTADO: ${imoveisFiltrados.length} imóveis após filtros`);
        setImoveis(imoveisFiltrados);
        
      } catch (err) {
        console.error("❌ Erro ao buscar imóveis:", err);
        setError(err?.message || "Erro ao buscar imóveis similares");
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImoveis();
  }, [id, endereco, bairro, categoria, metragem]);

  // Verificar se precisa mostrar botões de scroll
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

  // Não mostrar seção se não há ID
  if (!id) {
    return null;
  }

  // Não mostrar seção se houve erro
  if (error && !loading) {
    return null;
  }

  // Não mostrar seção se não há imóveis similares
  if (!loading && imoveis.length === 0) {
    console.log("ℹ️ Nenhum imóvel similar encontrado com os critérios definidos");
    return null;
  }

  return (
    <section className="relative bg-white container mx-auto border-t-2 p-10 mt-4">
      <h2 className="text-xl font-bold text-black mb-6">Imóveis Similares</h2>
      
      <div className="container mx-auto relative">
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
