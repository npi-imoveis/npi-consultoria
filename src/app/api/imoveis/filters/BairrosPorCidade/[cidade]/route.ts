import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { cidade } = params;
  const { searchParams } = request.nextUrl;

  // Extrair parâmetro de categoria da query
  const categoria = searchParams.get("categoria");

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Definir a condição de busca usando o parâmetro de cidade
    let condition: any = { Cidade: decodeURIComponent(cidade) };

    // Adicionar filtro de categoria se estiver presente
    if (categoria) {
      condition.Categoria = categoria;

    } else {

    }

    // Buscar bairros distintos com base na condição
    const bairros = await Imovel.distinct("BairroComercial", condition);

    // Função para normalizar nomes de bairros (capitalizar corretamente)
    const normalizarBairro = (bairro: string): string => {
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

    // Filtrar, normalizar e remover duplicatas
    const bairrosNormalizados = new Set<string>();

    bairros
      .filter((bairro) => bairro && bairro.trim() !== "")
      .forEach((bairro) => {
        const bairroNormalizado = normalizarBairro(bairro);
        bairrosNormalizados.add(bairroNormalizado);
      });

    // Converter Set para Array e ordenar
    const bairrosFiltrados = Array.from(bairrosNormalizados)
      .sort((a, b) => a.localeCompare(b));



    // Retornar os bairros como resposta
    return NextResponse.json({
      status: 200,
      data: bairrosFiltrados,
    });
  } catch (error) {
    console.error("Erro ao buscar bairros:", error);

    // Retornar erro
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar bairros",
    });
  }
}
