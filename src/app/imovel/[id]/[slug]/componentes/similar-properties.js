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
        
        // Calcular ranges mais FLEXÍVEIS (±30% ao invés de ±20%)
        const valorMin = valorBase * 0.7;
        const valorMax = valorBase * 1.3;
        const metragemMin = metragemBase * 0.7;
        const metragemMax = metragemBase * 1.3;
        
        console.log(`[SIMILAR] ========== BUSCA FLEXÍVEL ==========`);
        console.log(`[SIMILAR] Imóvel atual: ${id} - ${empreendimento}`);
        console.log(`[SIMILAR] Bairro: ${bairro || 'não especificado'}`);
        console.log(`[SIMILAR] Categoria: ${categoria || 'todas'}`);
        if (valorBase > 0) {
          console.log(`[SIMILAR] Valor: R$ ${valorBase.toLocaleString('pt-BR')} (${valorMin.toLocaleString('pt-BR')} - ${valorMax.toLocaleString('pt-BR')})`);
        }
        if (metragemBase > 0) {
          console.log(`[SIMILAR] Metragem: ${metragemBase}m² (${metragemMin.toFixed(0)} - ${metragemMax.toFixed(0)}m²)`);
        }
        
        // ESTRATÉGIA: Buscar MAIS imóveis para ter opções
        let params = {};
        
        // Só filtrar por bairro se existir
        if (bairro) {
          params.bairros = bairro;
        }
        
        // Só filtrar por categoria se existir
        if (categoria) {
          params.categoria = categoria;
        }
        
        // Sempre incluir cidade se disponível
        if (cidade) {
          params.cidade = cidade;
        }
        
        // Buscar MAIS imóveis (100 ao invés de 50)
        let response = await getImoveis(params, 1, 100);
        let imoveisData = response.imoveis || [];
        
        console.log(`[SIMILAR] Total encontrado: ${imoveisData.length} imóveis`);
        
        // Se não encontrou nada com bairro, tentar sem
        if (imoveisData.length === 0 && bairro) {
          console.log(`[SIMILAR] Nenhum imóvel no bairro, expandindo busca...`);
          params = { cidade: cidade || undefined };
          response = await getImoveis(params, 1, 100);
          imoveisData = response.imoveis || [];
          console.log(`[SIMILAR] Encontrados na cidade: ${imoveisData.length} imóveis`);
        }
        
        // FILTROS MAIS INTELIGENTES
        const imoveisFiltrados = imoveisData.filter(imovel => {
          // 1. SEMPRE remover o próprio imóvel
          const imovelId = String(imovel?.Codigo || imovel?._id || '');
          if (imovelId === String(id)) {
            return false;
          }
          
          // 2. SEMPRE remover mesmo empreendimento
          const imovelEmp = (imovel?.Empreendimento || '').toLowerCase().trim();
          const empAtual = (empreendimento || '').toLowerCase().trim();
          if (empAtual && imovelEmp && imovelEmp === empAtual) {
            return false;
          }
          
          // SISTEMA DE PONTOS: Não precisa passar em TODOS os filtros
          let pontos = 0;
          let criteriosAvaliados = 0;
          
          // 3. Categoria (OPCIONAL - adiciona pontos se combinar)
          if (categoria && imovel?.Categoria) {
            criteriosAvaliados++;
            const imovelCat = imovel.Categoria.toLowerCase();
            const catAtual = categoria.toLowerCase();
            if (imovelCat.includes(catAtual) || catAtual.includes(imovelCat)) {
              pontos += 2; // Categoria vale 2 pontos
            }
          }
          
          // 4. Valor (OPCIONAL - adiciona pontos se estiver no range)
          if (valorBase > 0) {
            const valorImovel = extrairValor(
              imovel.ValorVenda || 
              imovel.ValorAntigo || 
              imovel.Valor || 
              imovel.PrecoVenda || 
              0
            );
            
            if (valorImovel > 0) {
              criteriosAvaliados++;
              if (valorImovel >= valorMin && valorImovel <= valorMax) {
                pontos += 3; // Valor vale 3 pontos
                
                // Bonus por proximidade de valor
                const diffPercent = Math.abs(valorImovel - valorBase) / valorBase;
                if (diffPercent <= 0.1) pontos += 2; // ±10% = bonus
              }
            }
          }
          
          // 5. Metragem (OPCIONAL - adiciona pontos se estiver no range)
          if (metragemBase > 0) {
            const metragemImovel = extrairMetragem(
              imovel.MetragemAnt || 
              imovel.Metragem || 
              imovel.AreaTotal || 
              imovel.AreaPrivativa || 
              0
            );
            
            if (metragemImovel > 0) {
              criteriosAvaliados++;
              if (metragemImovel >= metragemMin && metragemImovel <= metragemMax) {
                pontos += 2; // Metragem vale 2 pontos
                
                // Bonus por proximidade de metragem
                const diffPercent = Math.abs(metragemImovel - metragemBase) / metragemBase;
                if (diffPercent <= 0.1) pontos += 1; // ±10% = bonus
              }
            }
          }
          
          // 6. Bairro (OPCIONAL - adiciona pontos se for o mesmo)
          if (bairro && imovel?.BairroComercial) {
            const bairroImovel = (imovel.BairroComercial || '').toLowerCase();
            const bairroAtual = bairro.toLowerCase();
            if (bairroImovel === bairroAtual) {
              pontos += 1; // Mesmo bairro vale 1 ponto
            }
          }
          
          // DECISÃO: Aceitar se tiver pelo menos 30% de compatibilidade
          // ou se não houver critérios para avaliar (mostra tudo)
          const pontosMaximos = criteriosAvaliados * 3; // Assumindo peso máximo 3
          const percentualCompatibilidade = pontosMaximos > 0 ? (pontos / pontosMaximos) : 1;
          
          // Debug para os primeiros imóveis
          if (imoveisData.indexOf(imovel) < 5) {
            console.log(`[SIMILAR] ${imovel.Empreendimento}: ${pontos}pts de ${pontosMaximos} (${(percentualCompatibilidade * 100).toFixed(0)}%)`);
          }
          
          // Aceitar se tiver 30% ou mais de compatibilidade
          return percentualCompatibilidade >= 0.3 || criteriosAvaliados === 0;
        });
        
        console.log(`[SIMILAR] Após filtros flexíveis: ${imoveisFiltrados.length} imóveis`);
        
        // ORDENAR por relevância (pontuação)
        const imoveisOrdenados = imoveisFiltrados.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          
          // Calcular scores baseado em proximidade
          if (valorBase > 0) {
            const valorA = extrairValor(a.ValorVenda || a.ValorAntigo || 0);
            const valorB = extrairValor(b.ValorVenda || b.ValorAntigo || 0);
            
            if (valorA > 0) {
              const diffA = Math.abs(valorA - valorBase) / valorBase;
              scoreA += Math.max(0, 100 * (1 - diffA));
            }
            
            if (valorB > 0) {
              const diffB = Math.abs(valorB - valorBase) / valorBase;
              scoreB += Math.max(0, 100 * (1 - diffB));
            }
          }
          
          if (metragemBase > 0) {
            const metragemA = extrairMetragem(a.MetragemAnt || a.Metragem || 0);
            const metragemB = extrairMetragem(b.MetragemAnt || b.Metragem || 0);
            
            if (metragemA > 0) {
              const diffA = Math.abs(metragemA - metragemBase) / metragemBase;
              scoreA += Math.max(0, 50 * (1 - diffA));
            }
            
            if (metragemB > 0) {
              const diffB = Math.abs(metragemB - metragemBase) / metragemBase;
              scoreB += Math.max(0, 50 * (1 - diffB));
            }
          }
          
          // Bonus por mesmo bairro
          if (bairro) {
            if ((a.BairroComercial || '').toLowerCase() === bairro.toLowerCase()) scoreA += 30;
            if ((b.BairroComercial || '').toLowerCase() === bairro.toLowerCase()) scoreB += 30;
          }
          
          return scoreB - scoreA;
        });
        
        // Limitar a 12 imóveis
        const imoveisFinais = imoveisOrdenados.slice(0, 12);
        
        if (imoveisFinais.length > 0) {
          console.log(`[SIMILAR] Exibindo ${imoveisFinais.length} imóveis mais relevantes`);
        } else {
          console.log(`[SIMILAR] ⚠️ Nenhum imóvel passou pelos filtros flexíveis`);
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
