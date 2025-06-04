import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const categoria = url.searchParams.get("categoria");
  const cidade = url.searchParams.get("cidade");
  const bairros = url.searchParams.getAll("bairros");
  const finalidade = url.searchParams.get("finalidade");
  const quartos = url.searchParams.get("quartos");
  const banheiros = url.searchParams.get("banheiros");
  const vagas = url.searchParams.get("vagas");
  const precoMinimo = url.searchParams.get("precoMinimo");
  const precoMaximo = url.searchParams.get("precoMaximo");
  const areaMinima = url.searchParams.get("areaMinima");
  const areaMaxima = url.searchParams.get("areaMaxima");

  const limit = parseInt(url.searchParams.get("limit") || "12", 10);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const skip = (page - 1) * limit;

  try {
    await connectToDatabase();

    // Removido filtro de valores - buscar todos os imóveis
    const filtro = {};

    if (categoria) filtro.Categoria = categoria;
    if (cidade) filtro.Cidade = cidade;

    if (!finalidade) {
      return NextResponse.json({
        status: 400,
        error: "Parâmetro 'finalidade' é obrigatório",
      });
    }

    filtro["FinalidadeStatus." + finalidade] = true;

    if (bairros && bairros.length > 0) {
      filtro.BairroComercial = { $in: bairros };
    }

    if (quartos) filtro.Dormitorios = quartos;
    if (banheiros) filtro.BanheiroSocialQtd = banheiros;
    if (vagas) filtro.Vagas = vagas;

    // Função para converter string de preço para número
    const converterPrecoParaNumero = (valor) => {
      if (!valor) return 0;
      try {
        let valorStr = String(valor);
        // Remove símbolos de moeda e espaços
        valorStr = valorStr.replace(/[R$\s]/g, "");
        // Converte vírgula para ponto (para decimais)
        valorStr = valorStr.replace(",", ".");
        // Remove pontos que não sejam o separador decimal (milhares)
        const parts = valorStr.split(".");
        if (parts.length > 2) {
          // Se há mais de um ponto, os primeiros são separadores de milhares
          valorStr = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
        }
        return parseFloat(valorStr) || 0;
      } catch (error) {
        console.error(`Erro ao converter preço "${valor}":`, error);
        return 0;
      }
    };

    // Função para converter string de área para número
    const converterAreaParaNumero = (valor) => {
      if (!valor) return 0;
      try {
        let valorStr = String(valor);
        // Remove todas as variações de unidade de área
        valorStr = valorStr
          .replace(/\s*m²?\s*/gi, "")
          .replace(/m2/gi, "")
          .trim();
        // Converte vírgula para ponto (para decimais)
        valorStr = valorStr.replace(",", ".");
        // Remove outros caracteres não numéricos exceto ponto
        valorStr = valorStr.replace(/[^\d.]/g, "");
        return parseFloat(valorStr) || 0;
      } catch (error) {
        console.error(`Erro ao converter área "${valor}":`, error);
        return 0;
      }
    };

    // Buscar imóveis base
    const imoveisBase = await Imovel.find(filtro);

    // Aplicar filtros de área se fornecidos
    let imoveisFiltradosArea = imoveisBase;
    if (areaMinima || areaMaxima) {
      const areaMinimaNumerica = areaMinima ? parseInt(areaMinima, 10) : null;
      const areaMaximaNumerica = areaMaxima ? parseInt(areaMaxima, 10) : null;

      imoveisFiltradosArea = imoveisBase.filter((imovel) => {
        try {
          const areaImovelNum = converterAreaParaNumero(imovel.AreaPrivativa);

          if (areaMinimaNumerica && areaImovelNum < areaMinimaNumerica) {
            return false;
          }

          if (areaMaximaNumerica && areaImovelNum > areaMaximaNumerica) {
            return false;
          }

          return true;
        } catch (error) {
          console.error(`Erro ao filtrar imóvel por área:`, error);
          return false;
        }
      });
    }

    // Aplicar filtros de preço se fornecidos
    let imoveisFiltrados = imoveisFiltradosArea;
    if (precoMinimo || precoMaximo) {
      const precoMinimoNumerico = precoMinimo ? converterPrecoParaNumero(precoMinimo) : null;
      const precoMaximoNumerico = precoMaximo ? converterPrecoParaNumero(precoMaximo) : null;

      imoveisFiltrados = imoveisFiltradosArea.filter((imovel) => {
        try {
          const precoImovelStr = imovel.ValorAntigo || "0";
          if (precoImovelStr === "0" || precoImovelStr === "") {
            return false;
          }

          const precoImovelNum = converterPrecoParaNumero(precoImovelStr);

          if (precoMinimoNumerico && precoImovelNum < precoMinimoNumerico) {
            return false;
          }

          if (precoMaximoNumerico && precoImovelNum > precoMaximoNumerico) {
            return false;
          }

          return true;
        } catch (error) {
          console.error(`Erro ao filtrar imóvel por preço:`, error);
          return false;
        }
      });
    }

    // Aplicar paginação
    const totalItems = imoveisFiltrados.length;
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
  } catch (error) {
    console.error("Erro ao buscar imóveis com filtros:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
