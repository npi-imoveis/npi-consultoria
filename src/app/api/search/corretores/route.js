import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ status: 200, data: [] });
    }

    await connectToDatabase();

    const resultado = await Corretores.aggregate([
      {
        $search: {
          index: "corretores",
          text: {
            query: query,
            path: "nome",
            fuzzy: { maxEdits: 1 },
          },
        },
      },
      { $limit: 20 },
      { $facet: { metadata: [{ $count: "total" }], data: [{ $limit: 20 }] } },
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
    console.error("Erro na busca (search/corretores):", error);
    return NextResponse.json({ status: 500, error: error.message || "Erro desconhecido" });
  }
}
  
