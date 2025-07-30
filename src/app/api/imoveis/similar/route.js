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

    // Buscar imóveis com área privativa semelhante, no mesmo bairro, excluindo o próprio imóvel de referência
    const filtroBase = {
      Codigo: { $ne: id },
      Bairro: imovelReferencia.Bairro,
      AreaPrivativa: { $exists: true, $ne: "" },
      ValorAntigo: { $nin: ["0", ""] },
    };

    // 🆕 ADICIONAR FILTRO DE CATEGORIA (MESMO TIPO)
    if (imovelReferencia.Categoria) {
      filtroBase.Categoria = imovelReferencia.Categoria;
    }

    // 🆕 ADICIONAR FILTRO DE FAIXA DE PREÇO
    if (precoMinimo && precoMaximo) {
      filtroBase.$expr = {
        $and: [
          { 
            $gte: [
              { 
                $toDouble: {
                  $replaceAll: {
                    input: { $replaceAll: { input: "$ValorAntigo", find: ",", replacement: "." } },
                    find: { $regexFind: { input: "$ValorAntigo", regex: "[^\\d.]" } },
                    replacement: ""
                  }
                }
              }, 
              precoMinimo 
            ] 
          },
          { 
            $lte: [
              { 
                $toDouble: {
                  $replaceAll: {
                    input: { $replaceAll: { input: "$ValorAntigo", find: ",", replacement: "." } },
                    find: { $regexFind: { input: "$ValorAntigo", regex: "[^\\d.]" } },
                    replacement: ""
                  }
                }
              }, 
              precoMaximo 
            ] 
          }
        ]
      };
    }

    const imoveisSimilares = await Imovel.find(filtroBase)
      .limit(20)
      .lean();

    // Filtrar os resultados em JavaScript para garantir a conversão correta
    const filtrados = imoveisSimilares
      .filter((imovel) => {
        try {
          const areaString = imovel.AreaPrivativa.toString()
            .replace(/[^\d.,]/g, "")
            .replace(",", ".");
          const area = parseFloat(areaString);
          return !isNaN(area) && area >= areaMinima && area <= areaMaxima;
        } catch (e) {
          return false;
        }
      });

    // 🆕 ORDENAÇÃO POR RELEVÂNCIA
    const comScore = filtrados.map(imovel => {
      let score = 0;
      
      // Mesmo bairro (já garantido pelo filtro): +10 pontos base
      score += 10;
      
      // Mesma categoria (já garantido pelo filtro): +20 pontos base
      if (imovel.Categoria === imovelReferencia.Categoria) {
        score += 20;
      }
      
      // Mesmo condomínio/empreendimento: +30 pontos
      if (imovel.Empreendimento === imovelReferencia.Empreendimento) {
        score += 30;
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

    // Ordenar por score (maior para menor) e pegar os 10 melhores
    const resultadosOrdenados = comScore
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);

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
