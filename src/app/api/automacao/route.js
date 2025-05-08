import { connectToDatabase } from "@/app/lib/mongodb";
import Review from "@/app/models/Review";

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Parâmetros de paginação
    const limit = parseInt(url.searchParams.get("limit") || "25", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    let connection;
    try {
      connection = await connectToDatabase();
    } catch (connError) {
      console.error("API automacao: Erro ao conectar ao banco de dados (automação):", connError);
      return NextResponse.json({
        status: 500,
        error: "Erro ao conectar ao banco de dados",
        data: [],
        paginacao: {
          totalItems: 0,
          totalPages: 1,
          currentPage: page,
          limit,
        },
      });
    }

    // Filtro básico para todos os documentos
    const filtro = {};

    // Adiciona um log para confirmar qual collection está sendo usada

    const totalItems = await Review.countDocuments(filtro);

    // Calcular o total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    const imoveis = await Review.find(filtro).sort({ _id: -1 }).skip(skip).limit(limit).lean(); // Usar lean() para melhor performance

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
  } catch (error) {
    console.error("API automacao: Erro ao buscar imóveis:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao buscar imóveis",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        data: [],
        paginacao: {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          limit: 25,
        },
      },
      { status: 500 }
    );
  }
}
