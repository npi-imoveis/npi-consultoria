import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const categoria = searchParams.get("categoria");
  const cidade = searchParams.get("cidade");
  const bairros = searchParams.getAll("bairros");
  const finalidade = searchParams.get("finalidade");
  const quartos = searchParams.get("quartos");
  const banheiros = searchParams.get("banheiros");
  const vagas = searchParams.get("vagas");
  const precoMinimo = searchParams.get("precoMinimo");
  const precoMaximo = searchParams.get("precoMaximo");
  const areaMinima = searchParams.get("areaMinima");
  const areaMaxima = searchParams.get("areaMaxima");

  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
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

    // Mapeamento correto: finalidade -> Status do banco
    const statusMap = {
      'Comprar': 'VENDA',
      'Alugar': 'ALUGUEL'
    };
    
    const statusFiltro = statusMap[finalidade];
    if (statusFiltro) {
      filtro.Status = statusFiltro;
    }

    if (bairros && bairros.length > 0) {
      // Função para normalizar nomes de bairros (capitalizar corretamente)
      const normalizarBairro = (bairro) => {
        // Palavras que devem ficar em minúscula (preposições, artigos, etc)
        const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];

        return bairro
          .toLowerCase()
          .split(' ')
          .map((palavra, index) => {
            // Primeira palavra sempre maiúscula
            if (index === 0) {
              return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            // Preposições ficam em minúscula, exceto se for a primeira palavra
            if (preposicoes.includes(palavra)) {
              return palavra;
            }
            // Outras palavras ficam com primeira letra maiúscula
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
          })
          .join(' ')
          .trim();
      };

      // Normalizar os bairros para comparação
      const bairrosNormalizados = bairros.map(b => normalizarBairro(b.trim()));

      // Criar array com variações (original + normalizada) para máxima compatibilidade
      const bairrosParaBusca = [];
      bairros.forEach(bairro => {
        const original = bairro.trim();
        const normalizado = normalizarBairro(original);

        bairrosParaBusca.push(original);
        if (original !== normalizado) {
          bairrosParaBusca.push(normalizado);
        }

        // Adicionar também versão lowercase e uppercase para compatibilidade
        bairrosParaBusca.push(original.toLowerCase());
        bairrosParaBusca.push(original.toUpperCase());
      });

      // Remover duplicatas
      const bairrosUnicos = [...new Set(bairrosParaBusca)];

      // Usar $or para buscar em ambos os campos de bairro
      filtro.$or = [
        { BairroComercial: { $in: bairrosUnicos } },
        { Bairro: { $in: bairrosUnicos } }
      ];
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
        // Remove TODOS os pontos (separadores de milhares no formato brasileiro)
        valorStr = valorStr.replace(/\./g, "");
        // Converte vírgula para ponto (para decimais)
        valorStr = valorStr.replace(",", ".");
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
