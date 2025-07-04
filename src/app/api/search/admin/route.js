import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    if (!query || query.trim() === "") {
      const emptyResponse = NextResponse.json({
        status: 200,
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          itemsPerPage: limit,
        }
      });
      emptyResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      emptyResponse.headers.set('Pragma', 'no-cache');
      emptyResponse.headers.set('Expires', '0');
      emptyResponse.headers.set('Surrogate-Control', 'no-store');
      return emptyResponse;
    }

    await connectToDatabase();

    // Primeiro, contar o total de resultados
    const totalResults = await Imovel.aggregate([
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
        $count: "total"
      }
    ]);

    const totalItems = totalResults[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Depois, buscar os resultados paginados
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
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const response = NextResponse.json({
      status: 200,
      data: resultado,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      }
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
