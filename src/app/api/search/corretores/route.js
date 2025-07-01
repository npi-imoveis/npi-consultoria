import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import ImovelAtivo from "@/app/models/ImovelAtivo";

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    await connectToDatabase();

    // Utilizando o índice do Atlas Search com a consulta simplificada
    const resultado = await Corretores.aggregate([
      {
        $search: {
          index: "corretores",
          text: {
            query: query,
            path: {
              wildcard: "*",
            },
          },
        },
      },
      {
        $limit: 20,
      },
    ]);

    return NextResponse.json({
      status: 200,
      data: resultado,
    });
  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
