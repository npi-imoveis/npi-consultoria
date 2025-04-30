import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import NodeCache from "node-cache";

// Criar uma instância de cache com TTL de 1 hora (3600 segundos)
const cache = new NodeCache({ stdTTL: 3600 });
const CACHE_KEY = "imoveis_destaques";

export async function GET() {
  try {
    // Verificar se os dados estão em cache
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({
        status: 200,
        data: cachedData,
        fromCache: true,
      });
    }

    // Se não estiver em cache, buscar do banco de dados
    await connectToDatabase();

    // Buscar imóveis destacados, ordenados por data de criação (mais recentes primeiro)
    const imoveis = await Imovel.find({ Destacado: "Sim" })
      .sort({ createdAt: -1 }) // Ordenar por data de criação, mais recentes primeiro
      .limit(30);

    // Verificar se encontrou algum imóvel
    if (!imoveis || imoveis.length === 0) {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    // Salvar no cache
    cache.set(CACHE_KEY, imoveis);

    return NextResponse.json({
      status: 200,
      data: imoveis,
      fromCache: false,
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis destacados:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
