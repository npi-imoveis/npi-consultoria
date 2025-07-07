import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

// Força a rota a ser dinâmica
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    await connectToDatabase();

    // Se não há query, listar todos os corretores
    if (!query || query.trim() === "") {
      const skip = (page - 1) * limit;
      
      const [corretores, totalItems] = await Promise.all([
        Corretores.find({}).skip(skip).limit(limit).lean(),
        Corretores.countDocuments({})
      ]);


      return NextResponse.json({
        status: 200,
        corretores: corretores,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      });
    }

    // --- VERSÃO FINAL E CORRETA PARA O SEU ÍNDICE ---
    const resultado = await Corretores.aggregate([
      {
        $search: {
          index: "corretores", // Nome do seu índice, que está CORRETO.
          text: { // ALTERADO de "autocomplete" para "text" para funcionar com seu índice dinâmico.
            query: query,
            path: "nome", // Buscando especificamente no campo "nome".
            fuzzy: {
              maxEdits: 1,
            },
          },
        },
      },
      {
        $limit: 20,
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $limit: 20 }],
        },
      },
    ]);

    if (!resultado[0] || !resultado[0].data) {
      return NextResponse.json({ status: 200, data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1 } });
    }

    const data = resultado[0].data;
    const totalItems = resultado[0].metadata[0] ? resultado[0].metadata[0].total : 0;

    return NextResponse.json({
      status: 200,
      data: data,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / 20),
        currentPage: 1,
      },
    });
  } catch (error) {
    console.error("Erro na busca (Atlas Search - text):", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
