import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

// Força a rota a ser dinâmica para evitar erros de build.
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ status: 200, data: [] });
    }

    await connectToDatabase();

    // USANDO A BUSCA MAIS SIMPLES POSSÍVEL (REGEX)
    // Isso não usa o Atlas Search e busca direto no campo "nome".
    const resultado = await Corretores.find({
      nome: { $regex: query, $options: "i" } // 'i' para case-insensitive
    }).limit(20);

    const totalItems = resultado.length;

    return NextResponse.json({
      status: 200,
      data: resultado,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / 20),
        currentPage: 1,
      },
    });

  } catch (error) {
    console.error("Erro na busca SIMPLES (regex):", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
