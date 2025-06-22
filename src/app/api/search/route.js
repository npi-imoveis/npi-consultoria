import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      // Retorna uma resposta vazia se a query estiver vazia
      // Certifique-se de que esta resposta também não seja cacheada
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

    // Utilizando o índice do Atlas Search com a consulta simplificada
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

    // Adicionar cabeçalhos para desabilitar o cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store'); // Para CDNs como a Vercel

    return response;

  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
