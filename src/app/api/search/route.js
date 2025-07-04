import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";

import { NextResponse } from "next/server";

// ADICIONE ESTA LINHA AQUI
export const dynamic = 'force-dynamic'; // Garante que a rota seja sempre dinâmica e não cacheada

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      const emptyResponse = NextResponse.json({
        status: 200,
        data: [],
      });
      emptyResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      emptyResponse.headers.set('Pragma', 'no-cache');
      emptyResponse.headers.set('Expires', '0');
      emptyResponse.headers.set('Surrogate-Control', 'no-store');
      return emptyResponse;
    }

    await connectToDatabase();

    const resultado = await Imovel.aggregate([
      {
        $search: {
          index: "imoveis",
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

    const response = NextResponse.json({
      status: 200,
      data: resultado,
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
