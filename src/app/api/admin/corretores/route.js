import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

// --- CORREÇÃO PRINCIPAL ---
// Esta linha força a rota a ser sempre dinâmica, resolvendo o erro de "static rendering".
export const dynamic = "force-dynamic";
// --------------------------

export async function GET(request) {
  try {
    // Agora o Next.js permitirá o acesso a searchParams sem erro.
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ status: 200, data: [] });
    }

    await connectToDatabase();

    // --- CÓDIGO DE DIAGNÓSTICO (ainda usando regex para testar) ---
    const resultado = await Corretores.find({
      nomeCompleto: { $regex: query, $options: "i" } // 'i' para ser case-insensitive
    }).limit(20);

    // Se o campo for 'nome', use a linha abaixo e comente a de cima:
    // const resultado = await Corretores.find({ nome: { $regex: query, $options: "i" } }).limit(20);

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
    console.error("Erro na busca (diagnóstico):", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
