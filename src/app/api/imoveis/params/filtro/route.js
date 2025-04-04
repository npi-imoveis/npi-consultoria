import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);

  // Extrair parâmetros da URL
  const categoria = url.searchParams.get("categoria");
  const cidade = url.searchParams.get("cidade");
  // Obter todos os bairros da query (pode ter múltiplos com o mesmo nome)
  const bairros = url.searchParams.getAll("bairros");
  const quartos = url.searchParams.get("quartos");
  const banheiros = url.searchParams.get("banheiros");
  const vagas = url.searchParams.get("vagas");
  const precoMinimo = url.searchParams.get("precoMinimo");
  const precoMaximo = url.searchParams.get("precoMaximo");
  const areaMinima = url.searchParams.get("areaMinima");
  const areaMaxima = url.searchParams.get("areaMaxima");

  // Parâmetros de paginação
  const limit = parseInt(url.searchParams.get("limit") || "12", 10);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const skip = (page - 1) * limit;

  // Log dos parâmetros recebidos para debug
  console.log("Parâmetros recebidos:", {
    categoria,
    cidade,
    bairros,
    quartos,
    banheiros,
    vagas,
    precoMinimo,
    precoMaximo,
    areaMinima,
    areaMaxima,
    limit,
    page,
    skip,
  });

  // Log para verificar como os bairros estão sendo recebidos
  console.log("Bairros recebidos:", bairros);
  // Log para verificar os valores de preço recebidos
  console.log("Valores de preço recebidos: precoMinimo =", precoMinimo, "precoMaximo =", precoMaximo);

  try {
    await connectToDatabase();

    // Construir o objeto de filtro
    const filtro = {};

    // Adicionar filtros básicos apenas se os parâmetros estiverem presentes
    if (categoria) filtro.Categoria = categoria;
    if (cidade) filtro.Cidade = cidade;

    // Tratamento específico para os bairros
    if (bairros && bairros.length > 0) {
      // Usar $in para buscar imóveis em qualquer um dos bairros selecionados
      filtro.BairroComercial = { $in: bairros };
    }

    if (quartos) filtro.Dormitorios = quartos;
    if (banheiros) filtro.BanheiroSocialQtd = banheiros;
    if (vagas) filtro.Vagas = vagas;

    // Adicionar filtros de área
    if (areaMinima || areaMaxima) {
      console.log("Aplicando filtros de área - Mínima:", areaMinima, "Máxima:", areaMaxima);

      filtro.AreaPrivativa = {};

      if (areaMinima) {
        filtro.AreaPrivativa.$gte = parseInt(areaMinima, 10);
      }

      if (areaMaxima) {
        filtro.AreaPrivativa.$lte = parseInt(areaMaxima, 10);
      }
    }

    console.log("Filtro base aplicado (antes do preço):", JSON.stringify(filtro, null, 2));

    // Função para converter string de preço para número para comparação
    const converterPrecoParaNumero = (valor) => {
      if (!valor) return 0;

      try {
        // Primeiro, normaliza a string para garantir que é uma string
        let valorStr = String(valor);

        // Remove pontos, vírgulas, espaços, "R$", etc.
        valorStr = valorStr.replace(/[^\d]/g, "");

        // Converte para número
        const numero = Number(valorStr);

        console.log(`Conversão de preço: "${valor}" => ${numero}`);

        return numero;
      } catch (error) {
        console.error(`Erro ao converter preço "${valor}":`, error);
        return 0;
      }
    };

    // Buscar imóveis e aplicar filtro de preço após converter os valores
    if (precoMinimo || precoMaximo) {
      console.log("Aplicando filtros de preço avançados - Mínimo:", precoMinimo, "Máximo:", precoMaximo);

      const precoMinimoNumerico = precoMinimo ? converterPrecoParaNumero(precoMinimo) : null;
      const precoMaximoNumerico = precoMaximo ? converterPrecoParaNumero(precoMaximo) : null;

      console.log("Preço mínimo numérico:", precoMinimoNumerico);
      console.log("Preço máximo numérico:", precoMaximoNumerico);

      // Criar uma etapa adicional de agregação para filtrar por preço
      const imoveisPreFiltrados = await Imovel.find(filtro);
      console.log(`Encontrados ${imoveisPreFiltrados.length} imóveis antes do filtro de preço`);

      // Filtrar os imóveis usando comparação numérica
      const imoveisFiltrados = imoveisPreFiltrados.filter(imovel => {
        try {
          // Converter o preço do imóvel para número
          const precoImovelStr = imovel.ValorAntigo || "0";
          const precoImovelNum = converterPrecoParaNumero(precoImovelStr);

          // Log detalhado para comparação
          const logComparacao = {
            imovelId: imovel.Codigo || imovel._id,
            valorOriginal: precoImovelStr,
            valorConvertido: precoImovelNum,
            precoMinimo: precoMinimoNumerico,
            precoMaximo: precoMaximoNumerico,
            comparacaoMin: precoMinimoNumerico ? (precoImovelNum < precoMinimoNumerico ? "REJEITADO" : "OK") : "Não aplicável",
            comparacaoMax: precoMaximoNumerico ? (precoImovelNum > precoMaximoNumerico ? "REJEITADO" : "OK") : "Não aplicável"
          };

          // Imprimir a comparação para os primeiros imóveis apenas (para evitar logs excessivos)
          if (imovel.Codigo?.includes("001") || Math.random() < 0.1) {
            console.log("Comparação de preço:", JSON.stringify(logComparacao, null, 2));
          }

          // Aplicar os filtros de preço com verificação de valores nulos/indefinidos
          if (precoMinimoNumerico && precoImovelNum < precoMinimoNumerico) {
            return false;
          }

          if (precoMaximoNumerico && precoImovelNum > precoMaximoNumerico) {
            return false;
          }

          return true;
        } catch (error) {
          console.error(`Erro ao filtrar imóvel:`, error);
          // Se houver erro ao processar este imóvel, não o incluir no resultado
          return false;
        }
      });

      console.log(`Restaram ${imoveisFiltrados.length} imóveis após filtro de preço`);

      // Contar o total de itens filtrados
      const totalItems = imoveisFiltrados.length;

      // Aplicar paginação manualmente
      const paginatedImoveis = imoveisFiltrados
        .sort((a, b) => new Date(b.DataInclusao) - new Date(a.DataInclusao))
        .slice(skip, skip + limit);

      return NextResponse.json({
        status: 200,
        data: paginatedImoveis,
        paginacao: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit,
        },
      });
    } else {
      // Se não há filtro de preço, continua com a consulta normal
      console.log("Filtro aplicado (sem preço):", JSON.stringify(filtro, null, 2));

      // Contar o total de documentos que correspondem ao filtro (para paginação)
      const totalItems = await Imovel.countDocuments(filtro);
      console.log("Total de itens encontrados:", totalItems);

      // Calcular o total de páginas
      const totalPages = Math.ceil(totalItems / limit);

      // Ordenar por data de inclusão (mais recentes primeiro)
      const imoveis = await Imovel.find(filtro)
        .sort({ DataInclusao: -1 })
        .skip(skip)
        .limit(limit);

      return NextResponse.json({
        status: 200,
        data: imoveis,
        paginacao: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }
  } catch (error) {
    console.error("Erro ao buscar imóveis com filtros:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
