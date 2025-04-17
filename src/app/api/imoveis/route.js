import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel, { IImovel } from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import cache from "@/app/lib/cache";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Parâmetros de paginação
    const limit = parseInt(url.searchParams.get("limit") || "25", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // Criar uma chave única para o cache baseada nos parâmetros
    const cacheKey = `imoveis_page${page}_limit${limit}`;

    // Verificar se os dados estão em cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    await connectToDatabase();

    // Filtro para imóveis com ValorAntigo diferente de "0" e ""
    const filtro = {
      ValorAntigo: { $exists: true, $nin: ["0", ""] }
    };

    // Contar o total de documentos com o filtro aplicado
    const totalItems = await Imovel.countDocuments(filtro);

    // Calcular o total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    // Buscar imóveis com paginação e filtro
    const imoveis = await Imovel.find(filtro).skip(skip).limit(limit);

    const response = {
      status: 200,
      data: imoveis,
      paginacao: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
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
