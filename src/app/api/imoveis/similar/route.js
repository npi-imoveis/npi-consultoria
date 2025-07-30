import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          error: "É necessário fornecer o ID do imóvel",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar o imóvel de referência pelo Codigo
    const imovelReferencia = await Imovel.findOne({ Codigo: id });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel de referência não encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar se o imóvel possui área privativa definida
    if (!imovelReferencia.AreaPrivativa) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui área privativa definida",
        },
        { status: 400 }
      );
    }

    // Converter a área privativa para número, removendo qualquer texto não numérico
    const areaReferenciaString = imovelReferencia.AreaPrivativa.toString()
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const areaReferencia = parseFloat(areaReferenciaString);

    // Definir margem de variação (20%)
    const margemVariacao = areaReferencia * 0.2;
    const areaMinima = areaReferencia - margemVariacao;
    const areaMaxima = areaReferencia + margemVariacao;

    // Verificar se o imóvel possui bairro definido
    if (!imovelReferencia.Bairro) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui bairro definido",
        },
        { status: 400 }
      );
    }

    // 🆕 CALCULAR FAIXA DE PREÇO (±30%)
    let precoMinimo, precoMaximo;
    if (imovelReferencia.ValorAntigo && imovelReferencia.ValorAntigo !== "0") {
      const precoReferencia = parseFloat(imovelReferencia.ValorAntigo.toString().replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isNaN(precoReferencia) && precoReferencia > 0) {
        precoMinimo = precoReferencia * 0.7;  // 30% menor
        precoMaximo = precoReferencia * 1.3;  // 30% maior
      }
    }

    // 🚀 BUSCA PRIORITÁRIA: MESMO ENDEREÇO + NÚMERO (mais confiável que empreendimento)
    let imoveisSimilares = [];
    
    if (imovelReferencia.Endereco && imovelReferencia.Numero) {
      console.log(`🏠 Buscando no mesmo endereço: ${imovelReferencia.Endereco}, ${imovelReferencia.Numero}`);
      
      const filtroMesmoEndereco = {
        Codigo: { $ne: id },
        Endereco: imovelReferencia.Endereco,
        Numero: imovelReferencia.Numero,
        // 🎯 FILTROS MAIS FLEXÍVEIS PARA MESMO ENDEREÇO
        ValorAntigo: { $nin: ["0", ""] }, // Só garantir que tem preço
        // Remover filtros de categoria e área para mesmo endereço
      };

      imoveisSimilares = await Imovel.find(filtroMesmoEndereco)
        .limit(15) // Limite maior para mesmo endereço
        .lean();
      
      console.log(`🏠 Encontrados ${imoveisSimilares.length} no mesmo endereço`);
    }

    // 🔍 BUSCA SECUNDÁRIA: MESMO BAIRRO (se precisar de mais resultados)
    if (imoveisSimilares.length < 8) {
      console.log(`🔍 Expandindo busca para mesmo bairro (atual: ${imoveisSimilares.length})`);
      
      const filtroMesmoBairro = {
        Codigo: { $ne: id },
        Bairro: imovelReferencia.Bairro,
        AreaPrivativa: { $exists: true, $ne: "" },
        ValorAntigo: { $nin: ["0", ""] },
      };

      // 🆕 ADICIONAR FILTRO DE CATEGORIA APENAS PARA BUSCA NO BAIRRO
      if (imovelReferencia.Categoria) {
        filtroMesmoBairro.Categoria = imovelReferencia.Categoria;
      }

      const codigosExistentes = new Set(imoveisSimilares.map(i => i.Codigo));
      
      const mesmoBairro = await Imovel.find(filtroMesmoBairro)
        .limit(20)
        .lean();

      // Adicionar apenas os que não estão na lista do mesmo endereço
      const novosDoBairro = mesmoBairro.filter(i => !codigosExistentes.has(i.Codigo));
      imoveisSimilares = [...imoveisSimilares, ...novosDoBairro];
      
      console.log(`🔍 Total após busca no bairro: ${imoveisSimilares.length}`);
    }

    // Filtrar os resultados em JavaScript
    const filtrados = imoveisSimilares
      .filter((imovel) => {
        try {
          // 🏠 LÓGICA ESPECIAL: Se é do mesmo endereço, aplicar filtros mais flexíveis
          const mesmoEndereco = imovel.Endereco === imovelReferencia.Endereco && 
                               imovel.Numero === imovelReferencia.Numero;
          
          if (mesmoEndereco) {
            // Para mesmo endereço: só validar que tem área válida (sem limite de ±20%)
            const areaString = imovel.AreaPrivativa.toString()
              .replace(/[^\d.,]/g, "")
              .replace(",", ".");
            const area = parseFloat(areaString);
            const temAreaValida = !isNaN(area) && area > 0;
            
            // Para preço: usar faixa mais ampla (±50% ao invés de ±30%)
            if (precoMinimo && precoMaximo && imovel.ValorAntigo) {
              const precoString = imovel.ValorAntigo.toString()
                .replace(/[^\d.,]/g, "")
                .replace(",", ".");
              const preco = parseFloat(precoString);
              
              if (!isNaN(preco) && preco > 0) {
                const precoMinimoFlexivel = precoMinimo * 0.5; // ±70% mais flexível
                const precoMaximoFlexivel = precoMaximo * 1.5;
                const precoValido = preco >= precoMinimoFlexivel && preco <= precoMaximoFlexivel;
                return temAreaValida && precoValido;
              }
            }
            
            return temAreaValida;
          }
          
          // 🎯 LÓGICA NORMAL: Para imóveis de outros endereços, usar filtros originais
          const areaString = imovel.AreaPrivativa.toString()
            .replace(/[^\d.,]/g, "")
            .replace(",", ".");
          const area = parseFloat(areaString);
          const areaValida = !isNaN(area) && area >= areaMinima && area <= areaMaxima;
          
          // Filtro de preço normal (±30%)
          if (precoMinimo && precoMaximo && imovel.ValorAntigo) {
            const precoString = imovel.ValorAntigo.toString()
              .replace(/[^\d.,]/g, "")
              .replace(",", ".");
            const preco = parseFloat(precoString);
            
            if (!isNaN(preco)) {
              const precoValido = preco >= precoMinimo && preco <= precoMaximo;
              return areaValida && precoValido;
            }
          }
          
          return areaValida;
        } catch (e) {
          return false;
        }
      });

    // 🆕 ORDENAÇÃO POR RELEVÂNCIA COM PRIORIDADE PARA MESMO ENDEREÇO
    const comScore = filtrados.map(imovel => {
      let score = 0;
      
      // 🏠 MESMO ENDEREÇO + NÚMERO: PRIORIDADE MÁXIMA (+100 pontos)
      if (imovel.Endereco === imovelReferencia.Endereco && 
          imovel.Numero === imovelReferencia.Numero) {
        score += 100;
      }
      
      // 🏢 Mesmo empreendimento (nome similar): +50 pontos
      if (imovel.Empreendimento === imovelReferencia.Empreendimento) {
        score += 50;
      }
      
      // Mesmo bairro: +10 pontos base
      if (imovel.Bairro === imovelReferencia.Bairro) {
        score += 10;
      }
      
      // Mesma categoria: +20 pontos
      if (imovel.Categoria === imovelReferencia.Categoria) {
        score += 20;
      }
      
      // Quartos similares (±1): +15 pontos
      const quartosRef = imovelReferencia.DormitoriosAntigo || 0;
      const quartosImovel = imovel.DormitoriosAntigo || 0;
      if (Math.abs(quartosImovel - quartosRef) <= 1) {
        score += 15;
      }
      
      // Área muito próxima (±10%): +10 pontos extras
      const areaImovelStr = imovel.AreaPrivativa.toString().replace(/[^\d.,]/g, "").replace(",", ".");
      const areaImovel = parseFloat(areaImovelStr);
      if (!isNaN(areaImovel)) {
        const diferencaArea = Math.abs(areaImovel - areaReferencia) / areaReferencia;
        if (diferencaArea <= 0.1) {
          score += 10;
        }
      }
      
      // Preço muito próximo (±10%): +10 pontos extras
      if (precoMinimo && precoMaximo) {
        const precoImovelStr = imovel.ValorAntigo.toString().replace(/[^\d.,]/g, "").replace(",", ".");
        const precoImovel = parseFloat(precoImovelStr);
        const precoReferencia = (precoMinimo + precoMaximo) / 2;
        
        if (!isNaN(precoImovel) && precoReferencia > 0) {
          const diferencaPreco = Math.abs(precoImovel - precoReferencia) / precoReferencia;
          if (diferencaPreco <= 0.1) {
            score += 10;
          }
        }
      }
      
      // Destaque: +5 pontos
      if (imovel.Destaque === "Sim") {
        score += 5;
      }
      
      return { ...imovel, similarityScore: score };
    });

    // Ordenar por score (maior para menor) e pegar os 12 melhores
    const resultadosOrdenados = comScore
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 12); // 🆕 Aumentei para 12 para garantir que capture todos do mesmo endereço

    console.log(`✅ Retornando ${resultadosOrdenados.length} imóveis similares`);
    
    // Debug: quantos são do mesmo endereço
    const mesmoEnd = resultadosOrdenados.filter(i => 
      i.Endereco === imovelReferencia.Endereco && i.Numero === imovelReferencia.Numero
    ).length;
    console.log(`🏠 Destes, ${mesmoEnd} são do mesmo endereço`);

    return NextResponse.json({
      status: 200,
      data: resultadosOrdenados,
    });

  } catch (error) {
    console.error("Erro ao buscar imóveis similares:", error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
