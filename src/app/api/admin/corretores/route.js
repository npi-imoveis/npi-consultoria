import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

// Esta linha é essencial e deve ser mantida.
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ status: 200, data: [] });
    }

    await connectToDatabase();

    // --- CORREÇÃO DO DIAGNÓSTICO ---
    // Alterado de "nomeCompleto" para "nome" para corresponder ao seu banco de dados.
    const resultado = await Corretores.find({
      nome: { $regex: query, $options: "i" } // 'i' para ser case-insensitive
    }).limit(20);
    // --- FIM DA CORREÇÃO ---

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
    console.error("Erro na busca (diagnóstico com campo 'nome'):", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
