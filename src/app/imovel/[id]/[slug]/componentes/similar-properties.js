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

  // Função para extrair valor numérico
  const extrairValor = (valorStr) => {
    if (typeof valorStr === 'number') return valorStr;
    if (!valorStr) return 0;
    
    const valorLimpo = String(valorStr)
      .replace(/R\$?\s*/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^\d.-]/g, '');
    
    return parseFloat(valorLimpo) || 0;
  };

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
    if (!id) {
      console.log("[SIMILAR] Sem ID, abortando");
      setLoading(false);
      return;
    }

    async function fetchImoveis() {
      try {
        setLoading(true);
        
        // Converter valores para números
        const valorBase = extrairValor(valor);
        const metragemBase = extrairMetragem(metragem);
        
        // Calcular ranges (±20%)
        const valorMin = valorBase * 0.8;
        const valorMax = valorBase * 1.2;
        const metragemMin = metragemBase * 0.8;
        const metragemMax = metragemBase * 1.2;
        
        console.log(`[SIMILAR] ========== BUSCA INTELIGENTE ==========`);
        console.log(`[SIMILAR] Imóvel atual: ${id} - ${empreendimento}`);
        console.log(`[SIMILAR] Bairro: ${bairro || 'não especificado'}`);
        console.log(`[SIMILAR] Categoria: ${categoria || 'todas'}`);
        console.log(`[SIMILAR] Valor: R$ ${valorBase.toLocaleString('pt-BR')} (${valorMin.toLocaleString('pt-BR')} - ${valorMax.toLocaleString('pt-BR')})`);
        console.log(`[SIMILAR] Metragem: ${metragemBase}m² (${metragemMin.toFixed(0)} - ${metragemMax.toFixed(0)}m²)`);
        
        // ESTRATÉGIA 1: Buscar no mesmo bairro primeiro
        let params = {
          bairros: bairro,
          categoria: categoria || undefined,
          cidade: cidade || undefined
        };
        
        let response = await getImoveis(params, 1, 50);
        let imoveisData = response.imoveis || [];
        
        console.log(`[SIMILAR] Encontrados no bairro ${bairro}: ${imoveisData.length} imóveis`);
        
        // Se não encontrou suficientes no bairro, expandir busca
        if (imoveisData.length < 20 && cidade) {
          console.log(`[SIMILAR] Expandindo busca para toda a cidade ${cidade}`);
          params = {
            cidade: cidade,
            categoria: categoria || undefined
          };
          response = await getImoveis(params, 1, 100);
          imoveisData = response.imoveis || [];
          console.log(`[SIMILAR] Encontrados na cidade: ${imoveisData.length} imóveis`);
        }
        
        // APLICAR FILTROS
        const imoveisFiltrados = imoveisData.filter(imovel => {
          // 1. Remover o próprio imóvel
          const imovelId = String(imovel?.Codigo || imovel?._id || '');
          if (imovelId === String(id)) {
            return false;
          }
          
          // 2. Remover mesmo empreendimento
          const imovelEmp = (imovel?.Empreendimento || '').toLowerCase().trim();
          const empAtual = (empreendimento || '').toLowerCase().trim();
          if (empAtual && imovelEmp === empAtual) {
            return false;
          }
          
          // 3. Filtrar por categoria (se especificada)
          if (categoria) {
            const imovelCat = (imovel?.Categoria || '').toLowerCase();
            const catAtual = categoria.toLowerCase();
            if (!imovelCat.includes(catAtual) && !catAtual.includes(imovelCat)) {
              return false;
            }
          }
          
          // 4. Filtrar por valor (±20%) se disponível
          if (valorBase > 0) {
            const valorImovel = extrairValor(
              imovel.ValorVenda || 
              imovel.ValorAntigo || 
              imovel.Valor || 
              imovel.PrecoVenda || 
              0
            );
            
            if (valorImovel > 0) {
              if (valorImovel < valorMin || valorImovel > valorMax) {
                return false;
              }
            }
          }
          
          // 5. Filtrar por metragem (±20%) se disponível
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
                return false;
              }
            }
          }
          
          return true;
        });
        
        console.log(`[SIMILAR] Após filtros: ${imoveisFiltrados.length} imóveis`);
        
        // ORDENAR POR RELEVÂNCIA (mais próximo em valor e metragem)
        const imoveisOrdenados = imoveisFiltrados.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          
          // Pontuação por proximidade de valor
          if (valorBase > 0) {
            const valorA = extrairValor(a.ValorVenda || a.ValorAntigo || a.Valor || 0);
            const valorB = extrairValor(b.ValorVenda || b.ValorAntigo || b.Valor || 0);
            
            if (valorA > 0) {
              const diffA = Math.abs(valorA - valorBase) / valorBase;
              scoreA += (1 - diffA) * 100; // Quanto mais próximo, maior o score
            }
            
            if (valorB > 0) {
              const diffB = Math.abs(valorB - valorBase) / valorBase;
              scoreB += (1 - diffB) * 100;
            }
          }
          
          // Pontuação por proximidade de metragem
          if (metragemBase > 0) {
            const metragemA = extrairMetragem(a.MetragemAnt || a.Metragem || 0);
            const metragemB = extrairMetragem(b.MetragemAnt || b.Metragem || 0);
            
            if (metragemA > 0) {
              const diffA = Math.abs(metragemA - metragemBase) / metragemBase;
              scoreA += (1 - diffA) * 50; // Peso menor que valor
            }
            
            if (metragemB > 0) {
              const diffB = Math.abs(metragemB - metragemBase) / metragemBase;
              scoreB += (1 - diffB) * 50;
            }
          }
          
          // Bonus se for do mesmo bairro
          const bairroA = (a.BairroComercial || '').toLowerCase();
          const bairroB = (b.BairroComercial || '').toLowerCase();
          const bairroAtual = (bairro || '').toLowerCase();
          
          if (bairroAtual) {
            if (bairroA === bairroAtual) scoreA += 30;
            if (bairroB === bairroAtual) scoreB += 30;
          }
          
          return scoreB - scoreA; // Ordem decrescente de relevância
        });
        
        // Limitar a 12 imóveis
        const imoveisFinais = imoveisOrdenados.slice(0, 12);
        
        if (imoveisFinais.length > 0) {
          console.log(`[SIMILAR] Top 3 mais relevantes:`);
          imoveisFinais.slice(0, 3).forEach((im, idx) => {
            const valorIm = extrairValor(im.ValorVenda || im.ValorAntigo || im.Valor || 0);
            const metragemIm = extrairMetragem(im.MetragemAnt || im.Metragem || 0);
            console.log(`  ${idx + 1}. ${im.Empreendimento} - ${im.BairroComercial}`);
            console.log(`     Valor: R$ ${valorIm.toLocaleString('pt-BR')} | Metragem: ${metragemIm}m²`);
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
  }, [id, empreendimento, bairro, categoria, cidade, valor, metragem]);

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

  // Não renderizar se não há imóveis
  if (!id || (!loading && imoveis.length === 0)) {
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
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-shrink-0 w-[280px]">
                <CardImovel isLoading={true} />
              </div>
            ))
          ) : (
            imoveis.map((imovel, index) => {
              const key = imovel?.Codigo || `similar-${index}`;
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
