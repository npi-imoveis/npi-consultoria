import { connectToDatabase } from "@/app/lib/mongodb";
import Review from "@/app/models/Review";

import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    await connectToDatabase();

    // Utilizando o índice do Atlas Search com a consulta simplificada
    const resultado = await Review.aggregate([
      {
        $search: {
          index: "reviews",
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
