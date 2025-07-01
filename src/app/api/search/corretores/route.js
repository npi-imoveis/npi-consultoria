export const dynamic = "force-dynamic"; // Garante execução dinâmica

import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import ImovelAtivo from "@/app/models/ImovelAtivo";

export async function GET(req) {
  try {
    const request = req; // Caso precise, adicione `as NextRequest`
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    await connectToDatabase();

    const resultado = await Corretores.aggregate([
      {
        $search: {
          index: "corretores",
          text: {
            query: query,
            path: ["nome", "nomeCompleto", "email", "celular"],
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
