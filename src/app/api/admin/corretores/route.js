import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

// Força a rota a ser dinâmica
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ status: 200, data: [] });
    }

    await connectToDatabase();

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
