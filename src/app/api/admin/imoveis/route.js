import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import cache from "@/app/lib/cache";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Parâmetros de paginação
    const limit = parseInt(url.searchParams.get("limit") || "25", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // Extrair parâmetros de filtro da URL
    const filtro = {};

    // Adicionar ao filtro apenas os parâmetros que existem na URL
    // e não são parâmetros de paginação
    url.searchParams.forEach((value, key) => {
      if (!["limit", "page"].includes(key) && value) {
        filtro[key] = value;
      }
    });

    // Criar uma chave única para o cache baseada nos parâmetros
    const filterParams = Object.entries(filtro)
      .map(([key, value]) => `${key}=${value}`)
      .join("_");
    const cacheKey = `imoveis_page${page}_limit${limit}${filterParams ? "_" + filterParams : ""}`;

    // Verificar se os dados estão em cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    await connectToDatabase();

    // Pipeline de agregação para garantir códigos únicos
    const imoveisAgregados = await Imovel.aggregate([
      // Filtrar conforme os critérios de filtro
      { $match: filtro },
      // Agrupar por Codigo e manter apenas o documento mais recente
      {
        $group: {
          _id: "$Codigo",
          doc: { $first: "$$ROOT" },
        },
      },
      // Desempacotar o documento para preservar a estrutura original
      { $replaceRoot: { newRoot: "$doc" } },
      // Contar total para paginação
      {
        $facet: {
          total: [{ $count: "count" }],
          // Aplicar paginação
          dados: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    // Extrair os resultados da agregação
    const imoveisPaginados = imoveisAgregados[0]?.dados || [];
    const totalItems = imoveisAgregados[0]?.total[0]?.count || 0;

    // Calcular o total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    const response = {
      status: 200,
      data: imoveisPaginados,
      paginacao: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
      filtros: filtro,
    };

    // Armazenar os dados em cache
    cache.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return NextResponse.json(
      {
        message: "Erro ao buscar imóveis",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
